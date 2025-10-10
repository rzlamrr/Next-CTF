import { z } from 'zod'

export const FlagSubmitSchema = z.object({
  challengeId: z.string().min(1, 'challengeId is required'),
  flag: z.string().min(1, 'flag is required'),
})

export type FlagSubmitInput = z.infer<typeof FlagSubmitSchema>
