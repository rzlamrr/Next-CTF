'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'

type Theme = 'light' | 'dark' | 'system'

const ORDER: Theme[] = ['light', 'dark', 'system']

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const onClick = React.useCallback(() => {
    const idx = ORDER.indexOf(theme)
    const next = ORDER[(idx + 1) % ORDER.length]
    setTheme(next)
  }, [theme, setTheme])

  const label = React.useMemo(() => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
      default:
        return 'System'
    }
  }, [theme])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-label="Toggle theme (cycles light, dark, system)"
      title="Toggle theme"
      className="gap-2"
    >
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 rounded-full bg-primary"
      ></span>
      <span className="text-xs text-foreground">{label}</span>
    </Button>
  )
}

export default ThemeToggle
