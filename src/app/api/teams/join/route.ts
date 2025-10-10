import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { attachUserToTeam, getConfig } from '@/lib/db/queries'
import { prisma } from '@/lib/db'
import { compare } from 'bcryptjs'

// POST /api/teams/join - Join a team
export async function POST(req: NextRequest) {
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

    // Diagnostics: session user
    console.info('[Teams][join] session', { userId: session.user.id })

    // Check if team mode is enabled
    const teamModeConfig = await getConfig('team_mode')
    const teamModeEnabled = teamModeConfig?.value?.toLowerCase() === 'true'
    console.info('[Teams][join] teamModeEnabled', { teamModeEnabled })

    if (!teamModeEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Team mode is disabled' },
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { teamId, password } = body
    console.info('[Teams][join] request', {
      teamId,
      passwordProvided: !!password,
    })

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Team ID is required' },
        },
        { status: 400 }
      )
    }

    // Check if user is already in a team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    })
    console.info('[Teams][join] preJoin user', { teamId: user?.teamId })

    if (user?.teamId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'You are already in a team. Leave your current team first.',
          },
        },
        { status: 400 }
      )
    }

    // Get team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })
    console.info('[Teams][join] team lookup', { found: !!team, teamId })

    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Team not found' },
        },
        { status: 404 }
      )
    }

    // Check password if team has one
    if (team.password) {
      console.info('[Teams][join] team requires password', {
        hasPassword: !!team.password,
      })
      if (!password) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Team password is required',
            },
          },
          { status: 400 }
        )
      }

      const passwordMatch = await compare(password, team.password)
      console.info('[Teams][join] password match', { passwordMatch })
      if (!passwordMatch) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Incorrect password' },
          },
          { status: 400 }
        )
      }
    }

    // Join team
    console.info('[Teams][join] attaching user to team', {
      userId: session.user.id,
      teamId,
    })
    await attachUserToTeam(session.user.id, teamId)

    // Diagnostics: confirm user now has teamId
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    })
    console.info('[Teams][join] postJoin user', {
      teamId: updatedUser?.teamId,
    })

    return NextResponse.json({
      success: true,
      data: { message: 'Joined team successfully', teamId },
    })
  } catch (error) {
    console.error('[Teams][join] error', error)
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
