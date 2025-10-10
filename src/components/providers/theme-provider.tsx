'use client'

import React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
)

function getStoredTheme(): Theme | null {
  try {
    const raw = localStorage.getItem('theme')
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
    return null
  } catch {
    return null
  }
}

function prefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyThemeClass(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolved =
    theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme
  root.classList.toggle('dark', resolved === 'dark')
  // Optional: keep color-scheme in sync to help with native form controls
  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const stored = getStoredTheme()
    const initial = stored ?? defaultTheme
    setThemeState(initial)
    applyThemeClass(initial)
  }, [defaultTheme])

  // Apply whenever theme changes
  React.useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  // Sync across tabs and system preference changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const next = (e.newValue as Theme | null) ?? 'system'
        setThemeState(next)
      }
    }
    window.addEventListener('storage', onStorage)

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      // Only re-apply when using system mode
      const current = getStoredTheme() ?? theme
      if (current === 'system') applyThemeClass('system')
    }
    if (
      typeof (mql as MediaQueryList & { addEventListener?: unknown })
        .addEventListener === 'function'
    ) {
      mql.addEventListener('change', onChange)
    } else {
      const mqlAny = mql as unknown as {
        addListener?: (fn: () => void) => void
      }
      if (typeof mqlAny.addListener === 'function') {
        mqlAny.addListener(onChange)
      }
    }

    return () => {
      window.removeEventListener('storage', onStorage)
      if (
        typeof (mql as MediaQueryList & { removeEventListener?: unknown })
          .removeEventListener === 'function'
      ) {
        mql.removeEventListener('change', onChange)
      } else {
        const mqlAny = mql as unknown as {
          removeListener?: (fn: () => void) => void
        }
        if (typeof mqlAny.removeListener === 'function') {
          mqlAny.removeListener(onChange)
        }
      }
    }
  }, [theme])

  const setTheme = React.useCallback((next: Theme) => {
    try {
      localStorage.setItem('theme', next)
    } catch {
      // ignore
    }
    setThemeState(next)
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
