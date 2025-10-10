import React from 'react'
import { SiteLogo } from '@/components/ui/site-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import NotificationsBell from '@/components/ui/notifications-bell'
import UserMenu from '@/components/ui/user-menu'

type HeaderProps = {
  title?: string
  subtitle?: string
  showUserMenu?: boolean
  showNotifications?: boolean
  showThemeToggle?: boolean
  teamModeEnabled?: boolean
}

export function Header({
  title,
  subtitle,
  showUserMenu = true,
  showNotifications = true,
  showThemeToggle = true,
  teamModeEnabled = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SiteLogo />
            {title && (
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {showNotifications && <NotificationsBell />}
            {showThemeToggle && <ThemeToggle />}
            {showUserMenu && <UserMenu teamModeEnabled={teamModeEnabled} />}
          </div>
        </div>
      </div>
    </header>
  )
}