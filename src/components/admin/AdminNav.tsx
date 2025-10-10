'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

type NavItem = {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/challenges', label: 'Challenges' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminNav({
  isOpen,
  onToggle,
}: {
  isOpen: boolean
  onToggle?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => onToggle?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed z-40 inset-y-0 left-0 w-64 border-r border-border bg-card',
          'transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
        ].join(' ')}
        aria-label="Admin sidebar navigation"
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-6 border-b border-border">
            <div className="text-lg font-bold text-foreground">Admin Panel</div>
            <div className="mt-1 text-sm text-muted-foreground truncate">
              {session?.user?.name ?? session?.user?.email ?? 'Administrator'}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navItems.map(item => {
                // Fix: Dashboard should only be active on exact /admin path
                const active =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === item.href ||
                      pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[
                        'block rounded-md px-3 py-2 text-sm font-medium',
                        active
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      ].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="px-4 py-4 border-t border-border">
            <Link
              href="/"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
