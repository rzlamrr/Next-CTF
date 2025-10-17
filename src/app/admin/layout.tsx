import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminNavWrapper } from '@/components/admin/AdminNavWrapper'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import NotificationsBell from '@/components/ui/notifications-bell'
import { SiteLogoClient } from '@/components/ui/site-logo-client'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/admin')
  }

  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNavWrapper />
      <div className="md:ml-64">
        {/* Top navbar - consistent with public pages */}
        <header className="sticky top-0 z-30 border-b border-border bg-background shadow-sm">
          <div className="flex items-center gap-4 px-4 py-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <SiteLogoClient />

            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>/</span>
              <span className="font-medium text-foreground">Admin Panel</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back to Site
              </Link>
              <NotificationsBell />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

