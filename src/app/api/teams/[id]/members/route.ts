import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { removeMemberFromTeam, addMemberToTeam } from '@/lib/db/queries'
import { supabase } from '@/lib/db'

type RouteContext = {
  params: Promise<{ id: string }>
}

// DELETE /api/teams/[id]/members - Kick a member (captain only)
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

    const { id: teamId } = await context.params
    const { searchParams } = new URL(req.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Member ID is required' },
        },
        { status: 400 }
      )
    }

    // Get team
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
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

    // Only captain can kick members
    if (team.captain_id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only team captain can kick members' },
        },
        { status: 403 }
      )
    }

    // Cannot kick yourself
    if (memberId === session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Cannot kick yourself',
          },
        },
        { status: 400 }
      )
    }

    // Check if member is in this team
    const { data: member, error: memberError } = await supabase
      .from('users')
      .select('team_id')
      .eq('id', memberId)
      .single()

    if (memberError || member?.team_id !== teamId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User is not in this team' },
        },
        { status: 400 }
      )
    }

    // Remove member from team
    await removeMemberFromTeam(memberId)

    return NextResponse.json({
      success: true,
      data: { message: 'Member removed from team' },
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

/**
 * POST /api/teams/[id]/members - Add a member to team (captain only)
 * Body: { "userId": "..." }
 * Response: { success: true, data: { member: { id, name, email } } }
 */
export async function POST(
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

    const { id: teamId } = await context.params

    // Lookup team with members
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:users(*)
      `)
      .eq('id', teamId)
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

    // Only captain can add members
    if (team.captain_id !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only team captain can add members' },
        },
        { status: 403 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const userId = (body?.userId as string | undefined)?.trim()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'User ID is required' },
        },
        { status: 400 }
      )
    }

    // Check target user
    const { data: target, error: targetError } = await supabase
      .from('users')
      .select('id, name, email, team_id')
      .eq('id', userId)
      .single()

    if (targetError || !target) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        },
        { status: 404 }
      )
    }

    // Already in a different team
    if (target.team_id && target.team_id !== teamId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User is already in a different team',
          },
        },
        { status: 400 }
      )
    }

    // Already in this team -> succeed idempotently
    if (target.team_id === teamId) {
      return NextResponse.json({
        success: true,
        data: { member: { id: target.id, name: target.name, email: target.email } },
      })
    }

    // Attach user to this team
    await addMemberToTeam(teamId, userId)

    const { data: added } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      success: true,
      data: { member: added },
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
