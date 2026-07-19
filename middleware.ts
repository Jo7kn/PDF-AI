import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgotpass',
  '/reset-password',
  '/terms',
  '/auth/callback',
  '/auth/update-password',
]

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          return
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && ['/login', '/signup', '/forgotpass', '/reset-password'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}