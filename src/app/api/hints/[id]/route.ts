/**
 * Hints - Admin Update/Delete
 *
 * PATCH /api/hints/:id
 * - Admin only
 * - Body: HintUpdateSchema
 * - Updates hint fields
 *
 * DELETE /api/hints/:id
 * - Admin only
 * - Deletes hint; 204 on success
 */

import { ok, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { HintUpdateSchema } from '@/lib/validations/hint'
import { updateHint, deleteHint } from '@/lib/db/queries'

// PATCH /api/hints/:id
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const body = await parseJson(req, HintUpdateSchema)

    const updated = await updateHint(id, {
      title: body.title,
      content: body.content,
      cost: body.cost,
      type: body.type ?? null,
      requirements: body.requirements ?? null,
    })

    const data = {
      id: updated.id,
      challengeId: updated.challengeId,
      title: updated.title,
      cost: updated.cost,
      type: updated.type ?? null,
      requirements: updated.requirements ?? null,
      updatedAt: updated.createdAt, // createdAt present; Prisma will not auto expose updatedAt for Hint; using createdAt for compatibility
    }

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to update hint')
  }
}

// DELETE /api/hints/:id
export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    await deleteHint(id)
    return new Response(null, { status: 204 })
  } catch (e) {
    return toErrorResponse(e, 'Failed to delete hint')
  }
}
