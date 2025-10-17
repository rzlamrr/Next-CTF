import { z } from 'zod'

export const FlagSubmitSchema = z.object({
  // Enforce UUID to prevent Postgres "invalid input syntax for type uuid" errors
  challengeId: z.string().uuid('challengeId must be a valid UUID'),
  flag: z.string().min(1, 'flag is required'),
})

export type FlagSubmitInput = z.infer<typeof FlagSubmitSchema>
