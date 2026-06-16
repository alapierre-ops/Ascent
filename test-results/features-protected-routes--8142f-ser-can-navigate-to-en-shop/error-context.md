# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features\protected-routes.spec.ts >> Feature: Protected Routes >> Authenticated access >> authenticated user can navigate to /en/shop
- Location: tests\features\protected-routes.spec.ts:80:9

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - generic [ref=e3]:
        - generic [ref=e4]:
            - generic [ref=e5]:
                - generic [ref=e6]:
                    - generic [ref=e7]:
                        - img [ref=e8]
                        - img [ref=e11]
                    - heading "Ascent" [level=1] [ref=e14]
                - paragraph [ref=e15]: Turn self-improvement into a measurable, gamified experience.
                - paragraph [ref=e16]: Track goals, build habits, and level up your life with XP-based progress tracking.
            - generic [ref=e17]:
                - generic [ref=e18]:
                    - img [ref=e19]
                    - heading "Set Goals" [level=3] [ref=e23]
                    - paragraph [ref=e24]: Create personal objectives across fitness, learning, and productivity.
                - generic [ref=e25]:
                    - img [ref=e26]
                    - heading "Earn XP" [level=3] [ref=e28]
                    - paragraph [ref=e29]: Complete tasks and earn experience points to track your progress.
                - generic [ref=e30]:
                    - img [ref=e31]
                    - heading "Track Streaks" [level=3] [ref=e34]
                    - paragraph [ref=e35]: Build consistency with streak counters and real-time progress charts.
                - generic [ref=e36]:
                    - img [ref=e37]
                    - heading "Visualize" [level=3] [ref=e40]
                    - paragraph [ref=e41]: See your growth with beautiful charts and dynamic feedback.
        - generic [ref=e43]:
            - generic [ref=e44]:
                - generic [ref=e45]: Welcome to Ascent
                - generic [ref=e46]: Start your journey of continuous improvement
            - generic [ref=e47]:
                - generic [ref=e48]: Invalid email or password
                - generic [ref=e49]:
                    - tablist [ref=e50]:
                        - tab "Sign In" [selected] [ref=e51]
                        - tab "Sign Up" [ref=e52]
                    - tabpanel "Sign In" [ref=e53]:
                        - generic [ref=e54]:
                            - generic [ref=e55]:
                                - generic [ref=e56]: Email
                                - textbox "Email" [ref=e57]:
                                    - /placeholder: you@example.com
                                    - text: prot-shop+1781562428673@example.com
                            - generic [ref=e58]:
                                - generic [ref=e59]:
                                    - generic [ref=e60]: Password
                                    - link "Forgot password?" [ref=e61] [cursor=pointer]:
                                        - /url: /en/reset-password
                                - textbox "Password" [ref=e62]:
                                    - /placeholder: ••••••••
                                    - text: password123
                            - button "Sign In" [ref=e63] [cursor=pointer]
                        - generic [ref=e68]: Or continue with
                        - button "Continue with Google" [ref=e69] [cursor=pointer]:
                            - img
                            - text: Continue with Google
    - button "Open Next.js Dev Tools" [ref=e75] [cursor=pointer]:
        - img [ref=e76]
    - alert [ref=e79]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   |
  3   | test.describe('Feature: Protected Routes', () => {
  4   |   test.describe('Unauthenticated redirects', () => {
  5   |     test('/en/dashboard redirects unauthenticated users to /en', async ({
  6   |       page,
  7   |       baseURL,
  8   |     }) => {
  9   |       await page.goto(`${baseURL}/en/dashboard`)
  10  |       await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
  11  |     })
  12  |
  13  |     test('/fr/dashboard redirects unauthenticated users to /fr', async ({
  14  |       page,
  15  |       baseURL,
  16  |     }) => {
  17  |       await page.goto(`${baseURL}/fr/dashboard`)
  18  |       await expect(page).toHaveURL(/\/fr$/, { timeout: 10_000 })
  19  |     })
  20  |
  21  |     test('/en/goals redirects unauthenticated users', async ({
  22  |       page,
  23  |       baseURL,
  24  |     }) => {
  25  |       await page.goto(`${baseURL}/en/goals`)
  26  |       await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
  27  |     })
  28  |   })
  29  |
  30  |   test.describe('Authenticated access', () => {
  31  |     test.setTimeout(60_000)
  32  |
  33  |     async function loginAs(
  34  |       page: any,
  35  |       request: any,
  36  |       baseURL: string | undefined,
  37  |       email: string
  38  |     ) {
  39  |       const password = 'password123'
  40  |       await request.post(`${baseURL}/api/auth/register`, {
  41  |         data: { email, password, name: 'Protected Route User', locale: 'en' },
  42  |       })
  43  |       await page.goto(`${baseURL}/en`)
  44  |       await page.locator('#login-email').fill(email)
  45  |       await page.locator('#login-password').fill(password)
  46  |       await page.getByRole('button', { name: /^sign in$/i }).click()
> 47  |       await page.waitForURL('**/dashboard', { timeout: 30_000 })
      |                  ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  48  |     }
  49  |
  50  |     test('authenticated user can access /en/dashboard', async ({
  51  |       page,
  52  |       request,
  53  |       baseURL,
  54  |     }) => {
  55  |       await loginAs(
  56  |         page,
  57  |         request,
  58  |         baseURL,
  59  |         `prot-dash+${Date.now()}@example.com`
  60  |       )
  61  |       await expect(page).toHaveURL(/\/dashboard/)
  62  |     })
  63  |
  64  |     test('authenticated user can navigate to /en/goals', async ({
  65  |       page,
  66  |       request,
  67  |       baseURL,
  68  |     }) => {
  69  |       await loginAs(
  70  |         page,
  71  |         request,
  72  |         baseURL,
  73  |         `prot-goals+${Date.now()}@example.com`
  74  |       )
  75  |       await page.goto(`${(baseURL as string).replace(/\/$/, '')}/en/goals`)
  76  |       await expect(page).toHaveURL(/\/goals/, { timeout: 10_000 })
  77  |       await expect(page.getByRole('heading', { name: /goals/i })).toBeVisible()
  78  |     })
  79  |
  80  |     test('authenticated user can navigate to /en/shop', async ({
  81  |       page,
  82  |       request,
  83  |       baseURL,
  84  |     }) => {
  85  |       await loginAs(
  86  |         page,
  87  |         request,
  88  |         baseURL,
  89  |         `prot-shop+${Date.now()}@example.com`
  90  |       )
  91  |       await page.goto(`${(baseURL as string).replace(/\/$/, '')}/en/shop`)
  92  |       await expect(page).toHaveURL(/\/shop/, { timeout: 10_000 })
  93  |       // Shop is under construction — verify something renders
  94  |       await expect(page.locator('h1').first()).toBeVisible()
  95  |     })
  96  |
  97  |     test('authenticated user visiting the auth page is redirected to dashboard', async ({
  98  |       page,
  99  |       request,
  100 |       baseURL,
  101 |     }) => {
  102 |       await loginAs(
  103 |         page,
  104 |         request,
  105 |         baseURL,
  106 |         `prot-auth+${Date.now()}@example.com`
  107 |       )
  108 |       await page.goto(`${baseURL}/en`)
  109 |       await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
  110 |     })
  111 |   })
  112 | })
  113 |
```
