/**
 * Challenge - Item API
 *
 * GET /api/challenges/:id
 * - Public
 * - Returns details: { id, name, description, value, category, difficulty, type, hints }
 * - Example:
 *   Request: GET /api/challenges/abc123
 *   Response: { "success": true, "data": { "id":"abc123","name":"...","value":100,"category":"web","hints":[{"id":"...","cost":10}] } }
 *
 * PATCH /api/challenges/:id
 * - Admin only
 * - Body: ChallengeUpdateSchema (partial fields)
 * - Updates base fields
 *
 * DELETE /api/challenges/:id
 * - Admin only
 * - Deletes challenge; 204 on success
 */

import { ok, err, toErrorResponse, parseJson } from '@/lib/utils/http'
import { requireAdmin } from '@/lib/auth/guards'
import {
  getChallengeById,
  updateChallenge,
  deleteChallenge,
} from '@/lib/db/queries'
import { ChallengeUpdateSchema } from '@/lib/validations/challenge'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
type CType = 'STANDARD' | 'DYNAMIC'

// GET /api/challenges/:id
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await ctx.params
    const c = await getChallengeById(id)
    if (!c) {
      return err('NOT_FOUND', 'Challenge not found', 404)
    }

    const displayValue =
      c.type === 'DYNAMIC' && c.value != null ? c.value : c.points

    const data = {
      id: c.id,
      name: c.name,
      description: c.description,
      value: displayValue,
      points: c.points,
      flag: c.flag,
      category: c.category,
      difficulty: c.difficulty as Difficulty,
      type: c.type as CType,
      function: c.function,
      minimum: c.minimum,
      decay: c.decay,
      hints: (c.hints ?? []).map((h: { id: string; cost: number }) => ({
        id: h.id,
        cost: h.cost,
      })), // summary only
    }

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to fetch challenge')
  }
}

// PATCH /api/challenges/:id
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const body = await parseJson(req, ChallengeUpdateSchema)

    const base = body as {
      [k: string]: unknown
    }

    // Normalize enums casing if present
    if (typeof base.type === 'string') {
      base.type = (base.type as string).toUpperCase() as CType
    }
    if (typeof base.difficulty === 'string') {
      base.difficulty = (base.difficulty as string).toUpperCase() as Difficulty
    }

    // Apply base update
    const updated = await updateChallenge(id, base)


    // Refetch for response
    const c = await getChallengeById(id)
    if (!c) {
      return err('NOT_FOUND', 'Challenge not found', 404)
    }

    const displayValue =
      c.type === 'DYNAMIC' && c.value != null ? c.value : c.points

    const data = {
      id: c.id,
      name: c.name,
      description: c.description,
      value: displayValue,
      points: c.points,
      flag: c.flag,
      category: c.category,
      difficulty: c.difficulty as Difficulty,
      type: c.type as CType,
      function: c.function,
      minimum: c.minimum,
      decay: c.decay,
      hints: (c.hints ?? []).map((h: { id: string; cost: number }) => ({
        id: h.id,
        cost: h.cost,
      })),
      updatedAt: c.updatedAt,
    }

    return ok(data, 200)
  } catch (e) {
    return toErrorResponse(e, 'Failed to update challenge')
  }
}

// DELETE /api/challenges/:id
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    await deleteChallenge(id)
    return new Response(null, { status: 204 })
  } catch (e) {
    return toErrorResponse(e, 'Failed to delete challenge')
  }
}
