/**
 * Hints - List for Challenge
 *
 * GET /api/challenges/:id/hints
 * - Public
 * - Returns hint summaries (id, title, cost, type?, requirements?)
 *
 * Example:
 *   Request: GET /api/challenges/abc123/hints
 *   Response: { "success": true, "data": [ { "id": "...", "title": "Hint 1", "cost": 10, "type": null, "requirements": null } ] }
 */

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { listHintsByChallenge } from '@/lib/db/queries'

type HintSummary = {
  id: string
  title: string
  cost: number
  type?: string | null
  requirements?: string | null
}

// GET /api/challenges/:id/hints
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params

    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const hints = await listHintsByChallenge(id)

    const data: HintSummary[] = hints.map(h => ({
      id: h.id,
      title: h.title,
      cost: h.cost,
      type: h.type ?? null,
      requirements: h.requirements ?? null,
    }))

    return ok<HintSummary[]>(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list hints')
  }
}
