// lib/nvidia/code.ts
//
// Client dedicato al modulo Code AI. Migrato da NVIDIA NIM a Gemini (24/07,
// scelta esplicita dell'utente) — percorso file invariato per non toccare
// gli import in app/actions/code-ai.ts, solo il provider sotto e' cambiato.

import { generateContent } from '../gemini-client'

const GEMINI_CODE_API_KEY = process.env.GEMINI_CODE_API_KEY || process.env.GEMINI_API_KEY

const CODE_MODEL = 'gemini-flash-latest'

export type CodeAction = 'generate' | 'debug' | 'refactor' | 'explain' | 'convert'

export interface CodeRequest {
  action: CodeAction
  code?: string
  prompt?: string
  language?: string
  targetLanguage?: string
}

function buildPrompt({ action, code, prompt, language, targetLanguage }: CodeRequest): {
  system: string
  user: string
} {
  const lang = language || 'il linguaggio più adatto alla richiesta'

  switch (action) {
    case 'generate':
      return {
        system:
          'Sei un assistente di programmazione esperto. Genera codice corretto, pulito e pronto ' +
          `all'uso in ${lang}. Rispondi SOLO con un blocco di codice markdown (\`\`\`${language || ''} ... \`\`\`), ` +
          'seguito da una spiegazione breve (max 3 frasi) di come funziona. Niente premesse.',
        user: prompt || '',
      }
    case 'debug':
      return {
        system:
          `Sei un debugger esperto in ${lang}. Analizza il codice fornito, individua il bug o l'errore, ` +
          'spiega la causa in 2-3 frasi e fornisci la versione corretta come blocco di codice markdown completo.',
        user: prompt ? `${code}\n\nContesto/errore riportato dall'utente:\n${prompt}` : code || '',
      }
    case 'refactor':
      return {
        system:
          `Sei un esperto di clean code in ${lang}. Riscrivi il codice fornito migliorandone leggibilità, ` +
          'struttura e performance, senza cambiarne il comportamento. Rispondi con il codice refactorizzato in ' +
          "un blocco markdown, seguito da un elenco puntato breve delle modifiche fatte e del perché.",
        user: prompt ? `${code}\n\nIstruzioni aggiuntive:\n${prompt}` : code || '',
      }
    case 'explain':
      return {
        system:
          `Sei un insegnante di programmazione. Spiega in italiano, in modo chiaro e didattico, cosa fa questo ` +
          `codice ${lang}, riga per riga o per blocchi logici se è lungo. Evidenzia eventuali pattern o rischi.`,
        user: code || '',
      }
    case 'convert':
      return {
        system:
          `Sei un esperto di conversione tra linguaggi di programmazione. Converti il codice da ${language} a ` +
          `${targetLanguage}, mantenendo lo stesso comportamento e usando le idiomatiche/convenzioni di ` +
          `${targetLanguage}. Rispondi con il codice convertito in un blocco markdown, seguito da eventuali note ` +
          'brevi su differenze di comportamento non evitabili.',
        user: code || '',
      }
    default:
      throw new Error(`Azione non supportata: ${action}`)
  }
}

export async function runCodeAssistant(request: CodeRequest): Promise<string> {
  if (!GEMINI_CODE_API_KEY) {
    throw new Error('GEMINI_CODE_API_KEY non configurata')
  }

  const input = request.action === 'generate' ? request.prompt : request.code
  if (!input || !input.trim()) {
    throw new Error('Nessun input fornito')
  }

  const { system, user } = buildPrompt(request)

  return generateContent({
    apiKey: GEMINI_CODE_API_KEY,
    model: CODE_MODEL,
    systemInstruction: system,
    parts: [{ text: user }],
    temperature: 0.2,
    topP: 0.9,
    maxOutputTokens: 4096,
    logLabel: 'code-ai',
  })
}
