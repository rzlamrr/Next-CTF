import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { removeMemberFromTeam, getConfig } from '@/lib/db/queries'
import { supabase } from '@/lib/db'

// POST /api/teams/leave - Leave current team
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

    // Check if team mode is enabled
    const teamModeConfig = await getConfig('team_mode')
    const teamModeEnabled = teamModeConfig?.value?.toLowerCase() === 'true'

    if (!teamModeEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Team mode is disabled' },
        },
        { status: 403 }
      )
    }

    // Check if user is in a team
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        team_id,
        team:teams(captain_id)
      `)
      .eq('id', session.user.id)
      .single()

    if (!user?.team_id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'You are not in a team' },
        },
        { status: 400 }
      )
    }

    // Check if user is captain - need to safely access team
    const team = user.team as any
    if (team?.captain_id === session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'You are the team captain. Transfer captaincy or delete the team first.',
          },
        },
        { status: 400 }
      )
    }

    // Leave team
    await removeMemberFromTeam(session.user.id)

    return NextResponse.json({
      success: true,
      data: { message: 'Left team successfully' },
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
