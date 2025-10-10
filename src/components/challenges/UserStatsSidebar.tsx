'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type UserStats = {
  points: number
  solved: number
  rank: number | string
  totalChallenges: number
}

type Notification = {
  id: string
  title: string
  message: string
  createdAt: string
}

export default function UserStatsSidebar({ totalChallenges }: { totalChallenges: number }) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<UserStats>({
    points: 0,
    solved: 0,
    rank: '-',
    totalChallenges: totalChallenges,
  })
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState<'notifications' | 'activity'>('notifications')

  useEffect(() => {
    if (session?.user) {
      // Fetch user stats
      fetch('/api/users/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats({
              points: data.data.score || 0,
              solved: data.data.solveCount || 0,
              rank: data.data.rank || '-',
              totalChallenges: totalChallenges,
            })
          }
        })
        .catch(() => {})

      // Fetch notifications
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.data.slice(0, 5))
          }
        })
        .catch(() => {})
    }
  }, [session, totalChallenges])

  if (!session?.user) {
    return null
  }

  const userName = session.user.name || 'User'
  const progress = stats.totalChallenges > 0 ? (stats.solved / stats.totalChallenges) * 100 : 0

  return (
    <div className="sticky top-4 space-y-4">
      {/* User Stats Card */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-destructive to-primary p-3 text-white text-center">
          <h6 className="mb-1 font-bold">{userName}</h6>
          <small className="opacity-75">Aegis Cadet</small>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-3 gap-3 mb-3 text-center">
            <div>
              <div className="text-xl font-bold text-success">{stats.points}</div>
              <div className="text-xs text-muted-foreground">Points</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{stats.solved}</div>
              <div className="text-xs text-muted-foreground">Solved</div>
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">#{stats.rank}</div>
              <div className="text-xs text-muted-foreground">Rank</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <small className="text-xs text-muted-foreground">Progress</small>
              <small className="text-xs text-muted-foreground">
                {stats.solved} / {stats.totalChallenges}
              </small>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-destructive to-primary h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications/Activity Card */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'notifications'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <i className="fas fa-bell mr-1"></i>
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 px-3 py-3 text-sm font-medium transition-colors rounded-t-lg ${
                activeTab === 'activity'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <i className="fas fa-chart-line mr-1"></i>
              Activity
            </button>
          </nav>
        </div>

        <div className="p-3" style={{ minHeight: '200px', maxHeight: '320px', overflowY: 'auto' }}>
          {activeTab === 'notifications' ? (
            notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="pb-2 border-b border-border last:border-0">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{notif.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{notif.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-3">
                  <button className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium border border-primary rounded-full hover:bg-primary/10 transition-colors">
                    <i className="fas fa-bell mr-1"></i>
                    View All
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                <i className="fas fa-bell-slash mb-2 opacity-30" style={{ fontSize: '2rem' }}></i>
                <p className="mb-0 text-xs">No notifications yet</p>
              </div>
            )
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              <i className="fas fa-chart-line mb-2 opacity-30" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 text-xs">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
