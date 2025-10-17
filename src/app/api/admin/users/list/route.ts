import { ok, toErrorResponse } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { listUsers, listTeams } from '@/lib/db/queries'

type Role = 'USER' | 'ADMIN'

type UserRow = {
  id: string
  username: string
  email: string | null
  role: Role
  team: string | null
  createdAt: string
}

// GET /api/admin/users/list - List all users
export async function GET(req: Request) {
  try {
    await requireAdmin()

    // Fetch users and teams to resolve team names
    const [users, teams] = await Promise.all([
      listUsers({ take: 500, skip: 0 }),
      listTeams({ take: 200, skip: 0 }),
    ])

    const teamNameById = new Map<string, string>()
    for (const t of teams) {
      teamNameById.set(t.id, t.name ?? '')
    }

    const rows: UserRow[] = (users || []).map((u: any) => ({
      id: u.id,
      username: u.name ?? '',
      email: u.email ?? null,
      role: u.role as Role,
      team: u.team_id ? (teamNameById.get(u.team_id) ?? null) : null,
      createdAt: new Date(u.created_at).toLocaleString(),
    }))

    return ok(rows)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list users')
  }
}
