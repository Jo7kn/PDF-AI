// app/actions/discord-announce.ts
//
// Manda annunci dal pannello /admin al canale Discord dedicato, chiamando
// direttamente la REST API di Discord con il bot token — non passa dal
// processo del bot (bot/), quindi funziona anche se il bot è offline.
// Stesso account Discord/token di bot/.env (DISCORD_BOT_TOKEN), copiato
// anche qui: vedi commento in .env.local.

'use server'

import { isCurrentUserAdmin } from '@/lib/admin'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

const DISCORD_API = 'https://discord.com/api/v10'
// PNG, non icon.svg: il fetcher di embed di Discord non renderizza SVG in
// modo affidabile per author/thumbnail icons.
const SITE_ICON_URL = `${SITE_URL}/apple-icon.png`
const MAX_MESSAGE_LENGTH = 4096 // limite embed description Discord (non 2000, quello è per content semplice)

export interface AnnouncementResult {
  success: boolean
  error?: string
}

export async function sendDiscordAnnouncement(title: string, message: string, tagEveryone = false): Promise<AnnouncementResult> {
  if (!(await isCurrentUserAdmin())) return { success: false, error: 'unauthorized' }

  const trimmedTitle = title.trim()
  const trimmedMessage = message.trim()
  if (!trimmedMessage) return { success: false, error: 'empty' }
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) return { success: false, error: 'too-long' }
  if (trimmedTitle.length > 256) return { success: false, error: 'title-too-long' } // limite embed title Discord

  const token = process.env.DISCORD_BOT_TOKEN
  const channelId = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID
  if (!token || !channelId) return { success: false, error: 'not-configured' }

  try {
    const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Discord non notifica i mention scritti dentro un embed (description/
        // title): @everyone deve stare nel "content" del messaggio, con
        // allowed_mentions che lo autorizza esplicitamente — altrimenti Discord
        // lo sopprime silenziosamente di default.
        content: tagEveryone ? '@everyone' : undefined,
        allowed_mentions: { parse: tagEveryone ? ['everyone'] : [] },
        embeds: [
          {
            author: { name: SITE_NAME, icon_url: SITE_ICON_URL, url: SITE_URL },
            title: trimmedTitle || '📢 Nuovo annuncio',
            url: SITE_URL,
            description: trimmedMessage,
            color: 0x22d3ee,
            thumbnail: { url: SITE_ICON_URL },
            timestamp: new Date().toISOString(),
            footer: { text: `${SITE_NAME} · inviato da /admin`, icon_url: SITE_ICON_URL },
          },
        ],
      }),
    })

    if (!res.ok) {
      // Il body di errore di Discord può contenere dettagli utili solo per
      // log server-side — non lo giriamo al client, solo lo status.
      const body = await res.text().catch(() => '')
      console.error('Discord announcement failed:', res.status, body)
      return { success: false, error: `discord-${res.status}` }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'network' }
  }
}
