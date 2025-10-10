import { redirect } from 'next/navigation'

export default function LoginAliasPage() {
  // Minimal alias so middleware can redirect to /login while reusing existing UI at /auth/login
  redirect('/auth/login')
}
