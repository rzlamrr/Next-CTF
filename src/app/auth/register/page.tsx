import { redirect } from 'next/navigation'
import { isRegistrationEnabled } from '@/lib/auth/visibility'
import RegisterForm from '@/components/auth/RegisterForm'

export default async function RegisterPage() {
  // Check if registration is enabled
  const regEnabled = await isRegistrationEnabled()

  if (!regEnabled) {
    redirect('/auth/login?error=registration_disabled')
  }

  return <RegisterForm />
}
