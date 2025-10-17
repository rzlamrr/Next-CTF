import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/db'
import { getTeamById } from '@/lib/db/queries'
import { hash } from 'bcryptjs'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/teams/[id] - Get team details
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const team = await getTeamById(id)

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: team,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}

// PATCH /api/teams/[id] - Update team details (captain only)
export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Only captain can edit
    if (team.captain_id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only team captain can edit' },
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, description, password } = body

    const updateData: any = {}

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Team name cannot be empty',
            },
          },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (password !== undefined) {
      updateData.password = password ? await hash(password.trim(), 12) : null
    }

    const { data: updated, error: updateError } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/teams/[id] - Delete team (captain only)
export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        },
        { status: 401 }
      )
    }

    const { id } = await context.params

    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Only captain can delete
    if (team.captain_id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only team captain can delete' },
        },
        { status: 403 }
      )
    }

    // Remove all members from team first
    const { error: updateError } = await supabase
      .from('users')
      .update({ team_id: null })
      .eq('team_id', id)

    if (updateError) throw updateError

    // Delete team
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      data: { message: 'Team deleted' },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
