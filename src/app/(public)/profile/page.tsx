import Link from 'next/link'
import { redirect } from 'next/navigation'
import GradientBanner from '@/components/ui/gradient-banner'
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

type SubmissionItem = {
  id: string
  challenge: { id: string; name: string }
  status: 'CORRECT' | 'INCORRECT' | 'PENDING'
  createdAt: string
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
    if (json.success) return json.data
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
    if (json.success) return json.data
    return null
  } catch {
    return null
  }
}

async function fetchMySubmissions(): Promise<SubmissionItem[] | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  try {
    const cookieStore = await cookies()
    const res = await fetch(`${base}/api/users/me/submissions`, {
      cache: 'no-store',
      headers: { cookie: cookieStore.toString() },
    })
    const json = (await res.json()) as Envelope<SubmissionItem[]>
    if ('success' in json && json.success) {
      return json.data
    }
    return null
  } catch {
    return null
  }
}

export default async function Page() {
  const session = await fetchSession()
  if (!session) {
    // Must be logged in
    redirect('/auth/login')
  }

  const [me, submissions, teamModeConfig] = await Promise.all([
    fetchMe(),
    fetchMySubmissions(),
    getConfig('team_mode'),
  ])
  const teamModeEnabled = teamModeConfig?.value?.toLowerCase() === 'true'

  if (!me) {
    return (
      <>
        <GradientBanner
          title="My Profile"
          subtitle="Your profile overview."
        />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Failed to load profile.
          </div>
        </main>
      </>
    )
  }

  const solves = (submissions ?? []).filter(s => s.status === 'CORRECT')
  const recentSolves = solves.slice(0, 10)

  return (
    <>
      <GradientBanner
        title="My Profile"
        subtitle="Your profile overview."
      />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Basic information about your account.
              </p>
            </div>
            <Link
              href="/profile/settings"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Edit settings
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <div className="text-xs uppercase text-muted-foreground">Name</div>
              <div className="mt-1 text-sm">{me.name ?? '—'}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-xs uppercase text-muted-foreground">Email</div>
              <div className="mt-1 text-sm">{me.email ?? '—'}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="text-xs uppercase text-muted-foreground">Role</div>
              <div className="mt-1 text-sm">{me.role ?? 'USER'}</div>
            </div>
            {teamModeEnabled ? (
              <div className="rounded-md border border-border p-3">
                <div className="text-xs uppercase text-muted-foreground">Team</div>
                <div className="mt-1 text-sm">
                  {me.team?.name ?? '—'}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent Solves</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest challenges you have solved.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Total solves: {solves.length}
            </div>
          </div>

          {recentSolves.length === 0 ? (
            <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No solved challenges yet.
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-md border border-border">
              {recentSolves.map(s => (
                <li key={s.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">{s.challenge.name}</span>
                  </div>
                  <time className="text-xs text-muted-foreground" title={new Date(s.createdAt).toLocaleString()}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  )
}
