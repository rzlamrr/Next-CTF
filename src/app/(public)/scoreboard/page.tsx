import GradientBanner from '@/components/ui/gradient-banner'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type UserRow = {
  id: string
  name: string
  teamId: string | null
  score: number
}
type TeamRow = { id: string; name: string; score: number }

async function fetchScoreboard(
  top: number
): Promise<{ users: UserRow[]; teams: TeamRow[] } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const url = `${base}/api/scoreboard?top=${encodeURIComponent(String(top))}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const json = (await res.json()) as Envelope<{
      users: UserRow[]
      teams: TeamRow[]
    }>
    if (json.success) return json.data
    return null
  } catch {
    return null
  }
}

function Table<T>({
  caption,
  columns,
  rows,
  renderCell,
  emptyMessage,
}: {
  caption: string
  columns: string[]
  rows: T[]
  renderCell: (row: T, colIndex: number) => React.ReactNode
  emptyMessage: string
}) {
  if (!rows.length) {
    return (
      <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="min-w-full divide-y divide-border">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted">
          <tr>
            {columns.map(c => (
              <th
                key={c}
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {rows.map((row, rIndex) => (
            <tr key={rIndex} className="hover:bg-muted/50">
              {columns.map((_c, cIndex) => (
                <td
                  key={`${rIndex}-${cIndex}`}
                  className="whitespace-nowrap px-4 py-2 text-sm text-foreground"
                >
                  {renderCell(row, cIndex)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const rawTop = Array.isArray(sp.top) ? sp.top[0] : sp.top
  const parsed = rawTop ? parseInt(rawTop, 10) : NaN
  const top =
    Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1000) : 50

  const data = await fetchScoreboard(top)

  return (
    <>
      <GradientBanner
        title="Scoreboard"
        subtitle={`Top ${top} users and teams by score.`}
      />

      <main className="px-4 py-8">
        {!data ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Failed to load scoreboard. Please try again.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section aria-labelledby="users-leaderboard">
              <h2
                id="users-leaderboard"
                className="mb-2 text-sm font-semibold text-foreground"
              >
                Users Leaderboard
              </h2>
              <Table
                caption="Users leaderboard"
                columns={['Rank', 'User', 'Team', 'Score']}
                rows={data.users}
                emptyMessage="No users to display yet."
                renderCell={(row, cIndex) => {
                  const r = row as UserRow
                  switch (cIndex) {
                    case 0:
                      return data.users.indexOf(r) + 1
                    case 1:
                      return r.name || r.id
                    case 2:
                      return r.teamId ? r.teamId : '-'
                    case 3:
                      return r.score
                    default:
                      return ''
                  }
                }}
              />
            </section>

            <section aria-labelledby="teams-leaderboard">
              <h2
                id="teams-leaderboard"
                className="mb-2 text-sm font-semibold text-foreground"
              >
                Teams Leaderboard
              </h2>
              <Table
                caption="Teams leaderboard"
                columns={['Rank', 'Team', 'Score']}
                rows={data.teams}
                emptyMessage="No teams to display yet."
                renderCell={(row, cIndex) => {
                  const r = row as TeamRow
                  switch (cIndex) {
                    case 0:
                      return data.teams.indexOf(r) + 1
                    case 1:
                      return r.name || r.id
                    case 2:
                      return r.score
                    default:
                      return ''
                  }
                }}
              />
            </section>
          </div>
        )}
      </main>
    </>
  )
}
