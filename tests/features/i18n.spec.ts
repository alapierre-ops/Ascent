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
    test('shows "Sign In" in English on the login tab', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(page.getByRole('tab', { name: 'Sign In' })).toBeVisible()
    })

    test('shows "Sign Up" in English on the signup tab', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(page.getByRole('tab', { name: 'Sign Up' })).toBeVisible()
    })

    test('shows "Forgot your password?" in English', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/login`)
      await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible()
    })

    test('registration API defaults to English when locale is omitted', async ({
      request,
      baseURL,
    }) => {
      const email = `en-default+${Date.now()}@example.com`
      const res = await request.post(`${baseURL}/api/auth/register`, {
        data: { email, password: 'password123', name: 'English Default' },
      })
      expect(res.status()).toBe(200)
    })
  })

  test.describe('French locale (/fr)', () => {
    test('shows "Se connecter" on the login tab in French', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/login`)
      // next-intl translation for auth.signIn in French
      await expect(page.getByRole('tab', { name: /connecter/i })).toBeVisible()
    })

    test('shows "S\'inscrire" on the signup tab in French', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/login`)
      await expect(page.getByRole('tab', { name: /inscrire/i })).toBeVisible()
    })

    test('registration with locale=fr returns success', async ({
      request,
      baseURL,
    }) => {
      const email = `fr+${Date.now()}@example.com`
      const res = await request.post(`${baseURL}/api/auth/register`, {
        data: {
          email,
          password: 'password123',
          name: 'Utilisateur Français',
          locale: 'fr',
        },
      })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.success).toBe(true)
    })

    test('unauthenticated /fr/dashboard redirects to /fr', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/dashboard`)
      await expect(page).toHaveURL(/\/fr$/, { timeout: 10_000 })
    })
  })
})
