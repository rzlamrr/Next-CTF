import { z } from 'zod'

export const SolutionCreateSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  content: z.string().min(1, 'Content is required'),
  state: z.string().min(1, 'State must be at least 1 character').optional(),
})

export const SolutionUpdateSchema = z.object({
  content: z.string().min(1, 'Content is required').optional(),
  state: z
    .string()
    .min(1, 'State must be at least 1 character')
    .optional()
    .nullable(),
})
