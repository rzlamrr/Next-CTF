import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import GeometricBackground from '@/components/ui/geometric-background'
import Image from 'next/image'
import { Navbar, Footer } from '@/components/layout'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen flex flex-col">
      <GeometricBackground />
      <Navbar />
      <main className="flex-1">

      {/* Hero Section */}
      <div className="relative flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          {/* Logo and Brand */}
          <div className="mb-8 flex flex-col items-center space-y-4">
            <div className="relative">
              <Image
                src="/bw_cyberstorm.png"
                alt="Cyberstorm logo"
                width={600}
                height={200}
                className="drop-shadow-2xl"
                sizes="(max-width: 640px) 80vw, 600px"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
          </div>

          {/* Tagline */}
          <p className="mb-12 max-w-2xl text-base text-gray-300 sm:text-lg">
            The crucible where elite cyber cadets are forged. Analyze, exploit,
            and conquer. Your trial begins now.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {session ? (
              <Link href="/challenges">
                <Button
                  size="lg"
                  className="bg-red-600 px-8 py-6 text-base font-semibold uppercase tracking-wide text-white hover:bg-red-700"
                >
                  → Enter Hub
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/challenges">
                  <Button
                    size="lg"
                    className="bg-red-600 px-8 py-6 text-base font-semibold uppercase tracking-wide text-white hover:bg-red-700"
                  >
                    → Enter Hub
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-600 bg-transparent px-8 py-6 text-base font-semibold uppercase tracking-wide text-white hover:border-gray-400 hover:bg-gray-800/50"
                  >
                    ⚡ Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  )
}
