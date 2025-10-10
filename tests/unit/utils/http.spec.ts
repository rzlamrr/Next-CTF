import { describe, it, expect } from '@jest/globals'
import { z } from 'zod'
import {
  ok,
  err,
  toErrorResponse,
  parseJson,
  prismaError,
  type HttpError,
} from '@/lib/utils/http'

describe('http.ok/err helpers', () => {
  it('ok returns standardized success envelope and status (default 200)', async () => {
    const res = ok({ a: 1 })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true, data: { a: 1 } })
  })

  it('ok allows custom status', async () => {
    const res = ok({ created: true }, 201)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toEqual({ success: true, data: { created: true } })
  })

  it('err returns standardized error envelope and status (default 400)', async () => {
    const res = err('BAD_REQUEST', 'nope')
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'nope' },
    })
  })

  it('err allows custom status', async () => {
    const res = err('UNPROCESSABLE', 'validation failed', 422)
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      error: { code: 'UNPROCESSABLE', message: 'validation failed' },
    })
  })
})

describe('http.parseJson', () => {
  const schema = z.object({
    x: z.number().int(),
    name: z.string().min(1),
  })

  it('parses valid json and validates with zod', async () => {
    const req = new Request('http://test.local/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ x: 42, name: 'alpha' }),
    })

    const data = await parseJson(req, schema)
    expect(data).toEqual({ x: 42, name: 'alpha' })
  })

  it('throws HttpError INVALID_JSON on invalid JSON', async () => {
    const req = new Request('http://test.local/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not valid json',
    })

    await expect(parseJson(req, schema)).rejects.toMatchObject({
      code: 'INVALID_JSON',
      status: 400,
    } satisfies Partial<HttpError>)
  })

  it('throws HttpError VALIDATION_ERROR on zod validation failure (422)', async () => {
    const req = new Request('http://test.local/api', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ x: 'NaN', name: '' }),
    })

    await expect(parseJson(req, schema)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 422,
    } satisfies Partial<HttpError>)
  })
})

describe('http.toErrorResponse', () => {
  it('maps HttpError to error envelope using its status', async () => {
    const httpError: HttpError = {
      code: 'FORBIDDEN',
      message: 'nope',
      status: 403,
    }
    const res = toErrorResponse(httpError)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({
      success: false,
      error: { code: 'FORBIDDEN', message: 'nope' },
    })
  })

  it('maps ZodError to 422 VALIDATION_ERROR', async () => {
    const schema = z.object({ a: z.number().int().min(1) })
    let resJson: any
    try {
      schema.parse({ a: 0 }) // throws ZodError
    } catch (e) {
      const res = toErrorResponse(e, 'fallback')
      expect(res.status).toBe(422)
      resJson = await res.json()
    }
    expect(resJson.success).toBe(false)
    expect(resJson.error.code).toBe('VALIDATION_ERROR')
    expect(typeof resJson.error.message).toBe('string')
  })

  it('maps unknown or Node-like error objects to 500 INTERNAL_ERROR with fallback message', async () => {
    const res = toErrorResponse(new Error('boom'), 'fallback')
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(typeof body.error.message).toBe('string')
  })
})

describe('http.prismaError', () => {
  it('maps P2002 to 409 CONFLICT', async () => {
    const mapped = prismaError({ code: 'P2002' })
    expect(mapped).not.toBeNull()
    const body = await mapped!.json()
    expect(mapped!.status).toBe(409)
    expect(body).toEqual({
      success: false,
      error: { code: 'CONFLICT', message: 'Resource already exists' },
    })
  })

  it('maps P2003 to 409 CONSTRAINT_VIOLATION', async () => {
    const mapped = prismaError({ code: 'P2003' })
    expect(mapped).not.toBeNull()
    const body = await mapped!.json()
    expect(mapped!.status).toBe(409)
    expect(body.error.code).toBe('CONSTRAINT_VIOLATION')
  })

  it('maps P2025 to 404 NOT_FOUND', async () => {
    const mapped = prismaError({ code: 'P2025' })
    expect(mapped).not.toBeNull()
    const body = await mapped!.json()
    expect(mapped!.status).toBe(404)
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('returns null for unmapped codes', () => {
    expect(prismaError({ code: 'P9999' })).toBeNull()
  })
})
