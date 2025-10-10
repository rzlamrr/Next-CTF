import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { StorageDriver, UploadResult } from './types'

const DEFAULT_UPLOAD_ROOT = process.env.UPLOAD_DIR ?? '.uploads'

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true })
}

function normalizeKey(key: string): string {
  // Prevent accidental absolute paths
  return key.replace(/^\/+/, '')
}

export class LocalStorageDriver implements StorageDriver {
  private root: string

  constructor(rootDir?: string) {
    this.root = rootDir ?? DEFAULT_UPLOAD_ROOT
  }

  private resolve(key: string): string {
    const safeKey = normalizeKey(key)
    return path.join(this.root, safeKey)
  }

  async upload(
    buffer: Buffer,
    key: string,
    _contentType: string
  ): Promise<UploadResult> {
    const fullPath = this.resolve(key)
    await ensureDir(path.dirname(fullPath))
    await fs.writeFile(fullPath, buffer)
    // Return a file:// URL for convenience; DB should store the "key"
    return { url: `file://${path.resolve(fullPath)}`, key }
  }

  async getSignedUrl(key: string, _expiresSeconds: number): Promise<string> {
    // Local: downloads are handled by the API route which streams the file.
    // Return a best-effort relative path hint; callers in this codebase won't rely on it for local.
    const safeKey = normalizeKey(key)
    return `/${this.root}/${safeKey}`.replace(/\/+/g, '/')
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.resolve(key)
    try {
      await fs.unlink(fullPath)
    } catch (e: unknown) {
      const err = e as { code?: string }
      if (err.code === 'ENOENT') return // Already gone
      throw e
    }
  }
}

export function createLocalStorageDriver(rootDir?: string): LocalStorageDriver {
  return new LocalStorageDriver(rootDir)
}
