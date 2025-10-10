# NextCTF - Modern Capture The Flag Platform

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.17.0-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)
![License](https://img.shields.io/badge/License-MIT-green)

NextCTF is a modern, feature-rich Capture The Flag (CTF) platform built with Next.js, Prisma, and TypeScript. It provides a complete solution for hosting CTF competitions with challenges, teams, scoring, and comprehensive admin features.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Health Check Endpoints](#health-check-endpoints)
- [SMTP Configuration](#smtp-configuration)
- [Manual Testing](#manual-testing)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core CTF Functionality

- **Challenge Management**: Create, categorize, and manage challenges with different difficulty levels
- **Dynamic Scoring**: Support for both static and dynamic scoring algorithms (log, exp, linear)
- **User & Team System**: Individual participation and team-based competitions
- **Real-time Scoreboard**: Live leaderboard with individual and team rankings
- **Hint System**: Optional hints that can be unlocked by participants
- **File Attachments**: Support for challenge files and resources
- **Solution Submissions**: Flag validation and submission tracking

### User Experience

- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Dark/Light Theme**: Theme toggle for user preference
- **User Profiles**: Customizable profiles with experience tracking
- **Challenge Ratings**: Users can rate and review challenges
- **Comments System**: Discussion threads for each challenge
- **Notifications**: Real-time notifications for users and teams

### Administration

- **Admin Dashboard**: Comprehensive admin panel for managing all aspects
- **Challenge Creation**: Full CRUD operations for challenges
- **User Management**: Manage users, teams, and permissions
- **Broadcast System**: Send notifications to all users
- **Configuration Management**: Site-wide settings and customization
- **Analytics**: Track participation and solve statistics

### Technical Features

- **Authentication**: Secure authentication with NextAuth.js
- **Database**: Prisma ORM with SQLite (dev) and PostgreSQL (prod) support
- **Storage**: Flexible storage backend (local or Supabase)
- **API**: RESTful API endpoints for all functionality
- **Testing**: Comprehensive test suite with Jest and Playwright
- **Type Safety**: Full TypeScript implementation

## Project Structure

```
next-ctfd/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Database schema definition
│   ├── migrations/        # Database migrations
│   └── seed.ts            # Database seed script
├── public/                # Static assets
├── scripts/               # Utility scripts
│   └── migrate.js         # Database migration script
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── (public)/      # Public routes
│   │   ├── admin/         # Admin routes
│   │   ├── api/           # API routes
│   │   └── auth/          # Authentication pages
│   ├── components/        # React components
│   │   ├── admin/         # Admin components
│   │   ├── challenges/    # Challenge components
│   │   ├── forms/         # Form components
│   │   ├── providers/     # Context providers
│   │   └── ui/            # UI components
│   └── lib/               # Utility libraries
│       ├── auth/          # Authentication utilities
│       ├── db/            # Database utilities
│       ├── email/         # Email utilities
│       ├── storage/       # Storage utilities
│       ├── utils/         # General utilities
│       └── validations/   # Schema validations
└── tests/                 # Test files
    ├── e2e/              # End-to-end tests
    ├── integration/      # Integration tests
    ├── setup/            # Test setup files
    └── unit/             # Unit tests
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rzlamrr/Next-CTF.git
   cd next-ctfd
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration. For development, you can use the default values:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth.js
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="http://127.0.0.1:4000"

   # Application
   NODE_ENV="development"
   NEXT_PUBLIC_BASE_URL="http://127.0.0.1:4000"

   # Storage
   STORAGE_DRIVER="local"
   UPLOAD_DIR=".uploads"
   ```

4. **Set up the database**

   ```bash
   npm run db:setup
   ```

   This will:
   - Generate Prisma client
   - Run migrations
   - Seed the database with sample data

5. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Access the application**
   - Open [http://127.0.0.1:4000](http://127.0.0.1:4000) in your browser
   - Default admin credentials: `admin@localhost` / `12345678`
   - Default user credentials: `user@localhost` / `12345678`

### Development Scripts

- `npm run dev` - Start development server on port 4000
- `npm run build` - Build the application for production
- `npm run start` - Start production server on port 4000
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

## Production Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (recommended) or SQLite
- Domain name with SSL certificate

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rzlamrr/Next-CTF.git
   cd next-ctfd
   ```

2. **Install dependencies**

   ```bash
   npm install --production
   # or
   yarn install --production
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your production configuration:

   ```env
   # Database (PostgreSQL with Supabase example)
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SHADOW_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

   # NextAuth.js
   NEXTAUTH_SECRET="your-generated-secret"
   NEXTAUTH_URL="https://yourdomain.com"

   # Application
   NODE_ENV="production"
   NEXT_PUBLIC_BASE_URL="https://yourdomain.com"

   # Storage (Supabase example)
   STORAGE_DRIVER="supabase"
   SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
   SUPABASE_BUCKET="challenge-files"

   # Email (SMTP)
   EMAIL_HOST="smtp.yourprovider.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@yourdomain.com"
   EMAIL_PASS="your-email-password"
   EMAIL_FROM="CTF Admin <no-reply@yourdomain.com>"
   NOTIFICATIONS_EMAIL_ENABLED="true"
   ```

4. **Set up the database**

   ```bash
   npm run db:setup:prod
   ```

   This will:
   - Generate Prisma client
   - Push schema to production database

5. **Build the application**

   ```bash
   npm run build
   ```

6. **Start the production server**
   ```bash
   npm start
   ```

### Deployment Options

#### Using PM2 (Recommended)

1. Install PM2 globally:

   ```bash
   npm install -g pm2
   ```

2. Create an `ecosystem.config.js` file:

   ```javascript
   module.exports = {
     apps: [
       {
         name: 'next-ctfd',
         script: 'npm',
         args: 'start',
         cwd: './',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
           PORT: 4000,
         },
       },
     ],
   }
   ```

3. Start the application:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Using Docker

1. Create a `Dockerfile`:

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 4000

   CMD ["npm", "start"]
   ```

2. Build and run:
   ```bash
   docker build -t next-ctfd .
   docker run -p 4000:4000 --env-file .env next-ctfd
   ```

#### Using Vercel (Simplest)

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

## API Documentation

The API follows RESTful conventions and returns JSON responses with a consistent envelope structure:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Authentication

All protected endpoints require authentication via NextAuth.js session cookies. Include the session cookie in your requests.

### Key Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - User logout

#### Challenges

- `GET /api/challenges` - List challenges with filtering
  - Query params: `category`, `type`, `difficulty`, `bracket`, `search`

  ```json
  // Response
  {
    "success": true,
    "data": [
      {
        "id": "challenge-id",
        "name": "Challenge Name",
        "value": 100,
        "category": "web",
        "difficulty": "EASY",
        "type": "STANDARD",
        "solveCount": 5,
        "solved": false
      }
    ]
  }
  ```

- `POST /api/challenges` - Create new challenge (Admin only)

  ```json
  // Request body
  {
    "name": "Challenge Name",
    "description": "Challenge description",
    "category": "web",
    "difficulty": "EASY",
    "points": 100,
    "flag": "flag{example}",
    "type": "STANDARD",
    "tags": ["web", "sql"],
    "topics": ["SQL Injection"]
  }
  ```

- `GET /api/challenges/[id]` - Get challenge details
- `PUT /api/challenges/[id]` - Update challenge (Admin only)
- `DELETE /api/challenges/[id]` - Delete challenge (Admin only)

#### Challenge Attempts

- `POST /api/challenges/attempt` - Submit flag

  ```json
  // Request body
  {
    "challengeId": "challenge-id",
    "flag": "flag{example}"
  }

  // Response
  {
    "success": true,
    "data": {
      "correct": true,
      "message": "Correct flag!"
    }
  }
  ```

#### Hints

- `GET /api/hints` - List available hints
- `POST /api/hints/unlock` - Unlock a hint
  ```json
  // Request body
  {
    "hintId": "hint-id"
  }
  ```

#### Scoreboard

- `GET /api/scoreboard` - Get leaderboard
  - Query params: `type` ("individual" or "teams"), `limit`
  ```json
  // Response
  {
    "success": true,
    "data": [
      {
        "id": "user-id",
        "name": "Player Name",
        "score": 500,
        "rank": 1,
        "solves": 5
      }
    ]
  }
  ```

#### Users

- `GET /api/users/me` - Get current user profile
- `GET /api/users/me/submissions` - Get user submissions
- `PUT /api/users/me` - Update user profile

#### Teams

- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/[id]` - Get team details
- `PUT /api/teams/[id]` - Update team (Captain only)

#### Admin

- `GET /api/admin/users` - List all users (Admin only)
- `GET /api/admin/teams` - List all teams (Admin only)
- `POST /api/admin/notifications` - Send broadcast (Admin only)
  ```json
  // Request body
  {
    "title": "Notification Title",
    "content": "Notification content",
    "target": "all" // or "users" or "teams"
  }
  ```

#### Files

- `GET /api/files/[id]/download` - Download challenge file
- `POST /api/files/[id]` - Upload challenge file (Admin only)

#### Comments

- `GET /api/comments` - List comments
- `POST /api/comments` - Create comment
- `GET /api/comments/[id]` - Get comment details
- `PUT /api/comments/[id]` - Update comment (Owner only)
- `DELETE /api/comments/[id]` - Delete comment (Owner or Admin)

#### Ratings

- `GET /api/ratings` - List ratings
- `POST /api/ratings` - Create/update rating
  ```json
  // Request body
  {
    "challengeId": "challenge-id",
    "value": 5,
    "review": "Great challenge!"
  }
  ```

## Database Schema

The application uses Prisma as the ORM with support for both SQLite (development) and PostgreSQL (production).

### Core Models

#### User

Represents a user in the system.

- `id` - Unique identifier
- `name` - Display name
- `email` - Email address (unique)
- `password` - Hashed password
- `role` - User role (USER or ADMIN)
- `teamId` - Associated team (optional)

#### Team

Represents a team of users.

- `id` - Unique identifier
- `name` - Team name (unique)
- `description` - Team description
- `captainId` - Team captain user ID
- `password` - Team password (optional)

#### Challenge

Represents a CTF challenge.

- `id` - Unique identifier
- `name` - Challenge name
- `description` - Challenge description
- `category` - Challenge category
- `difficulty` - Difficulty level (EASY, MEDIUM, HARD, INSANE)
- `points` - Point value for static scoring
- `flag` - Challenge flag
- `type` - Challenge type (STANDARD or DYNAMIC)
- `function` - Scoring function (static, log, exp, linear)
- `value` - Initial value for dynamic scoring
- `decay` - Decay value for dynamic scoring
- `minimum` - Minimum value for dynamic scoring
- `maxAttempts` - Maximum attempt limit (optional)
- `connectionInfo` - Connection information for challenges (optional)
- `requirements` - Challenge requirements (optional)
- `bracketId` - Associated bracket (optional)

#### Submission

Represents a flag submission attempt.

- `id` - Unique identifier
- `userId` - User ID
- `teamId` - Team ID (optional)
- `challengeId` - Challenge ID
- `flag` - Submitted flag
- `status` - Submission status (CORRECT, INCORRECT, PENDING)

#### Solve

Represents a solved challenge.

- `id` - Unique identifier
- `userId` - User ID
- `teamId` - Team ID (optional)
- `challengeId` - Challenge ID

#### Hint

Represents a hint for a challenge.

- `id` - Unique identifier
- `title` - Hint title
- `content` - Hint content
- `cost` - Point cost to unlock
- `challengeId` - Associated challenge

#### File

Represents a file attached to a challenge.

- `id` - Unique identifier
- `location` - File location/path
- `challengeId` - Associated challenge

### Supporting Models

#### Tag & Topic

- `Tag` - Categorization tags for challenges
- `Topic` - Topic classifications for challenges

#### Bracket

- `Bracket` - Difficulty brackets for challenges

#### Rating & Comment

- `Rating` - User ratings for challenges
- `Comment` - User comments on challenges

#### Solution

- `Solution` - Official solutions for challenges

#### Notification & Unlock

- `Notification` - User notifications
- `Unlock` - Records of unlocked hints/challenges

#### Config

- `Config` - System configuration settings

#### Page

- `Page` - Custom pages (About, Rules, etc.)

### Relationships

The database schema includes the following key relationships:

- Users can belong to Teams
- Challenges can have multiple Hints, Files, Tags, and Topics
- Users can submit Submissions and solve Challenges
- Users can create Ratings and Comments on Challenges
- Teams can have multiple Users
- Challenges can belong to Brackets

## Health Check Endpoints

The application provides health check endpoints to monitor system status:

### Database Health Check

- **Endpoint**: `GET /api/health/db`
- **Purpose**: Verify database connectivity
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "connected": true
    }
  }
  ```

### Storage Health Check

- **Endpoint**: `GET /api/health/storage`
- **Purpose**: Verify storage backend connectivity
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "storage": "local",
      "accessible": true
    }
  }
  ```

### Using Health Checks

These endpoints can be used by:

- Load balancers to determine service health
- Monitoring systems to track application status
- CI/CD pipelines to verify deployment success
- Container orchestrators for liveness/readiness probes

Example monitoring script:

```bash
#!/bin/bash

# Check database health
DB_HEALTH=$(curl -s http://localhost:4000/api/health/db | jq -r '.data.connected')

# Check storage health
STORAGE_HEALTH=$(curl -s http://localhost:4000/api/health/storage | jq -r '.data.accessible')

if [ "$DB_HEALTH" = "true" ] && [ "$STORAGE_HEALTH" = "true" ]; then
    echo "All systems healthy"
    exit 0
else
    echo "Health check failed"
    exit 1
fi
```

## SMTP Configuration

The application supports email notifications for user communications and admin broadcasts. Email functionality is optional and will safely no-op if not configured.

### Configuration

Add these environment variables to your `.env` file:

```env
# Email (SMTP)
EMAIL_HOST="smtp.yourprovider.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@yourdomain.com"
EMAIL_PASS="your-email-password"
EMAIL_FROM="CTF Admin <no-reply@yourdomain.com>"
NOTIFICATIONS_EMAIL_ENABLED="true"
```

### Email Service Providers

#### Gmail

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"  # Use app-specific password
EMAIL_FROM="CTF Admin <your-email@gmail.com>"
```

#### SendGrid

```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASS="your-sendgrid-api-key"
EMAIL_FROM="CTF Admin <no-reply@yourdomain.com>"
```

#### Mailgun

```env
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT="587"
EMAIL_USER="postmaster@yourdomain.com"
EMAIL_PASS="your-mailgun-smtp-password"
EMAIL_FROM="CTF Admin <no-reply@yourdomain.com>"
```

### Email Features

#### Admin Broadcasts

Admins can send email notifications to all users:

1. Go to Admin Dashboard
2. Navigate to Notifications
3. Create a new broadcast
4. Select "Send Email" option
5. All registered users will receive the email

#### User Notifications

Users receive email notifications for:

- Account creation
- Password resets
- Challenge solves
- Team invitations
- System announcements

### Testing Email Configuration

To test your email configuration:

1. Create a test script:

   ```javascript
   // test-email.js
   const { sendMail } = require('./src/lib/email/mailer')

   async function testEmail() {
     try {
       await sendMail({
         to: ['test@example.com'],
         subject: 'Test Email',
         text: 'This is a test email from NextCTF',
         html: '<h1>Test Email</h1><p>This is a test email from NextCTF</p>',
       })
       console.log('Email sent successfully')
     } catch (error) {
       console.error('Failed to send email:', error)
     }
   }

   testEmail()
   ```

2. Run the script:
   ```bash
   node test-email.js
   ```

### Troubleshooting

#### Email Not Sending

1. Verify SMTP settings are correct
2. Check firewall/port settings
3. Ensure authentication credentials are valid
4. Check spam/junk folders
5. Verify email provider's sending limits

#### SSL/TLS Issues

- Use port 587 for STARTTLS
- Use port 465 for SMTPS
- Ensure your email provider supports the chosen encryption method

#### Authentication Failures

- For Gmail, use app-specific passwords
- For other providers, ensure API keys are valid
- Check if account requires additional verification

## Manual Testing

This section provides guidance for manually testing the application to ensure all features work correctly.

### Prerequisites

1. Ensure the development environment is set up:

   ```bash
   npm run db:setup
   npm run dev
   ```

2. Access the application at `http://127.0.0.1:4000`

### Test Accounts

The seed script creates default test accounts:

#### Admin Account

- **Email**: `admin@localhost`
- **Password**: `12345678`
- **Role**: ADMIN
- **Features**: Full admin access

#### User Account

- **Email**: `user@localhost`
- **Password**: `12345678`
- **Role**: USER
- **Features**: Standard user access

### Testing Scenarios

#### 1. User Authentication

**Registration Test**:

1. Navigate to `/auth/register`
2. Fill in registration form with new user details
3. Submit form
4. Verify successful registration and redirect
5. Try to register with the same email (should fail)

**Login Test**:

1. Navigate to `/auth/login`
2. Enter valid credentials
3. Verify successful login and redirect
4. Test invalid credentials (should fail)
5. Test with incorrect password (should fail)

**Session Management**:

1. Login as a user
2. Close browser and reopen
3. Verify session persists
4. Logout and verify session is cleared

#### 2. Challenge Management

**Viewing Challenges**:

1. Login as a user
2. Navigate to `/challenges`
3. Verify challenges are displayed
4. Test filtering by category, difficulty, type
5. Test search functionality

**Solving Challenges**:

1. Select a challenge
2. View challenge details
3. Submit incorrect flag
4. Verify error message
5. Submit correct flag
6. Verify success message and points awarded

**Hint System**:

1. Select a challenge with hints
2. Click on hint to unlock
3. Verify points are deducted
4. Verify hint content is displayed

#### 3. Team Functionality

**Team Creation**:

1. Login as a user
2. Navigate to profile
3. Create a new team
4. Verify team is created
5. Invite another user to join

**Team Joining**:

1. Login as another user
2. Accept team invitation
3. Verify team membership
4. Solve a challenge as a team
5. Verify points are awarded to team

#### 4. Admin Features

**Challenge Creation**:

1. Login as admin
2. Navigate to `/admin/challenges`
3. Create a new challenge
4. Fill in all required fields
5. Upload a file (optional)
6. Save challenge
7. Verify challenge appears in public list

**User Management**:

1. Login as admin
2. Navigate to `/admin/users`
3. View list of users
4. Edit user details
5. Verify changes are saved

**Broadcast System**:

1. Login as admin
2. Navigate to `/admin/notifications`
3. Create a new broadcast
4. Select "All Users" as target
5. Send broadcast
6. Login as a regular user
7. Verify notification is received

#### 5. Scoring System

**Individual Scoring**:

1. Login as a user
2. Solve multiple challenges
3. Navigate to scoreboard
4. Verify score and rank are correct
5. Verify solve count is accurate

**Team Scoring**:

1. Create a team with multiple users
2. Have different users solve challenges
3. Navigate to team scoreboard
4. Verify team score is sum of individual solves
5. Verify team ranking is correct

**Dynamic Scoring**:

1. Login as admin
2. Create a challenge with dynamic scoring
3. Set initial value, decay, and minimum
4. Have multiple users solve the challenge
5. Verify point value decreases with each solve

#### 6. File Management

**File Upload**:

1. Login as admin
2. Create a new challenge
3. Upload a file
4. Save challenge
5. Login as a user
6. View challenge and download file
7. Verify file contents are correct

**File Deletion**:

1. Login as admin
2. Edit a challenge with files
3. Delete a file
4. Save changes
5. Verify file is no longer available

#### 7. Comments and Ratings

**Comment System**:

1. Login as a user
2. Navigate to a challenge
3. Add a comment
4. Verify comment appears
5. Edit the comment
6. Verify changes are saved

**Rating System**:

1. Login as a user
2. Solve a challenge
3. Rate the challenge (1-5 stars)
4. Add a review (optional)
5. Verify rating is recorded
6. View average rating on challenge

#### 8. Notifications

**User Notifications**:

1. Login as a user
2. Perform various actions (solve challenges, join teams)
3. Verify notifications appear in the bell icon
4. Mark notifications as read
5. Verify read count updates

**Admin Broadcasts**:

1. Login as admin
2. Create a broadcast notification
3. Send to all users
4. Login as a regular user
5. Verify broadcast is received

#### 9. Profile Management

**Profile Updates**:

1. Login as a user
2. Navigate to profile
3. Update profile information
4. Verify changes are saved
5. Upload a profile picture (if supported)

**Field Entries**:

1. Login as a user
2. Navigate to profile
3. Fill in custom fields (if configured)
4. Verify data is saved and displayed

#### 10. Health Checks

**Database Health**:

1. Access `/api/health/db`
2. Verify response indicates healthy database connection
3. Stop database service
4. Access endpoint again
5. Verify response indicates failure

**Storage Health**:

1. Access `/api/health/storage`
2. Verify response indicates healthy storage connection
3. Change storage configuration to invalid values
4. Access endpoint again
5. Verify response indicates failure

### Test Checklist

Use this checklist to verify all features are working:

#### Authentication

- [ ] User registration works
- [ ] User login works
- [ ] Invalid login fails appropriately
- [ ] Session persistence works
- [ ] Logout works correctly

#### Challenges

- [ ] Challenges display correctly
- [ ] Challenge filtering works
- [ ] Challenge search works
- [ ] Flag submission works
- [ ] Incorrect flags are rejected
- [ ] Correct flags are accepted
- [ ] Points are awarded correctly
- [ ] Hint system works
- [ ] File attachments work

#### Teams

- [ ] Team creation works
- [ ] Team invitations work
- [ ] Team joining works
- [ ] Team scoring works
- [ ] Team rankings are correct

#### Admin Features

- [ ] Admin login works
- [ ] Challenge creation works
- [ ] Challenge editing works
- [ ] Challenge deletion works
- [ ] User management works
- [ ] Broadcast system works
- [ ] File management works

#### User Experience

- [ ] Profile updates work
- [ ] Comments work
- [ ] Ratings work
- [ ] Notifications work
- [ ] Scoreboard displays correctly
- [ ] Responsive design works on mobile

#### System Features

- [ ] Health checks work
- [ ] Email notifications work (if configured)
- [ ] Database operations work
- [ ] File storage works
- [ ] Error handling is appropriate

### Performance Testing

To test performance under load:

1. **Concurrent Users**:
   - Open multiple browser windows
   - Login with different users
   - Simultaneously perform actions (solve challenges, view scoreboard)

2. **Database Load**:
   - Create multiple challenges
   - Have multiple users solve challenges rapidly
   - Monitor database performance

3. **File Uploads**:
   - Upload large files as challenge attachments
   - Verify upload speed and success rate

### Security Testing

1. **Input Validation**:
   - Try submitting XSS payloads in form fields
   - Try SQL injection in search fields
   - Verify proper sanitization

2. **Authentication**:
   - Try accessing protected routes without login
   - Try accessing admin routes as regular user
   - Verify proper authorization

3. **Flag Security**:
   - Try to view flags before solving challenges
   - Try to submit flags for challenges you haven't accessed
   - Verify flag validation is secure

## Contributing

We welcome contributions to NextCTF! Please follow these guidelines to contribute to the project.

### Development Workflow

1. **Fork the Repository**
   - Fork the project on GitHub
   - Clone your fork locally

   ```bash
   git clone https://github.com/rzlamrr/Next-CTF.git
   cd next-ctfd
   ```

2. **Set Up Development Environment**

   ```bash
   npm install
   cp .env.example .env
   npm run db:setup
   ```

3. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Your Changes**
   - Write clean, documented code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

5. **Run Tests**

   ```bash
   npm run test
   npm run lint
   npm run format:check
   ```

6. **Commit Your Changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Submit the PR

### Code Style Guidelines

#### TypeScript

- Use TypeScript for all new code
- Enable strict mode in TypeScript configuration
- Define types for all function parameters and return values
- Use interfaces for object shapes

#### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for environment variables
- Use kebab-case for file names

#### Component Structure

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow the existing folder structure

#### API Routes

- Use RESTful conventions
- Return consistent response format
- Include proper error handling
- Add input validation

### Testing Guidelines

#### Unit Tests

- Write unit tests for utility functions
- Mock external dependencies
- Test edge cases and error conditions
- Aim for high code coverage

#### Integration Tests

- Test API routes with mocked database
- Test authentication and authorization
- Test data validation
- Test error handling

#### End-to-End Tests

- Test key user flows
- Test authentication workflows
- Test admin functionality
- Test responsive design

### Documentation

- Update README.md for significant changes
- Add JSDoc comments for complex functions
- Document new API endpoints
- Include examples in documentation

### Issue Reporting

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version, etc.)
- Screenshots if applicable

### Pull Request Guidelines

- PR title should follow conventional commits format
- PR description should clearly explain changes
- Link to any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Follow the project's technical direction
- Maintain a positive community

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Third-Party Licenses

This project uses third-party libraries with their own licenses:

- [Next.js](https://github.com/vercel/next.js) - MIT License
- [Prisma](https://github.com/prisma/prisma) - Apache License 2.0
- [NextAuth.js](https://github.com/nextauthjs/next-auth) - ISC License
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) - MIT License
- [React](https://github.com/facebook/react) - MIT License

See `package.json` for a complete list of dependencies and their licenses.

### Contributing License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
