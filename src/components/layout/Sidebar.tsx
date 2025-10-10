'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type SidebarItem = {
  href: string
  label: string
  icon?: React.ReactNode
}

type SidebarProps = {
  items: SidebarItem[]
  title?: string
  isOpen?: boolean
  onToggle?: (open: boolean) => void
}

export function Sidebar({ items, title, isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => onToggle?.(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed z-40 inset-y-0 left-0 w-64 border-r border-border bg-card',
          'transform transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        ].join(' ')}
        aria-label="Sidebar navigation"
      >
        <div className="h-full flex flex-col">
          {title && (
            <div className="px-4 py-6 border-b border-border">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{title}</div>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}