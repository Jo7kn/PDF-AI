// app/api/webhooks/stripe/route.ts
// Replaces app/api/webhooks/lemonsqueezy/route.ts. Same shape (raw-body signature check,
// service client, resolve user -> apply tier/credits), swapped to Stripe's event model.
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripeClient } from '@/lib/stripe-server'
import { STRIPE_PRICE_TIER_MAP } from '@/lib/constants'
import { PLAN_CREDITS, setUserCredits } from '@/lib/credits'

function resolveTierFromPriceId(priceId: string | undefined): string | null {
  if (!priceId) return null
  return STRIPE_PRICE_TIER_MAP[priceId] || null
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET non configurata')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // Il body va letto come testo grezzo PRIMA di qualsiasi parsing: Stripe calcola la
  // firma sui byte esatti ricevuti (stesso motivo del webhook Lemon Squeezy).
  const rawBody = await request.text()
  const signatureHeader = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signatureHeader, secret)
  } catch (err) {
    console.error('Stripe webhook: firma non valida', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const supabase = createServiceClient()

  async function resolveUserIdFromCustomer(customerId: string | null | undefined): Promise<string | null> {
    if (!customerId) return null
    const { data } = await supabase.from('users').select('id').eq('stripe_customer_id', customerId).single()
    return data?.id || null
  }

  try {
    switch (event.type) {
      // Primo checkout riuscito: client_reference_id (impostato in lib/stripe.ts
      // buildCheckoutUrl) è l'unico punto in cui colleghiamo esplicitamente
      // l'utente Supabase al customer Stripe — da qui in poi il collegamento passa
      // per stripe_customer_id salvato sotto.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        if (!userId) {
          console.error('Stripe webhook: nessun client_reference_id nella sessione', session.id)
          break
        }

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

        let tier: string | null = null
        if (subscriptionId) {
          const subscription = await getStripeClient().subscriptions.retrieve(subscriptionId)
          tier = resolveTierFromPriceId(subscription.items.data[0]?.price.id)
        }

        if (!tier) {
          console.error('Stripe webhook: impossibile determinare il tier (price id non mappato?) per la sessione', session.id)
          break
        }

        await supabase
          .from('users')
          .update({
            tier,
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
            subscription_status: 'active',
            // Nuovo abbonamento: riparti con quota pulita, stesso motivo del webhook Lemon Squeezy.
            total_pages_used: 0,
          })
          .eq('id', userId)

        await setUserCredits(userId, PLAN_CREDITS[tier] ?? PLAN_CREDITS.free)

        await supabase.from('subscriptions').upsert(
          {
            user_id: userId,
            plan: tier,
            status: 'active',
            stripe_subscription_id: subscriptionId || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        break
      }

      // Cambio piano (upgrade/downgrade) o rinnovo di stato (non il rinnovo di
      // fatturazione in sé, quello è invoice.paid sotto).
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
        const userId = await resolveUserIdFromCustomer(customerId)
        if (!userId) {
          console.error('Stripe webhook: utente non trovato per customer', customerId)
          break
        }

        const item = subscription.items.data[0]
        const tier = resolveTierFromPriceId(item?.price.id)
        const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null

        const updates: Record<string, unknown> = {
          subscription_status: subscription.status,
          current_period_end: periodEnd,
        }
        if (tier) updates.tier = tier

        await supabase.from('users').update(updates).eq('id', userId)

        if (tier) {
          await supabase.from('subscriptions').upsert(
            {
              user_id: userId,
              plan: tier,
              status: subscription.status,
              stripe_subscription_id: subscription.id,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
        }
        break
      }

      // Fine effettiva dell'accesso (cancellazione completata, non la richiesta di
      // cancellazione): downgrade a free.
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
        const userId = await resolveUserIdFromCustomer(customerId)
        if (!userId) break

        await supabase.from('users').update({ tier: 'free', subscription_status: 'canceled' }).eq('id', userId)
        await setUserCredits(userId, PLAN_CREDITS.free)
        await supabase
          .from('subscriptions')
          .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
          .eq('user_id', userId)
        break
      }

      // Rinnovo riuscito: nuovo ciclo di fatturazione, la quota/i crediti ripartono da
      // zero (stesso fix di subscription_payment_success nel webhook Lemon Squeezy).
      // billing_reason distingue il rinnovo dal primo invoice di un nuovo abbonamento
      // (quello arriva insieme a checkout.session.completed, che già azzera tutto —
      // processarlo di nuovo qui sarebbe innocuo ma ridondante).
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.billing_reason !== 'subscription_cycle') break

        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        const userId = await resolveUserIdFromCustomer(customerId)
        if (!userId) break

        const { data: renewingUser } = await supabase.from('users').select('tier').eq('id', userId).single()

        await supabase.from('users').update({ total_pages_used: 0 }).eq('id', userId)
        await setUserCredits(userId, PLAN_CREDITS[renewingUser?.tier || 'free'] ?? PLAN_CREDITS.free)
        break
      }

      default:
        // Altri eventi non gestiti esplicitamente: va bene ignorarli e rispondere 200.
        break
    }
  } catch (err) {
    console.error('Stripe webhook: errore elaborazione evento', event.type, err)
    // 500 fa sì che Stripe ritenti automaticamente — corretto per un errore
    // transitorio nostro (es. DB temporaneamente giù).
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
