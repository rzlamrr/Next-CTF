import { supabase } from './index'
import type { Database } from './types'

type Tables = Database['public']['Tables']

/**
 * Users
 */

export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: 'USER' | 'ADMIN'
  teamId?: string | null
}) {
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? 'USER',
      team_id: data.teamId ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return user
}

export async function getUserByEmail(email: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      team:teams(*),
      submissions(*),
      solves(*),
      awards(*),
      notifications(*)
    `)
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return user
}

export async function getUserById(id: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return user
}

export async function listUsers(params?: {
  q?: string
  teamId?: string | null
  take?: number
  skip?: number
  orderBy?: any
}) {
  const {
    q,
    teamId,
    take = 50,
    skip = 0,
    orderBy = { createdAt: 'desc' },
  } = params ?? {}

  let query = supabase.from('users').select('*')

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,website.ilike.%${q}%,affiliation.ilike.%${q}%,country.ilike.%${q}%`)
  }

  if (teamId !== undefined) {
    if (teamId === null) {
      query = query.is('team_id', null)
    } else {
      query = query.eq('team_id', teamId)
    }
  }

  query = query.range(skip, skip + take - 1)

  if (orderBy.createdAt) {
    query = query.order('created_at', { ascending: orderBy.createdAt === 'asc' })
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string
    password: string
    role: 'USER' | 'ADMIN'
    teamId: string | null
    website: string | null
    affiliation: string | null
    country: string | null
  }>
) {
  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.password !== undefined) updateData.password = data.password
  if (data.role !== undefined) updateData.role = data.role
  if (data.teamId !== undefined) updateData.team_id = data.teamId
  if (data.website !== undefined) updateData.website = data.website
  if (data.affiliation !== undefined) updateData.affiliation = data.affiliation
  if (data.country !== undefined) updateData.country = data.country

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return user
}

export async function deleteUser(id: string) {
  const { data, error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function attachUserToTeam(userId: string, teamId: string | null) {
  return updateUser(userId, { teamId })
}

/**
 * Teams
 */

export async function createTeam(data: {
  name: string
  description?: string | null
  captainId: string
  password?: string | null
}) {
  const { data: team, error } = await supabase
    .from('teams')
    .insert({
      name: data.name,
      description: data.description ?? null,
      captain_id: data.captainId,
      password: data.password ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return team
}

export async function addMemberToTeam(teamId: string, userId: string) {
  return updateUser(userId, { teamId })
}

export async function removeMemberFromTeam(userId: string) {
  return updateUser(userId, { teamId: null })
}

export async function getTeamById(id: string) {
  const { data: team, error } = await supabase
    .from('teams')
    .select(`
      *,
      members:users(*),
      awards(*),
      submissions(*),
      solves(*)
    `)
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return team
}

export async function listTeams(params?: {
  q?: string
  take?: number
  skip?: number
}) {
  const { q, take = 50, skip = 0 } = params ?? {}

  let query = supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })
    .range(skip, skip + take - 1)

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

/**
 * Challenges
 */

export async function listChallenges(params?: {
  q?: string
  category?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
  bracketId?: string | null
  type?: 'STANDARD' | 'DYNAMIC'
  take?: number
  skip?: number
}) {
  const {
    q,
    category,
    difficulty,
    bracketId,
    type,
    take = 100,
    skip = 0,
  } = params ?? {}

  let query = supabase.from('challenges').select(`
    *,
    hints(*),
    files(*)
  `)

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`)
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty)
  }

  if (bracketId !== undefined) {
    if (bracketId === null) {
      query = query.is('bracket_id', null)
    } else {
      query = query.eq('bracket_id', bracketId)
    }
  }

  if (type) {
    query = query.eq('type', type)
  }

  query = query.order('created_at', { ascending: false }).range(skip, skip + take - 1)

  const { data, error } = await query

  if (error) throw error

  return data ?? []
}

export async function getChallengeById(id: string) {
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select(`
      *,
      hints(*),
      files(*)
    `)
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (!challenge) return null

  return challenge
}

export async function createChallenge(data: {
  name: string
  description: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE'
  points: number
  flag: string
  maxAttempts?: number | null
  type?: 'STANDARD' | 'DYNAMIC'
  function?: 'static' | 'log' | 'exp' | 'linear'
  value?: number | null
  decay?: number | null
  minimum?: number | null
  bracketId?: string | null
  connectionInfo?: string | null
  requirements?: string | null
}) {
  const rest = data

  const { data: challenge, error } = await supabase
    .from('challenges')
    .insert({
      name: rest.name,
      description: rest.description,
      category: rest.category,
      difficulty: rest.difficulty,
      points: rest.points,
      flag: rest.flag,
      max_attempts: rest.maxAttempts ?? null,
      type: rest.type ?? 'STANDARD',
      function: rest.function ?? 'static',
      value: rest.value ?? null,
      decay: rest.decay ?? null,
      minimum: rest.minimum ?? null,
      bracket_id: rest.bracketId ?? null,
      connection_info: rest.connectionInfo ?? null,
      requirements: rest.requirements ?? null,
    })
    .select()
    .single()

  if (error) throw error



  return challenge
}

export async function updateChallenge(
  id: string,
  data: Partial<Record<string, unknown>>
) {
  const updateData: any = {}

  // Map camelCase to snake_case
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.category !== undefined) updateData.category = data.category
  if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
  if (data.points !== undefined) updateData.points = data.points
  if (data.flag !== undefined) updateData.flag = data.flag
  if (data.maxAttempts !== undefined) updateData.max_attempts = data.maxAttempts
  if (data.type !== undefined) updateData.type = data.type
  if (data.function !== undefined) updateData.function = data.function
  if (data.value !== undefined) updateData.value = data.value
  if (data.decay !== undefined) updateData.decay = data.decay
  if (data.minimum !== undefined) updateData.minimum = data.minimum
  if (data.bracketId !== undefined) updateData.bracket_id = data.bracketId
  if (data.connectionInfo !== undefined) updateData.connection_info = data.connectionInfo
  if (data.requirements !== undefined) updateData.requirements = data.requirements

  const { data: challenge, error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return challenge
}

export async function deleteChallenge(id: string) {
  const { data, error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addHintToChallenge(
  challengeId: string,
  title: string,
  content: string,
  cost: number
) {
  const { data, error } = await supabase
    .from('hints')
    .insert({ challenge_id: challengeId, title, content, cost })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addFileToChallenge(
  challengeId: string,
  location: string
) {
  const { data, error } = await supabase
    .from('files')
    .insert({ challenge_id: challengeId, location })
    .select()
    .single()

  if (error) throw error
  return data
}


/**
 * Submissions & Solves
 */

export async function submitFlag(params: {
  userId?: string
  teamId?: string | null
  challengeId: string
  flag: string
}) {
  // Fetch challenge to check flag
  const { data: challenge, error: challengeError } = await supabase
    .from('challenges')
    .select('id, flag, type')
    .eq('id', params.challengeId)
    .single()

  if (challengeError || !challenge) throw new Error('Challenge not found')

  const correct = challenge.flag === params.flag

  // Check if submission already exists for this user+challenge combination
  const { data: existingSubmission } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', params.userId!)
    .eq('challenge_id', params.challengeId)
    .single()

  let submission
  if (existingSubmission) {
    submission = existingSubmission
  } else {
    // Create new submission
    const { data: newSubmission, error: submissionError } = await supabase
      .from('submissions')
      .insert({
        user_id: params.userId!,
        team_id: params.teamId ?? null,
        challenge_id: params.challengeId,
        flag: params.flag,
        status: correct ? 'CORRECT' : 'INCORRECT',
      })
      .select()
      .single()

    if (submissionError) throw submissionError
    submission = newSubmission
  }

  // Record solve if correct
  if (correct) {
    try {
      await supabase
        .from('solves')
        .insert({
          user_id: params.userId!,
          team_id: params.teamId ?? null,
          challenge_id: params.challengeId,
        })
    } catch (e: any) {
      // Ignore unique constraint violations
    }

    // Dynamic scoring: update persisted challenge value after a correct solve
    if (challenge.type === 'DYNAMIC') {
      try {
        await updateChallengeValue(params.challengeId)
      } catch (e) {
        // Non-fatal
      }
    }
  }

  return { submission, correct }
}

export async function getUserSolves(userId: string) {
  const { data, error } = await supabase
    .from('solves')
    .select('*, challenge:challenges(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getTeamSolves(teamId: string) {
  const { data, error } = await supabase
    .from('solves')
    .select('*, challenge:challenges(*)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getUserSubmissions(userId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, challenge:challenges(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getTeamSubmissions(teamId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*, challenge:challenges(*)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Notifications
 */

export async function listUserNotifications(
  userId: string
): Promise<
  Array<{
    id: string
    title: string
    content: string
    read: boolean
    createdAt: Date
  }>
> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, content, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((n: any) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    read: n.read,
    createdAt: new Date(n.created_at),
  }))
}

export async function createNotification(
  userId: string,
  title: string,
  content: string
): Promise<{
  id: string
  userId: string
  title: string
  content: string
  read: boolean
  createdAt: Date
}>
export async function createNotification(payload: {
  title: string
  body: string
  target: 'ALL' | 'USER' | 'TEAM'
  userId?: string
  teamId?: string
}): Promise<{ createdCount: number }>
export async function createNotification(
  arg1: unknown,
  arg2?: unknown,
  arg3?: unknown
): Promise<
  | {
      id: string
      userId: string
      title: string
      content: string
      read: boolean
      createdAt: Date
    }
  | { createdCount: number }
> {
  // Legacy single notification
  if (
    typeof arg1 === 'string' &&
    typeof arg2 === 'string' &&
    typeof arg3 === 'string'
  ) {
    const userId = arg1 as string
    const title = arg2 as string
    const content = arg3 as string

    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, title, content })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      read: data.read,
      createdAt: new Date(data.created_at),
    }
  }

  // Broadcast/create by payload
  const payload = arg1 as {
    title: string
    body: string
    target: 'ALL' | 'USER' | 'TEAM'
    userId?: string
    teamId?: string
  }

  switch (payload.target) {
    case 'ALL': {
      const { data: users } = await supabase.from('users').select('id')
      if (!users || users.length === 0) return { createdCount: 0 }

      const notifications = users.map((u: any) => ({
        user_id: u.id,
        title: payload.title,
        content: payload.body,
      }))

      const { error } = await supabase.from('notifications').insert(notifications)
      if (error) throw error

      return { createdCount: users.length }
    }
    case 'USER': {
      if (!payload.userId) return { createdCount: 0 }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: payload.userId,
          title: payload.title,
          content: payload.body,
        })

      if (error) throw error
      return { createdCount: 1 }
    }
    case 'TEAM': {
      if (!payload.teamId) return { createdCount: 0 }

      const { data: members } = await supabase
        .from('users')
        .select('id')
        .eq('team_id', payload.teamId)

      if (!members || members.length === 0) return { createdCount: 0 }

      const notifications = members.map((m: any) => ({
        user_id: m.id,
        title: payload.title,
        content: payload.body,
      }))

      const { error } = await supabase.from('notifications').insert(notifications)
      if (error) throw error

      return { createdCount: members.length }
    }
    default:
      return { createdCount: 0 }
  }
}

export async function markNotificationsRead(
  userId: string,
  ids: string[]
): Promise<number> {
  if (!ids.length) return 0

  const { error, count } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .in('id', ids)

  if (error) throw error
  return count ?? 0
}

export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Awards
 */

export async function grantAward(params: {
  userId?: string
  teamId?: string | null
  name: string
  description?: string | null
  category?: string
  value: number
  icon?: string | null
}) {
  const { data, error } = await supabase
    .from('awards')
    .insert({
      user_id: params.userId!,
      team_id: params.teamId ?? null,
      name: params.name,
      description: params.description ?? null,
      category: params.category ?? 'general',
      value: params.value,
      icon: params.icon ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Configs
 */

export async function getConfig(key: string) {
  const { data, error } = await supabase
    .from('configs')
    .select('*')
    .eq('key', key)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function setConfig(
  key: string,
  value: string,
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' = 'STRING',
  description?: string | null
) {
  const { data, error } = await supabase
    .from('configs')
    .upsert(
      {
        key,
        value,
        type,
        description: description ?? null,
      },
      { onConflict: 'key' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Pages
 */

export async function getPageByRoute(route: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('route', route)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function listPages(params?: {
  includeHidden?: boolean
  onlyDrafts?: boolean
}) {
  const { includeHidden = false, onlyDrafts = false } = params ?? {}

  let query = supabase.from('pages').select('*').order('created_at', { ascending: false })

  if (!includeHidden) {
    query = query.eq('hidden', false)
  }

  if (onlyDrafts) {
    query = query.eq('draft', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function createPage(data: {
  title: string
  route: string
  content: string
  draft?: boolean
  hidden?: boolean
  authRequired?: boolean
}) {
  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      title: data.title,
      route: data.route,
      content: data.content,
      draft: data.draft ?? false,
      hidden: data.hidden ?? false,
      auth_required: data.authRequired ?? false,
    })
    .select()
    .single()

  if (error) throw error
  return page
}

/**
 * Fields & FieldEntries
 */

export async function listFields() {
  const { data, error } = await supabase
    .from('fields')
    .select('*, fieldEntries:field_entries(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function setFieldEntry(params: {
  id: string
  fieldId: string
  userId: string
  teamId?: string | null
  value: string
}) {
  const { data, error } = await supabase
    .from('field_entries')
    .upsert({
      id: params.id,
      field_id: params.fieldId,
      user_id: params.userId,
      team_id: params.teamId ?? null,
      value: params.value,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Scoreboard helpers
 */

export async function getUserScore(userId: string) {
  const { data: solves } = await supabase
    .from('solves')
    .select('*, challenge:challenges(type, value, points)')
    .eq('user_id', userId)

  const { data: awards } = await supabase
    .from('awards')
    .select('value')
    .eq('user_id', userId)

  const solveScore = (solves ?? []).reduce((sum: number, s: any) => {
    const c = s.challenge as any
    if (!c) return sum
    if (c.type === 'DYNAMIC' && c.value != null) return sum + c.value
    return sum + c.points
  }, 0)

  const awardScore = (awards ?? []).reduce((sum: number, a: any) => sum + a.value, 0)
  return solveScore + awardScore
}

export async function getTeamScore(teamId: string) {
  const { data: solves } = await supabase
    .from('solves')
    .select('*, challenge:challenges(type, value, points)')
    .eq('team_id', teamId)

  const { data: awards } = await supabase
    .from('awards')
    .select('value')
    .eq('team_id', teamId)

  const solveScore = (solves ?? []).reduce((sum: number, s: any) => {
    const c = s.challenge as any
    if (!c) return sum
    if (c.type === 'DYNAMIC' && c.value != null) return sum + c.value
    return sum + c.points
  }, 0)

  const awardScore = (awards ?? []).reduce((sum: number, a: any) => sum + a.value, 0)
  return solveScore + awardScore
}

/**
 * Safe transaction wrapper
 */

export async function withTransaction<T>(fn: (tx: any) => Promise<T>) {
  // Supabase doesn't have built-in transactions like Prisma
  // For now, just execute the function
  return fn(supabase)
}

/**
 * Phase 2 helpers: Hints, Files, Ratings, Comments, Solutions, Listings
 */

export async function listHintsByChallenge(
  challengeId: string
): Promise<
  Array<{
    id: string
    title: string
    cost: number
    type?: string | null
    requirements?: string | null
  }>
> {
  const { data, error } = await supabase
    .from('hints')
    .select('id, title, cost, type, requirements')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createHint(data: {
  challengeId: string
  title: string
  content: string
  cost: number
  type?: string | null
  requirements?: string | null
}) {
  const { data: hint, error } = await supabase
    .from('hints')
    .insert({
      challenge_id: data.challengeId,
      title: data.title,
      content: data.content,
      cost: data.cost,
      type: data.type ?? null,
      requirements: data.requirements ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return hint
}

export async function updateHint(
  id: string,
  data: Partial<{
    title: string
    content: string
    cost: number
    type: string | null
    requirements: string | null
  }>
) {
  const { data: hint, error } = await supabase
    .from('hints')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return hint
}

export async function deleteHint(id: string) {
  const { data, error } = await supabase
    .from('hints')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unlockHint(
  userId: string,
  hintId: string
): Promise<{ unlocked: boolean; already: boolean }> {
  // Ensure hint exists
  const { data: hint } = await supabase
    .from('hints')
    .select('id')
    .eq('id', hintId)
    .single()

  if (!hint) throw new Error('Hint not found')

  // Resolve requester team (if any)
  const { data: user } = await supabase
    .from('users')
    .select('id, team_id')
    .eq('id', userId)
    .single()

  const teamId = user?.team_id ?? null

  // Check if already unlocked for this user
  const { data: existing } = await supabase
    .from('unlocks')
    .select('*')
    .eq('user_id', userId)
    .eq('target_id', hintId)
    .eq('type', 'HINTS')
    .single()

  if (existing) {
    return { unlocked: true, already: true }
  }

  await supabase.from('unlocks').insert({
    user_id: userId,
    team_id: teamId,
    target_id: hintId,
    type: 'HINTS',
  })

  return { unlocked: true, already: false }
}

export async function listChallengeFiles(
  challengeId: string
): Promise<Array<{ id: string; location: string; createdAt: Date }>> {
  const { data, error } = await supabase
    .from('files')
    .select('id, location, created_at')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((f: any) => ({
    id: f.id,
    location: f.location,
    createdAt: new Date(f.created_at),
  }))
}

export async function listSolvesByChallenge(challengeId: string): Promise<
  Array<{
    id: string
    createdAt: Date
    user?: { id: string; name: string } | null
    team?: { id: string; name: string } | null
  }>
> {
  const { data, error } = await supabase
    .from('solves')
    .select(`
      id,
      created_at,
      user:users(id, name),
      team:teams(id, name)
    `)
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw error

  return (data ?? []).map((s: any) => ({
    id: s.id,
    createdAt: new Date(s.created_at),
    user: s.user ? { id: s.user.id, name: s.user.name } : null,
    team: s.team ? { id: s.team.id, name: s.team.name } : null,
  }))
}

export async function listMySubmissions(userId: string): Promise<
  Array<{
    id: string
    challenge: { id: string; name: string }
    status: 'CORRECT' | 'INCORRECT' | 'PENDING'
    createdAt: Date
  }>
> {
  const { data, error } = await supabase
    .from('submissions')
    .select('id, status, created_at, challenge:challenges(id, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error

  return (data ?? []).map((s: any) => ({
    id: s.id,
    challenge: s.challenge,
    status: s.status as 'CORRECT' | 'INCORRECT' | 'PENDING',
    createdAt: new Date(s.created_at),
  }))
}

export async function listRatingsByChallenge(challengeId: string): Promise<{
  average: number
  count: number
  breakdown: Record<number, number>
  items: Array<{
    id: string
    value: number
    review?: string | null
    user: { id: string; name: string }
    createdAt: Date
  }>
}> {
  const { data: ratings, error } = await supabase
    .from('ratings')
    .select('*, user:users(id, name)')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error

  const values = (ratings ?? []).map((r: any) => r.value)
  const average = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0
  const count = values.length

  const breakdown: Record<number, number> = {}
  values.forEach((v: number) => {
    breakdown[v] = (breakdown[v] || 0) + 1
  })

  return {
    average,
    count,
    breakdown,
    items: (ratings ?? []).map((r: any) => ({
      id: r.id,
      value: r.value,
      review: r.review ?? null,
      user: { id: r.user.id, name: r.user.name },
      createdAt: new Date(r.created_at),
    })),
  }
}

export async function upsertRating(
  userId: string,
  challengeId: string,
  value: number,
  review?: string
): Promise<{
  average: number
  count: number
  breakdown: Record<number, number>
}> {
  // Check if rating exists
  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .single()

  if (existing) {
    await supabase
      .from('ratings')
      .update({ value, review: review ?? null })
      .eq('id', existing.id)
  } else {
    await supabase.from('ratings').insert({
      user_id: userId,
      challenge_id: challengeId,
      value,
      review: review ?? null,
    })
  }

  // Return updated aggregate
  const { data: ratings } = await supabase
    .from('ratings')
    .select('value')
    .eq('challenge_id', challengeId)

  const values = (ratings ?? []).map((r: any) => r.value)
  const average = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0
  const count = values.length

  const breakdown: Record<number, number> = {}
  values.forEach((v: number) => {
    breakdown[v] = (breakdown[v] || 0) + 1
  })

  return { average, count, breakdown }
}

export async function listCommentsByChallenge(
  challengeId: string
): Promise<
  Array<{
    id: string
    content: string
    user: { id: string; name: string }
    createdAt: Date
  }>
> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user:users(id, name)')
    .eq('challenge_id', challengeId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []).map((c: any) => ({
    id: c.id,
    content: c.content,
    user: { id: c.user.id, name: c.user.name },
    createdAt: new Date(c.created_at),
  }))
}

export async function createChallengeComment(
  authorId: string,
  challengeId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: authorId, challenge_id: challengeId, content })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteComment(
  commentId: string,
  requesterId: string,
  role: 'ADMIN' | 'USER'
): Promise<boolean> {
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment) return false

  if (role !== 'ADMIN' && comment.user_id !== requesterId) {
    return false
  }

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return false

  return true
}

export async function getSolutionByChallenge(challengeId: string) {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .eq('challenge_id', challengeId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createSolution(
  challengeId: string,
  content: string,
  state?: string | null
) {
  // Check if solution exists
  const { data: existing } = await supabase
    .from('solutions')
    .select('id')
    .eq('challenge_id', challengeId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('solutions')
      .update({ content, state: state ?? null })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('solutions')
    .insert({ challenge_id: challengeId, content, state: state ?? null })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSolution(
  id: string,
  data: Partial<{ content: string; state: string | null }>
) {
  const { data: solution, error } = await supabase
    .from('solutions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return solution
}

export async function deleteSolution(id: string) {
  await supabase.from('solutions').delete().eq('id', id)
}

// Files: minimal helpers

export async function createFileAndAttachToChallenge(
  challengeId: string,
  info: {
    location: string
    sha1sum?: string
    contentType?: string
    name?: string
  }
): Promise<{
  id: string
  location: string
  challengeId: string
  createdAt: Date
}> {
  const { data, error } = await supabase
    .from('files')
    .insert({ challenge_id: challengeId, location: info.location })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    location: data.location,
    challengeId: data.challenge_id,
    createdAt: new Date(data.created_at),
  }
}

export async function getFileById(
  id: string
): Promise<{
  id: string
  location: string
  challengeId: string
  createdAt: Date
} | null> {
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  if (!data) return null

  return {
    id: data.id,
    location: data.location,
    challengeId: data.challenge_id,
    createdAt: new Date(data.created_at),
  }
}

export async function deleteFileById(id: string): Promise<boolean> {
  const { error } = await supabase.from('files').delete().eq('id', id)
  if (error) return false
  return true
}

// Dynamic Scoring Helpers

export async function computeChallengeValue(
  challengeId: string
): Promise<number> {
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, type, function, points, minimum, decay, value')
    .eq('id', challengeId)
    .single()

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  const current = challenge.value ?? challenge.points
  if (challenge.type !== 'DYNAMIC' || challenge.function === 'static') {
    return current
  }

  const { count } = await supabase
    .from('solves')
    .select('*', { count: 'exact', head: true })
    .eq('challenge_id', challengeId)

  const solves = count ?? 0
  const initial = Number(challenge.points ?? 0)
  let minimum = Number(challenge.minimum ?? 0)
  let decay = Number(challenge.decay ?? 0)

  if (!Number.isFinite(minimum) || Number.isNaN(minimum) || minimum < 0)
    minimum = 0
  if (!Number.isFinite(decay) || Number.isNaN(decay) || decay < 0) decay = 0
  if (minimum > initial) minimum = initial

  let value = current

  switch (challenge.function) {
    case 'log': {
      const penalty = Math.log2(solves + 1) * decay
      value = Math.max(minimum, Math.floor(initial - penalty))
      break
    }
    case 'exp': {
      let d = decay
      if (!Number.isFinite(d)) d = 1
      d = Math.min(1, Math.max(0, d))
      value = Math.max(minimum, Math.floor(initial * Math.pow(d, solves)))
      break
    }
    case 'linear': {
      value = Math.max(minimum, Math.floor(initial - decay * solves))
      break
    }
    default: {
      value = current
    }
  }

  if (!Number.isFinite(value) || Number.isNaN(value)) return current
  if (value > initial) value = initial
  if (value < minimum) value = minimum

  return value
}

export async function updateChallengeValue(
  challengeId: string
): Promise<{ previous: number | null; updated: number | null }> {
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, type, value')
    .eq('id', challengeId)
    .single()

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  if (challenge.type !== 'DYNAMIC') {
    const prev = challenge.value ?? null
    return { previous: prev, updated: prev }
  }

  const computed = await computeChallengeValue(challengeId)
  const previous = challenge.value ?? null

  if (previous === computed) {
    return { previous, updated: previous }
  }

  const { data: updated } = await supabase
    .from('challenges')
    .update({ value: computed })
    .eq('id', challengeId)
    .select('value')
    .single()

  return { previous, updated: updated?.value ?? null }
}
