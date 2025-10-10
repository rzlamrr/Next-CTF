import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Protect admin pages
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // If no token or not admin, block
    if (!token || token.role !== 'ADMIN') {
      const wantsJson =
        req.headers.get('accept')?.includes('application/json') ||
        req.headers.get('x-requested-with') === 'XMLHttpRequest'

      if (wantsJson) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: token ? 'FORBIDDEN' : 'UNAUTHORIZED',
              message: token ? 'Admin only' : 'Login required',
            },
          },
          { status: token ? 403 : 401 }
        )
      }

      // Redirect to login page, preserving callback
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('callbackUrl', pathname + search)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
