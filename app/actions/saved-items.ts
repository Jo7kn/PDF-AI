// app/actions/saved-items.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import { getOrCreateTag } from './tags'
import type { ToolSlug } from '@/lib/credits'

export interface SaveItemInput {
  tool: ToolSlug
  title: string
  content: string
  metadata?: Record<string, unknown>
}

export async function saveItem(input: SaveItemInput) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('saved_items')
    .insert({
      user_id: user.id,
      tool: input.tool,
      title: input.title.slice(0, 255),
      content: input.content,
      content_type: 'text',
      metadata: input.metadata || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/files')
  return { success: true, item: data }
}

export interface SaveImageItemInput {
  tool: ToolSlug
  title: string
  dataUrl: string // "data:image/jpeg;base64,...."
  metadata?: Record<string, unknown>
}

export async function saveImageItem(input: SaveImageItemInput) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const match = input.dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) return { error: 'Formato immagine non valido' }

  const [, mime, base64] = match
  const ext = mime.split('/')[1] || 'jpg'
  const buffer = Buffer.from(base64, 'base64')

  const supabase = await createClient()
  const fileName = `${user.id}/saved-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, buffer, { contentType: mime })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)

  const { data, error } = await supabase
    .from('saved_items')
    .insert({
      user_id: user.id,
      tool: input.tool,
      title: input.title.slice(0, 255),
      content: publicUrl,
      content_type: 'image',
      metadata: input.metadata || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/files')
  return { success: true, item: data }
}

export interface GetSavedItemsFilters {
  folderId?: string | null
  tagId?: string
  favoritesOnly?: boolean
  search?: string
}

export async function getSavedItems(filters: GetSavedItemsFilters = {}) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  try {
    let query = supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', user.id)

    if (filters.folderId === null) {
      query = query.is('folder_id', null)
    } else if (filters.folderId) {
      query = query.eq('folder_id', filters.folderId)
    }
    if (filters.favoritesOnly) {
      query = query.eq('is_favorite', true)
    }
    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) return { error: error.message }

    let items = data || []
    const itemIds = items.map((i) => i.id)
    let tagsByItemId: Record<string, { id: string; name: string }[]> = {}

    if (itemIds.length > 0) {
      const { data: itemTags } = await supabase
        .from('saved_item_tags')
        .select('saved_item_id, tag_id')
        .in('saved_item_id', itemIds)

      if (itemTags && itemTags.length > 0) {
        const tagIds = [...new Set(itemTags.map((t: any) => t.tag_id))]
        const { data: tagRows } = await supabase
          .from('tags')
          .select('id, name')
          .in('id', tagIds)

        const tagById = Object.fromEntries((tagRows || []).map((t: any) => [t.id, t]))
        tagsByItemId = itemTags.reduce((acc: any, t: any) => {
          acc[t.saved_item_id] = acc[t.saved_item_id] || []
          if (tagById[t.tag_id]) acc[t.saved_item_id].push(tagById[t.tag_id])
          return acc
        }, {})

        if (filters.tagId) {
          const matchingIds = new Set(
            itemTags.filter((t: any) => t.tag_id === filters.tagId).map((t: any) => t.saved_item_id)
          )
          items = items.filter((i) => matchingIds.has(i.id))
        }
      } else if (filters.tagId) {
        items = []
      }
    }

    return { success: true, items: items.map((i) => ({ ...i, tags: tagsByItemId[i.id] || [] })) }
  } catch (error) {
    return { error: 'Failed to fetch saved items' }
  }
}

export async function toggleSavedItemFavorite(itemId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data: item, error: fetchError } = await supabase
    .from('saved_items')
    .select('is_favorite')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !item) return { error: 'Elemento non trovato' }

  const { error } = await supabase
    .from('saved_items')
    .update({ is_favorite: !item.is_favorite })
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/files')
  revalidatePath('/dashboard/favorites')
  return { success: true, isFavorite: !item.is_favorite }
}

export async function moveSavedItemToFolder(itemId: string, folderId: string | null) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('saved_items')
    .update({ folder_id: folderId })
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/files')
  return { success: true }
}

export async function deleteSavedItem(itemId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/files')
  revalidatePath('/dashboard/favorites')
  return { success: true }
}

export async function addTagToSavedItem(itemId: string, tagName: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data: item } = await supabase
    .from('saved_items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single()

  if (!item) return { error: 'Elemento non trovato' }

  const tagId = await getOrCreateTag(supabase, user.id, tagName)
  if (!tagId) return { error: 'Nome tag non valido' }

  const { error } = await supabase
    .from('saved_item_tags')
    .insert({ saved_item_id: itemId, tag_id: tagId })

  if (error) {
    if (error.code === '23505') return { error: 'Tag già presente su questo elemento' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/files')
  return { success: true }
}

export async function removeTagFromSavedItem(itemId: string, tagId: string) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  const { data: item } = await supabase
    .from('saved_items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single()

  if (!item) return { error: 'Elemento non trovato' }

  const { error } = await supabase
    .from('saved_item_tags')
    .delete()
    .eq('saved_item_id', itemId)
    .eq('tag_id', tagId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/files')
  return { success: true }
}
