/**
 * Challenges - Collection API
 *
 * GET /api/challenges?category=web&type=STANDARD&difficulty=BEGINNER&bracket=xxx&search=foo
 * - Public
 * - Query params: category, type, difficulty, bracket, search
 * - Response example:
 *   { "success": true, "data": [ { "id": "...", "name": "...", "value": 100, "category": "web", "solveCount": 3 } ] }
 *
 * POST /api/challenges
 * - Admin only
 * - Body: ChallengeCreateSchema
 * - Creates challenge
 */

import { ok, err, toErrorResponse, parseJson } from '@/lib/utils/http'
import { listChallenges, createChallenge } from '@/lib/db/queries'
import { supabase } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'
import { ChallengeCreateSchema } from '@/lib/validations/challenge'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
type CType = 'STANDARD' | 'DYNAMIC'

// GET /api/challenges
export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search') ?? undefined
    const category = url.searchParams.get('category') ?? undefined

    const typeParam = url.searchParams.get('type') ?? undefined
    const difficultyParam = url.searchParams.get('difficulty') ?? undefined
    const bracket = url.searchParams.get('bracket') ?? undefined

    const type = typeParam ? (typeParam.toUpperCase() as CType) : undefined
    const difficulty = difficultyParam
      ? (difficultyParam.toUpperCase() as Difficulty)
      : undefined
    const bracketId = bracket ?? undefined

    const challenges = await listChallenges({
      q: search,
      category,
      type,
      difficulty,
      bracketId,
      take: 500,
      skip: 0,
    })

    const ids = challenges.map((c: { id: string }) => c.id)
    let counts: Record<string, number> = {}
    if (ids.length) {
      // Get solve counts for each challenge using Supabase
      const { data: solves, error } = await supabase
        .from('solves')
        .select('challenge_id')
        .in('challenge_id', ids)

      if (!error && solves) {
        // Count solves per challenge
        counts = solves.reduce((acc: Record<string, number>, solve: { challenge_id: string }) => {
          acc[solve.challenge_id] = (acc[solve.challenge_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Check if user is authenticated and get their solved challenges
    const session = await getServerSession(authOptions)
    let userSolvedIds: Set<string> = new Set()
    if (session?.user?.id && ids.length) {
      const { data: userSolves, error } = await supabase
        .from('solves')
        .select('challenge_id')
        .eq('user_id', session.user.id)
        .in('challenge_id', ids)

      if (!error && userSolves) {
        userSolvedIds = new Set(userSolves.map((s: { challenge_id: string }) => s.challenge_id))
      }
    }

    const data = challenges.map(
      (c: {
        id: string
        name: string
        type: CType
        value: number | null
        points: number
        category: string
        difficulty: Difficulty
      }) => {
        const displayValue =
          c.type === 'DYNAMIC' && c.value != null ? c.value : c.points
        return {
          id: c.id,
          name: c.name,
          value: displayValue,
          category: c.category,
          difficulty: c.difficulty,
          type: c.type,
          solveCount: counts[c.id] ?? 0,
          solved: userSolvedIds.has(c.id),
        }
      }
    )

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to list challenges')
  }
}

// POST /api/challenges
export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin()
    const body = await parseJson(req, ChallengeCreateSchema)

    // Map API schema to DB helper shape
    // - Treat "initial" as "points" when provided (initial overrides points)
    // - Persist chosen scoring function (default 'static')
    const payload = {
      name: body.name,
      description: body.description,
      category: body.category,
      type: (body.type ?? 'STANDARD') as CType,
      difficulty: (body.difficulty ?? 'EASY') as Difficulty, // DB requires difficulty; default when omitted
      points: typeof body.initial === 'number' ? body.initial : body.points,
      flag: body.flag,
      function: (body.function ?? 'static') as
        | 'static'
        | 'log'
        | 'exp'
        | 'linear',
      value: body.value ?? null,
      decay: typeof body.decay === 'number' ? body.decay : null,
      minimum: typeof body.minimum === 'number' ? body.minimum : null,
      maxAttempts: body.maxAttempts ?? null,
      bracketId: body.bracketId ?? null,
      connectionInfo: body.connectionInfo ?? null,
      requirements: body.requirements ?? null,
    }

    const created = await createChallenge(payload)

    const response = {
      id: created.id,
      name: created.name,
      description: created.description,
      category: created.category,
      difficulty: created.difficulty,
      type: created.type,
      points: created.points,
      value: created.value ?? null,
      maxAttempts: created.maxAttempts ?? null,
      bracketId: created.bracketId ?? null,
      createdAt: created.createdAt,
    }

    return ok(response, 201)
  } catch (e: any) {
    // Try Prisma error mapping then fallback
    // We keep logic inline to avoid another import; toErrorResponse will still handle.
    return toErrorResponse(e, 'Failed to create challenge')
  }
}
