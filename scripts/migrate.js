const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production'

console.log(
  `Running migration for ${isProduction ? 'production' : 'development'} environment...`
)

try {
  if (isProduction) {
    // For production with PostgreSQL (Supabase)
    console.log('Using PostgreSQL database for production...')

    // Check if required environment variables are set
    const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL']
    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )

    if (missingEnvVars.length > 0) {
      console.error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      )
      console.error(
        'Please set these variables in your .env file for production'
      )
      process.exit(1)
    }

    // Generate Prisma Client
    console.log('Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    // Push schema to production database
    console.log('Pushing schema to production database...')
    execSync('npx prisma db push', { stdio: 'inherit' })

    console.log('Production database migration completed successfully!')
  } else {
    // For development with SQLite
    console.log('Using SQLite database for development...')

    // Generate Prisma Client
    console.log('Generating Prisma Client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    // Create and apply migration for development
    console.log('Creating and applying migration for development...')
    try {
      execSync('npx prisma migrate dev', { stdio: 'inherit' })
    } catch (error) {
      console.log(
        'Migration might already exist or database is in sync. Continuing...'
      )
    }

    // Run seed script
    console.log('Running seed script...')
    execSync('npm run db:seed', { stdio: 'inherit' })

    console.log('Development database migration completed successfully!')
  }
} catch (error) {
  console.error('Migration failed:', error.message)
  process.exit(1)
}
