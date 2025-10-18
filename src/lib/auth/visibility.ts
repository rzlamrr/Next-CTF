import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getConfig } from '@/lib/db/queries'

export type VisibilityMode = 'public' | 'private' | 'admin'

export interface VisibilityContext {
  isAuthenticated: boolean
  isAdmin: boolean
}

/**
 * Get the current user's visibility context
 */
export async function getVisibilityContext(): Promise<VisibilityContext> {
  const session = await getServerSession(authOptions)

  return {
    isAuthenticated: !!session?.user,
    isAdmin: (session?.user as any)?.role === 'ADMIN',
  }
}

/**
 * Check if the user can access a resource based on visibility mode
 */
export function canAccess(
  visibilityMode: VisibilityMode,
  context: VisibilityContext
): boolean {
  // Admins always have access to everything
  if (context.isAdmin) {
    return true
  }

  switch (visibilityMode) {
    case 'public':
      return true
    case 'private':
      return context.isAuthenticated
    case 'admin':
      return false // Non-admins cannot access admin-only resources
    default:
      return false
  }
}

/**
 * Get visibility mode from config value
 */
export function parseVisibilityMode(value: string | undefined): VisibilityMode {
  const normalized = value?.toLowerCase().trim()
  if (normalized === 'public' || normalized === 'private' || normalized === 'admin') {
    return normalized
  }
  return 'public' // default to public
}

/**
 * Check if challenges are accessible to the current user
 */
export async function canAccessChallenges(): Promise<boolean> {
  const [config, context] = await Promise.all([
    getConfig('challenges_visibility'),
    getVisibilityContext(),
  ])

  const mode = parseVisibilityMode(config?.value)
  return canAccess(mode, context)
}

/**
 * Check if accounts (users/teams) are accessible to the current user
 */
export async function canAccessAccounts(): Promise<boolean> {
  const [config, context] = await Promise.all([
    getConfig('accounts_visibility'),
    getVisibilityContext(),
  ])

  const mode = parseVisibilityMode(config?.value)
  return canAccess(mode, context)
}

/**
 * Check if scoreboard is accessible to the current user
 */
export async function canAccessScoreboard(): Promise<boolean> {
  const [config, context] = await Promise.all([
    getConfig('scoreboard_visibility'),
    getVisibilityContext(),
  ])

  const mode = parseVisibilityMode(config?.value)
  return canAccess(mode, context)
}

/**
 * Check if registration is enabled
 */
export async function isRegistrationEnabled(): Promise<boolean> {
  const config = await getConfig('registration_enabled')
  return config?.value?.toLowerCase() === 'true'
}

/**
 * Get visibility mode for a specific resource type
 */
export async function getVisibilityMode(
  resourceType: 'challenges' | 'accounts' | 'scoreboard'
): Promise<VisibilityMode> {
  const configKey = `${resourceType}_visibility`
  const config = await getConfig(configKey)
  return parseVisibilityMode(config?.value)
}
