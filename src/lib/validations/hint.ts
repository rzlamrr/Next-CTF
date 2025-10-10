import { z } from 'zod'

export const HintCreateSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  title: z.string().min(1, 'Hint title is required'),
  type: z.string().min(1, 'Type must be at least 1 character').optional(),
  content: z.string().min(1, 'Hint content is required'),
  cost: z
    .number()
    .int('Cost must be an integer')
    .min(0, 'Cost must be 0 or greater'),
  requirements: z
    .string()
    .min(1, 'Requirements must be at least 1 character')
    .optional(),
})

export const HintUpdateSchema = z.object({
  title: z.string().min(1, 'Hint title is required').optional(),
  type: z
    .string()
    .min(1, 'Type must be at least 1 character')
    .optional()
    .nullable(),
  content: z.string().min(1, 'Hint content is required').optional(),
  cost: z
    .number()
    .int('Cost must be an integer')
    .min(0, 'Cost must be 0 or greater')
    .optional(),
  requirements: z
    .string()
    .min(1, 'Requirements must be at least 1 character')
    .optional()
    .nullable(),
})

export const HintUnlockSchema = z.object({
  hintId: z.string().min(1, 'Hint ID is required'),
})
