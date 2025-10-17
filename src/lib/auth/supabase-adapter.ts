// Custom NextAuth adapter for Supabase
// Based on the Prisma adapter pattern but using Supabase client

import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters'
import { supabase } from '@/lib/db'

export function SupabaseAdapter(): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, 'id'>) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name ?? '',
          email: user.email,
          password: '', // Password will be set separately for credentials provider
          email_verified: user.emailVerified?.toISOString() ?? null,
          image: user.image ?? null,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified ? new Date(data.email_verified) : null,
        name: data.name,
        image: data.image,
      }
    },

    async getUser(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified ? new Date(data.email_verified) : null,
        name: data.name,
        image: data.image,
      }
    },

    async getUserByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified ? new Date(data.email_verified) : null,
        name: data.name,
        image: data.image,
      }
    },

    async getUserByAccount(
      { providerAccountId, provider }: { providerAccountId: string; provider: string }
    ) {
      const { data, error } = await supabase
        .from('accounts')
        .select('*, user:users(*)')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .single()

      if (error || !data || !data.user) return null

      const user = data.user as any

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified ? new Date(user.email_verified) : null,
        name: user.name,
        image: user.image,
      }
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      const updateData: any = {}
      if (user.name !== undefined) updateData.name = user.name
      if (user.email !== undefined) updateData.email = user.email
      if (user.emailVerified !== undefined) updateData.email_verified = user.emailVerified?.toISOString() ?? null
      if (user.image !== undefined) updateData.image = user.image

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        email: data.email,
        emailVerified: data.email_verified ? new Date(data.email_verified) : null,
        name: data.name,
        image: data.image,
      }
    },

    async deleteUser(userId: string) {
      await supabase.from('users').delete().eq('id', userId)
    },

    async linkAccount(account: AdapterAccount) {
      const { error } = await supabase.from('accounts').insert({
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      })

      if (error) throw error
      return account
    },

    async unlinkAccount(
      { providerAccountId, provider }: { providerAccountId: string; provider: string }
    ) {
      await supabase
        .from('accounts')
        .delete()
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
    },

    async createSession(
      { sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }
    ) {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          session_token: sessionToken,
          user_id: userId,
          expires: expires.toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return {
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires),
      }
    },

    async getSessionAndUser(sessionToken: string) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, user:users(*)')
        .eq('session_token', sessionToken)
        .single()

      if (error || !data || !data.user) return null

      const user = data.user as any

      return {
        session: {
          sessionToken: data.session_token,
          userId: data.user_id,
          expires: new Date(data.expires),
        },
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.email_verified ? new Date(user.email_verified) : null,
          name: user.name,
          image: user.image,
        },
      }
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      const updateData: any = {}
      if (session.expires !== undefined) updateData.expires = session.expires.toISOString()
      if (session.userId !== undefined) updateData.user_id = session.userId

      const { data, error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('session_token', session.sessionToken)
        .select()
        .single()

      if (error) throw error

      return {
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires),
      }
    },

    async deleteSession(sessionToken: string) {
      await supabase.from('sessions').delete().eq('session_token', sessionToken)
    },

    async createVerificationToken(
      { identifier, expires, token }: { identifier: string; expires: Date; token: string }
    ) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .insert({
          identifier,
          token,
          expires: expires.toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      }
    },

    async useVerificationToken(
      { identifier, token }: { identifier: string; token: string }
    ) {
      const { data, error } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('identifier', identifier)
        .eq('token', token)
        .single()

      if (error || !data) return null

      // Delete the token after retrieving it
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('identifier', identifier)
        .eq('token', token)

      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      }
    },
  }
}
