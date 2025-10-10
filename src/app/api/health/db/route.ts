export const runtime = 'nodejs'

import { ok, toErrorResponse } from '@/lib/utils/http'
import { prisma } from '@/lib/db/index'

/**
 * Health check: Database connectivity
 *
 * GET /api/health/db
 * Returns: { success: true, data: { connected: true } } on success
 */
export async function GET(_req: Request): Promise<Response> {
  try {
    // Lightweight query: count users table. Any successful query implies connectivity.
    // Use a small timeout to avoid hanging forever in case of misconfiguration.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5_000)

    // Prisma doesn't support AbortController; the timeout is a no-op here,
    // but retained for future enhancement. The count itself is lightweight.
    await prisma.user.count()

    clearTimeout(timeout)
    return ok<{ connected: boolean }>({ connected: true }, 200)
  } catch (e: unknown) {
    // Standardized envelope
    return toErrorResponse(e, 'Database not reachable')
  }
}
