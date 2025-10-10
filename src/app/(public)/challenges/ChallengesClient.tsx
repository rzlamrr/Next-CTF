'use client'

import * as React from 'react'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import ChallengeModal from '@/components/challenges/ChallengeModal'
import CategorySidebar from '@/components/challenges/CategorySidebar'
import UserStatsSidebar from '@/components/challenges/UserStatsSidebar'
import GradientBanner from '@/components/ui/gradient-banner'
import { useSearchParams } from 'next/navigation'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type CType = 'STANDARD' | 'DYNAMIC'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'

type ChallengeRow = {
  id: string
  name: string
  value: number
  category: string
  difficulty: Difficulty
  type: CType
  solveCount: number
  solved: boolean
}

export default function ChallengesClient() {
  const searchParams = useSearchParams()
  const [data, setData] = React.useState<ChallengeRow[] | null>(null)
  const [allChallenges, setAllChallenges] = React.useState<ChallengeRow[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)
  const [selectedChallengeId, setSelectedChallengeId] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    const category = searchParams.get('category')
    const type = searchParams.get('type')?.toUpperCase()
    const difficulty = searchParams.get('difficulty')?.toUpperCase()
    const bracket = searchParams.get('bracket')
    const search = searchParams.get('search')

    const qs = new URLSearchParams()
    if (category) qs.set('category', category)
    if (type) qs.set('type', type)
    if (difficulty) qs.set('difficulty', difficulty)
    if (bracket) qs.set('bracket', bracket)
    if (search) qs.set('search', search)

    const url = `/api/challenges${qs.toString() ? `?${qs.toString()}` : ''}`

    setLoading(true)
    setError(false)

    // Fetch all challenges for sidebar (without filters)
    const allChallengesPromise = fetch('/api/challenges', { cache: 'no-store' })
      .then(async res => {
        const json = (await res.json()) as Envelope<ChallengeRow[]>
        if (json.success) {
          setAllChallenges(json.data)
        }
      })
      .catch(() => {
        // Ignore errors for all challenges, we'll use filtered data as fallback
      })

    // Fetch filtered challenges
    fetch(url, { cache: 'no-store' })
      .then(async res => {
        const json = (await res.json()) as Envelope<ChallengeRow[]>
        if (json.success) {
          setData(json.data)
        } else {
          setError(true)
        }
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        // Wait for both requests to complete
        allChallengesPromise.finally(() => {
          setLoading(false)
        })
      })
  }, [searchParams])

  const handleViewChallenge = (id: string) => {
    setSelectedChallengeId(id)
  }

  const handleCloseModal = () => {
    setSelectedChallengeId(null)
  }

  // Helper function to get difficulty weight for sorting
  const getDifficultyWeight = (difficulty: string | null | undefined): number => {
    if (!difficulty) return 2 // Default to medium
    switch (difficulty.toUpperCase()) {
      case 'EASY':
        return 1
      case 'MEDIUM':
        return 2
      case 'HARD':
        return 3
      case 'INSANE':
        return 4
      default:
        return 2
    }
  }

  // Group challenges by category
  const groupedChallenges = React.useMemo(() => {
    if (!data) return {}
    const groups: Record<string, ChallengeRow[]> = {}
    data.forEach(challenge => {
      if (!groups[challenge.category]) {
        groups[challenge.category] = []
      }
      groups[challenge.category].push(challenge)
    })

    // Sort challenges within each category by difficulty first, then by value
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => {
        const diffA = getDifficultyWeight(a.difficulty)
        const diffB = getDifficultyWeight(b.difficulty)
        if (diffA !== diffB) {
          return diffA - diffB
        }
        return a.value - b.value
      })
    })

    return groups
  }, [data])

  // Calculate category info for sidebar (use all challenges, not filtered)
  const categoryInfo = React.useMemo(() => {
    const challengesToUse = allChallenges || data || []
    if (challengesToUse.length === 0) return []
    const categories = new Map<string, number>()
    challengesToUse.forEach(challenge => {
      categories.set(challenge.category, (categories.get(challenge.category) || 0) + 1)
    })
    return Array.from(categories.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allChallenges, data])

  // Helper function to get category icon
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      web: 'fa-globe',
      crypto: 'fa-lock',
      pwn: 'fa-bug',
      reverse: 'fa-cogs',
      forensics: 'fa-search',
      misc: 'fa-puzzle-piece',
      binary: 'fa-file-code',
      steganography: 'fa-eye',
      osint: 'fa-satellite',
      network: 'fa-network-wired',
      mobile: 'fa-mobile-alt',
      blockchain: 'fa-link',
      ai: 'fa-robot',
      iot: 'fa-microchip',
    }
    return icons[category.toLowerCase()] || 'fa-folder'
  }

  // Helper function to get category color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      web: 'text-primary',
      crypto: 'text-secondary',
      pwn: 'text-destructive',
      reverse: 'text-success',
      forensics: 'text-warning',
      misc: 'text-muted-foreground',
      binary: 'text-info',
      steganography: 'text-muted-foreground',
      osint: 'text-primary',
      network: 'text-success',
      mobile: 'text-secondary',
      blockchain: 'text-secondary',
      ai: 'text-primary',
      iot: 'text-warning',
    }
    return colors[category.toLowerCase()] || 'text-muted-foreground'
  }

  return (
    <>
      <GradientBanner
        title="Challenges"
        subtitle="The trial begins. Prove your worth. Earn your place."
      />

      <main className="px-4 py-8 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">
              Loading challenges...
            </div>
          </div>
        ) : error || !data ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            Failed to load challenges. Please try again.
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
            No challenges match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_320px] gap-6">
            {/* Left Sidebar - Categories */}
            <aside className="hidden lg:block">
              <CategorySidebar
                categories={categoryInfo}
                totalCount={(allChallenges || data || []).length}
              />
            </aside>

            {/* Main Content - Challenges by Category */}
            <section className="space-y-8">
              {Object.entries(groupedChallenges).map(([category, challenges]) => {
                const solvedCount = challenges.filter(c => c.solved).length
                return (
                  <div key={category}>
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${getCategoryIcon(category)} ${getCategoryColor(category)} text-lg`}></i>
                        <h2 className="font-semibold text-foreground">{category}</h2>
                      </div>
                      <span className="text-xs">
                        {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} : {solvedCount} solved
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {challenges.map(c => (
                        <ChallengeCard
                          key={c.id}
                          id={c.id}
                          name={c.name}
                          category={c.category}
                          value={c.value}
                          type={c.type}
                          difficulty={c.difficulty}
                          solveCount={c.solveCount}
                          solved={c.solved}
                          onViewChallenge={handleViewChallenge}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </section>

            {/* Right Sidebar - User Stats */}
            <aside className="hidden lg:block">
              <UserStatsSidebar totalChallenges={(allChallenges || data || []).length} />
            </aside>
          </div>
        )}
      </main>

      <ChallengeModal
        challengeId={selectedChallengeId}
        isOpen={selectedChallengeId !== null}
        onClose={handleCloseModal}
      />
    </>
  )
}
