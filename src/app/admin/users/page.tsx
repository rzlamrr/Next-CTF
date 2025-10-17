'use client'

import { useState, useEffect } from 'react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { UserDialog, DeleteUserDialog } from '@/components/admin/UserDialogs'

type Role = 'USER' | 'ADMIN'

type UserRow = {
  id: string
  username: string
  email: string | null
  role: Role
  team: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users from the server
      const response = await fetch('/api/admin/users/list')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (formData: any) => {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to create user')
    }

    await fetchUsers()
  }

  const handleEditUser = async (formData: any) => {
    if (!selectedUser) return

    const updateData: any = {
      name: formData.name,
      role: formData.role,
    }

    // Only include password if it's not empty
    if (formData.password && formData.password.trim().length > 0) {
      updateData.password = formData.password
    }

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to update user')
    }

    await fetchUsers()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to delete user')
    }

    await fetchUsers()
  }

  const columns: Column<UserRow>[] = [
    { key: 'username', header: 'Username' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'team', header: 'Team' },
    { key: 'createdAt', header: 'Created' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row)
              setDialogMode('edit')
              setUserDialogOpen(true)
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedUser(row)
              setDeleteDialogOpen(true)
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage registered users
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null)
            setDialogMode('create')
            setUserDialogOpen(true)
          }}
        >
          Add User
        </Button>
      </div>

      <DataTable<UserRow>
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        emptyMessage="No users"
      />

      <UserDialog
        isOpen={userDialogOpen}
        onClose={() => {
          setUserDialogOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={dialogMode === 'create' ? handleCreateUser : handleEditUser}
        user={selectedUser || undefined}
        mode={dialogMode}
      />

      <DeleteUserDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        username={selectedUser?.username || ''}
      />
    </div>
  )
}
