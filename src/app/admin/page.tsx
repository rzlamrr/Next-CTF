import { supabase } from '@/lib/db'
import { StatCard } from '@/components/admin/StatCard'

type RecentSolve = {
  id: string
  createdAt: string
  challenge: { id: string; name: string; category: string }
  user: { id: string; name: string | null; email: string | null } | null
  team: { id: string; name: string } | null
}

export default async function AdminHomePage() {
  // Server component: fetch stats directly with Supabase
  const [
    usersCountRes,
    teamsCountRes,
    challengesCountRes,
    submissionsCountRes,
    recentSolvesRes,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('challenges').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase
      .from('solves')
      .select(`
        id,
        created_at,
        challenge:challenges(id, name, category),
        user:users(id, name, email),
        team:teams(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const usersCount = usersCountRes.count ?? 0
  const teamsCount = teamsCountRes.count ?? 0
  const challengesCount = challengesCountRes.count ?? 0
  const submissionsCount = submissionsCountRes.count ?? 0
  const recentSolvesRaw = recentSolvesRes.data ?? []

  const recentSolves: RecentSolve[] = recentSolvesRaw.map((s: any) => ({
    id: s.id,
    createdAt: new Date(s.created_at).toISOString(),
    challenge: {
      id: s.challenge?.id ?? '',
      name: s.challenge?.name ?? 'Unknown',
      category: s.challenge?.category ?? '-',
    },
    user: s.user
      ? { id: s.user.id, name: s.user.name, email: s.user.email }
      : null,
    team: s.team ? { id: s.team.id, name: s.team.name } : null,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your CTF platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Users"
          value={usersCount}
          description="Total registered users"
        />
        <StatCard
          title="Teams"
          value={teamsCount}
          description="Total registered teams"
        />
        <StatCard
          title="Challenges"
          value={challengesCount}
          description="Total challenges"
        />
        <StatCard
          title="Submissions"
          value={submissionsCount}
          description="Total submissions"
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Solves</h2>
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
            <thead className="bg-gray-50 dark:bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Challenge
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
              {recentSolves.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400"
                  >
                    No recent solves
                  </td>
                </tr>
              ) : (
                recentSolves.map(s => (
                  <tr key={s.id} className="bg-white dark:bg-neutral-900">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {s.user?.name ?? s.user?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {s.team?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {s.challenge.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {s.challenge.category}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
