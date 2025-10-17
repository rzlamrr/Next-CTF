import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import ChallengesClient from './ChallengesClient'
import { canAccessChallenges } from '@/lib/auth/visibility'

export default async function Page() {
  // Check if user has access to challenges
  const hasAccess = await canAccessChallenges()

  if (!hasAccess) {
    redirect('/auth/login?callbackUrl=/challenges')
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ChallengesClient />
    </Suspense>
  )
}
