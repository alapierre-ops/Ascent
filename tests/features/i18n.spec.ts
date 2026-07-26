import { expect, test } from '@playwright/test'

test.describe('Feature: Internationalisation (i18n)', () => {
  test.describe('Locale routing', () => {
    test('root / redirects to /en', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/`)
      await expect(page).toHaveURL(/\/(en|fr)/, { timeout: 10_000 })
    })

    test('/en serves the English auth page', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en`)
      expect(page.url()).toContain('/en')
    })

    test('/fr serves the French auth page', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/fr`)
      expect(page.url()).toContain('/fr')
    })
  })

  test.describe('English locale (/en)', () => {
    test('shows the guest call to action in English', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(page.getByTestId('guest-signin')).toHaveText(
        /try it instantly/i
      )
    })

    test('shows the Google button in English', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(
        page.getByRole('button', { name: /continue with google/i })
      ).toBeVisible()
    })

    test('unauthenticated /en/dashboard redirects to /en/login', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/dashboard`)
      await expect(page).toHaveURL(/\/en\/login$/, { timeout: 10_000 })
    })
  })

  test.describe('French locale (/fr)', () => {
    test('shows the guest call to action in French', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/login`)
      await expect(page.getByTestId('guest-signin')).toHaveText(
        /essayer tout de suite/i
      )
    })

    test('shows the Google button in French', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/fr/login`)
      await expect(
        page.getByRole('button', { name: /continuer avec google/i })
      ).toBeVisible()
    })

    test('unauthenticated /fr/dashboard redirects to /fr/login', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/dashboard`)
      await expect(page).toHaveURL(/\/fr\/login$/, { timeout: 10_000 })
    })
  })
})
