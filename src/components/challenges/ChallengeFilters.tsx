'use client'
/**
 * ChallengeFilters
 *
 * Controls: search, category, type, difficulty, bracket.
 * - Syncs to URL query params and triggers refresh on change.
 * - Designed for use at top of /challenges page.
 *
 * Example:
 * <ChallengeFilters className="mb-4" />
 */
import * as React from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type CType = 'STANDARD' | 'DYNAMIC'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'

export type ChallengeFiltersProps = {
  className?: string
}

function useQueryUpdater() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = React.useCallback(
    (updates: Record<string, string | null | undefined>, replace = false) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')

      // Apply updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      const qs = params.toString()
      const url = qs ? `${pathname}?${qs}` : pathname
      if (replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
      router.refresh()
    },
    [router, pathname, searchParams]
  )

  const reset = React.useCallback(() => {
    router.push(pathname)
    router.refresh()
  }, [router, pathname])

  return { update, reset }
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ label: string; value: string }>
}) {
  return (
    <div className="flex-1 min-w-[160px]">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function ChallengeFilters({ className }: ChallengeFiltersProps) {
  const searchParams = useSearchParams()
  const { update, reset } = useQueryUpdater()

  const [search, setSearch] = React.useState(
    () => searchParams?.get('search') ?? ''
  )
  const [category, setCategory] = React.useState(
    () => searchParams?.get('category') ?? ''
  )
  const [type, setType] = React.useState<'' | CType>(
    () => (searchParams?.get('type')?.toUpperCase() as CType) ?? ''
  )
  const [difficulty, setDifficulty] = React.useState<'' | Difficulty>(
    () => (searchParams?.get('difficulty')?.toUpperCase() as Difficulty) ?? ''
  )
  const [bracket, setBracket] = React.useState(
    () => searchParams?.get('bracket') ?? ''
  )

  // Debounce text inputs to avoid excessive refresh
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  function scheduleUpdate(payload: Record<string, string | null | undefined>) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      update(payload)
    }, 300)
  }

  // Handlers
  function onSearchChange(v: string) {
    setSearch(v)
    scheduleUpdate({ search: v })
  }
  function onCategoryChange(v: string) {
    setCategory(v)
    scheduleUpdate({ category: v })
  }
  function onBracketChange(v: string) {
    setBracket(v)
    scheduleUpdate({ bracket: v })
  }
  function onTypeChange(v: string) {
    const normalized = v.toUpperCase()
    setType((normalized as CType) || '')
    update({ type: normalized || null })
  }
  function onDifficultyChange(v: string) {
    const normalized = v.toUpperCase()
    setDifficulty((normalized as Difficulty) || '')
    update({ difficulty: normalized || null })
  }

  function onReset() {
    setSearch('')
    setCategory('')
    setType('')
    setDifficulty('')
    setBracket('')
    reset()
  }

  return (
    <section className={className}>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-xs font-medium text-muted-foreground"
            >
              Search
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Find challenges by name or tags"
              className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="category"
              className="block text-xs font-medium text-muted-foreground"
            >
              Category
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={e => onCategoryChange(e.target.value)}
              placeholder="e.g., web, pwn, crypto"
              className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="bracket"
              className="block text-xs font-medium text-muted-foreground"
            >
              Bracket
            </label>
            <input
              id="bracket"
              type="text"
              value={bracket}
              onChange={e => onBracketChange(e.target.value)}
              placeholder="Optional bracket ID"
              className="mt-1 block w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            id="type"
            label="Type"
            value={type || ''}
            onChange={onTypeChange}
            options={[
              { label: 'All', value: '' },
              { label: 'Standard', value: 'STANDARD' },
              { label: 'Dynamic', value: 'DYNAMIC' },
            ]}
          />

          <Select
            id="difficulty"
            label="Difficulty"
            value={difficulty || ''}
            onChange={onDifficultyChange}
            options={[
              { label: 'All', value: '' },
              { label: 'Easy', value: 'EASY' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'Hard', value: 'HARD' },
              { label: 'Insane', value: 'INSANE' },
            ]}
          />

          <div className="flex items-end">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
