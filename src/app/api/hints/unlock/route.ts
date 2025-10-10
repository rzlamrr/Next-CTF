/**
 * Hints - Unlock
 *
 * POST /api/hints/unlock
 * - User only
 * - Body: HintUnlockSchema
 * - Creates Hint unlock record; returns unlock status
 *
 * Example:
 *   Body: { "hintId": "xxx" }
 *   Response: { "success": true, "data": { "unlocked": true, "already": false } }
 */

import { ok, toErrorResponse, parseJson, err } from '@/lib/utils/http'
import { requireUser } from '@/lib/auth/guards'
import { HintUnlockSchema } from '@/lib/validations/hint'
import { unlockHint } from '@/lib/db/queries'

// POST /api/hints/unlock
export async function POST(req: Request): Promise<Response> {
  try {
    const { user } = await requireUser()
    const body = await parseJson(req, HintUnlockSchema)

    if (!body.hintId) {
      return err('VALIDATION_ERROR', 'Hint ID is required', 422)
    }

    const result = await unlockHint(user.id, body.hintId)

    return ok(result, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to unlock hint')
  }
}
