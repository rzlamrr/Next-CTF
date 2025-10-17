import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import NotificationsBell from '@/components/ui/notifications-bell'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/ui/site-logo'
import UserMenu from '@/components/ui/user-menu'
import { getConfig } from '@/lib/db/queries'

export async function Navbar() {
  const session = await getServerSession(authOptions)

  // Check if team mode is enabled
  const teamModeConfig = await getConfig('team_mode')
  const teamModeEnabled = teamModeConfig?.value?.toLowerCase() === 'true'

  // Check if registration is enabled
  const registrationConfig = await getConfig('registration_enabled')
  const registrationEnabled = registrationConfig?.value?.toLowerCase() === 'true'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-6">
        <SiteLogo />
        <nav className="flex items-center gap-6 text-base">
          <Link
            href="/challenges"
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            Challenges
          </Link>
          <Link
            href="/scoreboard"
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            Scoreboard
          </Link>
          <Link
            href="/users"
            className="font-medium text-muted-foreground hover:text-foreground"
          >
            Users
          </Link>
          {teamModeEnabled && (
            <Link
              href="/teams"
              className="font-medium text-muted-foreground hover:text-foreground"
            >
              Teams
            </Link>
          )}
          {/* Optional: reference site shows "Learn" */}
          {/* <Link href="/learn" className="font-medium text-muted-foreground hover:text-foreground">Learn</Link> */}
          {session?.user ? (
            <>
              {/* Profile & Logout are in UserMenu */}
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
              {registrationEnabled && (
                <Link href="/auth/register">
                  <Button variant="default" size="sm">
                    Register
                  </Button>
                </Link>
              )}
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <NotificationsBell />
          <ThemeToggle />
          {session?.user ? <UserMenu teamModeEnabled={teamModeEnabled} /> : null}
        </div>
      </div>
    </header>
  )
}