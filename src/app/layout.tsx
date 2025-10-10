import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProviderWrapper } from '@/components/providers/session-provider'
import { ToasterProvider } from '@/components/providers/toaster-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { getConfig } from '@/lib/db/queries'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const siteNameConfig = await getConfig('site_name')
  const siteName = siteNameConfig?.value || 'NextCTF'

  return {
    title: `${siteName} - Capture The Flag Platform`,
    description: 'A modern CTF platform built with Next.js and Prisma',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <SessionProviderWrapper>
            {children}
            <ToasterProvider />
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
