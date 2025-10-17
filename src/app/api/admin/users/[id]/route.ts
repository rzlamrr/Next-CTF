import { ok, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { updateUser, deleteUser } from '@/lib/db/queries'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  teamId: z.string().uuid().nullable().optional(),
  website: z.string().nullable().optional(),
  affiliation: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
})

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const payload = await parseJson(req, UpdateUserSchema)

    // Hash password if provided
    const updateData: any = { ...payload }
    if (payload.password) {
      updateData.password = await hash(payload.password, 12)
    }

    const user = await updateUser(id, updateData)

    return ok({ user })
  } catch (e) {
    return toErrorResponse(e, 'Failed to update user')
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await deleteUser(id)

    return ok({ user })
  } catch (e) {
    return toErrorResponse(e, 'Failed to delete user')
  }
}
