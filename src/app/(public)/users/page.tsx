import { redirect } from 'next/navigation'
import { canAccessAccounts } from '@/lib/auth/visibility'
import UsersClient from './users-client'

export default async function UsersPage() {
  // Check if user has access to view accounts/users
  const hasAccess = await canAccessAccounts()

  // If no access, redirect to login with callback URL
  if (!hasAccess) {
    redirect('/auth/login?callbackUrl=/users')
  }

  // If access is granted, render the client component
  return <UsersClient />
}
