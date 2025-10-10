/**
 * Solutions - Admin Create/Upsert
 *
 * POST /api/solutions
 * - Admin only
 * - Body: SolutionCreateSchema
 * - Creates or upserts a solution for a challenge (single solution per challenge)
 *
 * Example:
 *   Body: { "challengeId": "xxx", "content": "Detailed writeup", "state": "published" }
 *   Response: { "success": true, "data": { "id":"...","challengeId":"xxx","content":"Detailed writeup","state":"published","createdAt":"...","updatedAt":"..." } }
 */

import { ok, toErrorResponse, parseJson, err } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { SolutionCreateSchema } from '@/lib/validations/solution'
import { createSolution } from '@/lib/db/queries'

// POST /api/solutions
export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin()
    const body = await parseJson(req, SolutionCreateSchema)

    if (!body.challengeId) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const created = await createSolution(
      body.challengeId,
      body.content,
      body.state ?? null
    )

    const data = {
      id: created.id,
      challengeId: created.challengeId,
      content: created.content,
      state: created.state ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }

    return ok(data, 201)
  } catch (e) {
    return toErrorResponse(e, 'Failed to create solution')
  }
}
