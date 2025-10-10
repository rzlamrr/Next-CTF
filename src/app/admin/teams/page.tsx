import { listTeams, listUsers } from '@/lib/db/queries'
import { DataTable, type Column } from '@/components/admin/DataTable'

type TeamRow = {
  id: string
  name: string
  captain: string | null
  members: number
  createdAt: string
}

export default async function AdminTeamsPage() {
  const [teams, users] = await Promise.all([
    listTeams({ take: 500, skip: 0 }),
    listUsers({ take: 2000, skip: 0 }),
  ])

  // Build lookup maps
  const userNameById = new Map<string, string | null>()
  const membersCountByTeamId = new Map<string, number>()

  for (const u of users as any[]) {
    const id = String(u.id)
    userNameById.set(id, (u.name as string | null) ?? null)
    const teamId = (u.teamId as string | null) ?? null
    if (teamId) {
      const key = String(teamId)
      membersCountByTeamId.set(key, (membersCountByTeamId.get(key) ?? 0) + 1)
    }
  }

  const rows: TeamRow[] = (teams as any[]).map(t => {
    const id = String(t.id)
    const captainId = (t.captainId as string | null) ?? null
    return {
      id,
      name: String(t.name ?? ''),
      captain: captainId ? (userNameById.get(String(captainId)) ?? null) : null,
      members: membersCountByTeamId.get(id) ?? 0,
      createdAt: new Date(t.createdAt as Date).toLocaleString(),
    }
  })

  const columns: Column<TeamRow>[] = [
    { key: 'name', header: 'Team' },
    { key: 'captain', header: 'Captain' },
    { key: 'members', header: 'Members' },
    { key: 'createdAt', header: 'Created' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teams</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage registered teams
        </p>
      </div>
      <DataTable<TeamRow>
        columns={columns}
        data={rows}
        loading={false}
        error={null}
        emptyMessage="No teams"
      />
    </div>
  )
}
