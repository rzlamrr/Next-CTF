/**
 * Users - Me API
 *
 * GET /api/users/me
 *   - Requires auth (requireUser)
 *   - Returns user profile + team summary (if any)
 *   Response: { "success": true, "data": { id, name, email, role, team?: { id, name } } }
 *
 * PATCH /api/users/me
 *   - Requires auth (requireUser)
 *   - Body: UserUpdateSchema
 *   - Updates allowed user fields
 *   Response: { "success": true, "data": { id, name, email, role, team?: { id, name } } }
 *
 * Note: The provided UserUpdateSchema includes fields (language, affiliation, country)
 * that are not present in the current Prisma User model. This handler will validate
 * the payload but will only persist fields that exist in the User model (currently: name).
 */

import { requireUser } from '@/lib/auth/guards'
import { getUserById, updateUser } from '@/lib/db/queries'
import { ok, err, toErrorResponse, parseJson } from '@/lib/utils/http'
import { UserUpdateSchema } from '@/lib/validations/user'

function shapeUser(
  u: NonNullable<Awaited<ReturnType<typeof getUserById>>> | null
) {
  if (!u) return null
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    website: u.website,
    affiliation: u.affiliation,
    country: u.country,
    team: u.team ? { id: u.team.id, name: u.team.name } : null,
  }
}

// GET /api/users/me
export async function GET(): Promise<Response> {
  try {
    const { user } = await requireUser()

    const dbUser = await getUserById(user.id)
    if (!dbUser) {
      return err('NOT_FOUND', 'User not found', 404)
    }

    return ok(shapeUser(dbUser), 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to fetch current user')
  }
}

// PATCH /api/users/me
export async function PATCH(req: Request): Promise<Response> {
  try {
    const { user } = await requireUser()
    const body = await parseJson(req, UserUpdateSchema)

    // Map validated fields to actual Prisma User updatable fields
    const data: Partial<{ name: string; website: string; affiliation: string; country: string }> = {}
    if (typeof body.name === 'string') data.name = body.name
    if (typeof body.website === 'string') data.website = body.website
    if (typeof body.affiliation === 'string') data.affiliation = body.affiliation
    if (typeof body.country === 'string') data.country = body.country

    if (Object.keys(data).length === 0) {
      // No persistable fields in current schema
      return err('VALIDATION_ERROR', 'No updatable fields provided', 422)
    }

    const updated = await updateUser(user.id, data)
    // Refetch with team summary for response consistency
    const refreshed = await getUserById(updated.id)

    return ok(shapeUser(refreshed), 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to update current user')
  }
}
