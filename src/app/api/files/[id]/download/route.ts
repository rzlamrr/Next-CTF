export const runtime = 'nodejs'

import { err, toErrorResponse } from '@/lib/utils/http'
import { getFileById } from '@/lib/db/queries'
import { getStorageDriver, isSupabase } from '@/lib/storage'
import { promises as fs } from 'node:fs'
import path from 'node:path'

function getUploadRoot(): string {
  return process.env.UPLOAD_DIR ?? '.uploads'
}

function contentTypeFromExt(filename: string): string {
  const ext = filename.toLowerCase()
  if (ext.endsWith('.txt')) return 'text/plain'
  if (ext.endsWith('.zip')) return 'application/zip'
  if (ext.endsWith('.pdf')) return 'application/pdf'
  if (ext.endsWith('.png')) return 'image/png'
  if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) return 'image/jpeg'
  if (ext.endsWith('.gif')) return 'image/gif'
  if (ext.endsWith('.tar')) return 'application/x-tar'
  if (ext.endsWith('.gz')) return 'application/gzip'
  return 'application/octet-stream'
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params
    if (!id) {
      return err('VALIDATION_ERROR', 'File ID is required', 422)
    }

    const file = await getFileById(id)
    if (!file) {
      return err('NOT_FOUND', 'File not found', 404)
    }

    const key = file.location // stored canonical key
    if (!key || key.length === 0) {
      return err('NOT_FOUND', 'Invalid file record', 404)
    }

    if (isSupabase()) {
      const driver = getStorageDriver()
      const signedUrl = await driver.getSignedUrl(key, 300)
      return Response.redirect(signedUrl, 302)
    }

    // Local: stream or read and return
    const uploadRoot = getUploadRoot()
    const fullPath = path.join(uploadRoot, key.replace(/^\/+/, ''))
    let data: Buffer
    try {
      data = await fs.readFile(fullPath)
    } catch {
      return err('NOT_FOUND', 'File content missing', 404)
    }

    const filename = path.basename(fullPath)
    const contentType = contentTypeFromExt(filename)

    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    })
  } catch (e: unknown) {
    return toErrorResponse(e, 'Failed to download file')
  }
}
