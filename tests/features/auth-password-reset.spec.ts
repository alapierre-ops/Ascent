import { expect, test } from '@playwright/test'

test.describe('Feature: Password Reset', () => {
  test.describe('Step 1 — Request a reset link', () => {
    const ENDPOINT = '/api/auth/request-reset'

    test('rejects an invalid email format', async ({ request, baseURL }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: { email: 'not-an-email', locale: 'en' },
      })

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('VALIDATION_ERROR')
    })

    test('returns success for a non-existent email (anti-enumeration)', async ({
      request,
      baseURL,
    }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: {
          email: `nobody+${Date.now()}@unknown-domain.com`,
          locale: 'en',
        },
      })

      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    test('returns success for a registered email', async ({
      request,
      baseURL,
    }) => {
      const email = `reset+${Date.now()}@example.com`

      await request.post(`${baseURL}/api/auth/register`, {
        data: {
          email,
          password: 'password123',
          name: 'Reset User',
          locale: 'en',
        },
      })

      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: { email, locale: 'en' },
      })

      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    test('returns success with French locale', async ({ request, baseURL }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: { email: `nobody+fr+${Date.now()}@example.com`, locale: 'fr' },
      })

      expect(res.status()).toBe(200)
    })

    test('rejects missing email field', async ({ request, baseURL }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: { locale: 'en' },
      })

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('VALIDATION_ERROR')
    })
  })

  test.describe('Step 2 — Confirm the new password', () => {
    const ENDPOINT = '/api/auth/reset-password'

    test('rejects request with missing token', async ({ request, baseURL }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: { newPassword: 'newpassword123' },
      })

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('VALIDATION_ERROR')
    })

    test('rejects a new password shorter than 6 characters', async ({
      request,
      baseURL,
    }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: { token: 'sometoken', newPassword: '123' },
      })

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('VALIDATION_ERROR')
      expect(body.message).toMatch(/6/)
    })

    test('rejects an unknown reset token', async ({ request, baseURL }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: {
          token: 'thisisanunknowntokenthatdoesnotexist',
          newPassword: 'newpassword123',
        },
      })

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('INVALID_TOKEN')
    })

    test('rejects a request with empty fields', async ({
      request,
      baseURL,
    }) => {
      const res = await request.post(`${baseURL}${ENDPOINT}`, {
        data: {},
      })

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('VALIDATION_ERROR')
    })
  })

  test.describe('End-to-end: reset password UI flow', () => {
    test('forgot password link is visible on the login page', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/login`)
      const link = page.locator('a', { hasText: /forgot/i })
      await expect(link).toBeVisible()
    })

    test('forgot password link points to reset-password page', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/login`)
      const link = page.locator('a', { hasText: /forgot/i })
      const href = await link.getAttribute('href')
      expect(href).toContain('reset-password')
    })
  })
})
