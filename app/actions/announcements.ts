// app/actions/announcements.ts
//
// Persistenza annunci per il riquadro "console" pubblico sulla landing page.
// Scrittura da /admin (service-role, gated da isCurrentUserAdmin). Lettura
// pubblica anch'essa via service-role: nessuna sessione utente sulla landing,
// e nessuna policy RLS pubblica da mantenere — stesso pattern di
// feature_flags/launch_notifications.
//
// Volutamente disaccoppiato da sendDiscordAnnouncement (discord-announce.ts):
// il post su Discord resta best-effort, il salvataggio DB è la fonte di
// verità per la landing e non deve fallire se Discord è mal configurato.

'use server'

import { isCurrentUserAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { sendDiscordAnnouncement } from './discord-announce'

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
  discordError?: string
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

  // Best-effort: se Discord non è configurato o rifiuta il messaggio, l'annuncio
  // resta comunque salvato e visibile sulla landing — non è un errore bloccante.
  const discordResult = await sendDiscordAnnouncement(trimmedTitle, trimmedMessage)

  return { success: true, discordError: discordResult.success ? undefined : discordResult.error }
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
