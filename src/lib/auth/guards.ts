import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { HttpError } from '@/lib/utils/http'

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

  const user: GuardUser = {
    id: session.user.id as string,
    email: session.user.email ?? null,
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
