'use client'

import React from 'react'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChallengeCreateSchema,
  ChallengeUpdateSchema,
  type ChallengeCreateInput,
  type ChallengeUpdateInput,
} from '@/lib/validations/challenge'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
type CType = 'STANDARD' | 'DYNAMIC'

type ChallengeFormProps = {
  mode: 'create' | 'edit'
  challengeId?: string
  initialValues?: {
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
  }
  onSuccess: () => void
  onCancel: () => void
  filesPanel?: React.ReactNode
}

type FormState = {
  name: string
  description: string
  category: string
  points: string
  flag: string
  type: CType
  difficulty: Difficulty
  value: string
  function: 'static' | 'log' | 'exp' | 'linear'
  initial: string
  minimum: string
  decay: string
  previewCurrent?: number
  previewComputed?: number
}

const defaultState: FormState = {
  name: '',
  description: '',
  category: '',
  points: '',
  flag: '',
  type: 'STANDARD',
  difficulty: 'EASY',
  value: '',
  function: 'static',
  initial: '',
  minimum: '',
  decay: '',
  previewCurrent: undefined,
  previewComputed: undefined,
}

export function ChallengeForm({
  mode,
  challengeId,
  initialValues,
  onSuccess,
  onCancel,
  filesPanel,
}: ChallengeFormProps) {
  const [submitting, setSubmitting] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [state, setState] = React.useState<FormState>(() => {
    if (!initialValues) return defaultState
    return {
      name: initialValues.name ?? '',
      description: initialValues.description ?? '',
      category: initialValues.category ?? '',
      points: initialValues.points != null ? String(initialValues.points) : '',
      flag: initialValues.flag ?? '',
      type: initialValues.type ?? 'STANDARD',
      difficulty: initialValues.difficulty ?? 'EASY',
      value: initialValues.value != null ? String(initialValues.value) : '',
      function: initialValues.function ?? 'static',
      initial: initialValues.points != null ? String(initialValues.points) : '',
      minimum: initialValues.minimum != null ? String(initialValues.minimum) : '',
      decay: initialValues.decay != null ? String(initialValues.decay) : '',
      previewCurrent: undefined,
      previewComputed: undefined,
    }
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setState(s => ({ ...s, [name]: value }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)])
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function uploadFilesToChallenge(challengeId: string) {
    if (selectedFiles.length === 0) return

    setUploadingFiles(true)
    const results = []

    for (const file of selectedFiles) {
      try {
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
          results.push({ file: file.name, success: false })
        } else {
          results.push({ file: file.name, success: true })
        }
      } catch {
        results.push({ file: file.name, success: false })
      }
    }

    setUploadingFiles(false)

    const failed = results.filter(r => !r.success)
    if (failed.length > 0) {
      toast.error(`Failed to upload ${failed.length} file(s): ${failed.map(f => f.file).join(', ')}`)
    } else if (results.length > 0) {
      toast.success(`Uploaded ${results.length} file(s)`)
    }
  }

  async function refreshPreview() {
    if (!challengeId) return
    try {
      const res = await fetch(`/api/challenges/${challengeId}/value`, {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(
          (json?.error?.message as string) ?? 'Failed to preview value'
        )
      }
      setState(s => ({
        ...s,
        previewCurrent: Number(json.data.current),
        previewComputed: Number(json.data.computed),
      }))
    } catch {
      // ignore preview failures
    }
  }

  React.useEffect(() => {
    if (mode === 'edit' && challengeId) {
      void refreshPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSubmitting(true)

      const base = {
        name: state.name.trim(),
        description: state.description.trim(),
        category: state.category.trim(),
        type: (state.type ?? 'STANDARD') as CType,
        difficulty: (state.difficulty ?? 'EASY') as Difficulty,
        points: Number.parseInt(state.points, 10),
        flag: state.flag,
      }

      if (Number.isNaN(base.points) || base.points <= 0) {
        throw new Error('Points must be a positive integer')
      }

      const scoringFields: Partial<
        ChallengeCreateInput & ChallengeUpdateInput
      > = {}
      if (state.initial !== '')
        scoringFields.initial = Number.parseInt(state.initial, 10)
      if (state.minimum !== '')
        scoringFields.minimum = Number.parseInt(state.minimum, 10)
      if (state.decay !== '')
        scoringFields.decay = Number.parseFloat(state.decay)
      if (state.function) scoringFields.function = state.function

      // Include dynamic value only when provided and type is DYNAMIC
      const maybeDynamic =
        state.type === 'DYNAMIC' && state.value !== ''
          ? { value: Number.parseInt(state.value, 10) }
          : {}

      if (mode === 'create') {
        const payload = {
          ...base,
          ...maybeDynamic,
          ...scoringFields,
        } as unknown
        const parsed = (
          ChallengeCreateSchema as z.ZodType<ChallengeCreateInput>
        ).safeParse(payload)
        if (!parsed.success) {
          const msg = parsed.error.issues?.[0]?.message ?? 'Invalid form values'
          throw new Error(msg)
        }
        const res = await fetch('/api/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to create challenge')
        }

        // Get the created challenge ID from response
        const json = await res.json()
        const newChallengeId = json.data?.id

        toast.success('Challenge created')

        // Upload files if any were selected
        if (newChallengeId && selectedFiles.length > 0) {
          await uploadFilesToChallenge(newChallengeId)
        }

        onSuccess()
        return
      }

      // edit mode
      if (!challengeId) throw new Error('Missing challenge id')

      // 1) Apply scoring params via dedicated endpoint
      const scoringUpdate: Partial<ChallengeUpdateInput> = {
        type: base.type,
        function: scoringFields.function as any,
        initial: scoringFields.initial as any,
        minimum: scoringFields.minimum as any,
        decay: scoringFields.decay as any,
      }
      // Strip undefineds
      Object.keys(scoringUpdate).forEach(k => {
        const key = k as keyof typeof scoringUpdate
        if (typeof scoringUpdate[key] === 'undefined') delete scoringUpdate[key]
      })
      if (Object.keys(scoringUpdate).length > 0) {
        const parsedScoring = (
          ChallengeUpdateSchema as z.ZodType<ChallengeUpdateInput>
        ).safeParse(scoringUpdate)
        if (!parsedScoring.success) {
          const msg =
            parsedScoring.error.issues?.[0]?.message ?? 'Invalid scoring values'
          throw new Error(msg)
        }
        const resScore = await fetch(`/api/challenges/${challengeId}/scoring`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedScoring.data),
        })
        if (!resScore.ok) {
          const text = await resScore.text()
          throw new Error(text || 'Failed to update scoring')
        }
        // Refresh preview after scoring update
        await refreshPreview()
      }

      // 2) Apply other fields via existing PATCH route
      const updatePayload: Partial<ChallengeUpdateInput> = {
        name: base.name,
        description: base.description,
        category: base.category,
        type: base.type,
        difficulty: base.difficulty,
        points: base.points,
        flag: base.flag,
        ...(state.type === 'DYNAMIC' && state.value !== ''
          ? { value: Number.parseInt(state.value, 10) }
          : {}),
      }
      const parsedUpdate = (
        ChallengeUpdateSchema as z.ZodType<ChallengeUpdateInput>
      ).safeParse(updatePayload)
      if (!parsedUpdate.success) {
        const msg =
          parsedUpdate.error.issues?.[0]?.message ?? 'Invalid form values'
        throw new Error(msg)
      }

      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedUpdate.data),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to update challenge')
      }
      toast.success('Challenge updated')
      onSuccess()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Main Content */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={state.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={state.category}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                value={state.type}
                onChange={handleChange}
                className="block w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="STANDARD">STANDARD</option>
                <option value="DYNAMIC">DYNAMIC</option>
              </select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                name="difficulty"
                value={state.difficulty}
                onChange={handleChange}
                className="block w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
                <option value="INSANE">INSANE</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="flag">Flag</Label>
              <Input
                id="flag"
                name="flag"
                value={state.flag}
                onChange={handleChange}
                required={mode === 'create'}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={state.description}
                onChange={handleChange}
                rows={6}
                className="block w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>

            {/* Files section */}
            <div className="md:col-span-2">
              {filesPanel ? (
                filesPanel
              ) : (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Files</h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="block w-full text-sm file:mr-2 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-muted transition-colors"
                        aria-label="Select files"
                        disabled={submitting || uploadingFiles}
                      />
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {selectedFiles.length} file(s) selected. They will be uploaded after creating the challenge.
                        </p>
                        <ul className="divide-y divide-border rounded-md border border-border">
                          {selectedFiles.map((file, index) => (
                            <li
                              key={`${file.name}-${index}`}
                              className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <div className="min-w-0 flex-1">
                                  <span className="truncate text-sm block">{file.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="ml-2 rounded-md p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                aria-label={`Remove ${file.name}`}
                                disabled={submitting || uploadingFiles}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Points & Scoring */}
        <aside className="space-y-4">
          <div className="sticky top-0 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5 shadow-lg">
            <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2 border-b border-primary/20 pb-3">
              <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Points & Scoring
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  min={1}
                  value={state.points}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Dynamic scoring section */}
              {state.type === 'DYNAMIC' ? (
                <>
                  <div>
                    <Label htmlFor="function">Function</Label>
                    <select
                      id="function"
                      name="function"
                      value={state.function}
                      onChange={handleChange}
                      className="block w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm"
                      title="Choose dynamic scoring algorithm: static, log, exp, linear"
                    >
                      <option value="static">static</option>
                      <option value="log">log</option>
                      <option value="exp">exp</option>
                      <option value="linear">linear</option>
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      log: value = max(min, floor(initial - (log2(solves+1) * decay)))
                      • exp: value = max(min, floor(initial * decay^solves)) • linear:
                      value = max(min, floor(initial - decay*solves))
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="initial">Initial</Label>
                    <Input
                      id="initial"
                      name="initial"
                      type="number"
                      min={1}
                      value={state.initial}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Defaults to Points if not set.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="minimum">Minimum</Label>
                    <Input
                      id="minimum"
                      name="minimum"
                      type="number"
                      min={0}
                      value={state.minimum}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Minimum value floor; must be ≤ initial.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="decay">Decay</Label>
                    <Input
                      id="decay"
                      name="decay"
                      type="number"
                      min={0}
                      step="any"
                      value={state.decay}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      For exp, use decay in [0, 1]. Backend stores integers, so use 0
                      or 1.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="value">Current Value</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      min={0}
                      value={state.value}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <div className="rounded-[var(--radius-md)] border border-border bg-muted/30 px-3 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Computed Preview</span>
                        <button
                          type="button"
                          className="text-xs text-primary hover:text-primary/80 underline underline-offset-4"
                          onClick={() => void refreshPreview()}
                          aria-label="Refresh preview"
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current:</span>{' '}
                          <span className="font-mono font-semibold">
                            {state.previewCurrent ?? '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Computed:</span>{' '}
                          <span className="font-mono font-semibold">
                            {state.previewComputed ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button type="submit" disabled={submitting || uploadingFiles}>
          {submitting || uploadingFiles
            ? uploadingFiles
              ? 'Uploading files...'
              : mode === 'create'
                ? 'Creating...'
                : 'Saving...'
            : mode === 'create'
              ? 'Create'
              : 'Save'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting || uploadingFiles}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
