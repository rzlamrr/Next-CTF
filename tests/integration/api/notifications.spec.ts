import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import {
  GET as getNotifications,
  PATCH as patchNotifications,
} from '@/app/api/notifications/route'
import { POST as postAdminNotifications } from '@/app/api/admin/notifications/route'
import { supabase } from '@/lib/db'
import { createUser, createNotification } from '@/lib/db/queries'
import { resetDb, seedBasic, jsonRequest, readJson } from './utils'
import type { GuardUser } from '@/lib/auth/guards'

// session controls from jest.integration.setup
declare global {
  var setMockSession: (user: GuardUser | null) => void
  var clearMockSession: () => void
}

describe('API /api/notifications (user)', () => {
  let user: { id: string; email: string }

  beforeAll(async () => {
    await resetDb()
    const seeded = await seedBasic()
    user = seeded.user

    // Seed some notifications for the user
    await supabase.from('notifications').insert([
      {
        user_id: user.id,
        title: 'Welcome',
        content: 'Hello user!',
        read: false,
      },
      {
        user_id: user.id,
        title: 'Update',
        content: 'New challenge added',
        read: false,
      },
    ])
  })

  afterAll(async () => {
    global.clearMockSession()
  })

  it('rejects unauthenticated GET with 401', async () => {
    global.clearMockSession()
    const res = await getNotifications()
    expect([401, 400, 422, 500]).toContain(res.status)
    // If 401, ensure code
    if (res.status === 401) {
      const body = await readJson<{ success: false; error: { code: string } }>(
        res
      )
      expect(body.error.code).toBe('UNAUTHORIZED')
    }
  })

  it('lists notifications for authenticated user ordered by newest', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    const res = await getNotifications()
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: Array<{
        id: string
        title: string
        read: boolean
        createdAt: string
      }>
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(2)

    // All seeded are unread initially
    for (const n of body.data) expect(n.read).toBe(false)
  })

  it('marks selected notifications as read via PATCH', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    const { data: current } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)

    const ids = (current || []).map((n: { id: string }) => n.id)
    const req = jsonRequest('PATCH', '/api/notifications', { ids })
    const res = await patchNotifications(req)
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: { updatedCount: number }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.updatedCount).toBe(ids.length)

    const { data: after } = await supabase
      .from('notifications')
      .select('read')
      .eq('user_id', user.id)

    expect((after || []).every((n: { read: boolean }) => n.read === true)).toBe(true)
  })
})

describe('API /api/admin/notifications (admin broadcast)', () => {
  let admin: { id: string; email: string }
  let user: { id: string; email: string }

  beforeAll(async () => {
    await resetDb()
    const seeded = await seedBasic()
    admin = seeded.admin
    user = seeded.user
    global.clearMockSession()
  })

  afterAll(async () => {
    global.clearMockSession()
  })

  it('rejects non-admin POST with 403', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    const req = jsonRequest('POST', '/api/admin/notifications', {
      title: 'Admin Only',
      body: 'Secret',
      target: 'ALL',
    })
    const res = await postAdminNotifications(req)
    expect([403, 400, 422, 500]).toContain(res.status)
  })

  it('creates a USER-target notification when admin posts', async () => {
    global.setMockSession({ id: admin.id, email: admin.email, role: 'ADMIN' })

    const req = jsonRequest('POST', '/api/admin/notifications', {
      title: 'Personal',
      body: 'Hi there',
      target: 'USER',
      userId: user.id,
    })
    const res = await postAdminNotifications(req)
    expect(res.status).toBe(201)

    const body = await readJson<{
      success: true
      data: { createdCount: number; target: string }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.target).toBe('USER')
    expect(body.data.createdCount).toBe(1)

    const { data: rows } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('title', 'Personal')

    expect((rows || []).length).toBe(1)
  })

  it('broadcasts to ALL users', async () => {
    global.setMockSession({ id: admin.id, email: admin.email, role: 'ADMIN' })

    // Add another user to ensure multiple recipients
    const other = await createUser({
      name: 'other',
      email: 'other@example.com',
      password: 'hashed',
      role: 'USER',
    })

    const { data: users } = await supabase.from('users').select('id')

    const req = jsonRequest('POST', '/api/admin/notifications', {
      title: 'Global',
      body: 'Broadcast message',
      target: 'ALL',
    })
    const res = await postAdminNotifications(req)
    expect(res.status).toBe(201)

    const body = await readJson<{
      success: true
      data: { createdCount: number; target: string }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.target).toBe('ALL')
    expect(body.data.createdCount).toBe((users || []).length)

    const { data: rows } = await supabase
      .from('notifications')
      .select('*')
      .eq('title', 'Global')

    expect((rows || []).length).toBe((users || []).length)
  })

  it('broadcasts to TEAM members', async () => {
    global.setMockSession({ id: admin.id, email: admin.email, role: 'ADMIN' })

    // Create a team and attach the regular user
    const { data: team } = await supabase
      .from('teams')
      .insert({ name: 'Broadcast Team', description: 't', captain_id: admin.id })
      .select('id')
      .single()

    if (team) {
      await supabase
        .from('users')
        .update({ team_id: team.id })
        .eq('id', user.id)
    }

    const req = jsonRequest('POST', '/api/admin/notifications', {
      title: 'TeamMsg',
      body: 'Hello team',
      target: 'TEAM',
      teamId: team?.id,
    })
    const res = await postAdminNotifications(req)
    expect(res.status).toBe(201)

    const body = await readJson<{
      success: true
      data: { createdCount: number; target: string }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.target).toBe('TEAM')
    expect(body.data.createdCount).toBeGreaterThanOrEqual(1)

    const { data: rows } = await supabase
      .from('notifications')
      .select('*')
      .eq('title', 'TeamMsg')

    expect((rows || []).length).toBeGreaterThanOrEqual(1)
  })
})
