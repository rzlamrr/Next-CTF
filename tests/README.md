Testing & CI for Next-CTFd

Overview

- Jest projects:
  - unit-jsdom: Client/component and pure TS unit tests run in jsdom with @testing-library/jest-dom set up.
  - integration-node: API route integration tests run in node with a local SQLite test DB and mocked NextAuth sessions.
- Playwright E2E:
  - Runs key user/admin flows against a dev server on http://127.0.0.1:4000 with multi-browser projects and artifacts on failure.
- CI (GitHub Actions):
  - End-to-end pipeline runs DB setup, Jest (coverage), starts Next dev server, executes Playwright, and uploads coverage + HTML reports.

Requirements

- Node 18+
- SQLite available via Prisma’s node driver
- Installed dev dependencies:
  - Jest + @swc/jest stack
  - @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
  - @playwright/test and browsers (Playwright installer)
- Local env vars (see [.env.example](../.env.example)):
  - NEXTAUTH_URL=http://127.0.0.1:4000
  - DATABASE_URL=file:./dev.db (default)

Local Database Setup (seeded data)

- Seed and apply schema (creates dev.db with seed users/challenges):
  - npm run db:setup
- Default seed users:
  - Admin: rizal@example.com / 123456 (role ADMIN)
  - User: icank@example.com / 123456 (role USER)
- See seed contents in [TypeScript.main()](../prisma/seed.ts:6)

Jest Configuration

- Config file: [next-ctfd/jest.config.ts](../jest.config.ts)
  - transform: @swc/jest ESM-compatible transform
  - moduleNameMapper: resolves TS path aliases "@/..." to src
  - projects:
    - unit-jsdom → testEnvironment: jsdom, setupFilesAfterEnv: [next-ctfd/tests/setup/jest.setup.ts](./setup/jest.setup.ts)
    - integration-node → testEnvironment: node, setupFilesAfterEnv: [next-ctfd/tests/setup/jest.integration.setup.ts](./setup/jest.integration.setup.ts)
  - Coverage:
    - collect from src/lib and src/app/api
    - coverageThreshold: branches 50, functions 50, lines 60, statements 60

Running Tests Locally

- Run all Jest tests (unit + integration):
  - npm run test
  - or npm run test:unit
- Run E2E Playwright tests:
  1. Start dev server on 4000:
     - npm run dev -- -p 4000
  2. In another terminal:
     - npm run test:e2e
- Combined (CI-like) local run:
  - npm run test:ci (runs jest --coverage then playwright test; you must have a server on 4000 already or replicate CI steps)

Unit Tests (Client & Utils)

- Location:
  - ./unit/\*\* e.g.:
    - Validations: [TypeScript.suite()](../src/lib/validations/challenge.ts:1), [TypeScript.suite()](../src/lib/validations/submission.ts:1), [TypeScript.suite()](../src/lib/validations/user.ts:1)
    - HTTP helpers: [TypeScript.suite()](../src/lib/utils/http.ts:1)
- RTL Setup:
  - [next-ctfd/tests/setup/jest.setup.ts](./setup/jest.setup.ts) loads @testing-library/jest-dom and mocks next/navigation

Integration Tests (API Routes)

- Location:
  - ./integration/api/\*\*
    - Session: [TypeScript.GET()](../src/app/api/session/route.ts:14) tests at ./integration/api/session.spec.ts
    - Challenges collection: [TypeScript.GET()](../src/app/api/challenges/route.ts:26) tests at ./integration/api/challenges.collection.spec.ts
    - Challenge item: [TypeScript.GET()](../src/app/api/challenges/[id]/route.ts:35) tests at ./integration/api/challenges.item.spec.ts
    - Attempt: [TypeScript.POST()](../src/app/api/challenges/attempt/route.ts:20) tests at ./integration/api/attempt.spec.ts
    - Scoreboard: [TypeScript.GET()](../src/app/api/scoreboard/route.ts:26) tests at ./integration/api/scoreboard.spec.ts
    - Notifications (user/admin):
      - [TypeScript.handlers()](../src/app/api/notifications/route.ts:1), [TypeScript.handlers()](../src/app/api/admin/notifications/route.ts:1) tests at ./integration/api/notifications.spec.ts
- Test Harness & DB:
  - Setup file: [next-ctfd/tests/setup/jest.integration.setup.ts](./setup/jest.integration.setup.ts)
    - Sets DATABASE_URL to file:./dev-test.db if unset
    - Mocks next-auth getServerSession and provides globals:
      - global.setMockSession(userOrNull)
      - global.clearMockSession()
    - Copies dev.db → dev-test.db if the latter does not exist yet (schema bootstrap)
  - Helpers: [next-ctfd/tests/integration/api/utils.ts](./integration/api/utils.ts)
    - resetDb(): wipe rows in FK-safe order
    - seedBasic(): create admin, user, standard and dynamic challenges
    - jsonRequest(), readJson(), makeUrl()
- Running integration tests deterministically:
  - Ensure you have run npm run db:setup at least once to generate dev.db/schema
  - Jest integration runs in node environment and uses its own dev-test.db

End-to-End Tests (Playwright)

- Config: [next-ctfd/playwright.config.ts](../playwright.config.ts)
  - baseURL=http://127.0.0.1:4000
  - projects for chromium, firefox, webkit (chromium OK initially)
  - screenshots/videos/trace on failure; retries=1 on CI
- Suites:
  - ./e2e/auth.spec.ts: Admin login → role ADMIN via /api/session; user login; profile render
  - ./e2e/challenges.spec.ts: Browse /challenges, incorrect and correct attempts, solve count visible
  - ./e2e/admin.spec.ts: Admin guard; CRUD challenge; file upload/delete; scoring update
  - ./e2e/scoreboard.spec.ts: Users/Teams rendering; ?top behavior
  - ./e2e/notifications.spec.ts: Admin broadcast ALL; user sees bell unread count; mark all read
- Running E2E:
  - Start dev server on port 4000: npm run dev -- -p 4000
  - Run: npm run test:e2e
  - Playwright browsers: npx playwright install (CI job does this automatically)

CI Pipeline

- Workflow: [next-ctfd/.github/workflows/ci.yml](../.github/workflows/ci.yml)
  - Node 18 setup and npm ci in next-ctfd
  - Cache npm and Playwright browsers
  - DB setup via npm run db:setup
  - Run Jest with coverage (both unit/integration via projects)
  - Start Next dev server on 4000 (background)
  - Run Playwright tests
  - Upload artifacts:
    - Jest coverage: next-ctfd/coverage/\*\*
    - Playwright report: next-ctfd/playwright-report/\*\*
- Note: CI sets NEXTAUTH_URL=http://127.0.0.1:4000 and uses local SQLite dev.db

Writing New Tests

- Unit (jsdom / components):
  - Import component and test with @testing-library/react; jest-dom matchers available.
  - Provide minimal mocks for Next App Router in [next-ctfd/tests/setup/jest.setup.ts](./setup/jest.setup.ts)
- Integration (API routes):
  - Prefer invoking route handlers directly:
    - e.g. const res = await GET(req) or await POST(req, { params: { id } })
  - Use jsonRequest(), readJson(), and makeUrl() helpers from [next-ctfd/tests/integration/api/utils.ts](./integration/api/utils.ts)
  - Control session:
    - global.setMockSession({ id, email, role }) for authenticated tests
    - global.clearMockSession() to simulate unauthenticated requests
  - Seed data with seedBasic() and ensure resetDb() is called in a beforeAll/beforeEach according to your needs
- E2E:
  - Use baseURL page.goto('/path') as server is already bound to 4000
  - Use test.request for API validation when needed
  - Clean cookies/session between logical auth steps with context.clearCookies()

Troubleshooting

- If integration tests complain about missing tables:
  - Run npm run db:setup once to generate dev.db and apply migrations
  - The integration setup will copy dev.db → dev-test.db automatically if needed
- If Playwright cannot connect:
  - Ensure dev server is running on 127.0.0.1:4000 and NEXTAUTH_URL matches
  - Ensure seed users exist by running npm run db:setup

Key References

- Configs:
  - [next-ctfd/jest.config.ts](../jest.config.ts)
  - [next-ctfd/playwright.config.ts](../playwright.config.ts)
- Setups:
  - [next-ctfd/tests/setup/jest.setup.ts](./setup/jest.setup.ts)
  - [next-ctfd/tests/setup/jest.integration.setup.ts](./setup/jest.integration.setup.ts)
- APIs under test:
  - Session: [TypeScript.GET()](../src/app/api/session/route.ts:14)
  - Challenges (collection): [TypeScript.GET()](../src/app/api/challenges/route.ts:26)
  - Challenges (item): [TypeScript.GET()](../src/app/api/challenges/[id]/route.ts:35)
  - Attempt: [TypeScript.POST()](../src/app/api/challenges/attempt/route.ts:20)
  - Scoreboard: [TypeScript.GET()](../src/app/api/scoreboard/route.ts:26)
  - Notifications (user/admin): [TypeScript.handlers()](../src/app/api/notifications/route.ts:1), [TypeScript.handlers()](../src/app/api/admin/notifications/route.ts:1)
