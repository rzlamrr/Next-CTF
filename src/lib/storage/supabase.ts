import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { StorageDriver, UploadResult } from './types'

const DEFAULT_BUCKET = process.env.SUPABASE_BUCKET ?? 'challenge-files'

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return v
}

/**
 * SupabaseStorageDriver
 *
 * - Uses service role key for server-side upload/delete and signed URLs.
 * - Bucket name defaults to "challenge-files".
 * - Attempts to create the bucket if missing (ignored if already exists).
 */
export class SupabaseStorageDriver implements StorageDriver {
  private client: SupabaseClient
  private bucket: string
  private bucketInitPromise?: Promise<void>

  constructor(
    url = process.env.SUPABASE_URL,
    serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket = DEFAULT_BUCKET
  ) {
    const supabaseUrl = url ?? ''
    const supabaseKey = serviceKey ?? ''
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SupabaseStorageDriver requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set'
      )
    }
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    this.bucket = bucket
  }

  private async ensureBucket(): Promise<void> {
    if (this.bucketInitPromise) return this.bucketInitPromise
    this.bucketInitPromise = (async () => {
      try {
        // Check existing buckets
        const { data: buckets, error: listErr } =
          await this.client.storage.listBuckets()
        if (listErr) {
          // If list fails (insufficient perms or API difference), assume bucket exists
          return
        }
        const exists = (buckets ?? []).some(
          (b: { name: string }) => b.name === this.bucket
        )
        if (!exists) {
          // Create bucket as private (public access not required; signed URLs suffice)
          const { error: createErr } = await this.client.storage.createBucket(
            this.bucket,
            {
              public: false,
              fileSizeLimit: null,
            }
          )
          if (createErr) {
            // If creation fails due to already exists or permissions, ignore.
            // Operational note: ensure the bucket is created manually in your Supabase project if needed.
          }
        }
      } catch {
        // Best-effort; proceed assuming bucket exists.
      }
    })()
    return this.bucketInitPromise
  }

  async upload(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<UploadResult> {
    await this.ensureBucket()
    // Supabase accepts ArrayBuffer/Uint8Array/Blob. Use Uint8Array for Node buffers.
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, new Uint8Array(buffer), {
        contentType,
        upsert: true,
      })
    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }
    // Return key as canonical "location"; signed URLs are generated on demand.
    return { url: `supabase://${this.bucket}/${key}`, key }
  }

  async getSignedUrl(key: string, expiresSeconds: number): Promise<string> {
    await this.ensureBucket()
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresSeconds)
    if (error || !data?.signedUrl) {
      throw new Error(
        `Supabase signed URL failed: ${error?.message ?? 'unknown error'}`
      )
    }
    return data.signedUrl
  }

  async delete(key: string): Promise<void> {
    await this.ensureBucket()
    const { error } = await this.client.storage.from(this.bucket).remove([key])
    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`)
    }
  }
}

export function createSupabaseStorageDriver(): SupabaseStorageDriver {
  return new SupabaseStorageDriver()
}
