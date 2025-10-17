import { z } from 'zod'

export const DifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD', 'INSANE'])
export const ChallengeTypeEnum = z.enum(['STANDARD', 'DYNAMIC'])
export const ScoringFunctionEnum = z.enum(['static', 'log', 'exp', 'linear'])

const NonNegInt = z.coerce.number().int().min(0)
const PosInt = z.coerce.number().int().min(1)

export const ChallengeCreateSchema = z
  .object({
    name: z.string().min(1, 'name is required'),
    description: z.string().min(1, 'description is required'),
    category: z.string().min(1, 'category is required'),
    type: ChallengeTypeEnum.default('STANDARD'),
    // Optional in schema per spec; DB requires it, so handler will default if missing
    difficulty: DifficultyEnum.optional(),
    // Our DB requires points and flag; include them here for correctness with Prisma
    points: PosInt.describe('Base/initial points'),
    flag: z.string().min(1, 'flag is required'),

    // Dynamic scoring related (optional)
    // Note: "initial" is an alias to points for dynamic scoring configuration
    initial: PosInt.optional(),
    function: ScoringFunctionEnum.optional(),
    value: NonNegInt.optional(),
    decay: z.coerce.number().min(0).optional(),
    minimum: NonNegInt.optional(),

    // Associations / Linking
    bracketId: z.string().optional(),
    // nextId is accepted per API spec but is not used by current Prisma schema
    nextId: z.string().optional(),
    maxAttempts: PosInt.optional(),
    connectionInfo: z.string().optional(),
    requirements: z.string().optional(),
  })
  .refine(
    data => {
      const min = data.minimum
      if (min == null) return true
      const base = data.initial ?? data.points
      return min <= base
    },
    {
      path: ['minimum'],
      message: 'minimum must be <= initial (or points if initial omitted)',
    }
  )

export const ChallengeUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    type: ChallengeTypeEnum.optional(),
    difficulty: DifficultyEnum.optional(),
    points: PosInt.optional(),
    flag: z.string().min(1).optional(),
    value: NonNegInt.optional(),
    decay: z.coerce.number().min(0).optional(),
    minimum: NonNegInt.optional(),
    // Dynamic scoring controls (partial)
    initial: PosInt.optional(),
    function: ScoringFunctionEnum.optional(),

    bracketId: z.string().optional(),
    nextId: z.string().optional(),
    maxAttempts: PosInt.optional(),
    connectionInfo: z.string().optional(),
    requirements: z.string().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'No fields provided for update',
  })
  .refine(
    data => {
      if (data.minimum == null) return true
      const base = data.initial ?? data.points
      if (base == null) return true // cannot validate bound without base; backend should map initial->points
      return data.minimum <= base
    },
    {
      path: ['minimum'],
      message: 'minimum must be <= initial (or points if initial provided)',
    }
  )

export type ChallengeCreateInput = z.infer<typeof ChallengeCreateSchema>
export type ChallengeUpdateInput = z.infer<typeof ChallengeUpdateSchema>
