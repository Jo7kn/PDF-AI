// lib/nvidia/image.ts
//
// Client dedicato al modulo Image AI. Diverso dagli altri moduli NVIDIA:
// non usa /chat/completions ma l'endpoint "genai" (funzioni NVCF) per la
// generazione immagini via black-forest-labs/flux.1-dev.

import { fetchWithRetry } from './fetch-with-retry'

const NVIDIA_IMAGE_API_KEY = process.env.NVIDIA_IMAGE_API_KEY || process.env.NVIDIA_API_KEY
const NVIDIA_GENAI_BASE_URL = process.env.NVIDIA_GENAI_BASE_URL || 'https://ai.api.nvidia.com/v1/genai'

// "qwen-image-edit-*" non esiste sul gateway pubblico (404): verificato che
// black-forest-labs/flux.1-dev funziona con questa key end-to-end.
const IMAGE_MODEL = 'black-forest-labs/flux.1-dev'

export type ImageAspect = 'square' | 'landscape' | 'portrait'

// Il modello accetta solo un set discreto di dimensioni (multipli di 64
// tra 768 e 1344): valori fuori da questo set vengono rifiutati con 422.
const ASPECT_SIZES: Record<ImageAspect, { width: number; height: number }> = {
  square: { width: 1024, height: 1024 },
  landscape: { width: 1344, height: 768 },
  portrait: { width: 768, height: 1344 },
}

export interface GenerateImageRequest {
  prompt: string
  negativePrompt?: string
  aspect?: ImageAspect
  seed?: number
}

export interface GeneratedImage {
  dataUrl: string
  seed: number
}

export async function generateImage(request: GenerateImageRequest): Promise<GeneratedImage> {
  if (!NVIDIA_IMAGE_API_KEY) {
    throw new Error('NVIDIA_IMAGE_API_KEY non configurata')
  }
  if (!request.prompt || !request.prompt.trim()) {
    throw new Error('Descrivi l\'immagine da generare')
  }

  const { width, height } = ASPECT_SIZES[request.aspect || 'square']

  const response = await fetchWithRetry(
    `${NVIDIA_GENAI_BASE_URL}/${IMAGE_MODEL}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NVIDIA_IMAGE_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt.trim(),
        ...(request.negativePrompt ? { negative_prompt: request.negativePrompt.trim() } : {}),
        width,
        height,
        steps: 30,
        cfg_scale: 3.5,
        ...(request.seed !== undefined ? { seed: request.seed } : {}),
      }),
    },
    1,
    25000,
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[image-ai] errore NVIDIA (status ${response.status}):`, errorText)
    throw new Error('Generazione immagine fallita. Riprova tra poco.')
  }

  const data = await response.json()
  const artifact = data.artifacts?.[0]

  if (!artifact?.base64 || artifact.finishReason !== 'SUCCESS') {
    throw new Error('Il modello non ha restituito un\'immagine valida')
  }

  return {
    dataUrl: `data:image/jpeg;base64,${artifact.base64}`,
    seed: artifact.seed,
  }
}
