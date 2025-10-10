import { describe, it, expect } from '@jest/globals'
import { FlagSubmitSchema } from '@/lib/validations/submission'

describe('FlagSubmitSchema', () => {
  it('accepts valid payload', () => {
    const res = FlagSubmitSchema.safeParse({
      challengeId: 'abc123',
      flag: 'flag{correct}',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.challengeId).toBe('abc123')
      expect(res.data.flag).toBe('flag{correct}')
    }
  })

  it('rejects empty challengeId', () => {
    const res = FlagSubmitSchema.safeParse({ challengeId: '', flag: 'x' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(
        res.error.issues.some(i => i.path.join('.') === 'challengeId')
      ).toBe(true)
    }
  })

  it('rejects empty flag', () => {
    const res = FlagSubmitSchema.safeParse({ challengeId: 'abc123', flag: '' })
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues.some(i => i.path.join('.') === 'flag')).toBe(true)
    }
  })

  it('rejects missing fields', () => {
    const res = FlagSubmitSchema.safeParse({})
    expect(res.success).toBe(false)
    if (!res.success) {
      const paths = res.error.issues.map(i => i.path.join('.'))
      expect(paths).toEqual(expect.arrayContaining(['challengeId', 'flag']))
    }
  })
})
