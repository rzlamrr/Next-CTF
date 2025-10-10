/**
 * Challenge Ratings - Aggregate + Latest items
 *
 * GET /api/challenges/:id/ratings
 * - Public
 * - Returns average + breakdown and latest items
 *
 * Example:
 *   Request: GET /api/challenges/abc123/ratings
 *   Response: { "success": true, "data": { "average": 3.8, "count": 12, "breakdown": { "1": 1, "4": 5 }, "items": [ { "id":"...","value":4,"review":"Nice challenge","user":{"id":"u1","name":"alice"},"createdAt":"..." } ] } }
 */

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { listRatingsByChallenge } from '@/lib/db/queries'

type RatingItem = {
  id: string
  value: number
  review?: string | null
  user: { id: string; name: string }
  createdAt: string
}

type RatingsResponse = {
  average: number
  count: number
  breakdown: Record<number, number>
  items: RatingItem[]
}

// GET /api/challenges/:id/ratings
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params
    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const res = await listRatingsByChallenge(id)

    const data: RatingsResponse = {
      average: res.average,
      count: res.count,
      breakdown: res.breakdown,
      items: res.items.map(i => ({
        id: i.id,
        value: i.value,
        review: i.review ?? null,
        user: i.user,
        createdAt: i.createdAt.toISOString(),
      })),
    }

    return ok<RatingsResponse>(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list challenge ratings')
  }
}
