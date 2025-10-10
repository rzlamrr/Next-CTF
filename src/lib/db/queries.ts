import { PrismaClient, Prisma } from '@prisma/client'
import { prisma } from './index'

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
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role ?? 'USER',
      teamId: data.teamId ?? null,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      team: true,
      submissions: true,
      solves: true,
      awards: true,
      notifications: true,
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      team: true,
    },
  })
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
  return prisma.user.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { website: { contains: q } },
                { affiliation: { contains: q } },
                { country: { contains: q } },
              ],
            }
          : {},
        teamId !== undefined ? { teamId: teamId ?? null } : {},
      ],
    },
    take,
    skip,
    orderBy,
  })
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
  return prisma.user.update({
    where: { id },
    data,
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } })
}

export async function attachUserToTeam(userId: string, teamId: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId },
  })
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
  return prisma.team.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      captainId: data.captainId,
      password: data.password ?? null,
    },
  })
}

export async function addMemberToTeam(teamId: string, userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId },
  })
}

export async function removeMemberFromTeam(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { teamId: null },
  })
}

export async function getTeamById(id: string) {
  return prisma.team.findUnique({
    where: { id },
    include: {
      members: true,
      awards: true,
      submissions: true,
      solves: true,
    },
  })
}

export async function listTeams(params?: {
  q?: string
  take?: number
  skip?: number
}) {
  const { q, take = 50, skip = 0 } = params ?? {}
  return prisma.team.findMany({
    where: q ? { name: { contains: q } } : undefined,
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  })
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
  return prisma.challenge.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [{ name: { contains: q } }, { description: { contains: q } }],
            }
          : {},
        category ? { category } : {},
        difficulty ? { difficulty } : {},
        bracketId !== undefined ? { bracketId: bracketId ?? null } : {},
        type ? { type } : {},
      ],
    },
    include: {
      hints: true,
      files: true,
      tags: true,
      topics: true,
    },
    take,
    skip,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getChallengeById(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      hints: true,
      files: true,
      tags: true,
      topics: true,
    },
  })
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
  tagNames?: string[]
  topicNames?: string[]
}) {
  const { tagNames = [], topicNames = [], ...rest } = data
  return prisma.challenge.create({
    data: {
      ...rest,
      type: rest.type ?? 'STANDARD',
      function: rest.function ?? 'static',
      tags: tagNames.length
        ? {
            connectOrCreate: tagNames.map(name => ({
              where: { name },
              create: { name },
            })),
          }
        : undefined,
      topics: topicNames.length
        ? {
            connectOrCreate: topicNames.map(name => ({
              where: { name },
              create: { name, category: 'General' },
            })),
          }
        : undefined,
    },
  })
}

export async function updateChallenge(
  id: string,
  data: Partial<Record<string, unknown>>
) {
  return prisma.challenge.update({
    where: { id },
    data,
  })
}

export async function deleteChallenge(id: string) {
  return prisma.challenge.delete({ where: { id } })
}

export async function addHintToChallenge(
  challengeId: string,
  title: string,
  content: string,
  cost: number
) {
  return prisma.hint.create({
    data: { challengeId, title, content, cost },
  })
}

export async function addFileToChallenge(
  challengeId: string,
  location: string
) {
  return prisma.file.create({
    data: { challengeId, location },
  })
}

export async function attachTagsToChallenge(
  challengeId: string,
  tagNames: string[]
) {
  if (!tagNames.length) return getChallengeById(challengeId)
  return prisma.challenge.update({
    where: { id: challengeId },
    data: {
      tags: {
        connectOrCreate: tagNames.map(name => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  })
}

export async function attachTopicsToChallenge(
  challengeId: string,
  topicNames: string[],
  defaultCategory = 'General'
) {
  if (!topicNames.length) return getChallengeById(challengeId)
  return prisma.challenge.update({
    where: { id: challengeId },
    data: {
      topics: {
        connectOrCreate: topicNames.map(name => ({
          where: { name },
          create: { name, category: defaultCategory },
        })),
      },
    },
    include: { topics: true },
  })
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
  const challenge = await prisma.challenge.findUnique({
    where: { id: params.challengeId },
  })
  if (!challenge) throw new Error('Challenge not found')
  const correct = challenge.flag === params.flag

  // Check if submission already exists for this user+challenge combination
  const existingSubmission = await prisma.submission.findFirst({
    where: {
      userId: params.userId!,
      challengeId: params.challengeId,
    },
  })

  let submission
  if (existingSubmission) {
    // Return existing submission instead of trying to create a new one
    submission = existingSubmission
  } else {
    // Create new submission
    submission = await prisma.submission.create({
      data: {
        userId: params.userId!,
        teamId: params.teamId ?? null,
        challengeId: params.challengeId,
        flag: params.flag,
        status: correct ? 'CORRECT' : 'INCORRECT',
      },
    })
  }

  // Record solve if correct and not exists
  if (correct) {
    try {
      await prisma.solve.create({
        data: {
          userId: params.userId!,
          teamId: params.teamId ?? null,
          challengeId: params.challengeId,
        },
      })
    } catch (e: any) {
      // Unique constraint on solve; ignore duplicate solves
      if (e?.code !== 'P2002') throw e
    }

    // Dynamic scoring: update persisted challenge value after a correct solve
    if (challenge.type === 'DYNAMIC') {
      try {
        await updateChallengeValue(params.challengeId)
      } catch (e) {
        // Non-fatal: scoring update should not block submission flow
        // Optionally log or surface error in future
      }
    }
  }

  return { submission, correct }
}

export async function getUserSolves(userId: string) {
  return prisma.solve.findMany({
    where: { userId },
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTeamSolves(teamId: string) {
  return prisma.solve.findMany({
    where: { teamId },
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUserSubmissions(userId: string) {
  return prisma.submission.findMany({
    where: { userId },
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getTeamSubmissions(teamId: string) {
  return prisma.submission.findMany({
    where: { teamId },
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Notifications
 */

// List notifications for a user ordered by newest first
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
  return prisma.notification.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      content: true,
      read: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// Overloads: keep legacy single-create and add broadcast payload variant
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
    return prisma.notification.create({
      data: { userId, title, content },
    })
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
      const users = await prisma.user.findMany({ select: { id: true } })
      if (!users.length) return { createdCount: 0 }
      const data = users.map((u: { id: string }) => ({
        userId: u.id,
        title: payload.title,
        content: payload.body,
      }))
      const result = await prisma.notification.createMany({ data })
      return { createdCount: result.count }
    }
    case 'USER': {
      if (!payload.userId) return { createdCount: 0 }
      const res = await prisma.notification.createMany({
        data: [
          {
            userId: payload.userId,
            title: payload.title,
            content: payload.body,
          },
        ],
      })
      return { createdCount: res.count }
    }
    case 'TEAM': {
      if (!payload.teamId) return { createdCount: 0 }
      const members = await prisma.user.findMany({
        where: { teamId: payload.teamId },
        select: { id: true },
      })
      if (!members.length) return { createdCount: 0 }
      const data = members.map((m: { id: string }) => ({
        userId: m.id,
        title: payload.title,
        content: payload.body,
      }))
      const res = await prisma.notification.createMany({ data })
      return { createdCount: res.count }
    }
    default:
      return { createdCount: 0 }
  }
}

// Mark multiple notifications as read for an owner
export async function markNotificationsRead(
  userId: string,
  ids: string[]
): Promise<number> {
  if (!ids.length) return 0
  const res = await prisma.notification.updateMany({
    where: { userId, id: { in: ids } },
    data: { read: true },
  })
  return res.count
}

// Retain existing single-update helper (used elsewhere)
export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  })
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
  return prisma.award.create({
    data: {
      userId: params.userId!,
      teamId: params.teamId ?? null,
      name: params.name,
      description: params.description ?? null,
      category: params.category ?? 'general',
      value: params.value,
      icon: params.icon ?? null,
    },
  })
}

/**
 * Configs
 */

export async function getConfig(key: string) {
  return prisma.config.findUnique({ where: { key } })
}

export async function setConfig(
  key: string,
  value: string,
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' = 'STRING',
  description?: string | null
) {
  return prisma.config.upsert({
    where: { key },
    update: { value, type, description },
    create: { key, value, type, description: description ?? null },
  })
}

/**
 * Pages
 */

export async function getPageByRoute(route: string) {
  return prisma.page.findUnique({ where: { route } })
}

export async function listPages(params?: {
  includeHidden?: boolean
  onlyDrafts?: boolean
}) {
  const { includeHidden = false, onlyDrafts = false } = params ?? {}
  return prisma.page.findMany({
    where: {
      AND: [
        includeHidden ? {} : { hidden: false },
        onlyDrafts ? { draft: true } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createPage(data: {
  title: string
  route: string
  content: string
  draft?: boolean
  hidden?: boolean
  authRequired?: boolean
}) {
  return prisma.page.create({
    data: {
      title: data.title,
      route: data.route,
      content: data.content,
      draft: data.draft ?? false,
      hidden: data.hidden ?? false,
      authRequired: data.authRequired ?? false,
    },
  })
}

/**
 * Fields & FieldEntries
 */

export async function listFields() {
  return prisma.field.findMany({
    include: { fieldEntries: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function setFieldEntry(params: {
  id: string
  fieldId: string
  userId: string
  teamId?: string | null
  value: string
}) {
  return prisma.fieldEntry.upsert({
    where: {
      id_fieldId_userId: {
        id: params.id,
        fieldId: params.fieldId,
        userId: params.userId,
      },
    },
    update: { value: params.value, teamId: params.teamId ?? null },
    create: {
      id: params.id,
      fieldId: params.fieldId,
      userId: params.userId,
      teamId: params.teamId ?? null,
      value: params.value,
    },
  })
}

/**
 * Scoreboard helpers
 */

export async function getUserScore(userId: string) {
  const [solves, awards] = await Promise.all([
    prisma.solve.findMany({ where: { userId }, include: { challenge: true } }),
    prisma.award.findMany({ where: { userId } }),
  ])

  const solveScore = solves.reduce(
    (
      sum: number,
      s: {
        challenge: {
          type: 'STANDARD' | 'DYNAMIC'
          value: number | null
          points: number
        } | null
      }
    ) => {
      const c = s.challenge
      if (!c) return sum
      if (c.type === 'DYNAMIC' && c.value != null) return sum + c.value
      return sum + c.points
    },
    0
  )
  const awardScore = awards.reduce(
    (sum: number, a: { value: number }) => sum + a.value,
    0
  )
  return solveScore + awardScore
}

export async function getTeamScore(teamId: string) {
  const [solves, awards] = await Promise.all([
    prisma.solve.findMany({ where: { teamId }, include: { challenge: true } }),
    prisma.award.findMany({ where: { teamId } }),
  ])
  const solveScore = solves.reduce(
    (
      sum: number,
      s: {
        challenge: {
          type: 'STANDARD' | 'DYNAMIC'
          value: number | null
          points: number
        } | null
      }
    ) => {
      const c = s.challenge
      if (!c) return sum
      if (c.type === 'DYNAMIC' && c.value != null) return sum + c.value
      return sum + c.points
    },
    0
  )
  const awardScore = awards.reduce(
    (sum: number, a: { value: number }) => sum + a.value,
    0
  )
  return solveScore + awardScore
}

/**
 * Safe transaction wrapper
 */

export async function withTransaction<T>(fn: (tx: PrismaClient) => Promise<T>) {
  return prisma.$transaction(async (tx: any) => fn(tx as PrismaClient))
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
  return prisma.hint.findMany({
    where: { challengeId },
    select: {
      id: true,
      title: true,
      cost: true,
      type: true,
      requirements: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createHint(data: {
  challengeId: string
  title: string
  content: string
  cost: number
  type?: string | null
  requirements?: string | null
}) {
  return prisma.hint.create({
    data: {
      challengeId: data.challengeId,
      title: data.title,
      content: data.content,
      cost: data.cost,
      type: data.type ?? null,
      requirements: data.requirements ?? null,
    },
  })
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
  return prisma.hint.update({
    where: { id },
    data,
  })
}

export async function deleteHint(id: string) {
  return prisma.hint.delete({ where: { id } })
}

export async function unlockHint(
  userId: string,
  hintId: string
): Promise<{ unlocked: boolean; already: boolean }> {
  // Ensure hint exists
  const hint = await prisma.hint.findUnique({ where: { id: hintId } })
  if (!hint) throw new Error('Hint not found')

  // Resolve requester team (if any)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const teamId = user?.teamId ?? null

  // Check if already unlocked for this user
  const existing = await prisma.unlock.findFirst({
    where: { userId, targetId: hintId, type: 'HINTS' },
  })

  if (existing) {
    return { unlocked: true, already: true }
  }

  await prisma.unlock.create({
    data: {
      userId,
      teamId,
      targetId: hintId,
      type: 'HINTS',
    },
  })

  return { unlocked: true, already: false }
}

export async function listChallengeFiles(
  challengeId: string
): Promise<Array<{ id: string; location: string; createdAt: Date }>> {
  return prisma.file.findMany({
    where: { challengeId },
    select: { id: true, location: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function listSolvesByChallenge(challengeId: string): Promise<
  Array<{
    id: string
    createdAt: Date
    user?: { id: string; name: string } | null
    team?: { id: string; name: string } | null
  }>
> {
  const solves = await prisma.solve.findMany({
    where: { challengeId },
    include: {
      user: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return solves.map(
    (s: {
      id: string
      createdAt: Date
      user: { id: string; name: string } | null
      team: { id: string; name: string } | null
    }) => ({
      id: s.id,
      createdAt: s.createdAt,
      user: s.user ? { id: s.user.id, name: s.user.name } : null,
      team: s.team ? { id: s.team.id, name: s.team.name } : null,
    })
  )
}

export async function listMySubmissions(userId: string): Promise<
  Array<{
    id: string
    challenge: { id: string; name: string }
    status: 'CORRECT' | 'INCORRECT' | 'PENDING'
    createdAt: Date
  }>
> {
  const subs = await prisma.submission.findMany({
    where: { userId },
    include: { challenge: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return subs.map(
    (s: {
      id: string
      createdAt: Date
      status: 'CORRECT' | 'INCORRECT' | 'PENDING'
      challenge: { id: string; name: string } | null
    }) => ({
      id: s.id,
      challenge: s.challenge!,
      status: s.status as 'CORRECT' | 'INCORRECT' | 'PENDING',
      createdAt: s.createdAt,
    })
  )
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
  const [agg, grouped, items] = await Promise.all([
    prisma.rating.aggregate({
      where: { challengeId },
      _avg: { value: true },
      _count: { value: true },
    }),
    prisma.rating.groupBy({
      where: { challengeId },
      by: ['value'],
      _count: { value: true },
    }),
    prisma.rating.findMany({
      where: { challengeId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const average = Number(agg._avg.value ?? 0)
  const count = Number(agg._count.value ?? 0)
  const breakdown: Record<number, number> = {}
  for (const g of grouped) breakdown[g.value] = g._count.value

  return {
    average,
    count,
    breakdown,
    items: items.map(
      (r: {
        id: string
        value: number
        review: string | null
        createdAt: Date
        user: { id: string; name: string }
      }) => ({
        id: r.id,
        value: r.value,
        review: r.review ?? null,
        user: { id: r.user.id, name: r.user.name },
        createdAt: r.createdAt,
      })
    ),
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
  // Prisma upsert doesn't support composite unique directly; emulate
  const existing = await prisma.rating.findFirst({
    where: { userId, challengeId },
  })
  if (existing) {
    await prisma.rating.update({
      where: { id: existing.id },
      data: { value, review: review ?? null },
    })
  } else {
    await prisma.rating.create({
      data: { userId, challengeId, value, review: review ?? null },
    })
  }
  // Return updated aggregate
  const [agg, grouped] = await Promise.all([
    prisma.rating.aggregate({
      where: { challengeId },
      _avg: { value: true },
      _count: { value: true },
    }),
    prisma.rating.groupBy({
      where: { challengeId },
      by: ['value'],
      _count: { value: true },
    }),
  ])
  const average = Number(agg._avg.value ?? 0)
  const count = Number(agg._count.value ?? 0)
  const breakdown: Record<number, number> = {}
  for (const g of grouped) breakdown[g.value] = g._count.value
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
  const comments = await prisma.comment.findMany({
    where: { challengeId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return comments.map(
    (c: {
      id: string
      content: string
      createdAt: Date
      user: { id: string; name: string }
    }) => ({
      id: c.id,
      content: c.content,
      user: { id: c.user.id, name: c.user.name },
      createdAt: c.createdAt,
    })
  )
}

export async function createChallengeComment(
  authorId: string,
  challengeId: string,
  content: string
) {
  return prisma.comment.create({
    data: { userId: authorId, challengeId, content },
  })
}

export async function deleteComment(
  commentId: string,
  requesterId: string,
  role: 'ADMIN' | 'USER'
): Promise<boolean> {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return false
  if (role !== 'ADMIN' && comment.userId !== requesterId) {
    // Not authorized to delete
    return false
  }
  await prisma.comment.delete({ where: { id: commentId } })
  return true
}

export async function getSolutionByChallenge(challengeId: string) {
  return prisma.solution.findUnique({ where: { challengeId } })
}

export async function createSolution(
  challengeId: string,
  content: string,
  state?: string | null
) {
  // Enforce single solution per challenge
  const existing = await prisma.solution.findUnique({ where: { challengeId } })
  if (existing) {
    return prisma.solution.update({
      where: { id: existing.id },
      data: { content, state: state ?? null },
    })
  }
  return prisma.solution.create({
    data: { challengeId, content, state: state ?? null },
  })
}

export async function updateSolution(
  id: string,
  data: Partial<{ content: string; state: string | null }>
) {
  return prisma.solution.update({ where: { id }, data })
}

export async function deleteSolution(id: string) {
  await prisma.solution.delete({ where: { id } })
}

// -----------------------------
// Files: minimal helpers (Phase 1)
// -----------------------------

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
  // Note: current schema tracks only location + challengeId.
  // sha1sum/contentType/name are ignored for now but accepted for forward-compat.
  return prisma.file.create({
    data: { challengeId, location: info.location },
    select: { id: true, location: true, challengeId: true, createdAt: true },
  })
}

export async function getFileById(
  id: string
): Promise<{
  id: string
  location: string
  challengeId: string
  createdAt: Date
} | null> {
  return prisma.file.findUnique({
    where: { id },
    select: { id: true, location: true, challengeId: true, createdAt: true },
  })
}

export async function deleteFileById(id: string): Promise<boolean> {
  try {
    await prisma.file.delete({ where: { id } })
    return true
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code
    if (code === 'P2025') return false // not found
    throw e
  }
}

// Dynamic Scoring Helpers

export async function computeChallengeValue(
  challengeId: string
): Promise<number> {
  // Fetch challenge scoring params and current persisted value
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      type: true,
      function: true,
      points: true,
      minimum: true,
      decay: true,
      value: true,
    },
  })

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  // If not dynamic or set to static, return current persisted value (fallback to points)
  const current = challenge.value ?? challenge.points
  if (challenge.type !== 'DYNAMIC' || challenge.function === 'static') {
    return current
  }

  const solves = await prisma.solve.count({ where: { challengeId } })

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
      // value = max(minimum, floor(initial - (log2(solves + 1) * decay)))
      const penalty = Math.log2(solves + 1) * decay
      value = Math.max(minimum, Math.floor(initial - penalty))
      break
    }
    case 'exp': {
      // value = max(minimum, floor(initial * Math.pow(decay, solves)))  // decay in (0,1]
      let d = decay
      if (!Number.isFinite(d)) d = 1
      d = Math.min(1, Math.max(0, d))
      value = Math.max(minimum, Math.floor(initial * Math.pow(d, solves)))
      break
    }
    case 'linear': {
      // value = max(minimum, floor(initial - (decay * solves)))
      value = Math.max(minimum, Math.floor(initial - decay * solves))
      break
    }
    default: {
      // Unknown function -> keep current
      value = current
    }
  }

  // Enforce bounds and coerce invalid to current value
  if (!Number.isFinite(value) || Number.isNaN(value)) return current
  if (value > initial) value = initial
  if (value < minimum) value = minimum

  return value
}

export async function updateChallengeValue(
  challengeId: string
): Promise<{ previous: number | null; updated: number | null }> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, type: true, value: true },
  })
  if (!challenge) {
    throw new Error('Challenge not found')
  }

  // Only persist dynamic challenge values
  if (challenge.type !== 'DYNAMIC') {
    const prev = challenge.value ?? null
    return { previous: prev, updated: prev }
  }

  const computed = await computeChallengeValue(challengeId)
  const previous = challenge.value ?? null

  if (previous === computed) {
    return { previous, updated: previous }
  }

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { value: computed },
    select: { value: true },
  })

  return { previous, updated: updated.value ?? null }
}
