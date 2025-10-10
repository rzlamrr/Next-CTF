import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

test.describe('Scoreboard E2E', () => {
  test('renders users and teams leaderboards and respects ?top param', async ({
    page,
  }) => {
    // Visit scoreboard with explicit top param
    await page.goto('/scoreboard?top=5')
    await page.waitForLoadState('networkidle')

    // Headings visible
    await expect(
      page.getByRole('heading', { name: /scoreboard/i })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /users leaderboard/i })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /teams leaderboard/i })
    ).toBeVisible()

    // There are two tables; verify row counts do not exceed 5 (excluding header)
    const tables = page.locator('table')
    await expect(tables).toHaveCount(2)

    // Users table rows (tbody > tr)
    const usersRows = tables.nth(0).locator('tbody tr')
    const usersCount = await usersRows.count()
    expect(usersCount).toBeLessThanOrEqual(5)

    // Teams table rows
    const teamsRows = tables.nth(1).locator('tbody tr')
    const teamsCount = await teamsRows.count()
    expect(teamsCount).toBeLessThanOrEqual(5)

    // Basic cell content validation: Score column should be numeric
    if (usersCount > 0) {
      // Last cell in first row (score)
      const userScoreCell = usersRows.nth(0).locator('td').last()
      const userScoreText = (await userScoreCell.textContent())?.trim() || ''
      expect(Number.isNaN(Number(userScoreText))).toBeFalsy()
    }

    if (teamsCount > 0) {
      const teamScoreCell = teamsRows.nth(0).locator('td').last()
      const teamScoreText = (await teamScoreCell.textContent())?.trim() || ''
      expect(Number.isNaN(Number(teamScoreText))).toBeFalsy()
    }
  })
})
