import { ok, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { NotificationCreateSchema } from '@/lib/validations/notification'
import { createNotification } from '@/lib/db/queries'
import { supabase } from '@/lib/db'
import { sendMail } from '@/lib/email/mailer'

// POST /api/admin/notifications
export async function POST(req: Request) {
  try {
    await requireAdmin()
    const payload = await parseJson(req, NotificationCreateSchema)

    // Create in-app notifications
    const result = await createNotification({
      title: payload.title,
      body: payload.body,
      target: payload.target,
      userId: payload.userId,
      teamId: payload.teamId,
    })

    // Optional email broadcast
    if (payload.sendEmail) {
      // Resolve recipients by target
      let recipients: string[] = []
      if (payload.target === 'ALL') {
        const { data: users } = await supabase
          .from('users')
          .select('email')

        recipients = (users || [])
          .map((u: { email: string | null }) => u.email)
          .filter((e: string | null): e is string => Boolean(e))
      } else if (payload.target === 'USER' && payload.userId) {
        const { data: user } = await supabase
          .from('users')
          .select('email')
          .eq('id', payload.userId)
          .single()

        if (user?.email) recipients = [user.email]
      } else if (payload.target === 'TEAM' && payload.teamId) {
        const { data: members } = await supabase
          .from('users')
          .select('email')
          .eq('team_id', payload.teamId)

        recipients = (members || [])
          .map((u: { email: string | null }) => u.email)
          .filter((e: string | null): e is string => Boolean(e))
      }

      if (recipients.length) {
        await sendMail({
          to: recipients,
          subject: payload.title,
          // Prefer HTML with a basic fallback text
          html: `<div><h2>${escapeHtml(payload.title)}</h2><p>${nl2br(escapeHtml(payload.body))}</p></div>`,
          text: payload.body,
        })
      }
    }

    return ok(
      {
        createdCount: (result as { createdCount: number }).createdCount ?? 1,
        target: payload.target,
      },
      201
    )
  } catch (e) {
    return toErrorResponse(e, 'Failed to create notifications')
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;')
}

function nl2br(str: string): string {
  return str.replace(/\n/g, '<br/>')
}
