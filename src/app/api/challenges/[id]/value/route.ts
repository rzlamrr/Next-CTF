/**
 * Challenge Value Preview (Public)
 *
 * GET /api/challenges/:id/value
 * - Public
 * - Returns { current: persisted value (or points), computed: algorithm output }
 *
 * Example:
 *   GET /api/challenges/abc123/value
 *   200 { success: true, data: { current: 300, computed: 275 } }
 */

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { prisma } from '@/lib/db'
import { computeChallengeValue } from '@/lib/db/queries'

// GET /api/challenges/:id/value
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params
    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { id: true, value: true, points: true },
    })

    if (!challenge) {
      return err('NOT_FOUND', 'Challenge not found', 404)
    }

    const current = challenge.value ?? challenge.points
    const computed = await computeChallengeValue(id)

    return ok<{ current: number; computed: number }>({ current, computed }, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to preview challenge value')
  }
}
