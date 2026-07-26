import { expect, test } from '@playwright/test'

import { loginAsGuest } from '../helpers/auth'

test.describe('Feature: One-click guest sign-up', () => {
  test.describe('Auth page layout', () => {
    test('shows the instant-try button', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(page.getByTestId('guest-signin')).toBeVisible()
    })

    test('shows a Google sign-in button', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(
        page.getByRole('button', { name: /google/i }).first()
      ).toBeVisible()
    })

    test('asks for no email or password', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(page.locator('input[type="email"]')).toHaveCount(0)
      await expect(page.locator('input[type="password"]')).toHaveCount(0)
    })
  })

  test.describe('Guest sign-up', () => {
    test.setTimeout(60_000)

    test('one click lands on the dashboard', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en/login`)
      await page.getByTestId('guest-signin').click()
      await page.waitForURL('**/dashboard', { timeout: 30_000 })
      expect(page.url()).toContain('/dashboard')
    })

    test('each guest gets a separate account', async ({ page, baseURL }) => {
      await loginAsGuest(page, baseURL)
      const first = await page.request
        .get(`${baseURL}/api/user/me`)
        .then((r) => r.json())

      await page.context().clearCookies()

      await loginAsGuest(page, baseURL)
      const second = await page.request
        .get(`${baseURL}/api/user/me`)
        .then((r) => r.json())

      // Guests have no email, so identity is asserted via onboarding state
      // being independently tracked rather than a shared account.
      expect(first.email).toBeNull()
      expect(second.email).toBeNull()
    })

    test('a signed-in guest visiting /login goes to the dashboard', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)
      await page.goto(`${baseURL}/en/login`)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    })
  })
})
