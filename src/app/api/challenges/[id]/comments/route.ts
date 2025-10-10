/**
 * Challenge Comments - List
 *
 * GET /api/challenges/:id/comments
 * - Public
 * - Returns latest comments with author
 *
 * Example:
 *   Request: GET /api/challenges/abc123/comments
 *   Response: { "success": true, "data": [ { "id":"...","content":"Great","user":{"id":"u1","name":"alice"},"createdAt":"..." } ] }
 */

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import { listCommentsByChallenge } from '@/lib/db/queries'

type CommentItem = {
  id: string
  content: string
  user: { id: string; name: string }
  createdAt: string
}

// GET /api/challenges/:id/comments
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params
    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const comments = await listCommentsByChallenge(id)
    const data: CommentItem[] = comments.map(c => ({
      id: c.id,
      content: c.content,
      user: c.user,
      createdAt: c.createdAt.toISOString(),
    }))

    return ok<CommentItem[]>(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list comments')
  }
}
