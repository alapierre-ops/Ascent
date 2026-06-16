# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features\i18n.spec.ts >> Feature: Internationalisation (i18n) >> English locale (/en) >> registration API defaults to English when locale is omitted
- Location: tests\features\i18n.spec.ts:50:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   |
  3   | test.describe('Feature: Internationalisation (i18n)', () => {
  4   |   test.describe('Locale routing', () => {
  5   |     test('root / redirects to /en', async ({ page, baseURL }) => {
  6   |       await page.goto(`${baseURL}/`)
  7   |       await expect(page).toHaveURL(/\/(en|fr)/, { timeout: 10_000 })
  8   |     })
  9   |
  10  |     test('/en serves the English auth page', async ({ page, baseURL }) => {
  11  |       await page.goto(`${baseURL}/en`)
  12  |       expect(page.url()).toContain('/en')
  13  |     })
  14  |
  15  |     test('/fr serves the French auth page', async ({ page, baseURL }) => {
  16  |       await page.goto(`${baseURL}/fr`)
  17  |       expect(page.url()).toContain('/fr')
  18  |     })
  19  |   })
  20  |
  21  |   test.describe('English locale (/en)', () => {
  22  |     test('shows "Sign In" in English on the login tab', async ({
  23  |       page,
  24  |       baseURL,
  25  |     }) => {
  26  |       await page.goto(`${baseURL}/en`)
  27  |       await expect(
  28  |         page.getByRole('tab', { name: 'Sign In' })
  29  |       ).toBeVisible()
  30  |     })
  31  |
  32  |     test('shows "Sign Up" in English on the signup tab', async ({
  33  |       page,
  34  |       baseURL,
  35  |     }) => {
  36  |       await page.goto(`${baseURL}/en`)
  37  |       await expect(
  38  |         page.getByRole('tab', { name: 'Sign Up' })
  39  |       ).toBeVisible()
  40  |     })
  41  |
  42  |     test('shows "Forgot your password?" in English', async ({
  43  |       page,
  44  |       baseURL,
  45  |     }) => {
  46  |       await page.goto(`${baseURL}/en`)
  47  |       await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible()
  48  |     })
  49  |
  50  |     test('registration API defaults to English when locale is omitted', async ({
  51  |       request,
  52  |       baseURL,
  53  |     }) => {
  54  |       const email = `en-default+${Date.now()}@example.com`
  55  |       const res = await request.post(`${baseURL}/api/auth/register`, {
  56  |         data: { email, password: 'password123', name: 'English Default' },
  57  |       })
> 58  |       expect(res.status()).toBe(200)
      |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  59  |     })
  60  |   })
  61  |
  62  |   test.describe('French locale (/fr)', () => {
  63  |     test('shows "Se connecter" on the login tab in French', async ({
  64  |       page,
  65  |       baseURL,
  66  |     }) => {
  67  |       await page.goto(`${baseURL}/fr`)
  68  |       // next-intl translation for auth.signIn in French
  69  |       await expect(
  70  |         page.getByRole('tab', { name: /connecter/i })
  71  |       ).toBeVisible()
  72  |     })
  73  |
  74  |     test('shows "S\'inscrire" on the signup tab in French', async ({
  75  |       page,
  76  |       baseURL,
  77  |     }) => {
  78  |       await page.goto(`${baseURL}/fr`)
  79  |       await expect(
  80  |         page.getByRole('tab', { name: /inscrire/i })
  81  |       ).toBeVisible()
  82  |     })
  83  |
  84  |     test('registration with locale=fr returns success', async ({
  85  |       request,
  86  |       baseURL,
  87  |     }) => {
  88  |       const email = `fr+${Date.now()}@example.com`
  89  |       const res = await request.post(`${baseURL}/api/auth/register`, {
  90  |         data: {
  91  |           email,
  92  |           password: 'password123',
  93  |           name: 'Utilisateur Français',
  94  |           locale: 'fr',
  95  |         },
  96  |       })
  97  |       expect(res.status()).toBe(200)
  98  |       const body = await res.json()
  99  |       expect(body.success).toBe(true)
  100 |     })
  101 |
  102 |     test('unauthenticated /fr/dashboard redirects to /fr', async ({
  103 |       page,
  104 |       baseURL,
  105 |     }) => {
  106 |       await page.goto(`${baseURL}/fr/dashboard`)
  107 |       await expect(page).toHaveURL(/\/fr$/, { timeout: 10_000 })
  108 |     })
  109 |   })
  110 | })
  111 |
```
