import { expect, test } from '@playwright/test'

test.describe('Feature: Login / Sign-up UI', () => {
  test.describe('Auth page layout', () => {
    test('shows Sign In and Sign Up tabs', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en`)
      await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible()
      await expect(page.getByRole('tab', { name: /sign up/i })).toBeVisible()
    })

    test('Sign In tab has email and password inputs', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en`)
      await expect(page.locator('#login-email')).toBeVisible()
      await expect(page.locator('#login-password')).toBeVisible()
    })

    test('Sign Up tab has name, email and password inputs', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en`)
      await page.getByRole('tab', { name: /sign up/i }).click()
      await expect(page.locator('#signup-name')).toBeVisible()
      await expect(page.locator('#signup-email')).toBeVisible()
      await expect(page.locator('#signup-password')).toBeVisible()
    })

    test('shows a Google sign-in button', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en`)
      await expect(
        page.getByRole('button', { name: /google/i }).first()
      ).toBeVisible()
    })

    test('shows a forgot password link', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en`)
      await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible()
    })
  })

  test.describe('Sign In', () => {
    test('shows an error when credentials are invalid', async ({
      page,
      baseURL,
    }) => {
      test.setTimeout(30_000)

      await page.goto(`${baseURL}/en`)
      await page.locator('#login-email').fill('nobody@example.com')
      await page.locator('#login-password').fill('wrongpassword')
      await page.getByRole('button', { name: /^sign in$/i }).click()

      await expect(page.locator('[class*="red"]').first()).toBeVisible({
        timeout: 15_000,
      })
    })

    test('redirects to dashboard on successful login', async ({
      request,
      page,
      baseURL,
    }) => {
      test.setTimeout(60_000)

      const email = `login+${Date.now()}@example.com`
      const password = 'password123'

      await request.post(`${baseURL}/api/auth/register`, {
        data: { email, password, name: 'Login User', locale: 'en' },
      })

      await page.goto(`${baseURL}/en`)
      await page.locator('#login-email').fill(email)
      await page.locator('#login-password').fill(password)
      await page.getByRole('button', { name: /^sign in$/i }).click()

      await page.waitForURL('**/dashboard', { timeout: 30_000 })
      expect(page.url()).toContain('/dashboard')
    })
  })

  test.describe('Sign Up', () => {
    test('creates an account and redirects to dashboard', async ({
      page,
      baseURL,
    }) => {
      test.setTimeout(60_000)

      const email = `signup+${Date.now()}@example.com`

      await page.goto(`${baseURL}/en`)
      await page.getByRole('tab', { name: /sign up/i }).click()
      await page.locator('#signup-name').fill('New User')
      await page.locator('#signup-email').fill(email)
      await page.locator('#signup-password').fill('password123')
      await page.getByRole('button', { name: /create account/i }).click()

      await page.waitForURL('**/dashboard', { timeout: 30_000 })
      expect(page.url()).toContain('/dashboard')
    })

    test('shows an error when registering a duplicate email', async ({
      request,
      page,
      baseURL,
    }) => {
      test.setTimeout(30_000)

      const email = `dup+${Date.now()}@example.com`

      await request.post(`${baseURL}/api/auth/register`, {
        data: {
          email,
          password: 'password123',
          name: 'Existing',
          locale: 'en',
        },
      })

      await page.goto(`${baseURL}/en`)
      await page.getByRole('tab', { name: /sign up/i }).click()
      await page.locator('#signup-name').fill('Duplicate')
      await page.locator('#signup-email').fill(email)
      await page.locator('#signup-password').fill('password123')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.locator('[class*="red"]').first()).toBeVisible({
        timeout: 15_000,
      })
    })
  })

  test.describe('Session redirect', () => {
    test('authenticated user visiting the auth page is sent to dashboard', async ({
      request,
      page,
      baseURL,
    }) => {
      test.setTimeout(60_000)

      const email = `session+${Date.now()}@example.com`
      const password = 'password123'

      await request.post(`${baseURL}/api/auth/register`, {
        data: { email, password, name: 'Session User', locale: 'en' },
      })

      // Login
      await page.goto(`${baseURL}/en`)
      await page.locator('#login-email').fill(email)
      await page.locator('#login-password').fill(password)
      await page.getByRole('button', { name: /^sign in$/i }).click()
      await page.waitForURL('**/dashboard', { timeout: 30_000 })

      // Return to auth page — should be redirected to dashboard
      await page.goto(`${baseURL}/en`)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    })
  })
})
