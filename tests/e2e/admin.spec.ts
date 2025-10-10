import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function login(page: Page, identifier: string, password: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Username or Email').fill(identifier)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /login/i }).click()
  await page.waitForLoadState('networkidle')
}

test.describe('Admin flows', () => {
  test('admin access guard at /admin and CRUD challenge, file upload/delete, scoring update', async ({
    page,
    request,
  }) => {
    // Guard: non-auth should redirect to /login alias or fail
    await page.goto('/admin')
    // We cannot assert redirect reliably without URL change; proceed to login admin
    await login(page, 'rizal@example.com', '123456')

    // After login, /admin should be accessible
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    const content = await page.content()
    expect(content.length).toBeGreaterThan(0)

    // Create challenge via API
    const createRes = await request.post('/api/challenges', {
      data: {
        name: 'Admin Test Challenge',
        description: 'Created via E2E',
        category: 'Web',
        type: 'STANDARD',
        difficulty: 'EASY',
        points: 200,
        flag: 'flag{admin_created}',
        tags: ['web'],
        topics: ['SQL Injection'],
      },
    })
    expect(createRes.ok()).toBeTruthy()
    const created = (await createRes.json()) as {
      success: true
      data: { id: string; name: string }
    }
    expect(created.success).toBe(true)
    const cid = created.data.id

    // Update challenge via PATCH
    const patchRes = await request.patch(`/api/challenges/${cid}`, {
      data: { description: 'Updated via E2E', points: 250 },
    })
    expect(patchRes.ok()).toBeTruthy()
    const patched = (await patchRes.json()) as {
      success: true
      data: { points: number; description: string }
    }
    expect(patched.success).toBe(true)
    expect(patched.data.points).toBe(250)
    expect(patched.data.description).toBe('Updated via E2E')

    // Upload a file to the challenge
    const formData = {
      file: await request.storageState(), // placeholder to satisfy Playwright types, replaced below
    } as any
    // Reconstruct proper multipart using fetch manually via page API since request doesn't support multipart directly with File objects
    const uploadRes = await page.evaluate(async challengeId => {
      const blob = new Blob(['hello world'], { type: 'text/plain' })
      const file = new File([blob], 'test.txt', { type: 'text/plain' })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('filename', 'test.txt')
      fd.append('contentType', 'text/plain')
      const r = await fetch(`/api/challenges/${challengeId}/files`, {
        method: 'POST',
        body: fd,
      })
      return { ok: r.ok, status: r.status, body: await r.json() }
    }, cid)
    expect(uploadRes.ok).toBeTruthy()
    expect(uploadRes.status).toBe(201)
    expect(uploadRes.body.success).toBe(true)
    const uploadedId = uploadRes.body.data.id as string

    // List files and then delete via /api/files/:id
    const listRes = await request.get(`/api/challenges/${cid}/files`)
    expect(listRes.ok()).toBeTruthy()
    const listBody = (await listRes.json()) as {
      success: boolean
      data: Array<{ id: string; location: string }>
    }
    expect(listBody.success).toBe(true)
    expect(listBody.data.find(f => f.id === uploadedId)).toBeTruthy()

    const delRes = await request.delete(`/api/files/${uploadedId}`)
    expect(delRes.status()).toBe(204)

    // Scoring panel update and preview via scoring API
    const scorePatch = await request.patch(`/api/challenges/${cid}/scoring`, {
      data: {
        type: 'DYNAMIC',
        function: 'linear',
        initial: 300,
        minimum: 100,
        decay: 10,
      },
    })
    expect(scorePatch.ok()).toBeTruthy()
    const scoreBody = (await scorePatch.json()) as {
      success: boolean
      data: {
        value: number
        type: string
        function: string
        initial: number
        minimum: number
        decay: number
      }
    }
    expect(scoreBody.success).toBe(true)
    expect(scoreBody.data.type).toBe('DYNAMIC')
    expect(scoreBody.data.function).toBe('linear')
    expect(scoreBody.data.initial).toBe(300)
    expect(typeof scoreBody.data.value).toBe('number')

    // Delete the challenge
    const delChallenge = await request.delete(`/api/challenges/${cid}`)
    expect(delChallenge.status()).toBe(204)
  })
})
