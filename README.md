# Next.js CTFd Platform

A modern CTF (Capture The Flag) platform built with Next.js, TypeScript, and Supabase.

## Features

- **Challenge Management** - Create, categorize, and manage CTF challenges with dynamic flags
- **Team System** - Form teams, collaborate, and compete together
- **Scoreboard** - Real-time leaderboard tracking team and individual progress
- **Admin Dashboard** - Comprehensive admin panel for platform management
- **User Profiles** - Customizable profiles with solve statistics
- **File Storage** - Flexible storage (local or Supabase) for challenge files
- **Notifications** - Email and in-app notification system
- **Comments & Ratings** - Challenge discussions and difficulty ratings
- **Solutions & Hints** - Post-solve write-ups and progressive hint system

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS v4
- **Testing:** Jest + Playwright
- **Storage:** Local filesystem or Supabase Storage

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard & management
│   ├── api/                # API routes
│   ├── (public)/           # Public pages (challenges, scoreboard, teams)
│   └── auth/               # Authentication pages
├── components/
│   ├── admin/              # Admin-specific components
│   ├── challenges/         # Challenge UI components
│   ├── ui/                 # Reusable UI components
│   └── providers/          # Context providers
├── lib/
│   ├── auth/               # Authentication logic & guards
│   ├── db/                 # Database queries & types
│   ├── storage/            # File storage adapters
│   ├── validations/        # Zod schemas
│   └── utils/              # Utility functions
└── types/                  # TypeScript type definitions
```

## Setup

### Prerequisites

- Node.js 20+
- Yarn 1.22+
- Supabase account ([supabase.com](https://supabase.com))

### Installation

1. **Clone and install dependencies**
   ```bash
   yarn install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`

3. **Set up database**
   ```bash
   yarn db:setup
   ```

### Development

```bash
yarn dev
```

Visit [http://localhost:4000](http://localhost:4000)

### Testing

```bash
yarn test        # Run all tests
yarn test:unit   # Unit tests only
yarn test:e2e    # E2E tests only
```

### Building

```bash
yarn build
yarn start
```

## Configuration

### Storage

Configure storage backend in `.env`:

```bash
# Use local filesystem
STORAGE_DRIVER="local"
UPLOAD_DIR=".uploads"

# OR use Supabase Storage
STORAGE_DRIVER="supabase"
SUPABASE_BUCKET="challenge-files"
```

### Email Notifications

Configure SMTP settings in `.env` to enable email notifications:

```bash
EMAIL_HOST="smtp.example.com"
EMAIL_PORT="587"
EMAIL_USER="your@email.com"
EMAIL_PASS="your-password"
EMAIL_FROM="CTF Platform <noreply@example.com>"
NOTIFICATIONS_EMAIL_ENABLED="true"
```

## Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server (port 4000) |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |
| `yarn test` | Run all tests |
| `yarn db:setup` | Initialize database schema |
| `yarn db:types` | Generate TypeScript types from database |
| `yarn db:seed` | Seed database with sample data |

## License

MIT
