import {
  type APIRequestContext,
  type Page,
  expect,
  test,
} from '@playwright/test'

test.describe('Feature: Protected Routes', () => {
  test.describe('Unauthenticated redirects', () => {
    test('/en/dashboard redirects unauthenticated users to /en', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/dashboard`)
      await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
    })

    test('/fr/dashboard redirects unauthenticated users to /fr', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/dashboard`)
      await expect(page).toHaveURL(/\/fr$/, { timeout: 10_000 })
    })

    test('/en/goals redirects unauthenticated users', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/goals`)
      await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
    })
  })

  test.describe('Authenticated access', () => {
    test.setTimeout(60_000)

    async function loginAs(
      page: Page,
      request: APIRequestContext,
      baseURL: string | undefined,
      email: string
    ) {
      const password = 'password123'
      await request.post(`${baseURL}/api/auth/register`, {
        data: { email, password, name: 'Protected Route User', locale: 'en' },
      })
      await page.goto(`${baseURL}/en`)
      await page.locator('#login-email').fill(email)
      await page.locator('#login-password').fill(password)
      await page.getByRole('button', { name: /^sign in$/i }).click()
      await page.waitForURL('**/dashboard', { timeout: 30_000 })
    }

    test('authenticated user can access /en/dashboard', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(
        page,
        request,
        baseURL,
        `prot-dash+${Date.now()}@example.com`
      )
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('authenticated user can navigate to /en/goals', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(
        page,
        request,
        baseURL,
        `prot-goals+${Date.now()}@example.com`
      )
      await page.goto(`${(baseURL as string).replace(/\/$/, '')}/en/goals`)
      await expect(page).toHaveURL(/\/goals/, { timeout: 10_000 })
      await expect(
        page.getByRole('heading', { level: 1, name: /goals/i })
      ).toBeVisible()
    })

    test('authenticated user can navigate to /en/shop', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(
        page,
        request,
        baseURL,
        `prot-shop+${Date.now()}@example.com`
      )
      await page.goto(`${(baseURL as string).replace(/\/$/, '')}/en/shop`)
      await expect(page).toHaveURL(/\/shop/, { timeout: 10_000 })
      // Shop is under construction — verify something renders
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test('authenticated user visiting the auth page is redirected to dashboard', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(
        page,
        request,
        baseURL,
        `prot-auth+${Date.now()}@example.com`
      )
      await page.goto(`${baseURL}/en`)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    })
  })
})
