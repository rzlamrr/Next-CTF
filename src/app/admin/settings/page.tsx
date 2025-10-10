import { getConfig, setConfig } from '@/lib/db/queries'
import { requireAdmin } from '@/lib/auth/guards'
import { ConfigUpdateSchema } from '@/lib/validations/config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import AdminNotificationForm from '@/components/admin/AdminNotificationForm'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  // Load current config values (server component)
  const [siteNameCfg, regCfg, teamModeCfg] = await Promise.all([
    getConfig('site_name'),
    getConfig('registration_enabled'),
    getConfig('team_mode'),
  ])

  const siteNameDefault = siteNameCfg?.value ?? ''
  const registrationDefault = (regCfg?.value ?? '').toLowerCase() === 'true'
  const teamModeDefault = (teamModeCfg?.value ?? '').toLowerCase() === 'true'

  async function updateSettings(formData: FormData) {
    'use server'
    await requireAdmin()

    const site_name = (formData.get('site_name') as string | null)?.trim() ?? ''
    // Checkboxes present => "on"; absent => null
    const registration_enabled = formData.get('registration_enabled') != null
    const team_mode = formData.get('team_mode') != null

    const parsed = ConfigUpdateSchema.safeParse({
      site_name,
      registration_enabled,
      team_mode,
    })
    if (!parsed.success) {
      // Basic server-side validation failure -> keep consistent error
      throw new Error(parsed.error.issues?.[0]?.message ?? 'Invalid settings')
    }

    // Persist via DB utils; store booleans as stringified "true"/"false"
    await setConfig('site_name', parsed.data.site_name, 'STRING')
    await setConfig(
      'registration_enabled',
      String(parsed.data.registration_enabled),
      'BOOLEAN'
    )
    await setConfig('team_mode', String(parsed.data.team_mode), 'BOOLEAN')

    revalidatePath('/admin/settings')
    revalidatePath('/', 'layout') // Revalidate all pages to update navbar
    redirect('/admin/settings?saved=1')
  }

  const params = await searchParams
  const saved =
    (Array.isArray(params?.saved) ? params?.saved[0] : params?.saved) === '1'

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        Settings
      </h1>

      {saved ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
          Settings saved
        </div>
      ) : null}

      <form action={updateSettings} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              name="site_name"
              defaultValue={siteNameDefault}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="registration_enabled"
              name="registration_enabled"
              type="checkbox"
              defaultChecked={registrationDefault}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-ring dark:border-neutral-700"
            />
            <Label htmlFor="registration_enabled">Registration Enabled</Label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="team_mode"
              name="team_mode"
              type="checkbox"
              defaultChecked={teamModeDefault}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-ring dark:border-neutral-700"
            />
            <Label htmlFor="team_mode">Team Mode</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit">Save</Button>
        </div>
      </form>

      <div className="space-y-6 mt-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Notifications
        </h2>
        <AdminNotificationForm />
      </div>
    </div>
  )
}
