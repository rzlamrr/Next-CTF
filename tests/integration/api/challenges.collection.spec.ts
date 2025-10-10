import { describe, it, expect, beforeAll } from '@jest/globals'
import { GET as listChallenges } from '@/app/api/challenges/route'
import { prisma } from '@/lib/db'
import { resetDb, seedBasic, makeUrl } from './utils'

describe('API /api/challenges (collection)', () => {
  beforeAll(async () => {
    await resetDb()
    await seedBasic()
  })

  it('lists challenges with solveCount and value mapping', async () => {
    const req = new Request(makeUrl('/api/challenges'))
    const res = await listChallenges(req)
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      success: boolean
      data: Array<{
        id: string
        name: string
        value: number
        solveCount: number
        type: 'STANDARD' | 'DYNAMIC'
      }>
    }
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)

    // Should include at least our seeded items
    const ids = body.data.map(c => c.id)
    expect(ids.length).toBeGreaterThanOrEqual(2)

    // Solve count initially zero
    for (const c of body.data) {
      expect(typeof c.solveCount).toBe('number')
      expect(c.solveCount).toBeGreaterThanOrEqual(0)
      // Value should be points for STANDARD; for DYNAMIC value retained when present
      expect(typeof c.value).toBe('number')
    }
  })

  it('applies filters: category, difficulty, type', async () => {
    const req = new Request(
      makeUrl('/api/challenges', {
        category: 'Web',
        difficulty: 'EASY',
        type: 'STANDARD',
      })
    )
    const res = await listChallenges(req)
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      success: boolean
      data: Array<{ category: string; difficulty: string; type: string }>
    }
    expect(body.success).toBe(true)
    for (const c of body.data) {
      expect(c.category).toBe('Web')
      expect(c.difficulty).toBe('EASY')
      expect(c.type).toBe('STANDARD')
    }
  })

  it('updates solveCount after a solve is recorded', async () => {
    // Record a solve for first challenge
    const first = await prisma.challenge.findFirst({ select: { id: true } })
    expect(first).toBeTruthy()
    const cId = first!.id

    const user = await prisma.user.findFirst({ select: { id: true } })
    expect(user).toBeTruthy()

    await prisma.solve.create({ data: { userId: user!.id, challengeId: cId } })

    const req = new Request(makeUrl('/api/challenges'))
    const res = await listChallenges(req)
    const body = (await res.json()) as {
      success: boolean
      data: Array<{ id: string; solveCount: number }>
    }
    expect(body.success).toBe(true)

    const row = body.data.find(c => c.id === cId)
    expect(row).toBeTruthy()
    expect(row!.solveCount).toBeGreaterThanOrEqual(1)
  })
})
