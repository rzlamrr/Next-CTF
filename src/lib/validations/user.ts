import { z } from 'zod'

export const UserUpdateSchema = z
  .object({
    name: z.string().min(1, 'name cannot be empty').optional(),
    website: z.string().min(1, 'website cannot be empty').optional(),
    language: z.string().min(1, 'language cannot be empty').optional(),
    affiliation: z.string().min(1, 'affiliation cannot be empty').optional(),
    country: z.string().min(1, 'country cannot be empty').optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'No fields provided for update',
  })

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
