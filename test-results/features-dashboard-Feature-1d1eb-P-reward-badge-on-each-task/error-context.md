# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features\dashboard.spec.ts >> Feature: Dashboard >> Content >> shows an XP reward badge on each task
- Location: tests\features\dashboard.spec.ts:98:9

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
                                    - text: dash-xp+1781562495437@example.com
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
  3   | // Helper: register a user and log in via the UI
  4   | async function loginAs(
  5   |   page: any,
  6   |   request: any,
  7   |   baseURL: string | undefined,
  8   |   { email, password }: { email: string; password: string }
  9   | ) {
  10  |   await request.post(`${baseURL}/api/auth/register`, {
  11  |     data: { email, password, name: 'Dashboard User', locale: 'en' },
  12  |   })
  13  |   await page.goto(`${baseURL}/en`)
  14  |   await page.locator('#login-email').fill(email)
  15  |   await page.locator('#login-password').fill(password)
  16  |   await page.getByRole('button', { name: /^sign in$/i }).click()
> 17  |   await page.waitForURL('**/dashboard', { timeout: 30_000 })
      |              ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  18  | }
  19  |
  20  | test.describe('Feature: Dashboard', () => {
  21  |   test.describe('Access control', () => {
  22  |     test('unauthenticated user is redirected to the login page', async ({
  23  |       page,
  24  |       baseURL,
  25  |     }) => {
  26  |       await page.goto(`${baseURL}/en/dashboard`)
  27  |       await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
  28  |     })
  29  |
  30  |     test('unauthenticated user hitting /fr/dashboard is redirected', async ({
  31  |       page,
  32  |       baseURL,
  33  |     }) => {
  34  |       await page.goto(`${baseURL}/fr/dashboard`)
  35  |       await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
  36  |     })
  37  |   })
  38  |
  39  |   test.describe('Content', () => {
  40  |     test.setTimeout(60_000)
  41  |
  42  |     test('shows the level indicator in the player bar', async ({
  43  |       page,
  44  |       request,
  45  |       baseURL,
  46  |     }) => {
  47  |       await loginAs(page, request, baseURL, {
  48  |         email: `dash-level+${Date.now()}@example.com`,
  49  |         password: 'password123',
  50  |       })
  51  |
  52  |       // The mock data has level 12 — verify a number is displayed
  53  |       const levelButton = page.locator('button').filter({ hasText: '12' }).first()
  54  |       await expect(levelButton).toBeVisible({ timeout: 10_000 })
  55  |     })
  56  |
  57  |     test('shows the streak count in the player bar', async ({
  58  |       page,
  59  |       request,
  60  |       baseURL,
  61  |     }) => {
  62  |       await loginAs(page, request, baseURL, {
  63  |         email: `dash-streak+${Date.now()}@example.com`,
  64  |         password: 'password123',
  65  |       })
  66  |
  67  |       // Mock data: first streak is 3 days
  68  |       const streakButton = page.locator('button').filter({ hasText: '3' }).first()
  69  |       await expect(streakButton).toBeVisible({ timeout: 10_000 })
  70  |     })
  71  |
  72  |     test("shows the user's gold balance in the player bar", async ({
  73  |       page,
  74  |       request,
  75  |       baseURL,
  76  |     }) => {
  77  |       await loginAs(page, request, baseURL, {
  78  |         email: `dash-gold+${Date.now()}@example.com`,
  79  |         password: 'password123',
  80  |       })
  81  |
  82  |       // Mock data: gold = 3200 — formatted as "3,200"
  83  |       await expect(page.getByText('3,200')).toBeVisible({ timeout: 10_000 })
  84  |     })
  85  |
  86  |     test("shows today's tasks list", async ({ page, request, baseURL }) => {
  87  |       await loginAs(page, request, baseURL, {
  88  |         email: `dash-tasks+${Date.now()}@example.com`,
  89  |         password: 'password123',
  90  |       })
  91  |
  92  |       // Mock data includes "Hydrate: 8 glasses"
  93  |       await expect(
  94  |         page.getByText('Hydrate: 8 glasses')
  95  |       ).toBeVisible({ timeout: 10_000 })
  96  |     })
  97  |
  98  |     test('shows an XP reward badge on each task', async ({
  99  |       page,
  100 |       request,
  101 |       baseURL,
  102 |     }) => {
  103 |       await loginAs(page, request, baseURL, {
  104 |         email: `dash-xp+${Date.now()}@example.com`,
  105 |         password: 'password123',
  106 |       })
  107 |
  108 |       // Mock data: first task rewards +20 XP
  109 |       await expect(page.getByText('+20 XP')).toBeVisible({ timeout: 10_000 })
  110 |     })
  111 |
  112 |     test('marks overdue tasks with a visual indicator', async ({
  113 |       page,
  114 |       request,
  115 |       baseURL,
  116 |     }) => {
  117 |       await loginAs(page, request, baseURL, {
```
