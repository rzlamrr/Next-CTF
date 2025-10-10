import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createTeam,
  listTeams,
  attachUserToTeam,
  getConfig,
} from '@/lib/db/queries'
import { hash } from 'bcryptjs'

// GET /api/teams - List all teams
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    console.log('Teams API called with params:', Object.fromEntries(searchParams.entries()))
    
    const q = searchParams.get('q') || undefined
    const take = Number(searchParams.get('take')) || 50
    const skip = Number(searchParams.get('skip')) || 0
    
    console.log('Parsed pagination - q:', q, 'take:', take, 'skip:', skip)

    const teams = await listTeams({ q, take, skip })
    
    console.log('listTeams returned', teams.length, 'teams')

    return NextResponse.json({
      success: true,
      data: teams,
    })
  } catch (error) {
    console.error('Error in teams API:', error)
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

// POST /api/teams - Create a new team
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

    const body = await req.json()
    const { name, description, password } = body

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Team name is required' },
        },
        { status: 400 }
      )
    }

    // Hash password if provided
    const hashedPassword = password
      ? await hash(password.trim(), 12)
      : null

    const team = await createTeam({
      name: name.trim(),
      description: description?.trim() || null,
      captainId: session.user.id,
      password: hashedPassword,
    })

    // Attach the creating user to the team
    await attachUserToTeam(session.user.id, team.id)

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
