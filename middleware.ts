import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/auth/login',
  '/api/auth/login',
  '/_next',
];

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  if (publicPaths.some(p => url.pathname === p || url.pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const cookie = request.cookies.get('dm_session');
  if (!cookie) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/health).*)'],
}
