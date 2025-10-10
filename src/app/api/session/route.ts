/**
 * Session API
 *
 * GET /api/session
 * Response:
 *   Success: { "success": true, "data": { "id": string, "email": string | null, "role": "USER" | "ADMIN" } | null }
 *   Error:   { "success": false, "error": { "code": string, "message": string } }
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ok, toErrorResponse } from '@/lib/utils/http'

export async function GET(): Promise<Response> {
  try {
    const session = await getServerSession(authOptions)
    const data = session?.user
      ? {
          id: session.user.id,
          email: session.user.email ?? null,
          role: session.user.role as 'USER' | 'ADMIN' | undefined,
        }
      : null

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to fetch session')
  }
}
