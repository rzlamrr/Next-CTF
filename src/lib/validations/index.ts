import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const teamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  description: z.string().optional(),
  password: z.string().optional(),
})

export const joinTeamSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  password: z.string().optional(),
})

export const challengeSubmissionSchema = z.object({
  flag: z.string().min(1, 'Flag is required'),
})

export const createChallengeSchema = z.object({
  name: z.string().min(1, 'Challenge name is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'insane']),
  points: z.number().min(1, 'Points must be greater than 0'),
  flag: z.string().min(1, 'Flag is required'),
  maxAttempts: z.number().optional(),
  type: z.enum(['standard', 'dynamic']),
  value: z.number().optional(),
  decay: z.number().optional(),
  minimum: z.number().optional(),
})

export const createHintSchema = z.object({
  content: z.string().min(1, 'Hint content is required'),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  challengeId: z.string().min(1, 'Challenge ID is required'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  route: z.string().min(1, 'Route is required'),
  content: z.string().min(1, 'Content is required'),
  draft: z.boolean().default(false),
  hidden: z.boolean().default(false),
  authRequired: z.boolean().default(false),
})

export const updateConfigSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
  type: z.enum(['string', 'number', 'boolean']),
  description: z.string().optional(),
  editable: z.boolean().default(true),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TeamInput = z.infer<typeof teamSchema>
export type JoinTeamInput = z.infer<typeof joinTeamSchema>
export type ChallengeSubmissionInput = z.infer<typeof challengeSubmissionSchema>
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>
export type CreateHintInput = z.infer<typeof createHintSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>