export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  teamId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Team {
  id: string
  name: string
  captainId: string
  description?: string
  members: User[]
  createdAt: Date
  updatedAt: Date
}

export interface Challenge {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard' | 'insane'
  points: number
  flag: string
  hints?: Hint[]
  maxAttempts?: number
  type: 'standard' | 'dynamic'
  value?: number
  decay?: number
  minimum?: number
  solvedBy: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Hint {
  id: string
  challengeId: string
  content: string
  cost: number
  createdAt: Date
}

export interface Submission {
  id: string
  userId: string
  teamId?: string
  challengeId: string
  flag: string
  status: 'correct' | 'incorrect' | 'pending'
  createdAt: Date
}

export interface Config {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean'
  description?: string
  editable: boolean
}

export interface Page {
  id: string
  title: string
  route: string
  content: string
  draft: boolean
  hidden: boolean
  authRequired: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  content: string
  read: boolean
  createdAt: Date
}

export interface Award {
  id: string
  userId: string
  teamId?: string
  name: string
  description?: string
  category: string
  value: number
  icon?: string
  createdAt: Date
}

export interface ScoreboardEntry {
  position: number
  teamId: string
  teamName: string
  score: number
  solvedChallenges: number
  lastSubmission: Date
}