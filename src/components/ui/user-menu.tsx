'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

type Props = {
  teamModeEnabled?: boolean
}

export default function UserMenu({ teamModeEnabled = false }: Props) {
  const { data: session } = useSession()
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const name = (session?.user as any)?.name as string | null | undefined
  const email = (session?.user as any)?.email as string | null | undefined
  const displayName = name || (email ? email.split('@')[0] : 'User')
  const initial = (displayName?.[0] ?? 'U').toUpperCase()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
    }
  }

  const itemClass =
    'block w-full text-left rounded-md px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none text-foreground'

  return (
    <div className="relative" ref={dropdownRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        className="relative inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground">
          {initial}
        </div>
        <span className="hidden sm:inline ml-2">{displayName}</span>
      </button>

      {open ? (
        <div
          role="menu"
          id="user-menu"
          className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card p-1 shadow-lg"
        >
          <Link href="/profile" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          {teamModeEnabled ? (
            <Link href="/teams/me" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
              Team
            </Link>
          ) : null}
          <Link
            href="/profile/settings"
            className={itemClass}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          {isAdmin && (
            <>
              <div className="my-1 border-t border-border" />
              <Link href="/admin" className={itemClass} role="menuitem" onClick={() => setOpen(false)}>
                Admin Panel
              </Link>
            </>
          )}
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            className={`${itemClass} text-destructive`}
            onClick={() => {
              setOpen(false)
              void signOut({ redirect: true, callbackUrl: '/' })
            }}
            role="menuitem"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}