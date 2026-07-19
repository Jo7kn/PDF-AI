function normalizeBaseUrl(origin?: string) {
  return (origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export function buildAppUrl(origin?: string) {
  return normalizeBaseUrl(origin)
}

export function buildAuthRedirectUrl(origin?: string, path = '/auth/callback') {
  return `${normalizeBaseUrl(origin)}${path}`
}

export function getOAuthOptions(origin?: string) {
  return {
    redirectTo: buildAuthRedirectUrl(origin),
    flowType: 'pkce' as const,
  }
}
