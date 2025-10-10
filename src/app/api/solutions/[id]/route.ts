/**
 * Solutions - Admin Update/Delete
 *
 * PATCH /api/solutions/:id
 * - Admin only
 * - Body: SolutionUpdateSchema
 * - Updates solution fields
 *
 * DELETE /api/solutions/:id
 * - Admin only
 * - Deletes solution; 204 on success
 */

import { ok, toErrorResponse, parseJson, err } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { SolutionUpdateSchema } from '@/lib/validations/solution'
import { updateSolution, deleteSolution } from '@/lib/db/queries'

// PATCH /api/solutions/:id
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const body = await parseJson(req, SolutionUpdateSchema)

    const updated = await updateSolution(id, {
      content: body.content,
      state: body.state ?? null,
    })

    const data = {
      id: updated.id,
      challengeId: updated.challengeId,
      content: updated.content,
      state: updated.state ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to update solution')
  }
}

// DELETE /api/solutions/:id
export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    if (!id) {
      return err('VALIDATION_ERROR', 'Solution ID is required', 422)
    }

    await deleteSolution(id)
    return new Response(null, { status: 204 })
  } catch (e) {
    return toErrorResponse(e, 'Failed to delete solution')
  }
}
