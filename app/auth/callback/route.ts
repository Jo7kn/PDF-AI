import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { ensureUserProfile, linkReferral } from '@/app/actions/auth'

function redirectWithError(requestUrl: URL, message: string) {
  const url = new URL('/login', requestUrl.origin)
  url.searchParams.set('error', message)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const code = requestUrl.searchParams.get('code')

  if (error || errorDescription) {
    console.warn('OAuth callback: provider returned an error', error, errorDescription)
    return redirectWithError(requestUrl, errorDescription || error || 'OAuth login failed')
  }

  if (!code) {
    return redirectWithError(requestUrl, 'No OAuth code returned')
  }

  try {
    const supabase = await createClient()

    // NB: non loggare mai `sessionData` per intero — contiene access_token,
    // refresh_token e provider_token (il token OAuth di Google) in chiaro.
    // Se questi log finiscono su un servizio esterno (Vercel logs, ecc.),
    // chiunque vi acceda può impersonare l'utente. Se serve debug, loggare
    // solo campi non sensibili (es. sessionData.user?.id).
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('OAuth callback: exchange failed', exchangeError.message)
      return redirectWithError(requestUrl, 'Exchange failed: ' + exchangeError.message)
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error('OAuth callback: getUser failed', userError.message)
      return redirectWithError(requestUrl, 'Get user failed: ' + userError.message)
    }

    if (!user?.id || !user?.email) {
      console.error('OAuth callback: no user data from auth')
      return redirectWithError(requestUrl, 'No user data from auth')
    }

    // Stessa funzione usata da signUp/signIn: crea il profilo SOLO se non
    // esiste già (ignoreDuplicates), così un login non azzera mai
    // total_pages_used/active_projects di un utente esistente.
    await ensureUserProfile(supabase, user)

    // Presente solo se il login Google è partito da /signup?ref=CODE (vedi
    // getOAuthOptions) — sopravvive al giro OAuth completo nel redirectTo.
    // linkReferral() è già idempotente (.is('referred_by', null)), quindi è
    // sicuro chiamarla anche per un utente esistente che rifà login.
    const ref = requestUrl.searchParams.get('ref')
    if (ref) await linkReferral(user.id, ref)

    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))

  } catch (err) {
    console.error('OAuth callback: unexpected error', err instanceof Error ? err.message : err)
    const message = err instanceof Error ? err.message : 'Unable to complete OAuth login'
    return redirectWithError(requestUrl, message)
  }
}