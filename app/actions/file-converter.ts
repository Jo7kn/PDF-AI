// app/actions/file-converter.ts
'use server'

import pdfParse from 'pdf-parse'
import { getCurrentUser } from './auth'
import { convertTextFormat, type TextFormat } from '@/lib/nvidia/converter'
import { runAiTool } from '@/lib/ai-router'

export async function runTextConversion(text: string, from: TextFormat, to: TextFormat) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  return runAiTool({
    userId: user.id,
    tool: 'file-converter',
    action: `${from}->${to}`,
    run: () => convertTextFormat(text, from, to),
  })
}

export async function convertPdfToText(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'Nessun file caricato' }
  if (file.type !== 'application/pdf') return { error: 'Il file deve essere un PDF' }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const data = await pdfParse(buffer)
    const text = (data.text || '').trim()
    if (!text) {
      return { error: 'Nessun testo estraibile da questo PDF (potrebbe essere scansionato/immagine).' }
    }
    return { success: true, text }
  } catch (error) {
    console.error('[file-converter] errore estrazione PDF:', error)
    return { error: 'Impossibile leggere questo PDF.' }
  }
}

const IMAGE_FORMATS = ['png', 'jpeg', 'webp'] as const
export type ImageOutputFormat = (typeof IMAGE_FORMATS)[number]

export async function convertImageFormat(formData: FormData, targetFormat: ImageOutputFormat) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Unauthorized' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'Nessun file caricato' }
  if (!file.type.startsWith('image/')) return { error: 'Il file deve essere un\'immagine' }
  if (!IMAGE_FORMATS.includes(targetFormat)) return { error: 'Formato di destinazione non supportato' }

  try {
    const sharpModule = await import('sharp')
    const sharp = sharpModule.default
    const buffer = Buffer.from(await file.arrayBuffer())
    const converted = await sharp(buffer)[targetFormat]().toBuffer()
    const mime = targetFormat === 'jpeg' ? 'image/jpeg' : `image/${targetFormat}`
    return { success: true, dataUrl: `data:${mime};base64,${converted.toString('base64')}` }
  } catch (error) {
    console.error('[file-converter] errore conversione immagine:', error)
    return { error: 'Impossibile convertire questa immagine.' }
  }
}
