// lib/nvidia/nim.ts
//
// Client PDF AI. Migrato da NVIDIA NIM a Gemini (24/07) — percorso file
// invariato, provider sotto cambiato. Vantaggio reale del cambio: Gemini è
// nativamente multimodale, quindi l'OCR non ha più bisogno di un modello
// vision separato dal modello di chat (era llama-3.2-90b-vision-instruct
// contro nemotron-3-nano-omni) — stesso modello, l'immagine è solo un altro
// "part" della richiesta. La key resta separata (GEMINI_VISION_API_KEY) per
// isolare la quota, visto che l'OCR fa una chiamata per pagina.

import { createClient } from '@/lib/supabase/server'
import { generateContent, embedContent, type GeminiPart } from '@/lib/gemini-client'
import pdfParse from 'pdf-parse'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_VISION_API_KEY = process.env.GEMINI_VISION_API_KEY || GEMINI_API_KEY
const GEMINI_EMBED_API_KEY = process.env.GEMINI_EMBED_API_KEY || GEMINI_API_KEY

const CHAT_MODEL = 'gemini-flash-latest'
const EMBED_MODEL = 'gemini-embedding-001'

// Cache TTL 1 ora
const CACHE_TTL = 60 * 60 * 1000
const responseCache = new Map<string, { data: any; timestamp: number }>()

// Limiti OCR
const MAX_PAGES = 30 // safety cap: oltre questo numero il costo/tempo esplode
const OCR_CONCURRENCY = 3 // pagine processate in parallelo
// La maggior parte degli endpoint vision rifiuta o degrada immagini inline
// oltre ~180KB di base64. Comprimiamo per stare sotto questa soglia mantenendo
// la risoluzione più alta possibile.
const MAX_IMAGE_BASE64_BYTES = 180 * 1024

function getCacheKey(prefix: string, input: string): string {
  return `${prefix}:${input}`
}

function getCachedResponse(key: string): any | null {
  const cached = responseCache.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    responseCache.delete(key)
    return null
  }
  return cached.data
}

function setCachedResponse(key: string, data: any): void {
  responseCache.set(key, { data, timestamp: Date.now() })
}

// ============================================
// CONVERTI PDF IN IMMAGINI (pdf-to-img)
// ============================================
type PdfDocument = AsyncIterable<Buffer>

type PdfToImgFn = (input: string | Buffer, options?: { scale?: number }) => Promise<PdfDocument>

let pdfToImgFn: PdfToImgFn | null = null

async function getPdfToImg(): Promise<PdfToImgFn> {
  if (!pdfToImgFn) {
    const imported = await import('pdf-to-img')
    const anyImported = imported as any
    pdfToImgFn = (anyImported.pdf ?? anyImported.default ?? anyImported) as PdfToImgFn
  }
  return pdfToImgFn
}

// pdf-to-img restituisce PNG grezzi. Serve sharp per:
// 1) ri-codificarli correttamente come JPEG
// 2) comprimerli sotto MAX_IMAGE_BASE64_BYTES mantenendo leggibilità
type SharpModule = typeof import('sharp')
let sharpFn: SharpModule['default'] | null = null

async function getSharp() {
  if (!sharpFn) {
    const imported = await import('sharp')
    sharpFn = (imported as any).default ?? imported
  }
  return sharpFn!
}

/**
 * Converte un buffer PNG in JPEG ottimizzato per OCR, riducendo qualità/
 * dimensione finché non rientra nel limite di byte per l'invio inline.
 */
async function optimizeImageForOcr(pngBuffer: Buffer): Promise<Buffer> {
  const sharp = await getSharp()
  let quality = 92
  let width: number | undefined // parte dalla risoluzione nativa
  let jpegBuffer = await sharp(pngBuffer).jpeg({ quality }).toBuffer()

  while (base64Size(jpegBuffer) > MAX_IMAGE_BASE64_BYTES && quality > 40) {
    quality -= 10
    jpegBuffer = await sharp(pngBuffer).jpeg({ quality }).toBuffer()
  }

  if (base64Size(jpegBuffer) > MAX_IMAGE_BASE64_BYTES) {
    const meta = await sharp(pngBuffer).metadata()
    width = meta.width ? Math.round(meta.width * 0.75) : undefined
    while (base64Size(jpegBuffer) > MAX_IMAGE_BASE64_BYTES && (width ?? 0) > 600) {
      jpegBuffer = await sharp(pngBuffer)
        .resize({ width })
        .jpeg({ quality: 75 })
        .toBuffer()
      width = Math.round((width ?? 1000) * 0.85)
    }
  }

  return jpegBuffer
}

function base64Size(buffer: Buffer): number {
  return Math.ceil(buffer.length / 3) * 4
}

async function convertPdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  console.log('🔄 Conversione PDF in immagini...')
  try {
    const pdfToImg = await getPdfToImg()
    const pdf = await pdfToImg(pdfBuffer, { scale: 2.5 })
    const rawImages: Buffer[] = []
    for await (const image of pdf) {
      rawImages.push(image)
      if (rawImages.length >= MAX_PAGES) {
        console.warn(`⚠️ Limite di ${MAX_PAGES} pagine raggiunto, tronco il documento`)
        break
      }
    }

    console.log(`🔄 Ottimizzazione di ${rawImages.length} immagini per OCR...`)
    const images = await Promise.all(rawImages.map(optimizeImageForOcr))

    console.log(`✅ Convertito in ${images.length} immagini`)
    return images
  } catch (error) {
    console.error('❌ Errore conversione PDF:', error)
    throw new Error('Impossibile convertire il PDF in immagini.')
  }
}

// Semplice limitatore di concorrenza, per non sparare N richieste vision
// tutte insieme (rate limit / timeout) ma nemmeno farle una alla volta
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function next(): Promise<void> {
    const index = cursor
    cursor += 1
    if (index >= items.length) return
    results[index] = await worker(items[index], index)
    await next()
  }

  const workers = Array(Math.min(limit, items.length)).fill(0).map(() => next())
  await Promise.all(workers)
  return results
}

// ============================================
// OCR CON GEMINI (nativamente multimodale)
// ============================================
async function extractTextWithVision(imageBuffer: Buffer, pageNumber: number): Promise<string> {
  const base64Image = imageBuffer.toString('base64')
  console.log(`📖 OCR pagina ${pageNumber}... (${Math.round(base64Image.length / 1024)}KB base64)`)

  if (!GEMINI_VISION_API_KEY) {
    return `[Errore OCR pagina ${pageNumber}: GEMINI_VISION_API_KEY non configurata]`
  }

  try {
    const parts: GeminiPart[] = [
      {
        text:
          `You are an OCR engine. Extract ALL text from this document image (page ${pageNumber}) ` +
          `exactly as it appears, preserving reading order (top to bottom, left to right, respecting ` +
          `columns if present). Reproduce tables using Markdown table syntax. Preserve line breaks for ` +
          `lists and paragraphs. Do NOT translate, summarize, or add commentary — output ONLY the ` +
          `extracted text, nothing else. If the page is blank or has no readable text, return an empty string.`,
      },
      { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    ]

    const text = await generateContent({
      apiKey: GEMINI_VISION_API_KEY,
      model: CHAT_MODEL,
      parts,
      temperature: 0.0,
      topP: 0.9,
      maxOutputTokens: 4096,
      logLabel: 'pdf-ai-ocr',
    })
    return text.trim()
  } catch (error) {
    // Non far cadere l'intero documento se una singola pagina fallisce
    console.error(`❌ OCR eccezione pagina ${pageNumber}:`, error)
    return `[Errore OCR pagina ${pageNumber}: ${error instanceof Error ? error.message : 'errore sconosciuto'}]`
  }
}

// ============================================
// PARSE DOCUMENT
// ============================================
export async function parseDocumentWithNim(fileUrl: string): Promise<{ text: string; totalPages: number }> {
  const cacheKey = getCacheKey('parse', fileUrl)
  const cached = getCachedResponse(cacheKey)
  if (cached) return cached

  console.log(`📄 [START] Parsing documento: ${fileUrl}`)

  try {
    // 1. Estrai il percorso completo del file dal URL pubblico
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    const publicIndex = pathParts.indexOf('public')
    if (publicIndex === -1) {
      throw new Error('URL del file non valido: manca "public"')
    }
    const bucketName = pathParts[publicIndex + 1]
    const filePath = pathParts.slice(publicIndex + 2).join('/')
    console.log(`📄 [1] Percorso file: ${filePath}, bucket: ${bucketName}`)

    if (!filePath) {
      throw new Error('Percorso file non trovato')
    }

    // 2. Scarica da Supabase Storage usando il percorso completo
    console.log('📄 [2] Scaricando da Supabase Storage...')
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath)

    if (error || !data) {
      console.error(`❌ [2] Download fallito:`, error)
      throw new Error(`Download fallito: ${error?.message}`)
    }
    console.log(`✅ [2] Download completato: ${data.size} bytes`)

    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 3. Prova con pdf-parse (PDF testuali)
    console.log('📄 [3] Tentativo con pdf-parse...')
    try {
      const pdfData = await pdfParse(buffer)
      const text = (pdfData.text || '').replace(/\s+/g, ' ').trim()
      const numPages = pdfData.numpages || 1
      const avgCharsPerPage = text.length / numPages
      if (text.length > 50 && avgCharsPerPage > 20) {
        console.log(`✅ [3] PDF testuale, estratte ${text.length} caratteri`)
        const result = { text, totalPages: numPages }
        setCachedResponse(cacheKey, result)
        return result
      }
      console.log(`📄 [3] Testo insufficiente (${text.length} caratteri, ${avgCharsPerPage.toFixed(1)}/pagina), provo OCR...`)
    } catch (err) {
      console.log('📄 [3] pdf-parse fallito, provo OCR...', err)
    }

    // 4. OCR con Gemini
    console.log('📄 [4] Tentativo OCR...')
    if (!GEMINI_VISION_API_KEY) {
      throw new Error('GEMINI_VISION_API_KEY non configurata')
    }

    const images = await convertPdfToImages(buffer)
    if (images.length === 0) {
      throw new Error('Nessuna pagina generata dal PDF')
    }

    const pageTexts = await runWithConcurrency(images, OCR_CONCURRENCY, (img, i) =>
      extractTextWithVision(img, i + 1)
    )

    const fullText = pageTexts
      .map((pageText, i) => `\n\n--- Page ${i + 1} ---\n\n${pageText}`)
      .join('')

    const failedPages = pageTexts.filter(t => t.startsWith('[Errore OCR')).length
    if (failedPages > 0) {
      console.warn(`⚠️ ${failedPages}/${pageTexts.length} pagine hanno fallito l'OCR`)
    }

    const result = {
      text: fullText.trim() || 'Nessun testo estratto dal PDF.',
      totalPages: images.length,
    }

    console.log(`✅ [4] OCR completato: ${result.text.length} caratteri, ${result.totalPages} pagine`)
    if (failedPages < pageTexts.length) {
      setCachedResponse(cacheKey, result)
    }
    return result

  } catch (error) {
    console.error('❌ [ERROR] Errore parsing PDF:', error)
    const fallback = {
      text: 'Non è stato possibile estrarre il testo dal PDF. Verifica che il file non sia corrotto.',
      totalPages: 1,
    }
    return fallback
  }
}

// ============================================
// GENERATE CHAT COMPLETION
// ============================================
export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  documentContext?: string
): Promise<string> {
  const cacheKey = getCacheKey('chat', JSON.stringify({ messages, documentContext }))
  const cached = getCachedResponse(cacheKey)
  if (cached) return cached

  if (!GEMINI_API_KEY) {
    const fallback = generateFallbackReply(documentContext, messages)
    setCachedResponse(cacheKey, fallback)
    return fallback
  }

  try {
    const systemPrompt = documentContext
      ? `You are an AI assistant helping analyze documents. Here is the document context:\n\n${documentContext}\n\nAnswer the user's questions based on this document. Be concise and helpful.`
      : 'You are a helpful AI assistant.'

    // Gemini usa role:"model" per il turno AI, non "assistant"
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }))

    const result = await generateContent({
      apiKey: GEMINI_API_KEY,
      model: CHAT_MODEL,
      systemInstruction: systemPrompt,
      contents,
      temperature: 0.6,
      topP: 0.95,
      maxOutputTokens: 4096,
      retries: 2,
      timeoutMs: 70000,
      logLabel: 'pdf-ai-chat',
    })

    setCachedResponse(cacheKey, result)
    return result
  } catch (error) {
    console.error('❌ Errore chat completion:', error)
    const fallback = generateFallbackReply(documentContext, messages)
    setCachedResponse(cacheKey, fallback)
    return fallback
  }
}

// ============================================
// FALLBACK REPLY
// ============================================
function generateFallbackReply(documentContext?: string, messages?: Array<{ role: string; content: string }>): string {
  const lastMessage = messages?.find(m => m.role === 'user')?.content || ''
  const preview = (documentContext || '').slice(0, 200)
  return `Hai chiesto: "${lastMessage}". ${preview ? `Il documento contiene: "${preview}..."` : 'Nessun contenuto disponibile.'}`
}

// ============================================
// GENERATE EMBEDDING
// ============================================
// La colonna vector() in document_chunks e' fissa a 2048 dim (creata per il
// vecchio embedder NVIDIA nemotron-3-embed-1b, migrazione non tracciata nel
// repo). gemini-embedding-001 di default restituisce 3072 dim: richiediamo
// esplicitamente 2048 via outputDimensionality (troncamento MRL) per restare
// compatibili senza toccare lo schema o re-indicizzare i chunk esistenti.
const EMBED_DIMENSIONS = 2048

export async function generateEmbedding(
  text: string,
  inputType: 'query' | 'passage' = 'passage'
): Promise<number[]> {
  if (!GEMINI_EMBED_API_KEY) {
    console.warn('GEMINI_EMBED_API_KEY non configurata, uso fallback casuale')
    return Array(EMBED_DIMENSIONS).fill(0).map(() => Math.random() - 0.5)
  }

  const cacheKey = getCacheKey('embed', `${inputType}:${text.substring(0, 500)}`)
  const cached = getCachedResponse(cacheKey)
  if (cached) return cached

  try {
    const embedding = await embedContent(GEMINI_EMBED_API_KEY, EMBED_MODEL, text, EMBED_DIMENSIONS)
    setCachedResponse(cacheKey, embedding)
    return embedding
  } catch (error) {
    console.error('❌ Errore generazione embedding, uso fallback casuale:', error)
    return Array(EMBED_DIMENSIONS).fill(0).map(() => Math.random() - 0.5)
  }
}

// ============================================
// EXTRACT DEADLINES
// ============================================
export async function extractDeadlinesFromDocument(documentText: string): Promise<Array<{ date: string; description: string }>> {
  const cacheKey = getCacheKey('deadlines', documentText.substring(0, 500))
  const cached = getCachedResponse(cacheKey)
  if (cached) return cached

  if (!documentText || documentText.length < 20) {
    return []
  }

  const fallback = () => {
    const matches = documentText.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\b/g) || []
    const unique = Array.from(new Set(matches))
    return unique.slice(0, 6).map(date => ({
      date,
      description: 'Data trovata nel documento',
    }))
  }

  if (!GEMINI_API_KEY) {
    const result = fallback()
    setCachedResponse(cacheKey, result)
    return result
  }

  try {
    const rawContent = await generateContent({
      apiKey: GEMINI_API_KEY,
      model: CHAT_MODEL,
      systemInstruction:
        'Extract all deadlines and important dates from the document. Return ONLY a valid JSON array with "date" (in YYYY-MM-DD format) and "description" fields, and nothing else (no markdown fences, no commentary). Example: [{"date": "2024-12-25", "description": "Christmas deadline"}]',
      parts: [{ text: documentText.substring(0, 4000) }],
      temperature: 0.2,
      maxOutputTokens: 1024,
      retries: 2,
      timeoutMs: 70000,
      logLabel: 'pdf-ai-deadlines',
    })

    const content = rawContent.replace(/```json\s*|```/g, '').trim()

    try {
      const result = JSON.parse(content)
      if (!Array.isArray(result)) throw new Error('Risposta non è un array')
      setCachedResponse(cacheKey, result)
      return result
    } catch {
      const result = fallback()
      setCachedResponse(cacheKey, result)
      return result
    }
  } catch (error) {
    console.error('Error extracting deadlines:', error)
    const result = fallback()
    setCachedResponse(cacheKey, result)
    return result
  }
}
