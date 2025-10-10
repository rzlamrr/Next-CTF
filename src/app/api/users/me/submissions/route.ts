/**
 * Users - My Submissions
 *
 * GET /api/users/me/submissions
 * - Requires auth (requireUser)
 * - Returns own submissions with status
 *
 * Example:
 *   Response: { "success": true, "data": [ { "id":"...","challenge":{"id":"c1","name":"Simple Flag"},"status":"INCORRECT","createdAt":"2025-01-01T00:00:00.000Z" } ] }
 */

import { ok, toErrorResponse } from '@/lib/utils/http'
import { requireUser } from '@/lib/auth/guards'
import { listMySubmissions } from '@/lib/db/queries'

type SubmissionItem = {
  id: string
  challenge: { id: string; name: string }
  status: 'CORRECT' | 'INCORRECT' | 'PENDING'
  createdAt: string
}

// GET /api/users/me/submissions
export async function GET(): Promise<Response> {
  try {
    const { user } = await requireUser()

    const items = await listMySubmissions(user.id)

    const data: SubmissionItem[] = items.map(s => ({
      id: s.id,
      challenge: s.challenge,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    }))

    return ok<SubmissionItem[]>(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list my submissions')
  }
}
