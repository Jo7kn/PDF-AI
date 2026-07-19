// lib/chunking.ts

export interface TextChunk {
  content: string
  pageNumber: number | null
  index: number
}

/**
 * Divide il testo di un documento in chunk adatti all'embedding.
 *
 * Se il testo contiene i marcatori "--- Page N ---" (inseriti dall'OCR in
 * lib/nvidia/nim.ts quando il PDF non è testuale), rispetta i confini di
 * pagina così ogni chunk sa a quale pagina appartiene. Per i PDF testuali
 * estratti con pdf-parse questi marcatori non ci sono: in quel caso tutto
 * il testo è trattato come un'unica "pagina" logica (pageNumber: null).
 */
export function chunkDocumentText(
  text: string,
  maxChunkChars = 1000,
  overlapChars = 150
): TextChunk[] {
  const pageRegex = /--- Page (\d+) ---/g
  const matches = [...text.matchAll(pageRegex)]
  const pages: { pageNumber: number | null; text: string }[] = []

  if (matches.length > 0) {
    matches.forEach((match, i) => {
      const pageNumber = parseInt(match[1], 10)
      const start = match.index! + match[0].length
      const end = i + 1 < matches.length ? matches[i + 1].index! : text.length
      pages.push({ pageNumber, text: text.slice(start, end).trim() })
    })
  } else {
    pages.push({ pageNumber: null, text })
  }

  const chunks: TextChunk[] = []
  let globalIndex = 0

  for (const page of pages) {
    const clean = page.text.replace(/\s+/g, ' ').trim()
    if (!clean) continue

    let start = 0
    while (start < clean.length) {
      const end = Math.min(start + maxChunkChars, clean.length)
      const content = clean.slice(start, end).trim()
      // Scarta frammenti troppo corti (es. residui di overlap a fine testo):
      // non aggiungono valore alla ricerca e sprecano chiamate di embedding
      if (content.length > 20) {
        chunks.push({ content, pageNumber: page.pageNumber, index: globalIndex })
        globalIndex++
      }
      if (end === clean.length) break
      start = end - overlapChars
    }
  }

  return chunks
}