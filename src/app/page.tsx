import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">NextCTF</div>
        <nav className="flex items-center space-x-4">
          <Link href="/challenges" className="hover:text-gray-300 transition">
            Challenges
          </Link>
          <Link href="/scoreboard" className="hover:text-gray-300 transition">
            Scoreboard
          </Link>
          {session ? (
            <>
              <Link href="/profile" className="hover:text-gray-300 transition">
                Profile
              </Link>
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-gray-300 transition">
                  Admin
                </Link>
              )}
              <Link href="/api/auth/signout" className="hover:text-gray-300 transition">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-gray-300 transition">
                Login
              </Link>
              <Link href="/auth/register">
                <Button variant="default">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to NextCTF</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          A modern Capture The Flag platform built with Next.js and Prisma.
          Test your skills, solve challenges, and compete with others!
        </p>
        <div className="flex justify-center space-x-4">
          {session ? (
            <Link href="/challenges">
              <Button variant="default" size="lg">
                View Challenges
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/register">
                <Button variant="default" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Variety of Challenges</h3>
            <p>
              Test your skills with challenges in web exploitation, reverse
              engineering, cryptography, and more.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Real-time Scoreboard</h3>
            <p>
              Track your progress and see how you rank against other
              participants on our live scoreboard.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Team Collaboration</h3>
            <p>
              Form teams with friends to tackle challenges together and share
              knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-700 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} NextCTF. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/about" className="hover:text-gray-300 transition">
              About
            </Link>
            <Link href="/rules" className="hover:text-gray-300 transition">
              Rules
            </Link>
            <Link href="/contact" className="hover:text-gray-300 transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
