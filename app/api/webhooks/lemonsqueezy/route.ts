// app/api/webhooks/lemonsqueezy/route.ts
import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { LEMONSQUEEZY_VARIANT_TIER_MAP } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET non configurata')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // Il body va letto come testo grezzo PRIMA di qualsiasi parsing: la
  // firma è calcolata sui byte esatti ricevuti, non sul JSON riparsato
  // (che potrebbe riordinare le chiavi o cambiare la formattazione).
  const rawBody = await request.text()
  const signatureHeader = request.headers.get('x-signature') || ''

  const digest = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'utf8'
  )
  const signatureBuffer = Buffer.from(signatureHeader, 'utf8')

  const isValid =
    digest.length === signatureBuffer.length &&
    crypto.timingSafeEqual(digest, signatureBuffer)

  if (!isValid) {
    console.error('Lemon Squeezy webhook: firma non valida')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName: string = payload?.meta?.event_name
  const customData = payload?.meta?.custom_data || {}
  const attributes = payload?.data?.attributes || {}
  const subscriptionId = payload?.data?.id
  const variantId = String(attributes.variant_id || '')
  const customerId = attributes.customer_id != null ? String(attributes.customer_id) : ''

  const supabase = createServiceClient()

  // Trova l'utente Supabase collegato a questo evento: prima via
  // custom_data.user_id (passato al checkout, presente su tutti gli
  // eventi della stessa subscription), altrimenti via
  // lemonsqueezy_customer_id salvato da un evento precedente per lo
  // stesso customer (fallback per eventi che potrebbero non ripetere
  // custom_data).
  async function resolveUserId(): Promise<string | null> {
    if (customData.user_id) return customData.user_id
    if (!customerId) return null
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('lemonsqueezy_customer_id', customerId)
      .single()
    return data?.id || null
  }

  try {
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const userId = await resolveUserId()
        if (!userId) {
          console.error('Lemon Squeezy webhook: utente non trovato', { customData, customerId })
          break
        }

        const tier = LEMONSQUEEZY_VARIANT_TIER_MAP[variantId]
        if (!tier) {
          console.error('Lemon Squeezy webhook: variant_id non mappato in LEMONSQUEEZY_VARIANT_TIER_MAP:', variantId)
          break
        }

        await supabase
          .from('users')
          .update({
            tier,
            lemonsqueezy_customer_id: customerId,
            lemonsqueezy_subscription_id: String(subscriptionId),
            subscription_status: attributes.status,
            current_period_end: attributes.renews_at || attributes.ends_at || null,
            // Nuovo abbonamento o cambio piano: riparti con quota pulita
            total_pages_used: 0,
          })
          .eq('id', userId)
        break
      }

      case 'subscription_payment_success': {
        // Rinnovo riuscito: nuovo ciclo di fatturazione iniziato, la
        // quota mensile deve ripartire da zero. Questo risolve il
        // problema che avevamo individuato: prima total_pages_used non
        // si azzerava mai, quindi un abbonamento pagato per sempre
        // esauriva la quota una volta sola e basta.
        const userId = await resolveUserId()
        if (!userId) {
          console.error('Lemon Squeezy webhook: utente non trovato per rinnovo', { customData, customerId })
          break
        }
        await supabase
          .from('users')
          .update({ total_pages_used: 0 })
          .eq('id', userId)
        break
      }

      case 'subscription_expired': {
        // Fine effettiva dell'accesso: downgrade a free
        const userId = await resolveUserId()
        if (!userId) break
        await supabase
          .from('users')
          .update({ subscription_status: attributes.status, tier: 'free' })
          .eq('id', userId)
        break
      }

      case 'subscription_cancelled': {
        // L'utente ha cancellato ma ha ancora accesso fino a
        // current_period_end (Lemon Squeezy manderà subscription_expired
        // a quel punto) — non fare downgrade subito
        const userId = await resolveUserId()
        if (!userId) break
        await supabase
          .from('users')
          .update({ subscription_status: attributes.status })
          .eq('id', userId)
        break
      }

      default:
        // Altri eventi (order_created, subscription_paused, ecc.) non
        // gestiti esplicitamente: va bene ignorarli e rispondere 200.
        break
    }
  } catch (err) {
    console.error('Lemon Squeezy webhook: errore elaborazione evento', eventName, err)
    // 500 fa sì che Lemon Squeezy ritenti (fino a 3 volte con backoff) —
    // corretto per un errore transitorio nostro (es. DB temporaneamente giù)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
