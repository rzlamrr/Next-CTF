import { z } from 'zod'

export const CommentCreateSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  content: z.string().min(1, 'Content is required'),
})
