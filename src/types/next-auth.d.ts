import 'next-auth'
import 'next-auth/jwt'

type Role = 'USER' | 'ADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: Role
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    role?: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: Role
  }
}
