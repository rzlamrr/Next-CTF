import { describe, it, expect } from '@jest/globals'
import { UserUpdateSchema } from '@/lib/validations/user'

describe('UserUpdateSchema', () => {
  it('rejects empty object', () => {
    const res = UserUpdateSchema.safeParse({})
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.error.issues[0]?.message).toMatch(
        /No fields provided for update/
      )
    }
  })

  it('accepts any single optional field when non-empty', () => {
    const cases = [
      { name: 'Roo' },
      { language: 'en' },
      { affiliation: 'CTF Team' },
      { country: 'ID' },
    ]

    for (const input of cases) {
      const res = UserUpdateSchema.safeParse(input)
      expect(res.success).toBe(true)
      if (res.success) {
        const keys = Object.keys(input)
        for (const k of keys) {
          // @ts-expect-error index access for dynamic key
          expect(res.data[k]).toBe(input[k])
        }
      }
    }
  })

  it('rejects empty strings for provided fields', () => {
    const cases = [
      { name: '' },
      { language: '' },
      { affiliation: '' },
      { country: '' },
    ]

    for (const input of cases) {
      const res = UserUpdateSchema.safeParse(input)
      expect(res.success).toBe(false)
      if (!res.success) {
        const paths = res.error.issues.map(i => i.path.join('.'))
        expect(paths.length).toBeGreaterThan(0)
      }
    }
  })

  it('accepts multiple fields together', () => {
    const res = UserUpdateSchema.safeParse({
      name: 'Rizal',
      language: 'en',
      affiliation: 'NextCTFd',
      country: 'KR',
    })
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.data.name).toBe('Rizal')
      expect(res.data.language).toBe('en')
      expect(res.data.affiliation).toBe('NextCTFd')
      expect(res.data.country).toBe('KR')
    }
  })
})
