'use client'
/**
 * AttemptFlagForm
 *
 * Client-side form to submit a flag for a challenge.
 * - Validates with FlagSubmitSchema
 * - POST /api/challenges/attempt
 * - Shows inline success/error messages
 * - If unauthenticated, disables form and shows CTA to /login
 *
 * Example:
 * <AttemptFlagForm challengeId="ch_123" onSuccess={() => console.log('Solved!')} />
 */
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FlagSubmitSchema,
  type FlagSubmitInput,
} from '@/lib/validations/submission'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type AttemptData =
  | {
      correct?: boolean
      message?: string
    }
  | Record<string, unknown>

export type AttemptFlagFormProps = {
  challengeId: string
  /**
   * Called when submission succeeds (regardless of correctness).
   * Use to refresh local lists or trigger extra effects.
   */
  onSuccess?: () => void
  /**
   * If true (default), calls router.refresh() on success.
   */
  refreshOnSuccess?: boolean
  className?: string
}

function isSuccess<T>(env: Envelope<T>): env is SuccessEnvelope<T> {
  return (env as SuccessEnvelope<T>).success === true
}

export default function AttemptFlagForm({
  challengeId,
  onSuccess,
  refreshOnSuccess = true,
  className,
}: AttemptFlagFormProps) {
  const router = useRouter()

  const [flag, setFlag] = React.useState<string>('')
  const [submitting, setSubmitting] = React.useState(false)

  const [authLoading, setAuthLoading] = React.useState(true)
  const [isAuthed, setIsAuthed] = React.useState(false)

  const [info, setInfo] = React.useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Fetch session to determine auth state
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/session', { cache: 'no-store' })
        const json = (await res.json()) as Envelope<{
          id: string
          email: string | null
          role?: 'USER' | 'ADMIN'
        } | null>
        if (!cancelled) {
          setIsAuthed(isSuccess(json) && json.data !== null)
        }
      } catch {
        if (!cancelled) {
          setIsAuthed(false)
        }
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInfo(null)

    // Basic guard
    if (!isAuthed) {
      setInfo({
        type: 'error',
        message: 'You must be logged in to submit flags.',
      })
      return
    }

    let payload: FlagSubmitInput
    try {
      payload = FlagSubmitSchema.parse({ challengeId, flag })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid input'
      setInfo({ type: 'error', message })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/challenges/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = (await res.json()) as Envelope<AttemptData>
      if (isSuccess(json)) {
        const d = json.data
        const correct =
          typeof (d as any)?.correct === 'boolean'
            ? ((d as any).correct as boolean)
            : undefined
        const message =
          typeof (d as any)?.message === 'string'
            ? ((d as any).message as string)
            : correct === true
              ? 'Correct flag! Nice work.'
              : correct === false
                ? 'Incorrect flag. Try again.'
                : 'Submission received.'

        setInfo({ type: correct ? 'success' : 'error', message })

        if (onSuccess) onSuccess()
        if (refreshOnSuccess) router.refresh()
        if (correct) setFlag('')
      } else {
        const msg = json.error?.message || 'Submission failed'
        setInfo({ type: 'error', message: msg })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      setInfo({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse h-10 w-full rounded-md bg-gray-200" />
        <p className="mt-2 text-xs text-gray-500">Checking session...</p>
      </div>
    )
  }

  if (!isAuthed) {
    return (
      <div className={className}>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            You must be logged in to submit a flag.
          </p>
          <div className="mt-2">
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="flag" className="block text-sm font-medium text-gray-700">
        Enter Flag
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id="flag"
          name="flag"
          type="text"
          autoComplete="off"
          value={flag}
          onChange={e => setFlag(e.target.value)}
          required
          disabled={submitting}
          placeholder="CTF{example_flag}"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 disabled:opacity-60"
          aria-describedby="flag-help"
        />
        <button
          type="submit"
          disabled={submitting || flag.trim().length === 0}
          className="inline-flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-60"
          aria-label="Submit flag"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
      <p id="flag-help" className="mt-1 text-xs text-gray-500">
        Format: CTF&#123;...&#125;
      </p>

      {info ? (
        <div
          className={`mt-3 rounded-md border p-3 text-sm ${
            info.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
          role={info.type === 'success' ? 'status' : 'alert'}
        >
          {info.message}
        </div>
      ) : null}
    </form>
  )
}
