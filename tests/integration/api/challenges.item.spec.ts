import { describe, it, expect, beforeAll } from '@jest/globals'
import { GET as getChallengeItem } from '@/app/api/challenges/[id]/route'
import { prisma } from '@/lib/db'
import { resetDb, seedBasic, makeUrl } from './utils'

type Item = {
  id: string
  name: string
  description: string
  value: number
  points: number
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
  type: 'STANDARD' | 'DYNAMIC'
  tags: string[]
  topics: string[]
  hints: Array<{ id: string; cost: number }>
}

describe('API /api/challenges/:id (item)', () => {
  let stdId = ''
  let dynId = ''

  beforeAll(async () => {
    await resetDb()
    const seeded = await seedBasic()
    stdId = seeded.stdChallenge.id
    dynId = seeded.dynChallenge.id

    // Attach some tags/topics and hints to standard challenge
    await prisma.tag.create({ data: { name: 'web', color: '#00f' } })
    await prisma.topic.create({
      data: { name: 'SQL Injection', category: 'Web' },
    })
    await prisma.challenge.update({
      where: { id: stdId },
      data: {
        tags: { connect: [{ name: 'web' }] },
        topics: { connect: [{ name: 'SQL Injection' }] },
        hints: { create: [{ title: 'Hint1', content: 'Try union', cost: 10 }] },
      },
    })
  })

  it('returns item with display value and shaped relational fields (STANDARD)', async () => {
    const req = new Request(makeUrl(`/api/challenges/${stdId}`))
    const ctx = { params: { id: stdId } }
    const res = await getChallengeItem(req, ctx)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { success: true; data: Item }
    expect(body.success).toBe(true)

    const item = body.data
    expect(item.id).toBe(stdId)
    expect(item.type).toBe('STANDARD')
    expect(typeof item.value).toBe('number')
    expect(item.value).toBe(item.points) // STANDARD maps value to points
    expect(Array.isArray(item.tags)).toBe(true)
    expect(Array.isArray(item.topics)).toBe(true)
    expect(item.tags).toContain('web')
    expect(item.topics).toContain('SQL Injection')
    expect(item.hints.length).toBeGreaterThanOrEqual(1)
    expect(typeof item.hints[0]?.cost).toBe('number')
  })

  it('returns item with display value (DYNAMIC) using persisted value when present', async () => {
    const req = new Request(makeUrl(`/api/challenges/${dynId}`))
    const ctx = { params: { id: dynId } }
    const res = await getChallengeItem(req, ctx)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { success: true; data: Item }
    expect(body.success).toBe(true)

    const item = body.data
    expect(item.id).toBe(dynId)
    expect(item.type).toBe('DYNAMIC')
    // Seeded dyn challenge has value set equal to points
    expect(item.value).toBe(item.points)
  })

  it('returns 404 when challenge not found', async () => {
    const fakeId = 'non-existent-id'
    const req = new Request(makeUrl(`/api/challenges/${fakeId}`))
    const ctx = { params: { id: fakeId } }
    const res = await getChallengeItem(req, ctx)
    expect(res.status).toBe(404)
  })
})
