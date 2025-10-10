import { ok, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireUser } from '@/lib/auth/guards'
import { NotificationReadSchema } from '@/lib/validations/notification'
import { listUserNotifications, markNotificationsRead } from '@/lib/db/queries'

// GET /api/notifications
export async function GET() {
  try {
    const { user } = await requireUser()
    const items = await listUserNotifications(user.id)
    return ok(items, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to fetch notifications')
  }
}

// PATCH /api/notifications
export async function PATCH(req: Request) {
  try {
    const { user } = await requireUser()
    const { ids } = await parseJson(req, NotificationReadSchema)
    const updated = await markNotificationsRead(user.id, ids)
    return ok({ updatedCount: updated }, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to update notifications')
  }
}
