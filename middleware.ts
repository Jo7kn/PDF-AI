import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAllowed } from '@/lib/rate-limit'

const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/signup',
  '/forgotpass',
  '/reset-password',
  '/terms',
  '/pricing',
  '/about',
  '/auth/callback',
  // Chiamato da Stripe (nessuna sessione utente): l'autenticazione è la
  // firma verificata dentro la route stessa, non i cookie.
  '/api/webhooks/stripe',
  // Pagine marketing dei tool: devono restare visitabili senza login così
  // Google può indicizzarle. L'uso reale (server action) resta comunque
  // protetto da getCurrentUser() dentro ogni action in app/actions/*.
  '/tools',
  '/tools/ai-writer',
  '/tools/code-ai',
  '/tools/image-ai',
  '/tools/data-ai',
  '/tools/study-ai',
  '/tools/translator-ai',
  '/tools/email-ai',
  '/tools/contract-ai',
  '/tools/file-converter',
  '/tools/chat-ai',
])

// Queste pagine hanno senso solo per un visitatore non autenticato.
const GUEST_ONLY_ROUTES = new Set([
  '/login',
  '/signup',
  '/forgotpass',
  '/reset-password',
])

const AUTHENTICATED_HOME = '/dashboard'

// Rallenta il credential stuffing: sia il caricamento della pagina sia il
// POST della server action di login/signup arrivano su questo stesso
// pathname, quindi limitarlo qui copre entrambi.
const RATE_LIMITED_ROUTES = new Set(['/login', '/signup'])
const LOGIN_RATE_LIMIT = 10
const LOGIN_RATE_WINDOW_MS = 5 * 60 * 1000

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function normalizePathname(pathname: string) {
  return pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
}

function copySupabaseState(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie))

  // @supabase/ssr può aggiungere intestazioni anti-cache durante il refresh.
  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = from.headers.get(header)
    if (value) to.headers.set(header, value)
  }
}

function redirectWithSupabaseState(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
  next?: string,
) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''

  if (next) url.searchParams.set('next', next)

  const redirectResponse = NextResponse.redirect(url)
  copySupabaseState(supabaseResponse, redirectResponse)

  return redirectResponse
}

export async function middleware(request: NextRequest) {
  const pathname = normalizePathname(request.nextUrl.pathname)

  if (RATE_LIMITED_ROUTES.has(pathname)) {
    const ip = getClientIp(request)
    if (!isAllowed(`login:${ip}`, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS)) {
      return new NextResponse('Troppi tentativi. Riprova tra qualche minuto.', { status: 429 })
    }
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>, headers?: Headers) {
          // Rende disponibili i cookie rinnovati agli handler/server component
          // eseguiti nella stessa richiesta.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })

          // Invia i cookie rinnovati anche al browser.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })

          headers?.forEach((value, key) => response.headers.set(key, value))
        },
      },
    },
  )

  // Non sostituire con getSession(): i dati della sessione letti dai cookie
  // non sono una prova di identità lato server. getClaims() valida il JWT.
  const { data, error } = await supabase.auth.getClaims()

  const isAuthenticated = !error && Boolean(data?.claims?.sub)
  const isPublicRoute = PUBLIC_ROUTES.has(pathname)
  const isApiRoute = pathname.startsWith('/api/')

  if (!isAuthenticated && !isPublicRoute) {
    // Le API dovrebbero restituire uno stato HTTP, non un redirect HTML.
    if (isApiRoute) {
      const unauthorizedResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
      copySupabaseState(response, unauthorizedResponse)
      return unauthorizedResponse
    }

    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`
    return redirectWithSupabaseState(
      request,
      '/login',
      response,
      requestedPath,
    )
  }

  if (isAuthenticated && (pathname === '/' || GUEST_ONLY_ROUTES.has(pathname))) {
    return redirectWithSupabaseState(request, AUTHENTICATED_HOME, response)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff2?|ttf|eot)$).*)',
  ],
}

// Se usi un endpoint per la conferma email diverso da /auth/callback
// (per esempio /auth/confirm), aggiungilo esplicitamente a PUBLIC_ROUTES.
