import type { Buffer } from 'node:buffer'

export type UploadResult = { url: string; key: string }

export interface StorageDriver {
  upload(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<UploadResult>
  getSignedUrl(key: string, expiresSeconds: number): Promise<string>
  delete(key: string): Promise<void>
}

export type StorageDriverName = 'supabase' | 'local'
