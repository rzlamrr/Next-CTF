import { describe, it, expect, beforeAll } from '@jest/globals'
import { GET as getScoreboard } from '@/app/api/scoreboard/route'
import { supabase } from '@/lib/db'
import { createTeam, grantAward } from '@/lib/db/queries'
import { resetDb, seedBasic, jsonRequest, readJson } from './utils'

type UserRow = {
  id: string
  name: string
  teamId: string | null
  score: number
}
type TeamRow = { id: string; name: string; score: number }

describe('API /api/scoreboard', () => {
  let admin: { id: string; email: string }
  let user: { id: string; email: string }
  let stdChallenge: { id: string; flag: string; points: number }
  let dynChallenge: { id: string; flag: string; points: number }

  beforeAll(async () => {
    await resetDb()
    const seeded = await seedBasic()
    admin = seeded.admin
    user = seeded.user
    stdChallenge = seeded.stdChallenge
    dynChallenge = seeded.dynChallenge

    // Create a team and attach user for team scoreboard
    const team = await createTeam({
      name: 'Team One',
      description: 'Integration Team',
      captainId: admin.id,
    })

    await supabase
      .from('users')
      .update({ team_id: team.id })
      .eq('id', user.id)

    // Give user some solves and awards for deterministic scores
    await supabase.from('solves').insert({
      user_id: user.id,
      team_id: team.id,
      challenge_id: stdChallenge.id,
    })

    await grantAward({
      userId: user.id,
      name: 'Bonus',
      category: 'bonus',
      value: 50,
    })

    // Give team an award too
    await grantAward({
      teamId: team.id,
      userId: admin.id,
      name: 'Team Bonus',
      category: 'bonus',
      value: 75,
    })
  })

  it('returns users and teams arrays ordered by score desc', async () => {
    const req = jsonRequest('GET', '/api/scoreboard')
    const res = await getScoreboard(req)
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: { users: UserRow[]; teams: TeamRow[] }
    }>(res)
    expect(body.success).toBe(true)

    // Basic shape checks
    expect(Array.isArray(body.data.users)).toBe(true)
    expect(Array.isArray(body.data.teams)).toBe(true)

    // Scores should be numbers
    for (const u of body.data.users) expect(typeof u.score).toBe('number')
    for (const t of body.data.teams) expect(typeof t.score).toBe('number')

    // Ordered desc by score
    const users = body.data.users.slice()
    const teams = body.data.teams.slice()
    const isDesc = (arr: { score: number }[]) =>
      arr.every((_, i) => (i === 0 ? true : arr[i - 1].score >= arr[i].score))
    expect(isDesc(users)).toBe(true)
    expect(isDesc(teams)).toBe(true)
  })

  it('respects ?top param to limit rows', async () => {
    const req = jsonRequest('GET', '/api/scoreboard', undefined, { top: 1 })
    const res = await getScoreboard(req)
    expect(res.status).toBe(200)

    const body = await readJson<{
      success: true
      data: { users: UserRow[]; teams: TeamRow[] }
    }>(res)
    expect(body.success).toBe(true)
    expect(body.data.users.length).toBeLessThanOrEqual(1)
    expect(body.data.teams.length).toBeLessThanOrEqual(1)
  })

  it('computes user score as sum of challenge points (or dynamic value) plus awards', async () => {
    // Add a dynamic challenge solve and confirm score increases accordingly
    await supabase.from('solves').insert({
      user_id: user.id,
      challenge_id: dynChallenge.id,
    })

    const req = jsonRequest('GET', '/api/scoreboard')
    const res = await getScoreboard(req)
    const body = await readJson<{ success: true; data: { users: UserRow[] } }>(
      res
    )

    const me = body.data.users.find(u => u.id === user.id)
    expect(me).toBeTruthy()
    // Minimum expected: std points + award 50 + dyn points (value defaults to points=300 in seed)
    expect((me as UserRow).score).toBeGreaterThanOrEqual(
      stdChallenge.points + 50 + 300
    )
  })
})
