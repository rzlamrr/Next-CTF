import { isRegistrationEnabled } from '@/lib/auth/visibility'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = params?.error

  // Check if registration is enabled
  const registrationEnabled = await isRegistrationEnabled()

  return <LoginForm registrationEnabled={registrationEnabled} error={error as string | undefined} />
}
