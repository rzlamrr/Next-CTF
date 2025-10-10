/**
 * Admin - Challenge Scoring Params Update
 *
 * PATCH /api/challenges/:id/scoring
 * - Admin only
 * - Body: subset of ChallengeUpdateSchema { type, function, initial, minimum, decay }
 * - Maps `initial` -> `points` for storage
 * - Recalculates and persists dynamic `value` after update
 *
 * Response: 200 { success: true, data: { id, value, type, function, initial, minimum, decay, updatedAt } }
 */

import { ok, err, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { prisma } from '@/lib/db'
import { ChallengeUpdateSchema } from '@/lib/validations/challenge'
import { updateChallengeValue } from '@/lib/db/queries'
import { logInfo, logError, logDebug } from '@/lib/utils/log'

// PATCH /api/challenges/:id/scoring
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    logDebug('api/challenges/scoring', 'REQUEST', { id })
    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const body = await parseJson(req, ChallengeUpdateSchema)

    // Accept only scoring-related fields
    const updateData: {
      type?: 'STANDARD' | 'DYNAMIC'
      function?: 'static' | 'log' | 'exp' | 'linear'
      points?: number
      minimum?: number | null
      decay?: number | null
    } = {}

    if (typeof body.type !== 'undefined') {
      updateData.type = body.type as 'STANDARD' | 'DYNAMIC'
    }
    if (typeof body.function !== 'undefined') {
      updateData.function = body.function as 'static' | 'log' | 'exp' | 'linear'
    }
    if (typeof body.initial !== 'undefined') {
      updateData.points = body.initial as number
    }
    if (typeof body.minimum !== 'undefined') {
      updateData.minimum = body.minimum as number
    }
    if (typeof body.decay !== 'undefined') {
      // allow null if omitted; zod provided number>=0 when present
      updateData.decay = body.decay as number
    }

    // Ensure there is at least one scoring field to update
    if (Object.keys(updateData).length === 0) {
      return err('VALIDATION_ERROR', 'No scoring fields provided', 422)
    }

    // Update challenge scoring params
    const updated = await prisma.challenge.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        type: true,
        function: true,
        points: true,
        minimum: true,
        decay: true,
        value: true,
        updatedAt: true,
      },
    })
    logInfo('api/challenges/scoring', 'UPDATED_PARAMS', {
      id: updated.id,
      type: updated.type,
      function: updated.function,
      points: updated.points,
      minimum: updated.minimum,
      decay: updated.decay,
    })

    // Recompute and persist value if dynamic
    await updateChallengeValue(id)
    logInfo('api/challenges/scoring', 'VALUE_RECALCULATED', { id })

    // Refetch current after recalculation
    const current = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        function: true,
        points: true,
        minimum: true,
        decay: true,
        value: true,
        updatedAt: true,
      },
    })

    if (!current) {
      return err('NOT_FOUND', 'Challenge not found after update', 404)
    }

    const response = {
      id: current.id,
      value: current.value ?? current.points,
      type: current.type,
      function: current.function,
      initial: current.points,
      minimum: current.minimum ?? 0,
      decay: current.decay ?? 0,
      updatedAt: current.updatedAt,
    }

    return ok(response, 200)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logError('api/challenges/scoring', 'EXCEPTION', msg)
    return toErrorResponse(e, 'Failed to update scoring parameters')
  }
}
