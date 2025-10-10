import { prisma } from '@/lib/db'

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
  await prisma.solve.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.fieldEntry.deleteMany()
  await prisma.field.deleteMany()
  await prisma.solution.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.file.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
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
  const admin = await prisma.user.create({
    data: {
      name: 'rizal',
      email: 'rizal@example.com',
      password: 'hashed',
      role: 'ADMIN',
    },
    select: { id: true, email: true },
  })

  const user = await prisma.user.create({
    data: {
      name: 'icank',
      email: 'icank@example.com',
      password: 'hashed',
      role: 'USER',
    },
    select: { id: true, email: true },
  })

  const std = await prisma.challenge.create({
    data: {
      name: 'Std Challenge',
      description: 'Simple standard',
      category: 'Web',
      difficulty: 'EASY',
      points: 100,
      flag: 'flag{std}',
      type: 'STANDARD',
    },
    select: { id: true, flag: true, points: true },
  })

  const dyn = await prisma.challenge.create({
    data: {
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
    },
    select: { id: true, flag: true, points: true },
  })

  return { admin, user, stdChallenge: std, dynChallenge: dyn }
}
