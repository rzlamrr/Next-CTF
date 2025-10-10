import { describe, it, expect } from '@jest/globals'
import {
  ChallengeCreateSchema,
  ChallengeUpdateSchema,
} from '@/lib/validations/challenge'

describe('ChallengeCreateSchema', () => {
  it('coerces dynamic fields and base numbers from strings', () => {
    const input = {
      name: 'Test',
      description: 'Desc',
      category: 'web',
      type: 'DYNAMIC',
      difficulty: 'EASY',
      points: '200',
      flag: 'flag{ok}',
      initial: '250',
      function: 'log',
      value: '240',
      decay: '5',
      minimum: '100',
      maxAttempts: '3',
    } as unknown as Record<string, unknown>

    const parsed = ChallengeCreateSchema.safeParse(input)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      const v = parsed.data
      expect(v.points).toBe(200)
      expect(v.initial).toBe(250)
      expect(v.value).toBe(240)
      expect(v.decay).toBe(5)
      expect(v.minimum).toBe(100)
      expect(v.maxAttempts).toBe(3)
      expect(v.type).toBe('DYNAMIC')
      expect(v.difficulty).toBe('EASY')
    }
  })

  it('enforces minimum <= initial (or points if initial omitted)', () => {
    // Case 1: uses initial as base
    const bad1 = ChallengeCreateSchema.safeParse({
      name: 'A',
      description: 'B',
      category: 'web',
      points: 100,
      initial: 100,
      flag: 'x',
      minimum: 101,
    })
    expect(bad1.success).toBe(false)
    if (!bad1.success) {
      expect(bad1.error.issues.some(i => i.path.join('.') === 'minimum')).toBe(
        true
      )
    }

    // Case 2: uses points as base when initial omitted
    const bad2 = ChallengeCreateSchema.safeParse({
      name: 'A',
      description: 'B',
      category: 'web',
      points: 100,
      flag: 'x',
      minimum: 200,
    })
    expect(bad2.success).toBe(false)
    if (!bad2.success) {
      expect(bad2.error.issues.some(i => i.path.join('.') === 'minimum')).toBe(
        true
      )
    }

    // Case 3: valid when minimum == base
    const ok = ChallengeCreateSchema.safeParse({
      name: 'A',
      description: 'B',
      category: 'web',
      points: 150,
      flag: 'x',
      minimum: 150,
    })
    expect(ok.success).toBe(true)
  })
})

describe('ChallengeUpdateSchema', () => {
  it('rejects empty object', () => {
    const res = ChallengeUpdateSchema.safeParse({})
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]?.message).toMatch(
        /No fields provided for update/
      )
    }
  })

  it('allows partial updates and coerces numeric strings', () => {
    const res = ChallengeUpdateSchema.safeParse({
      points: '300',
      minimum: '50',
      decay: '2',
      name: 'Updated',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.points).toBe(300)
      expect(res.data.minimum).toBe(50)
      expect(res.data.decay).toBe(2)
      expect(res.data.name).toBe('Updated')
    }
  })

  it('validates minimum against provided base (initial or points) when present', () => {
    const bad = ChallengeUpdateSchema.safeParse({
      points: 100,
      minimum: 200,
    })
    expect(bad.success).toBe(false)
    if (!bad.success) {
      expect(bad.error.issues.some(i => i.path.join('.') === 'minimum')).toBe(
        true
      )
    }

    // If base not provided (no points/initial in payload), allow minimum (backend maps initial -> points)
    const ok = ChallengeUpdateSchema.safeParse({
      minimum: 10,
      description: 'x',
    })
    expect(ok.success).toBe(true)
  })
})
