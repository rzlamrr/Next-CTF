import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const isServer = typeof window === 'undefined'

// Resolve env per runtime to avoid client-side crashes during bundling
const supabaseUrl = isServer
  ? process.env.SUPABASE_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseKey = isServer
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Strict checks only on server runtime
if (isServer) {
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL environment variable (server runtime)')
  }
  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable (server runtime)')
  }
}

// Server-side client with service role key (bypasses RLS). On client, expose a safe stub.
export const supabaseAdmin: any = isServer
  ? createClient<Database>(supabaseUrl!, supabaseKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase admin client is not available in the browser. Use server-side APIs.'
          )
        },
      }
    )

// For backwards compatibility
export const supabase = supabaseAdmin
