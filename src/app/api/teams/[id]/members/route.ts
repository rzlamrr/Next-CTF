import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { removeMemberFromTeam, addMemberToTeam } from '@/lib/db/queries'
import { prisma } from '@/lib/db'

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
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Only captain can kick members
    if (team.captainId !== session.user.id) {
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
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { teamId: true },
    })

    if (member?.teamId !== teamId) {
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
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    })

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Only captain can add members
    if (team.captainId !== session.user.id) {
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
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, teamId: true },
    })

    if (!target) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'User not found' },
        },
        { status: 404 }
      )
    }

    // Already in a different team
    if (target.teamId && target.teamId !== teamId) {
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
    if (target.teamId === teamId) {
      return NextResponse.json({
        success: true,
        data: { member: { id: target.id, name: target.name, email: target.email } },
      })
    }

    // Attach user to this team
    await addMemberToTeam(teamId, userId)

    const added = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })

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
