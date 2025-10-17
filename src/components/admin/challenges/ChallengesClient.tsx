'use client'

import React from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ChallengeForm } from '@/components/forms/ChallengeForm'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
type CType = 'STANDARD' | 'DYNAMIC'

export type ChallengeRow = {
  id: string
  name: string
  value: number
  category: string
  difficulty: Difficulty
  type: CType
  solveCount: number
}

type ChallengeDetail = {
  id: string
  name: string
  description: string
  value: number
  points: number
  flag: string
  category: string
  difficulty: Difficulty
  type: CType
  function: 'static' | 'log' | 'exp' | 'linear'
  minimum: number | null
  decay: number | null
  hints: { id: string; cost: number }[]
}

type ChallengesClientProps = {
  initialData: ChallengeRow[]
  initialError: string | null
}

export default function ChallengesClient({
  initialData,
  initialError,
}: ChallengesClientProps) {
  const [data, setData] = React.useState<ChallengeRow[]>(initialData ?? [])
  const [error, setError] = React.useState<string | null>(initialError ?? null)
  const [loading, setLoading] = React.useState(false)

  const [creating, setCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editInitial, setEditInitial] = React.useState<{
    name: string
    description: string
    category: string
    points: number
    flag?: string
    type?: CType
    difficulty?: Difficulty
    value?: number | null
    function?: 'static' | 'log' | 'exp' | 'linear'
    minimum?: number | null
    decay?: number | null
  } | null>(null)

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/challenges', {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(
          (json?.error?.message as string) ?? 'Failed to refresh challenges'
        )
      }
      setData(json.data as ChallengeRow[])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to refresh challenges')
    } finally {
      setLoading(false)
    }
  }

  async function startEdit(id: string) {
    try {
      setEditingId(id)
      setEditInitial(null)
      const res = await fetch(`/api/challenges/${id}`, {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(
          (json?.error?.message as string) ?? 'Failed to load challenge'
        )
      }
      const c = json.data as ChallengeDetail
      setEditInitial({
        name: c.name,
        description: c.description,
        category: c.category,
        points: c.points,
        flag: c.flag,
        type: c.type,
        difficulty: c.difficulty,
        value: c.type === 'DYNAMIC' ? c.value : null,
        function: c.function,
        minimum: c.minimum,
        decay: c.decay,
      })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load challenge')
      setEditingId(null)
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm('Delete this challenge?')
    if (!ok) return
    try {
      const res = await fetch(`/api/challenges/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to delete challenge')
      }
      toast.success('Challenge deleted')
      await refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete challenge')
    }
  }

  const columns: Column<ChallengeRow>[] = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'type', header: 'Type' },
    {
      key: 'value',
      header: 'Value',
      render: row => <span>{row.value}</span>,
    },
    {
      key: 'solveCount',
      header: 'Solves',
      render: row => <span>{row.solveCount}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: row => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => startEdit(row.id)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => setCreating(true)}>New Challenge</Button>
      </div>

      <DataTable<ChallengeRow>
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        emptyMessage="No challenges"
      />

      {/* Create modal */}
      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-7xl my-8 rounded-xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Create Challenge</h2>
              <button
                className="rounded-[var(--radius-md)] p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCreating(false)}
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <ChallengeForm
                mode="create"
                onSuccess={async () => {
                  setCreating(false)
                  await refresh()
                }}
                onCancel={() => setCreating(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {editingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-7xl my-8 rounded-xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Edit Challenge</h2>
              <button
                className="rounded-[var(--radius-md)] p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => {
                  setEditingId(null)
                  setEditInitial(null)
                }}
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {editInitial ? (
                <ChallengeForm
                  mode="edit"
                  challengeId={editingId}
                  initialValues={editInitial}
                  onSuccess={async () => {
                    setEditingId(null)
                    setEditInitial(null)
                    await refresh()
                  }}
                  onCancel={() => {
                    setEditingId(null)
                    setEditInitial(null)
                  }}
                  filesPanel={<FilesPanel challengeId={editingId!} />}
                />
              ) : (
                <div className="px-2 py-6 text-sm text-muted-foreground">
                  Loading challenge...
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type FileMeta = {
  id: string
  location: string
  sha1sum: string | null
}

/**
 * FilesPanel - Minimal admin UI to manage challenge files
 * - Lists files via GET /api/challenges/:id/files
 * - Uploads single file via POST /api/challenges/:id/files (multipart/form-data)
 * - Provides download link via GET /api/files/:id/download
 * - Deletes via DELETE /api/files/:id
 */
function FilesPanel({ challengeId }: { challengeId: string }) {
  const [files, setFiles] = React.useState<FileMeta[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/challenges/${challengeId}/files`, {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(
          (json?.error?.message as string) ?? 'Failed to load files'
        )
      }
      setFiles(json.data as FileMeta[])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load files'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId])

  async function onUploadChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('filename', file.name)
      if (file.type) fd.append('contentType', file.type)
      const res = await fetch(`/api/challenges/${challengeId}/files`, {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error((json?.error?.message as string) ?? 'Upload failed')
      }
      toast.success('File uploaded')
      if (inputRef.current) inputRef.current.value = ''
      await refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm('Delete this file?')
    if (!ok) return
    try {
      const res = await fetch(`/api/files/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Delete failed')
      }
      toast.success('File deleted')
      await refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Files
        </h3>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          onChange={onUploadChange}
          className="block w-full max-w-xs text-sm file:mr-2 file:rounded-md file:border file:border-gray-200 file:bg-white file:px-2 file:py-1 file:text-sm hover:file:bg-gray-50 dark:file:border-neutral-800 dark:file:bg-neutral-900 dark:hover:file:bg-neutral-800"
          aria-label="Upload file"
        />
        <Button size="sm" variant="outline" disabled>
          Uploads on select
        </Button>
        {uploading ? (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Uploading...
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Loading files...
        </div>
      ) : error ? (
        <div className="text-xs text-red-600 dark:text-red-400">{error}</div>
      ) : files.length === 0 ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          No files for this challenge
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-neutral-800 dark:border-neutral-800">
          {files.map(f => (
            <li
              key={f.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm">{f.location}</span>
                {f.sha1sum ? (
                  <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                    sha1: {f.sha1sum}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/files/${f.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
                >
                  Download
                </a>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(f.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
