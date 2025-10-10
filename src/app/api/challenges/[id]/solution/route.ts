/**
 * Challenge Solution - Admin Only
 *
 * GET /api/challenges/:id/solution
 * - Admin only
 * - Returns solution content/state for a challenge
 *
 * Example:
 *   Request: GET /api/challenges/abc123/solution
 *   Response: { "success": true, "data": { "id":"...","challengeId":"abc123","content":"...","state":"published","createdAt":"...","updatedAt":"..." } }
 */

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { getSolutionByChallenge } from '@/lib/db/queries'

// GET /api/challenges/:id/solution
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const sol = await getSolutionByChallenge(id)
    if (!sol) {
      return err('NOT_FOUND', 'Solution not found', 404)
    }

    const data = {
      id: sol.id,
      challengeId: sol.challengeId,
      content: sol.content,
      state: sol.state ?? null,
      createdAt: sol.createdAt.toISOString(),
      updatedAt: sol.updatedAt.toISOString(),
    }

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to fetch solution')
  }
}
