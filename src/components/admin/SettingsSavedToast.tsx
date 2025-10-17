'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function SettingsSavedToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const saved = searchParams.get('saved')
  const hasShownToast = useRef(false)

  useEffect(() => {
    if (saved === '1' && !hasShownToast.current) {
      hasShownToast.current = true
      toast.success('Settings saved successfully')

      // Remove the saved parameter from URL without page reload
      const newUrl = window.location.pathname
      router.replace(newUrl)
    }
  }, [saved, router])

  return null
}
