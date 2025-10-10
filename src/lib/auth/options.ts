import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'
import { type JWT } from 'next-auth/jwt'
import { type Session, type User as NextAuthUser } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier
        const password = credentials?.password

        // Structured diagnostics
        console.info('[NextAuth][authorize] start', {
          identifierPresent: !!identifier,
          passwordPresent: !!password,
        })

        if (!identifier || !password) {
          console.warn('[NextAuth][authorize] missing fields', {
            identifier,
            passwordPresent: !!password,
          })
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { name: identifier }],
          },
        })

        console.info('[NextAuth][authorize] user lookup', {
          found: !!user,
          userId: user?.id,
          email: user?.email,
        })

        if (!user) {
          console.warn('[NextAuth][authorize] no user for identifier', {
            identifier,
          })
          return null
        }

        const valid = await compare(password, user.password)
        console.info('[NextAuth][authorize] password compare', { valid })
        if (!valid) {
          console.warn('[NextAuth][authorize] invalid password', {
            userId: user.id,
          })
          return null
        }

        const safeUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as NextAuthUser & { role?: 'USER' | 'ADMIN' }

        console.info('[NextAuth][authorize] success', {
          userId: safeUser.id,
          role: safeUser.role,
        })
        return safeUser
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT
      user?: NextAuthUser & { role?: 'USER' | 'ADMIN' }
    }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id ?? token.sub ?? '',
          role: token.role as 'USER' | 'ADMIN' | undefined,
        },
      }
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}
