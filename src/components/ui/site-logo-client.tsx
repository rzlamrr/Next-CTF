'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function SiteLogoClient() {
  const [siteName, setSiteName] = useState('NextCTF')

  useEffect(() => {
    fetch('/api/config/site-name')
      .then(res => res.json())
      .then(data => setSiteName(data.siteName))
      .catch(() => setSiteName('NextCTF'))
  }, [])

  return (
    <div className="text-xl font-bold text-foreground">
      <Link href="/">{siteName}</Link>
    </div>
  )
}
