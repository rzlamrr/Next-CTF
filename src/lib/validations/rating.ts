import { z } from 'zod'

export const RatingCreateSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  value: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Minimum rating is 1')
    .max(5, 'Maximum rating is 5'),
  review: z.string().min(1, 'Review must be at least 1 character').optional(),
})
