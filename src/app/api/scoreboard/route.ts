/**
 * Scoreboard API
 *
 * GET /api/scoreboard?top=number
 * - Public
 * - Returns user and team leaderboards ordered by score (desc)
 * - Respects optional ?top param (default 50)
 *
 * Example:
 *   Request: GET /api/scoreboard?top=10
 *   Response: {
 *     "success": true,
 *     "data": {
 *       "users": [ { "id": "...", "name": "...", "teamId": null, "score": 300 } ],
 *       "teams": [ { "id": "...", "name": "...", "score": 550 } ]
 *     }
 *   }
 */

import { ok, toErrorResponse } from '@/lib/utils/http'
import {
  listUsers,
  listTeams,
  getUserScore,
  getTeamScore,
} from '@/lib/db/queries'

type UserRow = { id: string; name: string; teamId: string | null }
type TeamRow = { id: string; name: string }

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const topParam = url.searchParams.get('top')
    const parsed = topParam ? parseInt(topParam, 10) : NaN
    const top =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 1000) : 50

    // Fetch users/teams (basic listing via helpers)
    const usersRaw = await listUsers({ take: 2000, skip: 0 })
    const teamsRaw = await listTeams({ take: 2000, skip: 0 })

    // Shape minimal rows
    const users: UserRow[] = usersRaw.map((u: any) => ({
      id: u.id as string,
      name: (u.name as string) ?? '',
      teamId: (u.teamId as string | null) ?? null,
    }))
    const teams: TeamRow[] = teamsRaw.map((t: any) => ({
      id: t.id as string,
      name: (t.name as string) ?? '',
    }))

    // Compute scores concurrently
    const userScores = await Promise.all(
      users.map(async u => ({ ...u, score: await getUserScore(u.id) }))
    )
    const teamScores = await Promise.all(
      teams.map(async t => ({ ...t, score: await getTeamScore(t.id) }))
    )

    // Order desc by score and take top N
    userScores.sort((a, b) => b.score - a.score)
    teamScores.sort((a, b) => b.score - a.score)

    const data = {
      users: userScores.slice(0, top),
      teams: teamScores.slice(0, top),
    }

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to fetch scoreboard')
  }
}
