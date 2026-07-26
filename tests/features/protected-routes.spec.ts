import { expect, test } from '@playwright/test'

import { loginAsGuest } from '../helpers/auth'

test.describe('Feature: Protected Routes', () => {
  test.describe('Unauthenticated redirects', () => {
    test('/en/dashboard redirects unauthenticated users to /en/login', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/dashboard`)
      await expect(page).toHaveURL(/\/(en|fr)\/login$/, { timeout: 10_000 })
    })

    test('/fr/dashboard redirects unauthenticated users to /fr/login', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/dashboard`)
      await expect(page).toHaveURL(/\/fr\/login$/, { timeout: 10_000 })
    })

    test('/en/goals redirects unauthenticated users to /en/login', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/goals`)
      await expect(page).toHaveURL(/\/(en|fr)\/login$/, { timeout: 10_000 })
    })
  })

  test.describe('Authenticated access', () => {
    test.setTimeout(60_000)

    test('authenticated user can access /en/dashboard', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('authenticated user can navigate to /en/goals', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)
      await page.goto(`${(baseURL as string).replace(/\/$/, '')}/en/goals`)
      await expect(page).toHaveURL(/\/goals/, { timeout: 10_000 })
      await expect(
        page.getByRole('heading', { level: 1, name: /goals/i })
      ).toBeVisible()
    })

    test('authenticated user can navigate to /en/shop', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)
      await page.goto(`${(baseURL as string).replace(/\/$/, '')}/en/shop`)
      await expect(page).toHaveURL(/\/shop/, { timeout: 10_000 })
      // Shop is under construction — verify something renders
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test('authenticated user visiting the auth page is redirected to dashboard', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)
      await page.goto(`${baseURL}/en/login`)
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
    })
  })
})
