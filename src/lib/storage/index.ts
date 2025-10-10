import { createLocalStorageDriver, LocalStorageDriver } from './local'
import { createSupabaseStorageDriver, SupabaseStorageDriver } from './supabase'
import type { StorageDriver, StorageDriverName } from './types'

let singleton: StorageDriver | null = null

export function getStorageDriver(): StorageDriver {
  if (singleton) return singleton

  const driverName =
    (process.env.STORAGE_DRIVER as StorageDriverName | undefined) ?? 'local'

  if (driverName === 'supabase') {
    singleton = createSupabaseStorageDriver()
  } else {
    singleton = createLocalStorageDriver(process.env.UPLOAD_DIR)
  }
  return singleton
}

export function storageDriverName(): StorageDriverName {
  return (
    (process.env.STORAGE_DRIVER as StorageDriverName | undefined) ?? 'local'
  )
}

export function isSupabase(): boolean {
  return storageDriverName() === 'supabase'
}

// Re-export common types
export type { StorageDriver } from './types'
