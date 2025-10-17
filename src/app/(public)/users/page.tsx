'use client'

import React, { useState, useEffect } from 'react'
import GradientBanner from '@/components/ui/gradient-banner'
import { DataTable } from '@/components/admin/DataTable'
import { Pagination } from '@/components/ui/pagination'

type SuccessEnvelope<T> = { success: true; data: T }
type ErrorEnvelope = {
  success: false
  error: { code: string; message: string }
}
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

type UserRow = {
  id: string
  name: string
  website: string | null
  affiliation: string | null
  country: string | null
}

function fetchUsers(
  take: number,
  skip: number,
  q?: string,
  filter?: string
): Promise<{ users: UserRow[]; total: number } | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const params = new URLSearchParams({
    take: String(take),
    skip: String(skip),
  })
  
  if (q) params.append('q', q)
  if (filter) params.append('filter', filter)
  
  const url = `${base}/api/users?${params.toString()}`
  console.log('Fetching users from:', url)

  return fetch(url, { cache: 'no-store' })
    .then(res => {
      console.log('Users API response status:', res.status)
      if (!res.ok) {
        console.error('Users API request failed with status:', res.status)
        return null
      }
      return res.json()
    })
    .then((json: Envelope<UserRow[]>) => {
      console.log('Users API response:', json)
      if (json.success) {
        // Fetch one extra record (take = pageSize + 1) to detect if a next page exists
        const items = json.data as UserRow[]
        const pageSize = Math.max(1, take - 1)
        const visible = items.slice(0, pageSize)
        const hasMore = items.length > pageSize
        return {
          users: visible,
          // Minimal, accurate total to control pagination visibility
          // If we detected more, reflect at least one more item beyond the current page
          total: skip + visible.length + (hasMore ? 1 : 0),
        }
      } else {
        console.error('Users API returned error:', json.error)
      }
      return null
    })
    .catch(error => {
      console.error('Error fetching users:', error)
      return null
    })
}


export default function Page() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ users: UserRow[]; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('username')
  
  const usersPerPage = 20
  const skip = (page - 1) * usersPerPage
  
  useEffect(() => {
    setLoading(true)
    fetchUsers(usersPerPage + 1, skip, searchQuery, filterType)
      .then(result => {
        setData(result)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page, skip, searchQuery, filterType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
  }

  if (loading) {
    return (
      <>
        <GradientBanner
          title="Users"
          subtitle="Browse all registered users on the platform."
        />
        <main className="px-4 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <GradientBanner
        title="Users"
        subtitle="Browse all registered users on the platform."
      />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {!data ? (
          <div className="rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
            Failed to load users. Please try again.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Search
                </button>
              </form>
              
              <select
                className="px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="username">Username</option>
                <option value="country">Country</option>
                <option value="affiliation">Affiliation</option>
              </select>
            </div>
            
            <section aria-labelledby="users-list">
              <h2
                id="users-list"
                className="mb-2 text-sm font-semibold text-gray-900 dark:text-white"
              >
                Registered Users
              </h2>
              <DataTable<UserRow>
                columns={[
                  {
                    key: 'index',
                    header: '#',
                    render: (row) => skip + data.users.indexOf(row) + 1
                  },
                  {
                    key: 'name',
                    header: 'Username',
                    render: (row) => row.name || row.id
                  },
                  {
                    key: 'website',
                    header: 'Website',
                    render: (row) => row.website ? (
                      <a
                        href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {row.website}
                      </a>
                    ) : '-'
                  },
                  {
                    key: 'affiliation',
                    header: 'Affiliation',
                    render: (row) => row.affiliation || '-'
                  },
                  {
                    key: 'country',
                    header: 'Country',
                    render: (row) => row.country || '-'
                  }
                ]}
                data={data.users}
                emptyMessage="No users to display yet."
              />
            </section>
            
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(data.total / usersPerPage)}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>
    </>
  )
}