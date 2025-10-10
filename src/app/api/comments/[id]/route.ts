/**
 * Comments - Delete (owner or admin)
 *
 * DELETE /api/comments/:id
 * - User only
 * - Allows delete if session.user.id === authorId OR role === ADMIN
 * - 204 on success
 */

import { toErrorResponse, err } from '@/lib/utils/http'
import { requireUser } from '@/lib/auth/guards'
import { deleteComment } from '@/lib/db/queries'

// DELETE /api/comments/:id
export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { user } = await requireUser()
    const { id } = await ctx.params

    if (!id) {
      return err('VALIDATION_ERROR', 'Comment ID is required', 422)
    }

    const role = (user.role ?? 'USER') as 'ADMIN' | 'USER'
    const ok = await deleteComment(id, user.id, role)
    if (!ok) {
      // Either not found or not authorized; spec emphasizes authorization, return 403
      return err('FORBIDDEN', 'Not allowed to delete this comment', 403)
    }

    return new Response(null, { status: 204 })
  } catch (e) {
    return toErrorResponse(e, 'Failed to delete comment')
  }
}
