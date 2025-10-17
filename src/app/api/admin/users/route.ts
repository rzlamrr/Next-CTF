import { ok, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import { createUser } from '@/lib/db/queries'
import { hash } from 'bcryptjs'
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ADMIN']).optional(),
  teamId: z.string().uuid().nullable().optional(),
})

// POST /api/admin/users - Create new user
export async function POST(req: Request) {
  try {
    await requireAdmin()
    const payload = await parseJson(req, CreateUserSchema)

    // Hash password before storing
    const hashedPassword = await hash(payload.password, 12)

    const user = await createUser({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role ?? 'USER',
      teamId: payload.teamId ?? null,
    })

    return ok({ user }, 201)
  } catch (e) {
    return toErrorResponse(e, 'Failed to create user')
  }
}
