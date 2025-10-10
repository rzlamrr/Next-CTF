import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs} seconds ago`
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return formatDate(date)
}

export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

export function getFlagRegex(pattern: string): RegExp {
  // Escape special regex characters except for wildcards
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
  // Replace wildcard * with regex pattern .*
  const regexPattern = escapedPattern.replace(/\*/g, '.*')
  return new RegExp(`^${regexPattern}$`)
}

export function validateFlag(flag: string, pattern: string): boolean {
  const regex = getFlagRegex(pattern)
  return regex.test(flag)
}

export function calculateDynamicScore(
  initialPoints: number,
  decayLimit: number,
  minimumPoints: number,
  solves: number
): number {
  if (solves === 0) return initialPoints

  const decay = initialPoints - minimumPoints
  const coefficient = decay / (decayLimit * decayLimit)
  const points = initialPoints - coefficient * solves * solves

  return Math.max(Math.floor(points), minimumPoints)
}
