import Link from 'next/link'
import { redirect } from 'next/navigation'
import GradientBanner from '@/components/ui/gradient-banner'
import TeamDetailClient from '@/components/teams/TeamDetailClient'
import { cookies } from 'next/headers'
import { getConfig } from '@/lib/db/queries'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type SessionUser = {
  id: string
  email: string | null
  role?: 'USER' | 'ADMIN'
} | null

type TeamSummary = { id: string; name: string } | null
type MeResponse = {
  id: string
  name: string | null
  email: string | null
  role?: string
  team: TeamSummary
}

type Member = {
  id: string
  name: string | null
  email: string | null
}

type TeamDetail = {
  id: string
  name: string
  description: string | null
  captainId: string
  members: Member[]
}

async function fetchSession(): Promise<SessionUser | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  try {
    const cookieStore = await cookies()
    const res = await fetch(`${base}/api/session`, {
      cache: 'no-store',
      headers: { cookie: cookieStore.toString() },
    })
    const json = (await res.json()) as Envelope<SessionUser>
    if ('success' in json && json.success) return json.data
    return null
  } catch {
    return null
  }
}

async function fetchMe(): Promise<MeResponse | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  try {
    const cookieStore = await cookies()
    const res = await fetch(`${base}/api/users/me`, {
      cache: 'no-store',
      headers: { cookie: cookieStore.toString() },
    })
    const json = (await res.json()) as Envelope<MeResponse>
    if ('success' in json && json.success) return json.data
    return null
  } catch {
    return null
  }
}

async function fetchTeam(teamId: string): Promise<TeamDetail | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  try {
    const cookieStore = await cookies()
    const res = await fetch(`${base}/api/teams/${teamId}`, {
      cache: 'no-store',
      headers: { cookie: cookieStore.toString() },
    })
    const json = (await res.json()) as Envelope<any>
    if ('success' in json && json.success && json.data) {
      const t = json.data
      const members: Member[] = Array.isArray(t.members)
        ? t.members.map((m: any) => ({
            id: String(m.id),
            name: (m.name ?? null) as string | null,
            email: (m.email ?? null) as string | null,
          }))
        : []
      return {
        id: String(t.id),
        name: String(t.name),
        description: (t.description ?? null) as string | null,
        captainId: String(t.captainId),
        members,
      }
    }
    return null
  } catch {
    return null
  }
}

export default async function Page() {
  const session = await fetchSession()
  if (!session) {
    redirect('/auth/login')
  }

  // Gate by admin team mode setting
  const teamModeConfig = await getConfig('team_mode')
  const teamModeEnabled = teamModeConfig?.value?.toLowerCase() === 'true'

  if (!teamModeEnabled) {
    return (
      <>
        <GradientBanner title="My Team" subtitle="Team mode is disabled." />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Team mode is currently disabled by the administrator.
          </div>
        </main>
      </>
    )
  }

  const me = await fetchMe()
  if (!me) {
    return (
      <>
        <GradientBanner title="My Team" subtitle="Your team details." />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Failed to load your profile.
          </div>
        </main>
      </>
    )
  }

  if (!me.team) {
    return (
      <>
        <GradientBanner title="My Team" subtitle="You are not in a team." />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              You are currently not a member of any team.
            </p>
            <div className="mt-3">
              <Link
                href="/teams"
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Browse teams
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  const team = await fetchTeam(me.team.id)
  if (!team) {
    return (
      <>
        <GradientBanner title="My Team" subtitle="Your team details." />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Failed to load your team details.
          </div>
        </main>
      </>
    )
  }

  const isCaptain = team.captainId === (session?.id ?? session?.email ?? '')

  return (
    <>
      <GradientBanner title="My Team" subtitle="Your team details and management." />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <TeamDetailClient
          team={team}
          currentUserId={session!.id as string}
          isCaptain={team.captainId === (session!.id as string)}
        />
      </main>
    </>
  )
}