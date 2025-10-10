'use client'
/**
 * ProfileForm
 *
 * Client-side profile editor for current user.
 * - Validates payload with UserUpdateSchema
 * - PATCH /api/users/me
 * - Shows inline success/error and optionally refreshes
 *
 * Example:
 * <ProfileForm initial={{ name: 'alice', email: 'a@example.com', team: { id: 't1', name: 'Team A' } }} />
 */
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { UserUpdateSchema } from '@/lib/validations/user'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type TeamSummary = { id: string; name: string } | null

export type ProfileFormProps = {
  initial: {
    name: string | null
    email: string | null
    team: TeamSummary
    // Additional profile fields
    website?: string | null
    language?: string | null
    affiliation?: string | null
    country?: string | null
  }
  className?: string
  refreshOnSuccess?: boolean
}

export default function ProfileForm({
  initial,
  className,
  refreshOnSuccess = true,
}: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = React.useState(initial.name ?? '')
  const [website, setWebsite] = React.useState(initial.website ?? '')
  const [language, setLanguage] = React.useState(initial.language ?? '')
  const [affiliation, setAffiliation] = React.useState(
    initial.affiliation ?? ''
  )
  const [country, setCountry] = React.useState(initial.country ?? '')

  const [submitting, setSubmitting] = React.useState(false)
  const [info, setInfo] = React.useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  function collectUpdates() {
    const updates: Record<string, unknown> = {}
    if (name.trim() && name.trim() !== (initial.name ?? ''))
      updates.name = name.trim()
    if (website.trim() && website.trim() !== (initial.website ?? ''))
      updates.website = website.trim()
    if (language.trim() && language.trim() !== (initial.language ?? ''))
      updates.language = language.trim()
    if (
      affiliation.trim() &&
      affiliation.trim() !== (initial.affiliation ?? '')
    )
      updates.affiliation = affiliation.trim()
    if (country.trim() && country.trim() !== (initial.country ?? ''))
      updates.country = country.trim()
    return updates
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setInfo(null)

    const updates = collectUpdates()
    try {
      // Validate with server schema to match API contract
      UserUpdateSchema.parse(updates)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid input'
      setInfo({ type: 'error', message })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const json = (await res.json()) as Envelope<{
        id: string
        name: string | null
        email: string | null
        role?: string
        team: TeamSummary
      }>

      if ('success' in json && json.success) {
        setInfo({ type: 'success', message: 'Profile updated.' })
        if (refreshOnSuccess) router.refresh()
      } else {
        const msg = (json as ErrorEnvelope).error?.message || 'Update failed'
        setInfo({ type: 'error', message: msg })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      setInfo({ type: 'error', message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your display name"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Email</Label>
          <Input
            type="email"
            value={initial.email ?? ''}
            disabled
            className="mt-1 cursor-not-allowed"
          />
        </div>

        <div>
          <Label htmlFor="website" className="text-xs text-muted-foreground">
            Website
          </Label>
          <Input
            id="website"
            type="text"
            value={website}
            onChange={e => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="language" className="text-xs text-muted-foreground">
            Language
          </Label>
          <Input
            id="language"
            type="text"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            placeholder="e.g., en, ko"
            className="mt-1"
          />
        </div>

        <div>
          <Label
            htmlFor="affiliation"
            className="text-xs text-muted-foreground"
          >
            Affiliation
          </Label>
          <Input
            id="affiliation"
            type="text"
            value={affiliation}
            onChange={e => setAffiliation(e.target.value)}
            placeholder="Organization/School (optional)"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="country" className="text-xs text-muted-foreground">
            Country
          </Label>
          <Input
            id="country"
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="e.g., KR, US"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Team</Label>
          <Input
            type="text"
            value={initial.team?.name ?? '-'}
            disabled
            className="mt-1 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
        {info ? (
          <span
            className={`text-sm ${info.type === 'success' ? 'text-accent' : 'text-destructive'}`}
            role={info.type === 'success' ? 'status' : 'alert'}
          >
            {info.message}
          </span>
        ) : null}
      </div>
    </form>
  )
}
