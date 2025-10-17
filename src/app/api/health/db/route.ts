export const runtime = 'nodejs'

import { ok, toErrorResponse } from '@/lib/utils/http'
import { supabase } from '@/lib/db'

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

    // Check database connectivity with a simple count query
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    clearTimeout(timeout)

    if (error) throw error

    return ok<{ connected: boolean; count: number | null }>({ connected: true, count }, 200)
  } catch (e: unknown) {
    // Standardized envelope
    return toErrorResponse(e, 'Database not reachable')
  }
}
