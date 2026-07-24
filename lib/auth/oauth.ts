function normalizeBaseUrl(origin?: string) {
  return (origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function buildAppUrl(origin?: string) {
  return normalizeBaseUrl(origin)
}

export function buildAuthRedirectUrl(origin?: string, path = '/auth/callback') {
  return `${normalizeBaseUrl(origin)}${path}`
}

// extraParams sopravvive al giro OAuth completo (browser -> Supabase ->
// Google -> Supabase -> browser): Supabase reindirizza al `redirectTo`
// esatto fornito qui, aggiungendo solo il proprio `code=...` (PKCE) alla
// query string già presente — stesso meccanismo del pattern `next=` usato
// altrove per i redirect email. Usato per far arrivare il referral code
// (vedi app/(auth)/signup/page.tsx) fino a app/auth/callback/route.ts,
// che altrimenti non avrebbe modo di sapere che un invito era coinvolto.
export function getOAuthOptions(origin?: string, extraParams?: Record<string, string>) {
  let redirectTo = buildAuthRedirectUrl(origin)
  if (extraParams && Object.keys(extraParams).length > 0) {
    redirectTo += `?${new URLSearchParams(extraParams).toString()}`
  }

  return {
    redirectTo,
    flowType: 'pkce' as const,
  }
}
