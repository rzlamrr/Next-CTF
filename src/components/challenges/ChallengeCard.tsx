'use client'
/**
 * ChallengeCard
 *
 * Props: id, name, category, value, type, difficulty?, solveCount?
 * Renders a card with basic info and a "Start" button that opens a modal.
 *
 * Example:
 * <ChallengeCard id="abc123" name="Binary Exploitation 101" category="pwn" value={500} type="standard" difficulty="hard" solveCount={12} onViewChallenge={(id) => ...} />
 */
import React from 'react'

export type ChallengeCardProps = {
  id: string
  name: string
  category: string
  value: number
  type: string
  difficulty?: string | null
  solveCount?: number | null
  solved?: boolean
  onViewChallenge?: (id: string) => void
}

function getDifficultyColor(difficulty: string | null | undefined): string {
  if (!difficulty) return 'text-muted-foreground'
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return 'text-success'
    case 'MEDIUM':
      return 'text-warning'
    case 'HARD':
      return 'text-destructive'
    case 'INSANE':
      return 'text-purple'
    default:
      return 'text-muted-foreground'
  }
}

function getDifficultyBorderColor(difficulty: string | null | undefined): string {
  if (!difficulty) return 'border-l-muted'
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return 'border-l-success'
    case 'MEDIUM':
      return 'border-l-warning'
    case 'HARD':
      return 'border-l-destructive'
    case 'INSANE':
      return 'border-l-purple'
    default:
      return 'border-l-muted'
  }
}

function getDifficultyIcon(difficulty: string | null | undefined): string {
  if (!difficulty) return 'fa-circle'
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return 'fa-seedling'
    case 'MEDIUM':
      return 'fa-fire'
    case 'HARD':
      return 'fa-skull'
    case 'INSANE':
      return 'fa-bolt'
    default:
      return 'fa-circle'
  }
}

function BloodBadges({ solveCount }: { solveCount?: number | null }) {
  if (!solveCount || solveCount === 0) return null

  return (
    <div className="flex items-center gap-0.5">
      {solveCount >= 1 && (
        <i className="fas fa-medal text-warning" style={{ fontSize: '1rem', filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))' }} title="First Blood"></i>
      )}
      {solveCount >= 2 && (
        <i className="fas fa-medal text-muted-foreground" style={{ fontSize: '1rem', filter: 'drop-shadow(0 2px 4px rgba(192, 192, 192, 0.4))' }} title="Second Blood"></i>
      )}
      {solveCount >= 3 && (
        <i className="fas fa-medal text-secondary" style={{ fontSize: '1rem', filter: 'drop-shadow(0 2px 4px rgba(205, 127, 50, 0.4))' }} title="Third Blood"></i>
      )}
    </div>
  )
}

export default function ChallengeCard({
  id,
  name,
  category,
  value,
  type,
  difficulty,
  solveCount,
  solved,
  onViewChallenge,
}: ChallengeCardProps) {
  const difficultyColor = getDifficultyColor(difficulty)
  const difficultyBorderColor = getDifficultyBorderColor(difficulty)
  const difficultyIcon = getDifficultyIcon(difficulty)

  return (
    <article
      className={`relative rounded-lg border-2 bg-card p-3 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-2 ${
        solved
          ? 'border-success bg-success/5'
          : 'border-border hover:border-primary'
      } ${difficultyBorderColor} border-l-4`}
      aria-labelledby={`challenge-${id}-title`}
      onClick={() => onViewChallenge?.(id)}
    >
      {/* Solved Badge */}
      {solved && (
        <div className="absolute top-2 right-2">
          <i className="fas fa-check-circle text-success text-lg"></i>
        </div>
      )}

      {/* Card Content */}
      <div className="space-y-2 flex flex-col h-full">
        {/* Challenge Name */}
        <h6 className="font-bold text-foreground text-sm truncate" id={`challenge-${id}-title`}>
          {name}
        </h6>

        {/* Points and Solve Count */}
        <div className="flex justify-between items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-destructive to-primary text-white">
            <i className="fas fa-star"></i>
            <span>{value}</span> pts
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
            <i className="fas fa-users"></i>
            <span>{solveCount || 0}</span> solved
          </span>
        </div>

        {/* Difficulty and Blood Badges Row */}
        <div className="flex justify-between items-center">
          {/* Difficulty Indicator */}
          {difficulty && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              difficulty.toUpperCase() === 'EASY' ? 'bg-success/10 text-success' :
              difficulty.toUpperCase() === 'MEDIUM' ? 'bg-warning/10 text-warning' :
              difficulty.toUpperCase() === 'HARD' ? 'bg-destructive/10 text-destructive' :
              difficulty.toUpperCase() === 'INSANE' ? 'bg-purple/10 text-purple' :
              'bg-muted text-muted-foreground'
            }`}>
              <i className={`fas ${difficultyIcon}`}></i>
              {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
            </span>
          )}

          {/* Blood Badges */}
          <BloodBadges solveCount={solveCount} />
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-2 text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1 mt-auto ${
            solved
              ? 'border-2 border-success text-success hover:bg-success hover:text-white'
              : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
          }`}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewChallenge?.(id)
          }}
          aria-label={`${solved ? 'View' : 'Start'} challenge ${name}`}
        >
          {solved ? (
            <>
              <i className="fas fa-check"></i>
              Solved
            </>
          ) : (
            <>
              <i className="fas fa-play"></i>
              Start
            </>
          )}
        </button>
      </div>
    </article>
  )
}
