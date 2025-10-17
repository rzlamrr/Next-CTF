import { listUsers, listTeams } from '@/lib/db/queries'
import { DataTable, type Column } from '@/components/admin/DataTable'

type Role = 'USER' | 'ADMIN'

type UserRow = {
  id: string
  username: string
  email: string | null
  role: Role
  team: string | null
  createdAt: string
}

type UserEntity = Awaited<ReturnType<typeof listUsers>>[number]
type TeamEntity = Awaited<ReturnType<typeof listTeams>>[number]

export default async function AdminUsersPage() {
  // Fetch users and teams to resolve team names without adding new queries
  const [users, teams] = await Promise.all([
    listUsers({ take: 500, skip: 0 }),
    listTeams({ take: 200, skip: 0 }),
  ])

  const teamNameById = new Map<string, string>()
  for (const t of teams as TeamEntity[]) {
    teamNameById.set(t.id, t.name ?? '')
  }

  const rows: UserRow[] = (users as UserEntity[]).map(u => ({
    id: u.id,
    username: u.name ?? '',
    email: u.email ?? null,
    role: u.role as Role,
    team: u.team_id ? (teamNameById.get(u.team_id) ?? null) : null,
    createdAt: new Date(u.created_at).toLocaleString(),
  }))

  const columns: Column<UserRow>[] = [
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'team', header: 'Team' },
    { key: 'createdAt', header: 'Created' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage registered users
        </p>
      </div>
      <DataTable<UserRow>
        columns={columns}
        data={rows}
        loading={false}
        error={null}
        emptyMessage="No users"
      />
    </div>
  )
}
