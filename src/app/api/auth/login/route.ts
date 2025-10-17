import { ok, err, toErrorResponse, parseJson } from '@/lib/utils/http'
import { loginSchema } from '@/lib/validations'
import { supabase } from '@/lib/db'
import { compare } from 'bcryptjs'

/**
 * Auth - Login API
 *
 * POST /api/auth/login
 * Body: { "identifier": string, "password": string }
 * Behavior:
 *   - Validates payload
 *   - Verifies credentials against database (email === identifier OR name === identifier)
 *   - Returns { success: true } or standardized error envelope
 *
 * Note:
 *   - UI pages should continue to use signIn('credentials', { identifier, password, redirect: false })
 *   - This endpoint provides a unified API contract for programmatic logins without redirects
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const { identifier, password } = await parseJson(req, loginSchema)

    console.info('[API][login] parsed payload', {
      identifierPresent: !!identifier,
      passwordPresent: !!password,
    })

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${identifier},name.eq.${identifier}`)
      .single()

    console.info('[API][login] user lookup', {
      found: !!user,
      userId: user?.id,
      email: user?.email,
      error: error?.message,
    })

    if (error || !user) {
      console.warn('[API][login] invalid credentials - no user', { identifier })
      return err(
        'INVALID_CREDENTIALS',
        'Invalid username/email or password',
        401
      )
    }

    const valid = await compare(password, user.password)
    console.info('[API][login] password compare', { valid, userId: user.id })
    if (!valid) {
      console.warn('[API][login] invalid credentials - bad password', {
        userId: user.id,
      })
      return err(
        'INVALID_CREDENTIALS',
        'Invalid username/email or password',
        401
      )
    }

    // Indicate success for unified contract; session cookie is created via client-side signIn('credentials').
    console.info('[API][login] success', { userId: user.id })
    return ok(true, 200)
  } catch (e) {
    console.error('[API][login] error', e)
    return toErrorResponse(e, 'Failed to login')
  }
}
