import { Suspense } from 'react'
import ChallengesClient from './ChallengesClient'

export default function Page() {
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
