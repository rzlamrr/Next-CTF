'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

type Member = {
  id: string
  name: string | null
  email: string | null
}

type Team = {
  id: string
  name: string
  description: string | null
  captainId: string
  members: Member[]
}

type Props = {
  team: Team
  currentUserId: string
  isCaptain: boolean
}

export default function TeamDetailClient({ team, currentUserId, isCaptain }: Props) {
  const router = useRouter()

  const [name, setName] = React.useState(team.name)
  const [description, setDescription] = React.useState(team.description ?? '')
  const [password, setPassword] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const [members, setMembers] = React.useState<Member[]>(team.members)
  const [newMemberId, setNewMemberId] = React.useState('')
  const [adding, setAdding] = React.useState(false)
  const [removingId, setRemovingId] = React.useState<string | null>(null)

  const resetAlerts = () => {
    setError(null)
    setSuccess(null)
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    resetAlerts()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      if (name.trim() !== team.name) payload.name = name.trim()
      if ((description ?? '').trim() !== (team.description ?? '')) {
        payload.description = (description ?? '').trim()
      }
      // If password provided, update. If left blank, do not change.
      if (password.length > 0) payload.password = password

      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? res.statusText)
      }
      setSuccess('Team settings updated')
      setPassword('')
      // Refresh server data
      router.refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to update team')
    } finally {
      setSaving(false)
    }
  }

  const onAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    resetAlerts()
    if (!newMemberId.trim()) {
      setError('Member ID is required')
      return
    }
    setAdding(true)
    try {
      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: newMemberId.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? res.statusText)
      }
      // Optimistically append member if returned
      const added: Member | undefined = json?.data?.member
      if (added) {
        setMembers(prev => {
          if (prev.some(m => m.id === added.id)) return prev
          return [...prev, added]
        })
      }
      setNewMemberId('')
      setSuccess('Member added to team')
      router.refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  const onRemoveMember = async (memberId: string) => {
    resetAlerts()
    setRemovingId(memberId)
    try {
      const res = await fetch(`/api/teams/${team.id}/members?memberId=${encodeURIComponent(memberId)}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message ?? res.statusText)
      }
      setMembers(prev => prev.filter(m => m.id !== memberId))
      setSuccess('Member removed from team')
      router.refresh()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to remove member')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">Team</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Team details and roster.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-3">
            <div className="text-xs uppercase text-muted-foreground">Team Name</div>
            <div className="mt-1 text-sm">{team.name}</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="text-xs uppercase text-muted-foreground">Captain</div>
            <div className="mt-1 text-sm">{isCaptain ? 'You' : 'Another member'}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs uppercase text-muted-foreground">Members</div>
          <ul className="mt-2 divide-y divide-border rounded-md border border-border">
            {members.length === 0 ? (
              <li className="p-3 text-sm text-muted-foreground">No members</li>
            ) : (
              members.map(m => (
                <li key={m.id} className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{m.name ?? 'Unnamed'}</div>
                    <div className="truncate text-xs text-muted-foreground">{m.email ?? '—'}</div>
                  </div>
                  {isCaptain && m.id !== currentUserId ? (
                    <button
                      type="button"
                      className="text-xs underline underline-offset-4 disabled:opacity-50"
                      onClick={() => onRemoveMember(m.id)}
                      disabled={removingId === m.id}
                      aria-label={`Remove ${m.name ?? m.email ?? 'member'}`}
                    >
                      {removingId === m.id ? 'Removing...' : 'Remove'}
                    </button>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {isCaptain ? (
        <>
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Edit Team</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update team name, description, or password.
            </p>

            {error ? (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive-foreground">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-3 rounded-md border border-emerald-400/40 bg-emerald-400/10 p-2 text-sm text-emerald-600 dark:text-emerald-400">
                {success}
              </div>
            ) : null}

            <form onSubmit={onSave} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Team name"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <textarea
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Password</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Set new password (leave blank to keep unchanged)"
                />
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold">Add Member</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a member by user ID. Alternatively, users can join via the Teams page if they know the team password.
            </p>
            <form onSubmit={onAddMember} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newMemberId}
                onChange={e => setNewMemberId(e.target.value)}
                placeholder="User ID"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted disabled:opacity-50"
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
            </form>
          </section>
        </>
      ) : null}
    </div>
  )
}