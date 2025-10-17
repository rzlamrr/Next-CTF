'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Role = 'USER' | 'ADMIN'

interface UserFormData {
  name: string
  email: string
  password?: string
  role: Role
  teamId: string | null
}

interface UserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => Promise<void>
  user?: {
    id: string
    username: string
    email: string | null
    role: Role
  }
  mode: 'create' | 'edit'
}

export function UserDialog({ isOpen, onClose, onSubmit, user, mode }: UserDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'USER',
    teamId: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
        teamId: null,
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        teamId: null,
      })
    }
    setError(null)
  }, [user, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {mode === 'create' ? 'Add New User' : 'Edit User'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading || mode === 'edit'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password {mode === 'edit' && '(leave blank to keep current)'}
            </label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={mode === 'create'}
              minLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              disabled={loading}
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-white"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  username: string
}

export function DeleteUserDialog({ isOpen, onClose, onConfirm, username }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-foreground mb-4">Delete User</h2>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <p className="text-foreground mb-6">
          Are you sure you want to delete user <strong>{username}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </div>
    </div>
  )
}
