import { supabase } from '@/lib/db'
import { createUser, createChallenge } from '@/lib/db/queries'

export function makeUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const base = 'http://127.0.0.1:4000'
  const url = new URL(path, base)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export function jsonRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  query?: Record<string, string | number | boolean | undefined>
): Request {
  const url = makeUrl(path, query)
  const init: RequestInit = { method }
  if (body !== undefined) {
    init.headers = { 'content-type': 'application/json' }
    init.body = JSON.stringify(body)
  }
  return new Request(url, init)
}

export async function readJson<T = any>(res: Response): Promise<T> {
  const data = await res.json()
  return data as T
}

/**
 * Wipe database tables for deterministic integration tests.
 * Order matters due to FK constraints.
 */
export async function resetDb(): Promise<void> {
  // Delete in order respecting FK constraints
  await supabase.from('solves').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('field_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('fields').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('solutions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('hints').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('files').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('challenge_topics').delete().neq('challenge_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('challenge_tags').delete().neq('challenge_id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('topics').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('awards').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

/**
 * Seed minimal fixtures: admin user, regular user, an EASY STANDARD challenge, and a DYNAMIC challenge.
 */
export async function seedBasic(): Promise<{
  admin: { id: string; email: string }
  user: { id: string; email: string }
  stdChallenge: { id: string; flag: string; points: number }
  dynChallenge: { id: string; flag: string; points: number }
}> {
  const admin = await createUser({
    name: 'rizal',
    email: 'rizal@example.com',
    password: 'hashed',
    role: 'ADMIN',
  })

  const user = await createUser({
    name: 'icank',
    email: 'icank@example.com',
    password: 'hashed',
    role: 'USER',
  })

  const std = await createChallenge({
    name: 'Std Challenge',
    description: 'Simple standard',
    category: 'Web',
    difficulty: 'EASY',
    points: 100,
    flag: 'flag{std}',
    type: 'STANDARD',
  })

  const dyn = await createChallenge({
    name: 'Dyn Challenge',
    description: 'Dynamic scoring',
    category: 'Reverse',
    difficulty: 'MEDIUM',
    points: 300,
    flag: 'flag{dyn}',
    type: 'DYNAMIC',
    value: 300,
    decay: 10,
    minimum: 50,
  })

  return {
    admin: { id: admin.id, email: admin.email },
    user: { id: user.id, email: user.email },
    stdChallenge: { id: std.id, flag: std.flag, points: std.points },
    dynChallenge: { id: dyn.id, flag: dyn.flag, points: dyn.points },
  }
}
