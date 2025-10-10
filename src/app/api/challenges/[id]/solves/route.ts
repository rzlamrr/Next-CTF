/**
 * Challenge Solves - Recent list
 *
 * GET /api/challenges/:id/solves
 * - Public
 * - Returns recent solves with user/team and date
 *
 * Example:
 *   Request: GET /api/challenges/abc123/solves
 *   Response: { "success": true, "data": [ { "id":"...","createdAt":"2025-01-01T00:00:00.000Z","user":{"id":"u1","name":"alice"},"team":null } ] }
 */

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { listSolvesByChallenge } from '@/lib/db/queries'

type SolveItem = {
  id: string
  createdAt: string
  user: { id: string; name: string } | null
  team: { id: string; name: string } | null
}

// GET /api/challenges/:id/solves
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params
    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const items = await listSolvesByChallenge(id)

    const data: SolveItem[] = items.map(s => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      user: s.user ?? null,
      team: s.team ?? null,
    }))

    return ok<SolveItem[]>(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list challenge solves')
  }
}
