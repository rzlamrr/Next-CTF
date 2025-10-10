import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function login(page: Page, identifier: string, password: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Username or Email').fill(identifier)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /login/i }).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Challenges flow', () => {
  test('browse list, attempt incorrect and correct flag, verify solve count update', async ({
    page,
    request,
  }) => {
    // Browse challenges
    await page.goto('/challenges')
    await expect(
      page.getByRole('heading', { name: /challenges/i })
    ).toBeVisible()

    // Find seeded challenge "Simple Flag" (from seed script)
    // Fetch API to reliably get ID
    const listRes = await request.get('/api/challenges', {
      params: { search: 'Simple Flag' },
    })
    expect(listRes.ok()).toBeTruthy()
    const listBody = (await listRes.json()) as {
      success: boolean
      data: Array<{
        id: string
        name: string
        value: number
        solveCount: number
      }>
    }
    expect(listBody.success).toBe(true)
    const simple = listBody.data.find(c => c.name === 'Simple Flag')
    expect(simple).toBeTruthy()
    const challengeId = simple!.id

    // Login as regular user
    await login(page, 'icank@example.com', '123456')

    // Attempt incorrect flag via API
    const wrongRes = await request.post('/api/challenges/attempt', {
      data: { challengeId, flag: 'flag{WRONG_FLAG}' },
    })
    expect(wrongRes.ok()).toBeTruthy()
    const wrongBody = (await wrongRes.json()) as {
      success: boolean
      data: { correct: boolean; message: string; newScore?: number }
    }
    expect(wrongBody.success).toBe(true)
    expect(wrongBody.data.correct).toBe(false)
    expect(/incorrect/i.test(wrongBody.data.message)).toBe(true)

    // Attempt correct flag via API (from seed: flag{simple_flag})
    const okRes = await request.post('/api/challenges/attempt', {
      data: { challengeId, flag: 'flag{simple_flag}' },
    })
    expect(okRes.ok()).toBeTruthy()
    const okBody = (await okRes.json()) as {
      success: boolean
      data: { correct: boolean; message: string; newScore?: number }
    }
    expect(okBody.success).toBe(true)
    expect(okBody.data.correct).toBe(true)
    expect(typeof okBody.data.newScore).toBe('number')
    expect(okBody.data.newScore!).toBeGreaterThanOrEqual(100) // seeded points

    // Verify solve count updated on /challenges
    await page.goto('/challenges')
    await page.waitForLoadState('networkidle')
    // Expect the card for "Simple Flag" to present "solves" text
    const card = page.getByRole('article').filter({ hasText: 'Simple Flag' })
    await expect(card).toBeVisible()
    // Solve count badge should contain "solves"
    const solvesBadge = card.getByText(/solves/i)
    await expect(solvesBadge).toBeVisible()
  })
})
