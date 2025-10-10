// Database configuration for different environments
const isProduction = process.env.NODE_ENV === 'production'

// SQLite configuration for development
const sqliteConfig = {
  provider: 'sqlite',
  url: process.env.DATABASE_URL || 'file:./dev.db',
}

// PostgreSQL configuration for production (Supabase)
const postgresConfig = {
  provider: 'postgresql',
  url: process.env.DATABASE_URL,
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
}

// Export the appropriate configuration based on environment
module.exports = isProduction ? postgresConfig : sqliteConfig
