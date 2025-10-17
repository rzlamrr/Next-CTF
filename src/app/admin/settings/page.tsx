import { getConfig, setConfig } from '@/lib/db/queries'
import { requireAdmin } from '@/lib/auth/guards'
import { ConfigUpdateSchema } from '@/lib/validations/config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import AdminNotificationForm from '@/components/admin/AdminNotificationForm'
import SettingsSavedToast from '@/components/admin/SettingsSavedToast'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>
}) {
  // Load current config values (server component)
  const [
    siteNameCfg,
    regCfg,
    teamModeCfg,
    challengesVisCfg,
    accountsVisCfg,
    scoreboardVisCfg,
  ] = await Promise.all([
    getConfig('site_name'),
    getConfig('registration_enabled'),
    getConfig('team_mode'),
    getConfig('challenges_visibility'),
    getConfig('accounts_visibility'),
    getConfig('scoreboard_visibility'),
  ])

  const siteNameDefault = siteNameCfg?.value ?? ''
  const registrationDefault = (regCfg?.value ?? '').toLowerCase() === 'true'
  const teamModeDefault = (teamModeCfg?.value ?? '').toLowerCase() === 'true'
  const challengesVisDefault = challengesVisCfg?.value ?? 'public'
  const accountsVisDefault = accountsVisCfg?.value ?? 'public'
  const scoreboardVisDefault = scoreboardVisCfg?.value ?? 'public'

  async function updateSettings(formData: FormData) {
    'use server'
    await requireAdmin()

    const site_name = (formData.get('site_name') as string | null)?.trim() ?? ''
    // Checkboxes present => "on"; absent => null
    const registration_enabled = formData.get('registration_enabled') != null
    const team_mode = formData.get('team_mode') != null
    const challenges_visibility = (formData.get('challenges_visibility') as string | null) ?? 'public'
    const accounts_visibility = (formData.get('accounts_visibility') as string | null) ?? 'public'
    const scoreboard_visibility = (formData.get('scoreboard_visibility') as string | null) ?? 'public'

    const parsed = ConfigUpdateSchema.safeParse({
      site_name,
      registration_enabled,
      team_mode,
    })
    if (!parsed.success) {
      // Basic server-side validation failure -> keep consistent error
      throw new Error(parsed.error.issues?.[0]?.message ?? 'Invalid settings')
    }

    // Validate visibility modes
    const validModes = ['public', 'private', 'admin']
    if (!validModes.includes(challenges_visibility) ||
        !validModes.includes(accounts_visibility) ||
        !validModes.includes(scoreboard_visibility)) {
      throw new Error('Invalid visibility mode')
    }

    // Persist via DB utils; store booleans as stringified "true"/"false"
    await setConfig('site_name', parsed.data.site_name, 'STRING')
    await setConfig(
      'registration_enabled',
      String(parsed.data.registration_enabled),
      'BOOLEAN'
    )
    await setConfig('team_mode', String(parsed.data.team_mode), 'BOOLEAN')
    await setConfig('challenges_visibility', challenges_visibility, 'STRING')
    await setConfig('accounts_visibility', accounts_visibility, 'STRING')
    await setConfig('scoreboard_visibility', scoreboard_visibility, 'STRING')

    revalidatePath('/admin/settings')
    revalidatePath('/', 'layout') // Revalidate all pages to update navbar
    redirect('/admin/settings?saved=1')
  }

  return (
    <div className="space-y-6">
      <SettingsSavedToast />
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        Settings
      </h1>

      <form action={updateSettings} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              name="site_name"
              defaultValue={siteNameDefault}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="border-t border-border pt-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Visibility Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Control who can view different sections of the platform:
            </p>
            <ul className="text-sm text-muted-foreground mb-6 space-y-1 list-disc list-inside">
              <li><strong>Public:</strong> Anyone can view (no login required)</li>
              <li><strong>Private:</strong> Only logged-in users can view</li>
              <li><strong>Admin:</strong> Only administrators can view</li>
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="challenges_visibility">Challenges Visibility</Label>
                <select
                  id="challenges_visibility"
                  name="challenges_visibility"
                  defaultValue={challengesVisDefault}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="admin">Admin Only</option>
                </select>
              </div>

              <div>
                <Label htmlFor="accounts_visibility">Accounts Visibility</Label>
                <select
                  id="accounts_visibility"
                  name="accounts_visibility"
                  defaultValue={accountsVisDefault}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="admin">Admin Only</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Controls visibility of users and teams pages
                </p>
              </div>

              <div>
                <Label htmlFor="scoreboard_visibility">Scoreboard Visibility</Label>
                <select
                  id="scoreboard_visibility"
                  name="scoreboard_visibility"
                  defaultValue={scoreboardVisDefault}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="admin">Admin Only</option>
                </select>
              </div>
            </div>
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
