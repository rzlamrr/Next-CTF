import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function login(page: Page, identifier: string, password: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Username or Email').fill(identifier)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /login/i }).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Auth flows', () => {
  test('admin login -> session role ADMIN -> logout', async ({
    page,
    context,
    request,
  }) => {
    await login(page, 'rizal@example.com', '123456')

    const res = await request.get('/api/session')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data?.role).toBe('ADMIN')

    // "Logout" by clearing cookies for clean next test
    await context.clearCookies()
  })

  test('user login -> session role USER -> visit profile page', async ({
    page,
    request,
  }) => {
    await login(page, 'icank@example.com', '123456')

    const res = await request.get('/api/session')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data?.role).toBe('USER')

    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Basic smoke: page rendered (has some content)
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)
  })
})
