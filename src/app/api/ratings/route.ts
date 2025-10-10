/**
 * Ratings - Create/Update (Upsert)
 *
 * POST /api/ratings
 * - User only
 * - Body: RatingCreateSchema
 * - Upsert user rating per challenge; return updated aggregate
 *
 * Example:
 *   Body: { "challengeId": "xxx", "value": 4, "review": "Nice challenge" }
 *   Response: { "success": true, "data": { "average": 3.8, "count": 12, "breakdown": { "1": 1, "4": 5 } } }
 */

import { ok, toErrorResponse, parseJson, err } from '@/lib/utils/http'
import { requireUser } from '@/lib/auth/guards'
import { RatingCreateSchema } from '@/lib/validations/rating'
import { upsertRating } from '@/lib/db/queries'

// POST /api/ratings
export async function POST(req: Request): Promise<Response> {
  try {
    const { user } = await requireUser()
    const body = await parseJson(req, RatingCreateSchema)

    if (!body.challengeId) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const agg = await upsertRating(
      user.id,
      body.challengeId,
      body.value,
      body.review
    )

    return ok(agg, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to submit rating')
  }
}
