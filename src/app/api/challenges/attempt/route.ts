/**
 * Challenges - Attempt API
 *
 * POST /api/challenges/attempt
 * - Requires auth (requireUser)
 * - Body: { "challengeId": string, "flag": string }
 * - Response: { "success": true, "data": { "correct": boolean, "message"?: string, "newScore"?: number } }
 *
 * Example:
 *   Request JSON: { "challengeId": "xxx", "flag": "CTF{...}" }
 *   Response: { "success": true, "data": { "correct": true, "newScore": 200 } }
 */

import { ok, toErrorResponse, parseJson, err } from '@/lib/utils/http'
import { requireUser } from '@/lib/auth/guards'
import { FlagSubmitSchema } from '@/lib/validations/submission'
import { submitFlag, getUserScore, getUserById } from '@/lib/db/queries'
import { logInfo, logError, logDebug } from '@/lib/utils/log'

// POST /api/challenges/attempt
export async function POST(req: Request): Promise<Response> {
  try {
    const { user } = await requireUser()
    logDebug('api/challenges/attempt', 'AUTH', { userId: user.id })
    const body = await parseJson(req, FlagSubmitSchema)
    logDebug('api/challenges/attempt', 'PARSE', {
      challengeId: body.challengeId,
    })

    const dbUser = await getUserById(user.id)
    if (!dbUser) {
      logError('api/challenges/attempt', 'USER_NOT_FOUND', 'User not found', {
        userId: user.id,
      })
      return err('NOT_FOUND', 'User not found', 404)
    }

    const { submission, correct } = await submitFlag({
      userId: user.id,
      teamId: dbUser.teamId ?? null,
      challengeId: body.challengeId,
      flag: body.flag,
    })
    logInfo(
      'api/challenges/attempt',
      correct ? 'SUBMIT_CORRECT' : 'SUBMIT_INCORRECT',
      {
        challengeId: body.challengeId,
        userId: user.id,
      }
    )

    const message = correct ? 'Correct flag' : 'Incorrect flag'

    let newScore: number | undefined = undefined
    if (correct) {
      // Compute user's new score after a successful solve
      newScore = await getUserScore(user.id)
    }

    return ok({ correct, message, newScore }, 200)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logError('api/challenges/attempt', 'EXCEPTION', msg)
    return toErrorResponse(e, 'Failed to submit flag')
  }
}
