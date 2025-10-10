import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'
import GradientBanner from '@/components/ui/gradient-banner'
import { cookies } from 'next/headers'

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
  website?: string | null
  affiliation?: string | null
  country?: string | null
  team: TeamSummary
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

export default async function Page() {
  const session = await fetchSession()
  if (!session) {
    // Must be logged in
    redirect('/auth/login')
  }

  const me = await fetchMe()

  if (!me) {
    return (
      <>
        <GradientBanner
          title="Profile Settings"
          subtitle="Manage your account settings and information."
        />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Failed to load profile.
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <GradientBanner
        title="Profile Settings"
        subtitle="Manage your account settings and information."
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <section>
          <div className="rounded-lg border border-border bg-card p-4">
            <ProfileForm
              initial={{
                name: me.name,
                email: me.email,
                team: me.team,
                website: me.website,
                language: '',
                affiliation: me.affiliation,
                country: me.country,
              }}
            />
          </div>
        </section>
      </main>
    </>
  )
}