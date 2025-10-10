import { NextResponse } from 'next/server'
import { ZodError, type ZodSchema } from 'zod'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}

export function ok<T = unknown>(data: T, status = 200): NextResponse {
  // Success: { "success": true, "data": ... }
  return NextResponse.json<SuccessEnvelope<T>>(
    { success: true, data },
    { status }
  )
}

export function err(code: string, message: string, status = 400): NextResponse {
  // Error: { "success": false, "error": { "code": string, "message": string } }
  return NextResponse.json<ErrorEnvelope>(
    { success: false, error: { code, message } },
    { status }
  )
}

export type HttpError = {
  code: string
  message: string
  status: number
}

/**
 * Convert thrown values to a standardized JSON error response.
 * Unknown errors map to 500.
 */
export function toErrorResponse(
  e: unknown,
  fallbackMessage = 'Unexpected error'
): NextResponse {
  if (isHttpError(e)) {
    return err(e.code, e.message, e.status)
  }
  if (e instanceof ZodError) {
    const issues = e.issues
      .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    return err('VALIDATION_ERROR', issues, 422)
  }
  if (isNodeError(e)) {
    return err('INTERNAL_ERROR', e.message || fallbackMessage, 500)
  }
  return err('INTERNAL_ERROR', fallbackMessage, 500)
}

function isNodeError(e: unknown): e is { message?: string } {
  return !!e && typeof e === 'object' && 'message' in (e as any)
}

function isHttpError(e: unknown): e is HttpError {
  return (
    !!e &&
    typeof e === 'object' &&
    'code' in (e as any) &&
    'message' in (e as any) &&
    'status' in (e as any)
  )
}

/**
 * Safe JSON parse + Zod validation with clear 422 errors.
 * Throws HttpError (or ZodError) on failure; callers should catch and return toErrorResponse(e).
 */
export async function parseJson<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw {
      code: 'INVALID_JSON',
      message: 'Invalid JSON payload',
      status: 400,
    } satisfies HttpError
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const issues = result.error.issues
      .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ')
    throw {
      code: 'VALIDATION_ERROR',
      message: issues,
      status: 422,
    } satisfies HttpError
  }

  return result.data
}

/**
 * Optional helper to map common Prisma errors to standardized responses.
 * Use when catching errors from DB layer.
 */
export function prismaError(e: any): NextResponse | null {
  const code = e?.code
  switch (code) {
    case 'P2002':
      return err('CONFLICT', 'Resource already exists', 409)
    case 'P2003':
      return err('CONSTRAINT_VIOLATION', 'Foreign key constraint failed', 409)
    case 'P2025':
      return err('NOT_FOUND', 'Resource not found', 404)
    default:
      return null
  }
}
