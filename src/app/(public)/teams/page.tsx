'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GradientBanner from '@/components/ui/gradient-banner'
import { DataTable, Column } from '@/components/admin/DataTable'
import { Pagination } from '@/components/ui/pagination'

type Team = {
  id: string
  name: string
  description: string | null
  captainId: string
  createdAt: string
  members?: Array<{ id: string; name: string }>
  _count?: {
    members: number
  }
}

type MyTeamData = {
  id: string
  name: string
  description: string | null
  captainId: string
  members: Array<{ id: string; name: string; email: string }>
}

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

function fetchTeams(
  take: number,
  skip: number,
  q?: string
): Promise<{ teams: Team[]; total: number } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const params = new URLSearchParams({
    take: String(take),
    skip: String(skip),
  })
  
  if (q) params.append('q', q)
  
  const url = `${base}/api/teams?${params.toString()}`
  console.log('Fetching teams from:', url)

  return fetch(url, { cache: 'no-store' })
    .then(res => {
      console.log('Teams API response status:', res.status)
      if (!res.ok) {
        console.error('Teams API request failed with status:', res.status)
        return null
      }
      return res.json()
    })
    .then((json: Envelope<Team[]>) => {
      console.log('Teams API response:', json)
      if (json.success) {
        // For now, we'll estimate the total since we don't have a count endpoint
        // In a real implementation, you would add a count endpoint or include total in the response
        return {
          teams: json.data,
          total: json.data.length + skip + 50 // Estimate with 50 more teams
        }
      } else {
        console.error('Teams API returned error:', json.error)
      }
      return null
    })
    .catch(error => {
      console.error('Error fetching teams:', error)
      return null
    })
}

export default function TeamsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [teamsData, setTeamsData] = useState<{ teams: Team[]; total: number } | null>(null)
  const [myTeam, setMyTeam] = useState<MyTeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [teamMode, setTeamMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const teamsPerPage = 20
  const skip = (page - 1) * teamsPerPage

  // Check team mode config
  useEffect(() => {
    fetch('/api/config/site-name')
      .then(res => res.json())
      .then(data => {
        // We need a better way to get config, but for now assume enabled
        setTeamMode(true)
      })
      .catch(() => setTeamMode(true))
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    console.log('Fetching my team, session status:', status)
    fetchMyTeam()
  }, [status, router])

  useEffect(() => {
    console.log('Fetching teams data with page:', page, 'skip:', skip, 'searchQuery:', searchQuery)
    fetchTeamsData()
  }, [page, skip, searchQuery])

  async function fetchTeamsData() {
    try {
      setLoading(true)
      console.log('About to fetch teams with teamsPerPage:', teamsPerPage, 'skip:', skip, 'searchQuery:', searchQuery)
      const result = await fetchTeams(teamsPerPage, skip, searchQuery)
      console.log('Fetch teams result:', result)
      setTeamsData(result)
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMyTeam() {
    try {
      // Fetch my team if I have one
      const meRes = await fetch('/api/users/me')
      const meJson = await meRes.json()
      if (meJson.success && meJson.data.team) {
        const teamDetailRes = await fetch(`/api/teams/${meJson.data.team.id}`)
        const teamDetailJson = await teamDetailRes.json()
        if (teamDetailJson.success) {
          setMyTeam(teamDetailJson.data)
        }
      } else {
        setMyTeam(null)
      }
    } catch (error) {
      console.error('Failed to fetch my team:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <GradientBanner
          title="Teams"
          subtitle="Browse all teams on the platform."
        />
        <main className="px-4 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </main>
      </>
    )
  }

  if (!teamMode) {
    return (
      <>
        <GradientBanner
          title="Teams"
          subtitle="Browse all teams on the platform."
        />
        <main className="px-4 py-8">
          <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
            Team mode is currently disabled.
          </div>
        </main>
      </>
    )
  }

  const isCaptain = myTeam && myTeam.captainId === session?.user?.id

  return (
    <>
      <GradientBanner
        title="Teams"
        subtitle="Browse all teams on the platform."
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          {/* My Team Section */}
          {myTeam && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{myTeam.name}</h2>
                  {myTeam.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {myTeam.description}
                    </p>
                  )}
                  {isCaptain && (
                    <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Captain
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {isCaptain && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowEditModal(true)}
                    >
                      Edit
                    </Button>
                  )}
                  {!isCaptain && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm('Leave team?')) return
                        try {
                          const res = await fetch('/api/teams/leave', {
                            method: 'POST',
                          })
                          const json = await res.json()
                          if (json.success) {
                            toast.success('Left team')
                            fetchMyTeam()
                            fetchTeamsData()
                          } else {
                            toast.error(json.error?.message || 'Failed to leave team')
                          }
                        } catch (e) {
                          toast.error('Failed to leave team')
                        }
                      }}
                    >
                      Leave
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">
                  Members ({myTeam.members.length})
                </h3>
                <ul className="space-y-1">
                  {myTeam.members.map(member => (
                    <li
                      key={member.id}
                      className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"
                    >
                      {member.name}
                      {member.id === myTeam.captainId && (
                        <span className="text-xs text-primary">(Captain)</span>
                      )}
                      {isCaptain && member.id !== myTeam.captainId && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="ml-2"
                          onClick={async () => {
                            if (!confirm(`Kick ${member.name}?`)) return
                            try {
                              const res = await fetch(
                                `/api/teams/${myTeam.id}/members?memberId=${member.id}`,
                                { method: 'DELETE' }
                              )
                              const json = await res.json()
                              if (json.success) {
                                toast.success('Member removed')
                                fetchMyTeam()
                                fetchTeamsData()
                              } else {
                                toast.error(json.error?.message || 'Failed to remove member')
                              }
                            } catch (e) {
                              toast.error('Failed to remove member')
                            }
                          }}
                        >
                          Kick
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Teams Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {!myTeam && (
                <>
                  <Button onClick={() => setShowCreateModal(true)}>Create Team</Button>
                  <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                    Join Team
                  </Button>
                </>
              )}
              {isCaptain && myTeam && (
                <Button variant="outline" onClick={() => setShowEditModal(true)}>
                  Manage Team
                </Button>
              )}
            </div>
          </div>

          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Search teams..."
                className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Search
              </button>
            </form>
          </div>

          {/* Teams Table */}
          <section aria-labelledby="teams-list">
            <h2
              id="teams-list"
              className="mb-2 text-sm font-semibold text-gray-900 dark:text-white"
            >
              All Teams
            </h2>
            {!teamsData ? (
              <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
                Failed to load teams. Please try again.
              </div>
            ) : (
              <DataTable<Team>
                columns={[
                  {
                    key: 'index',
                    header: '#',
                    render: (row) => skip + teamsData.teams.indexOf(row) + 1
                  },
                  {
                    key: 'name',
                    header: 'Team Name',
                    render: (row) => row.name
                  },
                  {
                    key: 'description',
                    header: 'Description',
                    className: 'max-w-xs truncate',
                    render: (row) => row.description || '-'
                  },
                  {
                    key: 'members',
                    header: 'Members',
                    render: (row) => row._count?.members || row.members?.length || 0
                  },
                  {
                    key: 'createdAt',
                    header: 'Created',
                    render: (row) => new Date(row.createdAt).toLocaleDateString()
                  },
                  {
                    key: 'actions',
                    header: 'Actions',
                    render: (row) => (
                      !myTeam && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeam(row)
                            setShowJoinModal(true)
                          }}
                        >
                          Join
                        </Button>
                      )
                    )
                  }
                ]}
                data={teamsData.teams}
                emptyMessage="No teams to display yet."
              />
            )}
          </section>

          {/* Pagination */}
          {teamsData && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(teamsData.total / teamsPerPage)}
              onPageChange={setPage}
            />
          )}
        </div>
      </main>

      {/* Create Team Modal */}
      <CreateTeamModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false)
          fetchMyTeam()
          fetchTeamsData()
        }}
      />

      {/* Join Team Modal */}
      <JoinTeamModal
        open={showJoinModal}
        onClose={() => {
          setShowJoinModal(false)
          setSelectedTeam(null)
        }}
        team={selectedTeam}
        onSuccess={() => {
          setShowJoinModal(false)
          setSelectedTeam(null)
          fetchMyTeam()
          fetchTeamsData()
        }}
      />

      {/* Edit Team Modal */}
      {myTeam && (
        <EditTeamModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          team={myTeam}
          onSuccess={() => {
            setShowEditModal(false)
            fetchMyTeam()
            fetchTeamsData()
          }}
          onDelete={() => {
            setShowEditModal(false)
            fetchMyTeam()
            fetchTeamsData()
          }}
        />
      )}
    </>
  )
}

function CreateTeamModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, password }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Team created!')
        onSuccess()
      } else {
        toast.error(json.error?.message || 'Failed to create team')
      }
    } catch (e) {
      toast.error('Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Create Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-900 dark:text-white">Team Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-900 dark:text-white">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-900 dark:text-white">Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty for public team
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function JoinTeamModal({
  open,
  onClose,
  team,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  team: Team | null
  onSuccess: () => void
}) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!team) return

    try {
      setLoading(true)
      const res = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: team.id, password }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Joined team!')
        onSuccess()
      } else {
        toast.error(json.error?.message || 'Failed to join team')
      }
    } catch (e) {
      toast.error('Failed to join team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Join {team?.name || 'Team'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-gray-900 dark:text-white">Team Password (if required)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Joining...' : 'Join'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditTeamModal({
  open,
  onClose,
  team,
  onSuccess,
  onDelete,
}: {
  open: boolean
  onClose: () => void
  team: MyTeamData
  onSuccess: () => void
  onDelete: () => void
}) {
  const [name, setName] = useState(team.name)
  const [description, setDescription] = useState(team.description || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const payload: any = { name, description }
      if (password.trim()) {
        payload.password = password.trim()
      }
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Team updated!')
        onSuccess()
      } else {
        toast.error(json.error?.message || 'Failed to update team')
      }
    } catch (e) {
      toast.error('Failed to update team')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this team? All members will be removed.')) return

    try {
      setLoading(true)
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Team deleted')
        onDelete()
      } else {
        toast.error(json.error?.message || 'Failed to delete team')
      }
    } catch (e) {
      toast.error('Failed to delete team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-900 dark:text-white">Team Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-900 dark:text-white">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-900 dark:text-white">New Password (optional)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty to keep current password
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="ml-auto"
            >
              Delete Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
