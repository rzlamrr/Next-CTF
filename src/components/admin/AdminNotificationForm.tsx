'use client'

import * as React from 'react'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type Target = 'ALL' | 'USER' | 'TEAM'

export default function AdminNotificationForm() {
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')
  const [target, setTarget] = React.useState<Target>('ALL')
  const [userId, setUserId] = React.useState('')
  const [teamId, setTeamId] = React.useState('')
  const [sendEmail, setSendEmail] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required')
      return
    }
    if (target === 'USER' && !userId.trim()) {
      toast.error('userId is required for target=USER')
      return
    }
    if (target === 'TEAM' && !teamId.trim()) {
      toast.error('teamId is required for target=TEAM')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          target,
          userId: target === 'USER' ? userId.trim() : undefined,
          teamId: target === 'TEAM' ? teamId.trim() : undefined,
          sendEmail,
        }),
      })
      const json = await res.json()
      if (json?.success) {
        const createdCount = json.data?.createdCount ?? 0
        toast.success(`Notifications created: ${createdCount}`)
        // reset minimal fields
        setTitle('')
        setBody('')
        setUserId('')
        setTeamId('')
      } else {
        const msg = json?.error?.message ?? 'Failed to send notification'
        toast.error(msg)
      }
    } catch (err) {
      toast.error('Network error while sending notification')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <h2 className="text-base font-semibold">Admin Broadcast</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="notify_title">Title</Label>
            <Input
              id="notify_title"
              placeholder="System maintenance at 03:00 UTC"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="notify_body">Body</Label>
            <textarea
              id="notify_body"
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="We will be performing scheduled maintenance..."
              value={body}
              onChange={e => setBody(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="notify_target">Target</Label>
            <select
              id="notify_target"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={target}
              onChange={e => setTarget(e.target.value as Target)}
            >
              <option value="ALL">ALL</option>
              <option value="USER">USER</option>
              <option value="TEAM">TEAM</option>
            </select>
          </div>

          {target === 'USER' ? (
            <div>
              <Label htmlFor="notify_userId">User ID</Label>
              <Input
                id="notify_userId"
                placeholder="cuid_of_user"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
              />
            </div>
          ) : null}

          {target === 'TEAM' ? (
            <div>
              <Label htmlFor="notify_teamId">Team ID</Label>
              <Input
                id="notify_teamId"
                placeholder="cuid_of_team"
                value={teamId}
                onChange={e => setTeamId(e.target.value)}
                required
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="notify_sendEmail"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-ring dark:border-neutral-700"
              checked={sendEmail}
              onChange={e => setSendEmail(e.target.checked)}
            />
            <Label htmlFor="notify_sendEmail">
              Also send via email (if SMTP configured)
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </form>
    </div>
  )
}
