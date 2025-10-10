import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function login(page: Page, identifier: string, password: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Username or Email').fill(identifier)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /login/i }).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Notifications flow', () => {
  test('admin broadcast ALL -> user sees bell unread count -> mark all as read', async ({
    page,
    request,
    context,
  }) => {
    // Admin login
    await login(page, 'rizal@example.com', '123456')

    // Admin broadcast to ALL via API
    const title = `Global ${Date.now()}`
    const res = await request.post('/api/admin/notifications', {
      data: {
        title,
        body: 'Broadcast E2E message',
        target: 'ALL',
      },
    })
    expect(res.ok()).toBeTruthy()
    const body = (await res.json()) as {
      success: boolean
      data: { createdCount: number; target: string }
    }
    expect(body.success).toBe(true)
    expect(body.data.target).toBe('ALL')
    expect(body.data.createdCount).toBeGreaterThanOrEqual(1)

    // Clear cookies to logout admin
    await context.clearCookies()

    // User login
    await login(page, 'icank@example.com', '123456')

    // Navigate to a public page expected to include notifications bell (home)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Bell exists with aria-label
    const bell = page.getByRole('button', { name: 'Notifications' })
    await expect(bell).toBeVisible()

    // A badge with unread count should appear (span inside the button, text is a number)
    // Open the list to ensure items are loaded
    await bell.click()

    const list = page.getByRole('menu', { name: /Notifications list/i })
    await expect(list).toBeVisible()

    // Expect at least one item present and possibly our new broadcast title among the first 20
    const itemTitle = page.locator('li >> .font-medium')
    await expect(itemTitle.first()).toBeVisible()

    // "Mark all as read" action present and enabled
    const markButton = page.getByRole('button', { name: /Mark all as read/i })
    await expect(markButton).toBeVisible()
    await expect(markButton).toBeEnabled()

    // Mark as read
    await markButton.click()

    // Close and reopen to refresh local state via component logic
    await bell.click()
    await bell.click()

    // Unread badge should be gone or button disabled
    // The badge is a span with a number; expect it to be hidden now
    const badge = bell.locator('span', { hasText: /\d+/ })
    await expect(badge).toHaveCount(0)
  })
})
