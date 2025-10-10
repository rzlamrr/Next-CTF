/**
 * Admin - Bulk Dynamic Scoring Recalculation
 *
 * POST /api/challenges/recalculate
 * - Admin only
 * - Finds all DYNAMIC challenges, recomputes and persists their value
 *
 * Response: 200 { success: true, data: { count: number, updatedIds: string[] } }
 */

import { ok, toErrorResponse } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { prisma } from '@/lib/db'
import { updateChallengeValue } from '@/lib/db/queries'

// POST /api/challenges/recalculate
export async function POST(): Promise<Response> {
  try {
    await requireAdmin()

    const dynamicChallenges = await prisma.challenge.findMany({
      where: { type: 'DYNAMIC' },
      select: { id: true },
    })

    const ids = dynamicChallenges.map((c: { id: string }) => c.id)

    const updatedIds: string[] = []
    for (const id of ids) {
      try {
        const { previous, updated } = await updateChallengeValue(id)
        // Only record if changed or computed returned a valid number
        if (typeof updated === 'number') {
          updatedIds.push(id)
        }
      } catch {
        // skip failures per challenge; continue bulk operation
      }
    }

    return ok<{ count: number; updatedIds: string[] }>(
      { count: updatedIds.length, updatedIds },
      200
    )
  } catch (e) {
    return toErrorResponse(e, 'Failed to bulk recalculate challenge values')
  }
}
