// lib/ai-router.ts
//
// Punto unico che ogni server action AI-backed attraversa: controlla i
// crediti, esegue la chiamata al modello (la funzione lib/nvidia/*.ts
// esistente, passata come `run`), e solo su successo scala i crediti e
// registra l'utilizzo. Le funzioni in lib/nvidia/*.ts restano invariate —
// il router le avvolge, non le sostituisce.

import { CREDIT_COSTS, TIER_GATED_TOOLS, deductCredits, getUserCredits, getUserTier, hasPaidTier, logUsage, type ToolSlug } from '@/lib/credits'
import { isAllowed } from '@/lib/rate-limit'

export interface RunAiToolParams<T> {
  userId: string
  tool: ToolSlug
  action?: string
  metadata?: Record<string, unknown>
  run: () => Promise<T>
}

export type AiRouterResult<T> = { success: true; result: T } | { error: string }

const INSUFFICIENT_CREDITS_ERROR =
  'Crediti insufficienti per completare questa richiesta. Passa a un piano superiore o attendi il rinnovo.'

const TIER_GATE_ERROR = 'Questo strumento richiede il piano Pro o Team. Passa a un piano superiore per sbloccarlo.'

// 15 chiamate AI/minuto per utente: copre un uso normale intenso (anche
// generazioni multiple ravvicinate) ma blocca flood/loop client rotti.
const AI_RATE_LIMIT = 15
const AI_RATE_WINDOW_MS = 60 * 1000

export async function runAiTool<T>({ userId, tool, action, metadata, run }: RunAiToolParams<T>): Promise<AiRouterResult<T>> {
  if (!isAllowed(`ai:${userId}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS)) {
    return { error: 'Troppe richieste in poco tempo. Attendi un minuto e riprova.' }
  }

  // Gate di prodotto: alcuni tool richiedono Pro/Team indipendentemente dai
  // crediti disponibili. Controllato prima dei crediti per non sprecare la
  // query se l'utente non può comunque usare il tool.
  if (TIER_GATED_TOOLS.has(tool)) {
    const tier = await getUserTier(userId)
    if (!hasPaidTier(tier)) {
      return { error: TIER_GATE_ERROR }
    }
  }

  const cost = CREDIT_COSTS[tool]

  // Check ottimistico: evita di chiamare il modello (costo API reale) se
  // sappiamo già che i crediti non bastano. La vera garanzia anti-overdraft
  // è la deduzione atomica sotto (deduct_user_credits), non questo check.
  const availableCredits = await getUserCredits(userId)
  if (availableCredits < cost) {
    return { error: INSUFFICIENT_CREDITS_ERROR }
  }

  let result: T
  try {
    result = await run()
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Richiesta fallita' }
  }

  const deducted = await deductCredits(userId, cost)
  if (!deducted) {
    // Race condition: i crediti sono finiti tra il check e ora (richiesta
    // concorrente sullo stesso account). Il risultato AI è già stato
    // generato ma non lo restituiamo: l'utente non ha credito per pagarlo.
    return { error: INSUFFICIENT_CREDITS_ERROR }
  }

  await logUsage(userId, tool, action, cost, metadata)

  return { success: true, result }
}
