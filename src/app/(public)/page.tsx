import Link from 'next/link'
import GradientBanner from '@/components/ui/gradient-banner'

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

async function fetchSession(): Promise<SessionUser | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/session`
    const res = await fetch(url, { cache: 'no-store' })
    const json = (await res.json()) as Envelope<SessionUser>
    // eslint-disable-next-line no-console
    console.info('[UI] fetchSession', {
      ok: 'success' in json ? json.success : false,
      url,
      user: (json as SuccessEnvelope<SessionUser>).success
        ? (json as SuccessEnvelope<SessionUser>).data
        : null,
    })
    if (json.success) {
      return json.data
    }
    return null
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[UI] fetchSession error', e)
    return null
  }
}

export default async function Page() {
  const session = await fetchSession()

  const siteName = 'CyberStorm CTF'
  const tagline =
    'Sharpen your skills. Solve challenges. Climb the leaderboard.'

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="/challenges"
              className="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Browse Challenges
            </Link>
            <Link
              href="/scoreboard"
              className="inline-flex items-center rounded-lg bg-background px-5 py-3 text-base font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              View Scoreboard
            </Link>
            {session ? (
              <Link
                href="/profile"
                className="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Go to Profile
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-lg bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Login
              </Link>
            )}
          </div>

          <div className="mt-6 text-xs text-muted-foreground">
            {session ? (
              <p>
                Logged in as{' '}
                <span className="font-medium text-foreground">
                  {session.email ?? session.id}
                </span>
              </p>
            ) : (
              <p>You are not logged in.</p>
            )}
          </div>
        </div>

        <section className="mt-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
                Solve
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Pick from a curated set of challenges across web, pwn, crypto,
                and more.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
                Compete
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Climb the leaderboard as you rack up points and improve your
                rank.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
                Learn
              </h3>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                Practice safely and learn at your own pace with progressive
                difficulty.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
