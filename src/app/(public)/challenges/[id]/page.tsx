import AttemptFlagForm from '@/components/challenges/AttemptFlagForm'
import Link from 'next/link'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type CType = 'STANDARD' | 'DYNAMIC'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'

type ChallengeDetail = {
  id: string
  name: string
  description: string
  value: number
  points: number
  category: string
  difficulty: Difficulty
  type: CType
  tags: string[]
  topics: string[]
  hints: Array<{ id: string; cost: number }>
}

async function fetchChallenge(id: string): Promise<ChallengeDetail | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const url = `${base}/api/challenges/${encodeURIComponent(id)}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const json = (await res.json()) as Envelope<ChallengeDetail>
    if (json.success) return json.data
    return null
  } catch {
    return null
  }
}

function Badge({
  children,
  color = 'gray',
}: {
  children: React.ReactNode
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}) {
  const map: Record<string, string> = {
    gray: 'bg-muted text-muted-foreground',
    blue: 'bg-info/10 text-info',
    green: 'bg-success/10 text-success',
    yellow: 'bg-warning/10 text-warning',
    red: 'bg-danger/10 text-danger',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[color]}`}
    >
      {children}
    </span>
  )
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await fetchChallenge(id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {!data ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          Challenge not found or failed to load.
          <div className="mt-2">
            <Link
              href="/challenges"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
            >
              Back to Challenges
            </Link>
          </div>
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {data.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Category:{' '}
                <span className="font-medium text-foreground">
                  {data.category}
                </span>{' '}
                • Points:{' '}
                <span className="font-medium text-foreground">
                  {data.value}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="blue">{data.type}</Badge>
              <Badge color="purple">{data.difficulty}</Badge>
            </div>
          </header>

          <section className="mt-6 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold text-foreground">
                Description
              </h2>
              <div className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {data.description}
              </div>
            </div>

            {data.tags?.length || data.topics?.length ? (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {data.tags?.length ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        Tags:
                      </span>
                      {data.tags.map(t => (
                        <Badge key={`tag-${t}`} color="gray">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {data.topics?.length ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        Topics:
                      </span>
                      {data.topics.map(t => (
                        <Badge key={`topic-${t}`} color="green">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">
              Submit Flag
            </h2>
            <div className="mt-2">
              <AttemptFlagForm challengeId={data.id} refreshOnSuccess />
            </div>
          </section>

          {data.hints?.length ? (
            <section className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">Hints</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {data.hints.map(h => (
                  <li key={h.id}>Hint available (cost: {h.cost})</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-8">
            <Link
              href="/challenges"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back to Challenges
            </Link>
          </div>
        </>
      )}
    </main>
  )
}
