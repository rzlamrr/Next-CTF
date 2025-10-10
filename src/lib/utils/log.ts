type Level = 'silent' | 'error' | 'warn' | 'info' | 'debug'

const LOG_LEVEL: Level = (process.env.LOG_LEVEL as Level) || 'silent'

function levelToNum(level: Level): number {
  switch (level) {
    case 'silent':
      return 0
    case 'error':
      return 1
    case 'warn':
      return 2
    case 'info':
      return 3
    case 'debug':
      return 4
    default:
      return 0
  }
}

const current = levelToNum(LOG_LEVEL)

function prefix(scope: string, code?: string): string {
  return `[${scope}${code ? `:${code}` : ''}]`
}

export function logError(
  scope: string,
  code: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  if (current >= 1) {
    // eslint-disable-next-line no-console
    console.error(prefix(scope, code), message, meta ? { meta } : '')
  }
}

export function logWarn(
  scope: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  if (current >= 2) {
    // eslint-disable-next-line no-console
    console.warn(prefix(scope), message, meta ? { meta } : '')
  }
}

export function logInfo(
  scope: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  if (current >= 3) {
    // eslint-disable-next-line no-console
    console.info(prefix(scope), message, meta ? { meta } : '')
  }
}

export function logDebug(
  scope: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  if (current >= 4) {
    // eslint-disable-next-line no-console
    console.debug(prefix(scope), message, meta ? { meta } : '')
  }
}
