import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { HttpError } from '@/lib/utils/http'
import { getUserByEmail } from '@/lib/db/queries'

type Role = 'USER' | 'ADMIN'

export type GuardUser = {
  id: string
  email?: string | null
  role?: Role
}

export async function requireUser(): Promise<{ user: GuardUser }> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw {
      code: 'UNAUTHORIZED',
      message: 'Login required',
      status: 401,
    } satisfies HttpError
  }

  // Normalize/repair user id: ensure UUID, otherwise try lookup by email and rehydrate
  const email = session.user.email ?? null
  let effectiveId = String(session.user.id)

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(effectiveId) && email) {
    try {
      const u = await getUserByEmail(email)
      if (u?.id && uuidRegex.test(u.id)) {
        effectiveId = u.id
      }
    } catch {
      // ignore and fall through to validation below
    }
  }

  // If still not a valid UUID, force re-auth to avoid DB uuid errors
  if (!uuidRegex.test(effectiveId)) {
    throw {
      code: 'UNAUTHORIZED',
      message: 'Invalid session. Please log in again.',
      status: 401,
    } satisfies HttpError
  }

  const user: GuardUser = {
    id: effectiveId,
    email,
    role: session.user.role as Role | undefined,
  }

  return { user }
}

export async function requireAdmin(): Promise<{ user: GuardUser }> {
  const { user } = await requireUser()

  if (user.role !== 'ADMIN') {
    throw {
      code: 'FORBIDDEN',
      message: 'Admin only',
      status: 403,
    } satisfies HttpError
  }

  return { user }
}
