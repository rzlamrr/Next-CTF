import ChallengesClient from '@/components/admin/challenges/ChallengesClient'
import { listChallenges } from '@/lib/db/queries'
import { supabase } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/guards'

type ChallengeRow = {
  id: string
  name: string
  value: number
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
  type: 'STANDARD' | 'DYNAMIC'
  solveCount: number
}

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
type CType = 'STANDARD' | 'DYNAMIC'

export default async function AdminChallengesPage() {
  // Verify admin access
  await requireAdmin()

  let challenges: ChallengeRow[] = []
  let error: string | null = null

  try {
    // Directly query challenges from database (admin can see all challenges)
    const challengesData = await listChallenges({
      take: 500,
      skip: 0,
    })

    const ids = challengesData.map((c: { id: string }) => c.id)
    let counts: Record<string, number> = {}

    if (ids.length) {
      // Get solve counts for each challenge
      const { data: solves, error: solvesError } = await supabase
        .from('solves')
        .select('challenge_id')
        .in('challenge_id', ids)

      if (!solvesError && solves) {
        // Count solves per challenge
        counts = solves.reduce((acc: Record<string, number>, solve: { challenge_id: string }) => {
          acc[solve.challenge_id] = (acc[solve.challenge_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    challenges = challengesData.map(
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
        }
      }
    )
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load challenges'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Challenges
        </h1>
      </div>
      <ChallengesClient initialData={challenges} initialError={error} />
    </div>
  )
}
