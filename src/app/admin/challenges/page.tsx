import ChallengesClient from '@/components/admin/challenges/ChallengesClient'

type ChallengeRow = {
  id: string
  name: string
  value: number
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
  type: 'STANDARD' | 'DYNAMIC'
  solveCount: number
}

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } }

export default async function AdminChallengesPage() {
  // Prefer API for consistent shape (value/solveCount computed there)
  const url =
    typeof process.env.NEXTAUTH_URL === 'string' &&
    process.env.NEXTAUTH_URL.length > 0
      ? new URL('/api/challenges', process.env.NEXTAUTH_URL).toString()
      : '/api/challenges'

  let challenges: ChallengeRow[] = []
  let error: string | null = null

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
    })
    const json = (await res.json()) as ApiResponse<ChallengeRow[]>
    if ('success' in json && json.success) {
      challenges = json.data
    } else {
      error =
        ('error' in json && json.error?.message) || 'Failed to load challenges'
    }
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
