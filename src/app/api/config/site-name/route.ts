import { getConfig } from '@/lib/db/queries'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const siteNameConfig = await getConfig('site_name')
    const siteName = siteNameConfig?.value || 'NextCTF'

    return NextResponse.json({ siteName })
  } catch (error) {
    return NextResponse.json({ siteName: 'NextCTF' })
  }
}
