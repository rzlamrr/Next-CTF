import { jest } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'

type Role = 'USER' | 'ADMIN'
type GuardUser = {
  id: string
  email?: string | null
  role?: Role
}

// Ensure Prisma uses a dedicated SQLite DB for integration tests
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev-test.db'

// Ensure dev-test.db has Prisma schema by copying seeded dev.db if available
function ensureTestDbSeed(): void {
  try {
    const src = path.resolve(process.cwd(), 'dev.db')
    const dest = path.resolve(process.cwd(), 'dev-test.db')
    const srcExists = fs.existsSync(src)
    const destExists = fs.existsSync(dest)
    if (srcExists && !destExists) {
      fs.copyFileSync(src, dest)
    }
  } catch {
    // noop: tests may still create tables if schema already applied elsewhere
  }
}

// Session mock holder
let sessionUser: GuardUser | null = null

// Mock next-auth getServerSession to return our controlled session user
jest.mock('next-auth', () => {
  return {
    getServerSession: jest.fn(async () =>
      sessionUser ? { user: sessionUser } : null
    ),
  }
})

// Expose globals to control session from tests (strict types, no any)
declare global {
  // Set a session user (or null to clear)
  // Example: setMockSession({ id: 'u1', email: 'x@y', role: 'ADMIN' })
  var setMockSession: (user: GuardUser | null) => void
  // Clear any mocked session
  var clearMockSession: () => void
}

global.setMockSession = (user: GuardUser | null) => {
  sessionUser = user
}

global.clearMockSession = () => {
  sessionUser = null
}

// Default: start unauthenticated, and clear after each test to keep isolation
beforeAll(() => {
  // Ensure test DB file exists with schema
  ensureTestDbSeed()
  sessionUser = null
})

afterEach(() => {
  sessionUser = null
})
