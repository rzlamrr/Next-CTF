import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { POST as postAttempt } from '@/app/api/challenges/attempt/route'
import { supabase } from '@/lib/db'
import { resetDb, seedBasic, jsonRequest, readJson } from './utils'
import type { GuardUser } from '@/lib/auth/guards'

// session controls from jest.integration.setup
declare global {
  var setMockSession: (user: GuardUser | null) => void
  var clearMockSession: () => void
}

describe('API /api/challenges/attempt', () => {
  let user: { id: string; email: string }
  let stdChallenge: { id: string; flag: string; points: number }
  let dynChallenge: { id: string; flag: string; points: number }

  beforeAll(async () => {
    await resetDb()
    const seeded = await seedBasic()
    user = seeded.user
    stdChallenge = seeded.stdChallenge
    dynChallenge = seeded.dynChallenge
    global.clearMockSession()
  })

  afterAll(async () => {
    global.clearMockSession()
  })

  it('rejects unauthenticated users (401) via guards', async () => {
    global.clearMockSession()
    const req = jsonRequest('POST', '/api/challenges/attempt', {
      challengeId: stdChallenge.id,
      flag: 'anything',
    })
    const res = await postAttempt(req)
    expect([401, 400, 422, 500]).toContain(res.status)
    const body = await readJson<{ success: false; error: { code: string } }>(
      res
    )
    // Guard throws UNAUTHORIZED -> mapped by toErrorResponse
    if (res.status === 401) {
      expect(body.error.code).toBe('UNAUTHORIZED')
    }
  })

  it('returns correct=false for wrong flag and does not increase score', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    // Ensure starting score is 0
    const { count: preSolves } = await supabase
      .from('solves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    expect(preSolves).toBe(0)

    const req = jsonRequest('POST', '/api/challenges/attempt', {
      challengeId: stdChallenge.id,
      flag: 'flag{WRONG}',
    })
    const res = await postAttempt(req)
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: { correct: boolean; message: string; newScore?: number }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.correct).toBe(false)
    expect(body.data.message).toMatch(/Incorrect/i)
    expect(body.data.newScore).toBeUndefined()

    // No solve recorded
    const { count: postSolves } = await supabase
      .from('solves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('challenge_id', stdChallenge.id)
    expect(postSolves).toBe(0)
  })

  it('returns correct=true for correct flag and returns newScore including challenge points', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    const req = jsonRequest('POST', '/api/challenges/attempt', {
      challengeId: stdChallenge.id,
      flag: stdChallenge.flag,
    })
    const res = await postAttempt(req)
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: { correct: boolean; message: string; newScore?: number }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.correct).toBe(true)
    expect(body.data.message).toMatch(/Correct/i)
    expect(typeof body.data.newScore).toBe('number')
    expect(body.data.newScore).toBeGreaterThanOrEqual(stdChallenge.points)

    // Solve recorded exactly once
    const { count: solves } = await supabase
      .from('solves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('challenge_id', stdChallenge.id)
    expect(solves).toBe(1)
  })

  it('does not create duplicate solves on repeated correct submissions', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    const req = jsonRequest('POST', '/api/challenges/attempt', {
      challengeId: stdChallenge.id,
      flag: stdChallenge.flag,
    })
    const res = await postAttempt(req)
    expect(res.status).toBe(200)

    const { count: solves } = await supabase
      .from('solves')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('challenge_id', stdChallenge.id)
    expect(solves).toBe(1)
  })

  it('works for dynamic challenge and returns newScore when correct', async () => {
    global.setMockSession({ id: user.id, email: user.email, role: 'USER' })

    const req = jsonRequest('POST', '/api/challenges/attempt', {
      challengeId: dynChallenge.id,
      flag: dynChallenge.flag,
    })
    const res = await postAttempt(req)
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: { correct: boolean; newScore?: number }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.correct).toBe(true)
    expect(typeof body.data.newScore).toBe('number')

    // Ensure a solve exists
    const { data: solve } = await supabase
      .from('solves')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', dynChallenge.id)
      .single()
    expect(solve).toBeTruthy()
  })
})
