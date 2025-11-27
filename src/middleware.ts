import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl

  const response = intlMiddleware(req as NextRequest)

  if (pathname.includes('/dashboard') || pathname.includes('/goals')) {
    const session = req.auth

    if (!session) {
      const locale = pathname.split('/')[1] || 'en'
      const loginUrl = new URL(`/${locale}`, req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
})

export const config = {
  matcher: ['/', '/(fr|en)/:path*'],
}
