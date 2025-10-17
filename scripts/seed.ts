#!/usr/bin/env tsx

/**
 * Enhanced Database Seed Script for Next-CTFd
 *
 * This script seeds the database with sample data for development and testing.
 * It includes various options for customizing the seeding process.
 *
 * Usage:
 *   tsx scripts/seed.ts [options]
 *
 * Options:
 *   --help, -h         Show this help message
 *   --dry-run          Preview what will be created without making changes
 *   --skip-existing    Skip items that already exist in the database
 *   --reset            Clean existing data before seeding
 *   --users-only       Seed only users
 *   --challenges-only  Seed only challenges
 *   --config-only      Seed only configuration
 *   --pages-only       Seed only pages
 *   --no-prompt        Skip all confirmation prompts
 *   --verbose          Show detailed output
 *
 * Examples:
 *   tsx scripts/seed.ts                 # Full seeding with prompts
 *   tsx scripts/seed.ts --dry-run       # Preview what will be created
 *   tsx scripts/seed.ts --skip-existing # Skip items that already exist
 *   tsx scripts/seed.ts --users-only    # Seed only users
 *   yarn db:seed                        # Via npm script
 */

// Parse command line arguments
const args = process.argv.slice(2)
const showHelp = args.includes('--help') || args.includes('-h')

import { hash } from 'bcryptjs'
import { createInterface } from 'readline'

// Show help and exit before requiring database connection
if (showHelp) {
  console.log(`
Enhanced Database Seed Script for Next-CTFd

This script seeds the database with sample data for development and testing.

Usage:
  tsx scripts/seed.ts [options]

Options:
  --help, -h         Show this help message
  --dry-run          Preview what will be created without making changes
  --skip-existing    Skip items that already exist in the database
  --reset            Clean existing data before seeding
  --users-only       Seed only users
  --challenges-only  Seed only challenges
  --config-only      Seed only configuration
  --pages-only       Seed only pages
  --no-prompt        Skip all confirmation prompts
  --verbose          Show detailed output

Examples:
  tsx scripts/seed.ts                 # Full seeding with prompts
  tsx scripts/seed.ts --dry-run       # Preview what will be created
  tsx scripts/seed.ts --skip-existing # Skip items that already exist
  tsx scripts/seed.ts --users-only    # Seed only users
  yarn db:seed                        # Via npm script
`)
  process.exit(0)
}

// Dynamic imports to avoid loading database modules for help
let dbQueries: any = null
let supabase: any = null

async function loadDbModules() {
  if (!dbQueries) {
    const queries = await import('../src/lib/db/queries')
    const db = await import('../src/lib/db')
    dbQueries = queries
    supabase = db.supabase
  }
}
const dryRun = args.includes('--dry-run')
const skipExisting = args.includes('--skip-existing')
const resetData = args.includes('--reset')
const usersOnly = args.includes('--users-only')
const challengesOnly = args.includes('--challenges-only')
const configOnly = args.includes('--config-only')
const pagesOnly = args.includes('--pages-only')
const noPrompt = args.includes('--no-prompt')
const verbose = args.includes('--verbose')

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

// Helper functions for colored output
const printSuccess = (message: string) => {
  console.log(`${colors.green}✓${colors.reset} ${message}`)
}

const printError = (message: string) => {
  console.log(`${colors.red}✗${colors.reset} ${message}`)
}

const printWarning = (message: string) => {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`)
}

const printInfo = (message: string) => {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
}

const printHeader = (title: string) => {
  console.log('')
  console.log(`${colors.blue}========================================${colors.reset}`)
  console.log(`${colors.blue}${title}${colors.reset}`)
  console.log(`${colors.blue}========================================${colors.reset}`)
  console.log('')
}

// Progress indicator
const showProgress = (current: number, total: number, item: string) => {
  const percent = Math.round((current / total) * 100)
  const barLength = 20
  const filledLength = Math.round((barLength * percent) / 100)
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)
  
  process.stdout.write(`\r${colors.cyan}[${bar}] ${percent}%${colors.reset} ${item}`)
  
  if (current === total) {
    console.log('')
  }
}

// Utility functions
const promptUser = async (question: string): Promise<boolean> => {
  if (noPrompt) return true
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(`${question} [y/N] `, (answer) => {
      rl.close()
      resolve(answer.match(/^[Yy]$/) ? true : false)
    })
  })
}

const promptInput = async (question: string): Promise<string> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// Check database connection
async function checkDatabaseConnection(): Promise<boolean> {
  await loadDbModules()

  try {
    const { data, error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      printError(`Database connection failed: ${error.message}`)
      printInfo('')
      printInfo('Possible solutions:')
      printInfo('  1. Ensure migrations have been applied to your Supabase database')
      printInfo('  2. Check your environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
      printInfo('  3. Apply migrations via Supabase Dashboard or CLI:')
      printInfo('     - Dashboard: SQL Editor → paste contents of supabase/migrations/*.sql')
      printInfo('     - CLI: supabase db push (requires project link)')
      printInfo('')
      return false
    }

    printSuccess('Database connection established')
    return true
  } catch (error) {
    printError(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`)
    printInfo('Please check your database configuration and try again.')
    return false
  }
}

// Check if data exists
async function checkDataExists() {
  await loadDbModules()
  
  const result = {
    admin: false,
    users: 0,
    challenges: 0,
    config: 0,
    pages: 0
  }

  try {
    // Check admin
    const admin = await dbQueries.getUserByEmail('admin@next.ctf')
    if (admin) {
      result.admin = true
    }

    // Count users
    const users = await dbQueries.listUsers({ take: 1000 })
    result.users = users.length

    // Count challenges
    const challenges = await dbQueries.listChallenges({ take: 1000 })
    result.challenges = challenges.length

    // Count configs
    const { data: configs } = await supabase.from('configs').select('id')
    result.config = configs?.length || 0

    // Count pages
    const { data: pages } = await supabase.from('pages').select('id')
    result.pages = pages?.length || 0
  } catch (error) {
    printWarning(`Could not check existing data: ${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}

// Reset existing data
async function resetExistingData() {
  await loadDbModules()
  
  printInfo('Resetting existing data...')
  
  // Define table names as any to bypass TypeScript strict typing for this operation
  const tables: any[] = ['unlocks', 'submissions', 'solves', 'awards', 'notifications', 'hints', 'files', 'comments', 'ratings', 'solutions', 'challenges', 'users', 'configs', 'pages']
  
  for (const table of tables) {
    try {
      // Use a more generic approach to delete all data
      const { error } = await (supabase.from(table) as any).delete().gte('created_at', '1970-01-01')
      if (error) {
        printWarning(`Failed to reset ${table}: ${error.message}`)
      } else {
        if (verbose) printSuccess(`Reset ${table}`)
      }
    } catch (error) {
      printWarning(`Failed to reset ${table}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  printSuccess('Existing data reset completed')
}

// Default credentials
const DEFAULT_ADMIN = {
  email: 'admin@next.ctf',
  password: 'admin123',
  name: 'Admin',
}

const DEFAULT_USERS = [
  { email: 'user1@next.ctf', password: 'password123', name: 'User1' },
  { email: 'user2@next.ctf', password: 'password123', name: 'User2' },
]

const SAMPLE_CHALLENGES = [
  {
    name: 'Welcome',
    description: 'Welcome to the CTF! Find the flag hidden in the description.\n\nThe flag is: `CTF{w3lc0me_t0_th3_ctf}`',
    category: 'Misc',
    difficulty: 'EASY' as const,
    points: 10,
    flag: 'CTF{w3lc0me_t0_th3_ctf}',
  },
  {
    name: 'SQL Injection 101',
    description: 'A login form is vulnerable to SQL injection. Can you bypass authentication?\n\nURL: http://ctf.local:8080/login\nUsername: admin\nPassword: ?',
    category: 'Web',
    difficulty: 'MEDIUM' as const,
    points: 100,
    flag: 'CTF{sql_1nj3ct10n_m4st3r}',
    connectionInfo: 'http://ctf.local:8080/login',
    hints: [
      {
        title: 'Hint 1: Classic Bypass',
        content: 'Try using `\' OR 1=1--` as the username.',
        cost: 20,
      },
      {
        title: 'Hint 2: Comment Syntax',
        content: 'The `--` at the end comments out the rest of the SQL query.',
        cost: 30,
      },
    ],
  },
  {
    name: 'Reverse Engineering',
    description: 'Download the binary and find the hidden flag.\n\nFile: `challenge.bin`',
    category: 'Reverse Engineering',
    difficulty: 'HARD' as const,
    points: 200,
    flag: 'CTF{r3v3rs3_eng1n33r1ng_pr0}',
    hints: [
      {
        title: 'Hint 1: Tools',
        content: 'Use tools like `strings`, `objdump`, or Ghidra to analyze the binary.',
        cost: 50,
      },
    ],
  },
]

const SAMPLE_CONFIG = [
  { key: 'ctf_name', value: 'NextCTF', type: 'STRING' as const, description: 'Name of the CTF' },
  { key: 'ctf_description', value: 'A modern CTF platform built with Next.js', type: 'STRING' as const, description: 'Description of the CTF' },
  { key: 'ctf_start_time', value: new Date().toISOString(), type: 'STRING' as const, description: 'CTF start time' },
  { key: 'registration_enabled', value: 'true', type: 'BOOLEAN' as const, description: 'Allow new user registrations' },
  { key: 'teams_enabled', value: 'true', type: 'BOOLEAN' as const, description: 'Enable team functionality' },
  { key: 'max_team_size', value: '5', type: 'NUMBER' as const, description: 'Maximum team size' },
  { key: 'show_scoreboard', value: 'true', type: 'BOOLEAN' as const, description: 'Show scoreboard to public' },
]

const SAMPLE_PAGES = [
  {
    title: 'Rules',
    route: '/rules',
    content: `# CTF Rules

## General Rules

1. **No attacking the infrastructure**: Do not attempt to attack the CTF platform itself
2. **No sharing flags**: Flags are unique to each challenge and should not be shared
3. **No brute forcing**: Rate limiting is in place; excessive requests will result in a ban
4. **Be respectful**: Treat other participants and organizers with respect

## Scoring

- Challenges are worth different points based on difficulty
- Dynamic scoring may be enabled for some challenges
- Hints will deduct points from your score
- First blood bonuses may be awarded

## Support

If you encounter technical issues, please contact the organizers.

Good luck and have fun!`,
    draft: false,
    hidden: false,
    authRequired: false,
  },
  {
    title: 'About',
    route: '/about',
    content: `# About NextCTF

NextCTF is a modern Capture The Flag platform built with Next.js and Supabase.

## Features

- User authentication and team management
- Dynamic challenge scoring
- Real-time scoreboard
- Hint system with point deduction
- File uploads for challenges
- Notification system
- Admin dashboard

## Technology Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Contributing

We welcome contributions! Please see our GitHub repository for more information.

Enjoy the CTF!`,
    draft: false,
    hidden: false,
    authRequired: false,
  },
]

// Seed functions
async function seedUsers() {
  printHeader('Seeding Users')
  
  let createdCount = 0
  let skippedCount = 0
  
  // Create admin user
  printInfo('Creating admin user...')
  
  if (dryRun) {
    printInfo(`[DRY-RUN] Would create admin user: ${DEFAULT_ADMIN.email}`)
    createdCount++
  } else {
    await loadDbModules()
    
    try {
      const existingAdmin = await dbQueries.getUserByEmail(DEFAULT_ADMIN.email)
      
      if (existingAdmin && skipExisting) {
        printWarning(`Admin user already exists: ${DEFAULT_ADMIN.email}`)
        skippedCount++
      } else {
        const hashedAdminPassword = await hash(DEFAULT_ADMIN.password, 10)
        const admin = await dbQueries.createUser({
          name: DEFAULT_ADMIN.name,
          email: DEFAULT_ADMIN.email,
          password: hashedAdminPassword,
          role: 'ADMIN',
        })
        printSuccess(`Admin created: ${admin.email}`)
        if (verbose) {
          console.log(`   📧 Email: ${DEFAULT_ADMIN.email}`)
          console.log(`   🔑 Password: ${DEFAULT_ADMIN.password}`)
        }
        createdCount++
      }
    } catch (error) {
      printError(`Failed to create admin: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Create sample users
  printInfo(`Creating ${DEFAULT_USERS.length} sample users...`)
  for (let i = 0; i < DEFAULT_USERS.length; i++) {
    const user = DEFAULT_USERS[i]
    showProgress(i + 1, DEFAULT_USERS.length, user.email)
    
    if (dryRun) {
      if (verbose) printInfo(`[DRY-RUN] Would create user: ${user.email}`)
      createdCount++
    } else {
      if (!dbQueries) await loadDbModules()
      
      try {
        const existingUser = await dbQueries.getUserByEmail(user.email)
        
        if (existingUser && skipExisting) {
          if (verbose) printWarning(`User already exists: ${user.email}`)
          skippedCount++
        } else {
          const hashedPassword = await hash(user.password, 10)
          const createdUser = await dbQueries.createUser({
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: 'USER',
          })
          if (verbose) printSuccess(`User created: ${createdUser.email}`)
          createdCount++
        }
      } catch (error) {
        printError(`Failed to create user ${user.email}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  
  console.log('')
  printInfo(`Users: ${createdCount} created, ${skippedCount} skipped`)
  return { created: createdCount, skipped: skippedCount }
}

async function seedChallenges() {
  printHeader('Seeding Challenges')
  
  let createdCount = 0
  let skippedCount = 0
  let hintsCreated = 0
  
  printInfo(`Creating ${SAMPLE_CHALLENGES.length} sample challenges...`)
  for (let i = 0; i < SAMPLE_CHALLENGES.length; i++) {
    const challengeData = SAMPLE_CHALLENGES[i]
    showProgress(i + 1, SAMPLE_CHALLENGES.length, challengeData.name)
    
    const { hints, ...challenge } = challengeData
    
    if (dryRun) {
      if (verbose) printInfo(`[DRY-RUN] Would create challenge: ${challenge.name}`)
      createdCount++
      if (hints) hintsCreated += hints.length
    } else {
      if (!dbQueries) await loadDbModules()
      
      try {
        const created = await dbQueries.createChallenge(challenge)
        if (verbose) printSuccess(`Challenge created: ${created.name} (${challenge.difficulty}, ${challenge.points} pts)`)
        createdCount++
        
        // Add hints if provided
        if (hints && hints.length > 0) {
          for (const hint of hints) {
            await dbQueries.createHint({
              challengeId: created.id,
              ...hint,
            })
          }
          hintsCreated += hints.length
          if (verbose) printInfo(`   └─ Added ${hints.length} hint(s)`)
        }
      } catch (error) {
        printError(`Failed to create challenge ${challengeData.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  
  console.log('')
  printInfo(`Challenges: ${createdCount} created, ${skippedCount} skipped`)
  printInfo(`Hints: ${hintsCreated} created`)
  return { created: createdCount, skipped: skippedCount, hints: hintsCreated }
}

async function seedConfig() {
  printHeader('Seeding Configuration')
  
  let createdCount = 0
  let skippedCount = 0
  
  printInfo(`Creating ${SAMPLE_CONFIG.length} config entries...`)
  for (let i = 0; i < SAMPLE_CONFIG.length; i++) {
    const config = SAMPLE_CONFIG[i]
    showProgress(i + 1, SAMPLE_CONFIG.length, config.key)
    
    if (dryRun) {
      if (verbose) printInfo(`[DRY-RUN] Would set config: ${config.key}`)
      createdCount++
    } else {
      if (!dbQueries) await loadDbModules()
      
      try {
        const existingConfig = await dbQueries.getConfig(config.key)
        
        if (existingConfig && skipExisting) {
          if (verbose) printWarning(`Config already exists: ${config.key}`)
          skippedCount++
        } else {
          await dbQueries.setConfig(config.key, config.value, config.type, config.description)
          if (verbose) printSuccess(`Config set: ${config.key}`)
          createdCount++
        }
      } catch (error) {
        printError(`Failed to set config ${config.key}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  
  console.log('')
  printInfo(`Config: ${createdCount} created, ${skippedCount} skipped`)
  return { created: createdCount, skipped: skippedCount }
}

async function seedPages() {
  printHeader('Seeding Pages')
  
  let createdCount = 0
  let skippedCount = 0
  
  printInfo(`Creating ${SAMPLE_PAGES.length} sample pages...`)
  for (let i = 0; i < SAMPLE_PAGES.length; i++) {
    const page = SAMPLE_PAGES[i]
    showProgress(i + 1, SAMPLE_PAGES.length, page.title)
    
    if (dryRun) {
      if (verbose) printInfo(`[DRY-RUN] Would create page: ${page.title} (${page.route})`)
      createdCount++
    } else {
      if (!dbQueries) await loadDbModules()
      
      try {
        const existingPage = await dbQueries.getPageByRoute(page.route)
        
        if (existingPage && skipExisting) {
          if (verbose) printWarning(`Page already exists: ${page.title} (${page.route})`)
          skippedCount++
        } else {
          await dbQueries.createPage(page)
          if (verbose) printSuccess(`Page created: ${page.title} (${page.route})`)
          createdCount++
        }
      } catch (error) {
        printError(`Failed to create page ${page.title}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
  
  console.log('')
  printInfo(`Pages: ${createdCount} created, ${skippedCount} skipped`)
  return { created: createdCount, skipped: skippedCount }
}

// Main function
async function main() {
  printHeader(`Database Seed Script${dryRun ? ' (DRY RUN)' : ''}`)
  
  // Check database connection (skip for dry-run)
  let existingData = {
    admin: false,
    users: 0,
    challenges: 0,
    config: 0,
    pages: 0
  }
  
  if (!dryRun) {
    printInfo('Checking database connection...')
    const dbConnected = await checkDatabaseConnection()
    if (!dbConnected) {
      printError('Cannot proceed without database connection')
      process.exit(1)
    }
    
    // Check existing data
    existingData = await checkDataExists()
    
    if (verbose) {
      printInfo('Current database state:')
      console.log(`   Admin: ${existingData.admin ? '✓' : '✗'}`)
      console.log(`   Users: ${existingData.users}`)
      console.log(`   Challenges: ${existingData.challenges}`)
      console.log(`   Config entries: ${existingData.config}`)
      console.log(`   Pages: ${existingData.pages}`)
      console.log('')
    }
  }
  
  if (verbose) {
    printInfo('Current database state:')
    console.log(`   Admin: ${existingData.admin ? '✓' : '✗'}`)
    console.log(`   Users: ${existingData.users}`)
    console.log(`   Challenges: ${existingData.challenges}`)
    console.log(`   Config entries: ${existingData.config}`)
    console.log(`   Pages: ${existingData.pages}`)
    console.log('')
  }
  
  // Show summary of what will be created
  printInfo('This script will create:')
  if (!usersOnly && !challengesOnly && !configOnly && !pagesOnly) {
    console.log(`   • 1 admin account (${DEFAULT_ADMIN.email})`)
    console.log(`   • ${DEFAULT_USERS.length} sample users`)
    console.log(`   • ${SAMPLE_CHALLENGES.length} sample challenges`)
    console.log(`   • ${SAMPLE_CONFIG.length} configuration entries`)
    console.log(`   • ${SAMPLE_PAGES.length} sample pages`)
  } else if (usersOnly) {
    console.log(`   • 1 admin account (${DEFAULT_ADMIN.email})`)
    console.log(`   • ${DEFAULT_USERS.length} sample users`)
  } else if (challengesOnly) {
    console.log(`   • ${SAMPLE_CHALLENGES.length} sample challenges`)
  } else if (configOnly) {
    console.log(`   • ${SAMPLE_CONFIG.length} configuration entries`)
  } else if (pagesOnly) {
    console.log(`   • ${SAMPLE_PAGES.length} sample pages`)
  }
  
  if (skipExisting) {
    printInfo('Existing items will be skipped')
  }
  
  if (resetData) {
    printWarning('All existing data will be deleted!')
  }
  
  console.log('')
  
  // Confirm before proceeding
  const shouldProceed = await promptUser('Do you want to continue?')
  if (!shouldProceed) {
    printInfo('Seed script cancelled')
    process.exit(0)
  }
  
  // Reset data if requested
  if (resetData) {
    const shouldReset = await promptUser('Are you sure you want to delete all existing data?')
    if (!shouldReset) {
      printInfo('Data reset cancelled')
      process.exit(0)
    }
    await resetExistingData()
  }
  
  // Track results
  const results = {
    users: { created: 0, skipped: 0 },
    challenges: { created: 0, skipped: 0, hints: 0 },
    config: { created: 0, skipped: 0 },
    pages: { created: 0, skipped: 0 }
  }
  
  // Seed data based on options
  if (usersOnly || (!challengesOnly && !configOnly && !pagesOnly)) {
    results.users = await seedUsers()
  }
  
  if (challengesOnly || (!usersOnly && !configOnly && !pagesOnly)) {
    results.challenges = await seedChallenges()
  }
  
  if (configOnly || (!usersOnly && !challengesOnly && !pagesOnly)) {
    results.config = await seedConfig()
  }
  
  if (pagesOnly || (!usersOnly && !challengesOnly && !configOnly)) {
    results.pages = await seedPages()
  }
  
  // Show final summary
  printHeader('Seeding Complete!')
  
  if (dryRun) {
    printInfo('This was a dry run. No actual changes were made.')
  } else {
    printSuccess('Database seeded successfully!')
    
    console.log('')
    printInfo('Summary:')
    console.log(`   Users: ${results.users.created} created, ${results.users.skipped} skipped`)
    console.log(`   Challenges: ${results.challenges.created} created, ${results.challenges.skipped} skipped`)
    if (results.challenges.hints > 0) {
      console.log(`   Hints: ${results.challenges.hints} created`)
    }
    console.log(`   Config: ${results.config.created} created, ${results.config.skipped} skipped`)
    console.log(`   Pages: ${results.pages.created} created, ${results.pages.skipped} skipped`)
    
    console.log('')
    printSuccess('🔐 Login Credentials:')
    console.log(`   Email: ${DEFAULT_ADMIN.email}`)
    console.log(`   Password: ${DEFAULT_ADMIN.password}`)
    console.log('')
    printInfo('Sample Users (all have password: password123):')
    DEFAULT_USERS.forEach(user => {
      console.log(`   - ${user.email}`)
    })
  }
  
  console.log('')
  printInfo('You can now start the application with: yarn dev')
}

// Run the seed script
main().catch(error => {
  printError(`Seed script failed: ${error instanceof Error ? error.message : String(error)}`)
  if (verbose) console.error(error)
  process.exit(1)
})
