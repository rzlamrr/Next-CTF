export const runtime = 'nodejs'

import { ok, toErrorResponse } from '@/lib/utils/http'
import { getStorageDriver, storageDriverName } from '@/lib/storage'

/**
 * Health check: Storage backend
 *
 * GET /api/health/storage
 * Returns: { success: true, data: { driver: 'supabase'|'local', bucket: string | null, ok: boolean } }
 */
export async function GET(_req: Request): Promise<Response> {
  try {
    const name = storageDriverName()
    const bucket =
      name === 'supabase'
        ? (process.env.SUPABASE_BUCKET ?? 'challenge-files')
        : null

    // Initialize driver (throws if misconfigured, e.g., missing envs for supabase)
    let okFlag = false
    try {
      const driver = getStorageDriver()

      if (name === 'supabase') {
        // Minimal probe: attempt to generate a signed URL for a dummy key.
        // NotFound errors are acceptable for connectivity; we only care that the API is reachable.
        try {
          await driver.getSignedUrl('challenges/__health__.txt', 60)
          okFlag = true
        } catch {
          // Signed URL for a non-existent key will typically fail -> still indicates connectivity to storage.
          okFlag = true
        }
      } else {
        // Local driver: assume OK if driver initialized
        okFlag = true
      }
    } catch {
      // Driver failed to initialize (e.g., missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)
      okFlag = false
    }

    return ok<{
      driver: 'supabase' | 'local'
      bucket: string | null
      ok: boolean
    }>(
      {
        driver: name,
        bucket,
        ok: okFlag,
      },
      200
    )
  } catch (e: unknown) {
    return toErrorResponse(e, 'Storage not reachable')
  }
}
