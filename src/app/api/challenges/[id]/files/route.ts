/**
 * Challenge Files - Metadata List
 *
 * GET /api/challenges/:id/files
 * - Public
 * - Returns file metadata (id, type?, location, sha1sum?)
 *
 * Example:
 *   Request: GET /api/challenges/abc123/files
 *   Response: { "success": true, "data": [ { "id":"...","type":null,"location":"/uploads/file.txt","sha1sum":null } ] }
 */

export const runtime = 'nodejs'

import { ok, err, toErrorResponse } from '@/lib/utils/http'
import {
  listChallengeFiles,
  createFileAndAttachToChallenge,
} from '@/lib/db/queries'
import { requireAdmin } from '@/lib/auth/guards'
import { getStorageDriver } from '@/lib/storage'
import { createHash } from 'node:crypto'

type FileMeta = {
  id: string
  type: string | null
  location: string
  sha1sum: string | null
}

// GET /api/challenges/:id/files
export async function GET(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params

    if (!id) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const files = await listChallengeFiles(id)

    const data: FileMeta[] = files.map(f => ({
      id: f.id,
      type: null, // placeholder: no file type column in schema (phase 2 metadata only)
      location: f.location,
      sha1sum: null, // placeholder: checksum not tracked in current schema
    }))

    return ok<FileMeta[]>(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list challenge files')
  }
}
// POST /api/challenges/:id/files
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // Admin guard
    await requireAdmin()

    const { id: challengeId } = await ctx.params
    if (!challengeId) {
      return err('VALIDATION_ERROR', 'Challenge ID is required', 422)
    }

    const form = await req.formData()
    const fileEntry = form.get('file')

    if (!(fileEntry instanceof Blob)) {
      return err(
        'VALIDATION_ERROR',
        'Missing file (multipart/form-data field "file")',
        422
      )
    }

    const providedName = form.get('filename')
    const providedType = form.get('contentType')

    const contentType =
      typeof providedType === 'string' && providedType.length > 0
        ? providedType
        : fileEntry.type || 'application/octet-stream'
    const filename =
      typeof providedName === 'string' && providedName.length > 0
        ? providedName
        : 'upload.bin'

    // Validation: size limit (50MB)
    const MAX_SIZE = 50 * 1024 * 1024
    if (fileEntry.size > MAX_SIZE) {
      return err(
        'PAYLOAD_TOO_LARGE',
        `File too large. Max 50MB, received ${Math.round(fileEntry.size / (1024 * 1024))}MB`,
        413
      )
    }

    // Validation: content-type whitelist
    const allowed = isAllowedContentType(contentType)
    if (!allowed) {
      return err(
        'VALIDATION_ERROR',
        `Unsupported content-type "${contentType}". Allowed: zip, text, pdf, images, binaries.`,
        422
      )
    }

    const arrayBuffer = await fileEntry.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Compute sha1 checksum
    const sha1sum = createHash('sha1').update(buffer).digest('hex')

    // Storage key convention: challenges/{id}/{timestamp}-{random}-{filename}
    const safeName = sanitizeFilename(filename)
    const key = `challenges/${challengeId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`

    const driver = getStorageDriver()
    const uploadRes = await driver.upload(buffer, key, contentType)

    // Persist metadata (current schema stores only location + challengeId)
    const created = await createFileAndAttachToChallenge(challengeId, {
      location: uploadRes.key, // store canonical key (not public URL)
      sha1sum,
      contentType,
      name: safeName,
    })

    return ok<{ id: string; location: string; sha1sum: string }>(
      { id: created.id, location: created.location, sha1sum },
      201
    )
  } catch (e: unknown) {
    return toErrorResponse(e, 'Failed to upload file')
  }
}

/** Allow: zip, text/*, pdf, images, binaries, tar/gzip */
function isAllowedContentType(ct: string): boolean {
  if (!ct) return false
  if (ct.startsWith('text/')) return true
  if (ct.startsWith('image/')) return true
  const allowed = new Set<string>([
    'application/zip',
    'application/x-zip-compressed',
    'application/pdf',
    'application/octet-stream',
    'application/x-tar',
    'application/gzip',
  ])
  return allowed.has(ct)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, '_').replace(/\s+/g, '_')
}
