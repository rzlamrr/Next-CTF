'use client'

import React from 'react'
import { AdminNav } from '@/components/layout'

export function AdminNavWrapper() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <AdminNav isOpen={sidebarOpen} onToggle={setSidebarOpen} />
}
