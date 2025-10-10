import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { GET as getSession } from '@/app/api/session/route'
import { prisma } from '@/lib/db'
import type { GuardUser } from '@/lib/auth/guards'

// Types aligned with guards
type Role = 'USER' | 'ADMIN'

// Helpers to control NextAuth session (provided by jest.integration.setup)
declare global {
  var setMockSession: (user: GuardUser | null) => void
  var clearMockSession: () => void
}

describe('API /api/session', () => {
  let adminId = ''
  let userId = ''

  beforeAll(async () => {
    // Reset DB to deterministic state
    await prisma.solve.deleteMany()
    await prisma.submission.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.fieldEntry.deleteMany()
    await prisma.field.deleteMany()
    await prisma.solution.deleteMany()
    await prisma.rating.deleteMany()
    await prisma.file.deleteMany()
    await prisma.challenge.deleteMany()
    await prisma.team.deleteMany()
    await prisma.user.deleteMany()

    const admin = await prisma.user.create({
      data: {
        name: 'rizal',
        email: 'rizal@example.com',
        password: 'hashed',
        role: 'ADMIN',
      },
    })
    const user = await prisma.user.create({
      data: {
        name: 'icank',
        email: 'icank@example.com',
        password: 'hashed',
        role: 'USER',
      },
    })

    adminId = admin.id
    userId = user.id

    global.clearMockSession()
  })

  afterAll(async () => {
    global.clearMockSession()
  })

  it('returns null data when unauthenticated', async () => {
    global.clearMockSession()

    const res = await getSession()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
  })

  it('returns ADMIN role details when admin is logged in', async () => {
    global.setMockSession({
      id: adminId,
      email: 'rizal@example.com',
      role: 'ADMIN',
    })

    const res = await getSession()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({
      id: adminId,
      email: 'rizal@example.com',
      role: 'ADMIN',
    })
  })

  it('returns USER role details when user is logged in', async () => {
    global.setMockSession({
      id: userId,
      email: 'icank@example.com',
      role: 'USER',
    })

    const res = await getSession()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({
      id: userId,
      email: 'icank@example.com',
      role: 'USER',
    })
  })
})
