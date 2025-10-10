export const runtime = 'nodejs'

import { err, toErrorResponse } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { getFileById, deleteFileById } from '@/lib/db/queries'
import { getStorageDriver } from '@/lib/storage'

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()

    const { id } = await ctx.params
    if (!id) {
      return err('VALIDATION_ERROR', 'File ID is required', 422)
    }

    const file = await getFileById(id)
    if (!file) {
      return err('NOT_FOUND', 'File not found', 404)
    }

    const key = file.location
    if (!key || key.length === 0) {
      // Still attempt to remove the DB record to avoid dangling entries
      await deleteFileById(id)
      return new Response(null, { status: 204 })
    }

    const driver = getStorageDriver()
    await driver.delete(key)

    await deleteFileById(id)

    return new Response(null, { status: 204 })
  } catch (e: unknown) {
    return toErrorResponse(e, 'Failed to delete file')
  }
}
