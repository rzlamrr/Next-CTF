'use client'

import * as React from 'react'
import AttemptFlagForm from '@/components/challenges/AttemptFlagForm'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type CType = 'STANDARD' | 'DYNAMIC'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'

type ChallengeDetail = {
  id: string
  name: string
  description: string
  value: number
  points: number
  category: string
  difficulty: Difficulty
  type: CType
  hints: Array<{ id: string; cost: number }>
}

type SolveItem = {
  id: string
  createdAt: string
  user: { id: string; name: string } | null
  team: { id: string; name: string } | null
}

type FileItem = {
  id: string
  type: string | null
  location: string
  sha1sum: string | null
}

type ChallengeModalProps = {
  challengeId: string | null
  isOpen: boolean
  onClose: () => void
}

type TabType = 'challenge' | 'solves' | 'files'

function Badge({
  children,
  color = 'gray',
}: {
  children: React.ReactNode
  color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}) {
  const map: Record<string, string> = {
    gray: 'bg-muted text-muted-foreground',
    blue: 'bg-info/20 text-info border border-info/30',
    green: 'bg-success/20 text-success border border-success/30',
    yellow: 'bg-warning/20 text-warning border border-warning/30',
    red: 'bg-destructive/20 text-destructive border border-destructive/30',
    purple: 'bg-purple/20 text-purple border border-purple/30',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[color]}`}
    >
      {children}
    </span>
  )
}

function getDifficultyColor(
  difficulty: Difficulty
): 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' {
  switch (difficulty) {
    case 'EASY':
      return 'green'
    case 'MEDIUM':
      return 'yellow'
    case 'HARD':
      return 'red'
    case 'INSANE':
      return 'purple'
    default:
      return 'gray'
  }
}

export default function ChallengeModal({
  challengeId,
  isOpen,
  onClose,
}: ChallengeModalProps) {
  const [data, setData] = React.useState<ChallengeDetail | null>(null)
  const [solves, setSolves] = React.useState<SolveItem[]>([])
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<TabType>('challenge')
  const [solvesLoading, setSolvesLoading] = React.useState(false)
  const [filesLoading, setFilesLoading] = React.useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Fetch challenge data when modal opens
  React.useEffect(() => {
    if (!isOpen || !challengeId) {
      setData(null)
      setSolves([])
      setFiles([])
      setError(false)
      setActiveTab('challenge')
      return
    }

    setLoading(true)
    setError(false)

    fetch(`/api/challenges/${encodeURIComponent(challengeId)}`, {
      cache: 'no-store',
    })
      .then(async res => {
        const json = (await res.json()) as Envelope<ChallengeDetail>
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
        setLoading(false)
      })
  }, [isOpen, challengeId])

  // Fetch solves when switching to solves tab
  React.useEffect(() => {
    if (!challengeId || activeTab !== 'solves') return

    setSolvesLoading(true)
    fetch(`/api/challenges/${encodeURIComponent(challengeId)}/solves`, {
      cache: 'no-store',
    })
      .then(async res => {
        const json = (await res.json()) as Envelope<SolveItem[]>
        if (json.success) {
          setSolves(json.data)
        }
      })
      .catch(() => {})
      .finally(() => {
        setSolvesLoading(false)
      })
  }, [challengeId, activeTab])

  // Fetch files when modal opens
  React.useEffect(() => {
    if (!isOpen || !challengeId) return

    setFilesLoading(true)
    fetch(`/api/challenges/${encodeURIComponent(challengeId)}/files`, {
      cache: 'no-store',
    })
      .then(async res => {
        const json = (await res.json()) as Envelope<FileItem[]>
        if (json.success) {
          setFiles(json.data ?? [])
        } else {
          setFiles([])
        }
      })
      .catch(() => {
        setFiles([])
      })
      .finally(() => {
        setFilesLoading(false)
      })
  }, [isOpen, challengeId])

  // Handle backdrop click to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle Escape key to close
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="challenge-modal-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-muted-foreground">
              Loading challenge...
            </div>
          </div>
        ) : error || !data ? (
          <div className="p-6">
            <div className="rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Challenge not found or failed to load.
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4">
              <div className="pr-8">
                <h2
                  id="challenge-modal-title"
                  className="text-2xl font-bold text-foreground text-center mb-2"
                >
                  {data.name}
                </h2>
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold bg-gradient-to-r from-destructive to-primary text-white">
                    <i className="fas fa-star"></i>
                    {data.value} points
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border bg-muted/30">
              <nav className="flex px-6">
                <button
                  onClick={() => setActiveTab('challenge')}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'challenge'
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <i className="fas fa-flag mr-2"></i>
                  Challenge
                </button>
                <button
                  onClick={() => setActiveTab('solves')}
                  className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'solves'
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <i className="fas fa-users mr-2"></i>
                  {solves.length} Solve{solves.length !== 1 ? 's' : ''}
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
              {activeTab === 'challenge' && (
                <div className="p-6 space-y-6">
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Badge color="blue">{data.category}</Badge>
                    <Badge color={getDifficultyColor(data.difficulty)}>
                      {data.difficulty}
                    </Badge>
                    <Badge color="gray">{data.type}</Badge>
                  </div>


                  {/* Description */}
                  <div className="rounded-lg border border-border bg-muted/30 p-6">
                    <div className="whitespace-pre-line text-sm text-foreground leading-relaxed">
                      {data.description}
                    </div>
                  </div>

                  {/* Attached Files */}
                  {filesLoading ? (
                    <div className="rounded-lg border border-border bg-card p-6">
                      <div className="text-sm text-muted-foreground">Loading files...</div>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <i className="fas fa-file text-primary"></i>
                        Attachments
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {files.map(file => {
                          const base = file.location.split('/').pop() || ''
                          const filename = base.split('-').slice(2).join('-') || base
                          const href = `/api/files/${encodeURIComponent(file.id)}/download`
                          return (
                            <li key={file.id}>
                              <a href={href} className="text-sm text-primary hover:underline">
                                {filename}
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : null}

                  {/* Submit Flag */}
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <i className="fas fa-flag text-primary"></i>
                      Submit Flag
                    </h3>
                    <AttemptFlagForm challengeId={data.id} refreshOnSuccess />
                  </div>

                  {/* Hints */}
                  {data.hints?.length > 0 && (
                    <div className="rounded-lg border border-warning/30 bg-warning/5 p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <i className="fas fa-lightbulb text-warning"></i>
                        Hints Available
                      </h3>
                      <ul className="space-y-2">
                        {data.hints.map(h => (
                          <li
                            key={h.id}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <i className="fas fa-circle text-xs text-warning"></i>
                            Hint available (cost: {h.cost} points)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'solves' && (
                <div className="p-6">
                  {solvesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-sm text-muted-foreground">
                        Loading solves...
                      </div>
                    </div>
                  ) : solves.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="fas fa-users text-4xl text-muted-foreground/30 mb-3"></i>
                      <p className="text-sm text-muted-foreground">
                        No solves yet. Be the first!
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary">
                              <i className="fas fa-user mr-2"></i>Name
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-primary">
                              <i className="fas fa-calendar mr-2"></i>Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {solves.map((solve, idx) => {
                            const name =
                              solve.team?.name || solve.user?.name || 'Unknown'
                            const date = new Date(
                              solve.createdAt
                            ).toLocaleString()
                            return (
                              <tr
                                key={solve.id}
                                className="hover:bg-muted/50 transition-colors"
                              >
                                <td className="px-4 py-3 text-sm text-foreground font-medium">
                                  <div className="flex items-center gap-2">
                                    {idx === 0 && (
                                      <i className="fas fa-medal text-warning" title="First Blood"></i>
                                    )}
                                    {idx === 1 && (
                                      <i className="fas fa-medal text-muted-foreground" title="Second Blood"></i>
                                    )}
                                    {idx === 2 && (
                                      <i className="fas fa-medal text-secondary" title="Third Blood"></i>
                                    )}
                                    {name}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                                  {date}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  )
}
