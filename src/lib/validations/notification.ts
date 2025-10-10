import { z } from 'zod'

export const NotificationCreateSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required'),
    target: z.enum(['ALL', 'USER', 'TEAM']),
    userId: z.string().min(1).optional(),
    teamId: z.string().min(1).optional(),
    sendEmail: z.boolean().default(false).optional(),
  })
  .refine(
    data => {
      if (data.target === 'USER')
        return typeof data.userId === 'string' && data.userId.length > 0
      if (data.target === 'TEAM')
        return typeof data.teamId === 'string' && data.teamId.length > 0
      return true
    },
    {
      message:
        'userId required when target=USER; teamId required when target=TEAM',
    }
  )

export const NotificationReadSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one id is required'),
})

export type NotificationCreateInput = z.infer<typeof NotificationCreateSchema>
export type NotificationReadInput = z.infer<typeof NotificationReadSchema>
