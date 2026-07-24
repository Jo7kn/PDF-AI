// app/actions/announcements.ts
//
// Persistenza annunci per il riquadro "console" pubblico su landing/home.
// Scrittura da /admin (service-role, gated da isCurrentUserAdmin). Lettura
// pubblica anch'essa via service-role: nessuna sessione utente sulla
// landing, e nessuna policy RLS pubblica da mantenere — stesso pattern di
// feature_flags/launch_notifications.
//
// Composer separato da sendDiscordAnnouncement (discord-announce.ts) su
// richiesta esplicita: sito e Discord sono due canali indipendenti nella UI
// admin, l'admin decide per ciascuno se e cosa pubblicare.

'use server'

import { isCurrentUserAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'

const MAX_MESSAGE_LENGTH = 4096
const MAX_TITLE_LENGTH = 256

export interface Announcement {
  id: string
  title: string | null
  message: string
  createdAt: string
}

export interface PostAnnouncementResult {
  success: boolean
  error?: string
}

export async function postAnnouncement(title: string, message: string): Promise<PostAnnouncementResult> {
  if (!(await isCurrentUserAdmin())) return { success: false, error: 'unauthorized' }

  const trimmedTitle = title.trim()
  const trimmedMessage = message.trim()
  if (!trimmedMessage) return { success: false, error: 'empty' }
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) return { success: false, error: 'too-long' }
  if (trimmedTitle.length > MAX_TITLE_LENGTH) return { success: false, error: 'title-too-long' }

  const supabase = createServiceClient()
  const { error } = await supabase.from('announcements').insert({
    title: trimmedTitle || null,
    message: trimmedMessage,
  })

  if (error) {
    console.error('postAnnouncement: insert fallito:', error)
    return { success: false, error: 'db' }
  }

  return { success: true }
}

export async function getAnnouncements(limit = 6): Promise<Announcement[]> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) {
    console.error('getAnnouncements: query fallita:', error)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
  }))
}
