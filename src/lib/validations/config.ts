import { z } from 'zod'

export const ConfigUpdateSchema = z.object({
  site_name: z.string().min(1, 'site_name is required'),
  registration_enabled: z.boolean(),
  team_mode: z.boolean(),
})

export type ConfigUpdateInput = z.infer<typeof ConfigUpdateSchema>
