/**
 * Hints - Admin Create
 *
 * POST /api/hints
 * - Admin only
 * - Body: HintCreateSchema
 * - Creates a hint for a challenge
 *
 * Example:
 *   Body: { "challengeId": "xxx", "title": "Hint 1", "content": "....", "cost": 10, "type": "text", "requirements": "..." }
 *   Response: { "success": true, "data": { "id": "...", "challengeId": "xxx", "title": "Hint 1", "cost": 10, "type": null, "requirements": null } }
 */

import { ok, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { HintCreateSchema } from '@/lib/validations/hint'
import { createHint } from '@/lib/db/queries'

// POST /api/hints
export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin()

    const body = await parseJson(req, HintCreateSchema)

    const created = await createHint({
      challengeId: body.challengeId,
      title: body.title,
      content: body.content,
      cost: body.cost,
      type: body.type ?? null,
      requirements: body.requirements ?? null,
    })

    const data = {
      id: created.id,
      challengeId: created.challengeId,
      title: created.title,
      cost: created.cost,
      type: created.type ?? null,
      requirements: created.requirements ?? null,
      createdAt: created.createdAt,
    }

    return ok(data, 201)
  } catch (e) {
    return toErrorResponse(e, 'Failed to create hint')
  }
}
