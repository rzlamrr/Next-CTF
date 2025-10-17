import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { GET as getSession } from '@/app/api/session/route'
import { supabase } from '@/lib/db'
import { createUser } from '@/lib/db/queries'
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
    await supabase.from('solves').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('field_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('fields').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('solutions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('files').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const admin = await createUser({
      name: 'rizal',
      email: 'rizal@example.com',
      password: 'hashed',
      role: 'ADMIN',
    })

    const user = await createUser({
      name: 'icank',
      email: 'icank@example.com',
      password: 'hashed',
      role: 'USER',
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
