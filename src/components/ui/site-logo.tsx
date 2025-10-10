import Link from 'next/link'
import { getConfig } from '@/lib/db/queries'

export async function SiteLogo() {
  const siteNameConfig = await getConfig('site_name')
  const siteName = siteNameConfig?.value || 'cyberstorm'

  return (
    <Link
      href="/"
      className="text-xl font-bold text-foreground"
      aria-label={siteName}
    >
      {siteName}
    </Link>
  )
}
