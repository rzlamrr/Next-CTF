'use client'

import * as React from 'react'

type NotificationItem = {
  id: string
  title: string
  content: string
  read: boolean
  createdAt: string | Date
}

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}

export default function NotificationsBell() {
  const [items, setItems] = React.useState<NotificationItem[]>([])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [marking, setMarking] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const unreadCount = React.useMemo(
    () => items.filter(i => !i.read).length,
    [items]
  )

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/notifications', { method: 'GET' })
      .then(async res => {
        const json = (await res.json()) as
          | SuccessEnvelope<NotificationItem[]>
          | ErrorEnvelope
        if ('success' in json && json.success) {
          if (mounted) setItems(json.data)
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            'Failed to fetch notifications:',
            'error' in json ? json.error?.message : res.statusText
          )
        }
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch notifications')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const markAllUnreadAsRead = React.useCallback(async () => {
    const unread = items.filter(i => !i.read)
    if (!unread.length) return
    setMarking(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unread.map(i => i.id) }),
      })
      const json = (await res.json()) as
        | SuccessEnvelope<{ updatedCount: number }>
        | ErrorEnvelope
      if ('success' in json && json.success) {
        // Optimistically update local state
        setItems(prev =>
          prev.map(i =>
            unread.some(u => u.id === i.id) ? { ...i, read: true } : i
          )
        )
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          'Failed to mark as read:',
          'error' in json ? json.error?.message : res.statusText
        )
      }
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Failed to mark notifications as read')
    } finally {
      setMarking(false)
    }
  }, [items])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        className="relative inline-flex items-center justify-center rounded-md border border-input bg-background px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        onClick={() => setOpen(v => !v)}
      >
        <BellIcon />
        {unreadCount > 0 ? (
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications list"
          className="absolute right-0 mt-2 w-80 rounded-md border border-border bg-card p-2 shadow-lg"
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <button
              type="button"
              className="text-xs underline underline-offset-4 disabled:opacity-50"
              onClick={markAllUnreadAsRead}
              disabled={marking || unreadCount === 0}
            >
              {marking ? 'Marking...' : 'Mark all as read'}
            </button>
          </div>

          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto">
              {items.slice(0, 20).map(n => (
                <li
                  key={n.id}
                  className={`rounded-md p-2 text-sm ${
                    n.read ? 'bg-transparent' : 'bg-primary/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-foreground">{n.title}</span>
                    <time
                      className="ml-2 shrink-0 text-xs text-muted-foreground"
                      title={new Date(n.createdAt).toLocaleString()}
                    >
                      {formatRelative(new Date(n.createdAt))}
                    </time>
                  </div>
                  <p className="mt-1 line-clamp-3 text-muted-foreground">
                    {n.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

function BellIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5L4 18v2h16v-2l-2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  return `${d}d ago`
}
