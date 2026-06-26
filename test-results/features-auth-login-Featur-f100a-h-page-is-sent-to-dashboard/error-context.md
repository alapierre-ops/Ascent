# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features\auth-login.spec.ts >> Feature: Login / Sign-up UI >> Session redirect >> authenticated user visiting the auth page is sent to dashboard
- Location: tests\features\auth-login.spec.ts:134:9

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
                                    - text: session+1781562429670@example.com
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
  53  |       await page.goto(`${baseURL}/en`)
  54  |       await page.locator('#login-email').fill('nobody@example.com')
  55  |       await page.locator('#login-password').fill('wrongpassword')
  56  |       await page.getByRole('button', { name: /^sign in$/i }).click()
  57  |
  58  |       await expect(
  59  |         page.locator('[class*="red"]').first()
  60  |       ).toBeVisible({ timeout: 15_000 })
  61  |     })
  62  |
  63  |     test('redirects to dashboard on successful login', async ({
  64  |       request,
  65  |       page,
  66  |       baseURL,
  67  |     }) => {
  68  |       test.setTimeout(60_000)
  69  |
  70  |       const email = `login+${Date.now()}@example.com`
  71  |       const password = 'password123'
  72  |
  73  |       await request.post(`${baseURL}/api/auth/register`, {
  74  |         data: { email, password, name: 'Login User', locale: 'en' },
  75  |       })
  76  |
  77  |       await page.goto(`${baseURL}/en`)
  78  |       await page.locator('#login-email').fill(email)
  79  |       await page.locator('#login-password').fill(password)
  80  |       await page.getByRole('button', { name: /^sign in$/i }).click()
  81  |
  82  |       await page.waitForURL('**/dashboard', { timeout: 30_000 })
  83  |       expect(page.url()).toContain('/dashboard')
  84  |     })
  85  |   })
  86  |
  87  |   test.describe('Sign Up', () => {
  88  |     test('creates an account and redirects to dashboard', async ({
  89  |       page,
  90  |       baseURL,
  91  |     }) => {
  92  |       test.setTimeout(60_000)
  93  |
  94  |       const email = `signup+${Date.now()}@example.com`
  95  |
  96  |       await page.goto(`${baseURL}/en`)
  97  |       await page.getByRole('tab', { name: /sign up/i }).click()
  98  |       await page.locator('#signup-name').fill('New User')
  99  |       await page.locator('#signup-email').fill(email)
  100 |       await page.locator('#signup-password').fill('password123')
  101 |       await page.getByRole('button', { name: /create account/i }).click()
  102 |
  103 |       await page.waitForURL('**/dashboard', { timeout: 30_000 })
  104 |       expect(page.url()).toContain('/dashboard')
  105 |     })
  106 |
  107 |     test('shows an error when registering a duplicate email', async ({
  108 |       request,
  109 |       page,
  110 |       baseURL,
  111 |     }) => {
  112 |       test.setTimeout(30_000)
  113 |
  114 |       const email = `dup+${Date.now()}@example.com`
  115 |
  116 |       await request.post(`${baseURL}/api/auth/register`, {
  117 |         data: { email, password: 'password123', name: 'Existing', locale: 'en' },
  118 |       })
  119 |
  120 |       await page.goto(`${baseURL}/en`)
  121 |       await page.getByRole('tab', { name: /sign up/i }).click()
  122 |       await page.locator('#signup-name').fill('Duplicate')
  123 |       await page.locator('#signup-email').fill(email)
  124 |       await page.locator('#signup-password').fill('password123')
  125 |       await page.getByRole('button', { name: /create account/i }).click()
  126 |
  127 |       await expect(
  128 |         page.locator('[class*="red"]').first()
  129 |       ).toBeVisible({ timeout: 15_000 })
  130 |     })
  131 |   })
  132 |
  133 |   test.describe('Session redirect', () => {
  134 |     test('authenticated user visiting the auth page is sent to dashboard', async ({
  135 |       request,
  136 |       page,
  137 |       baseURL,
  138 |     }) => {
  139 |       test.setTimeout(60_000)
  140 |
  141 |       const email = `session+${Date.now()}@example.com`
  142 |       const password = 'password123'
  143 |
  144 |       await request.post(`${baseURL}/api/auth/register`, {
  145 |         data: { email, password, name: 'Session User', locale: 'en' },
  146 |       })
  147 |
  148 |       // Login
  149 |       await page.goto(`${baseURL}/en`)
  150 |       await page.locator('#login-email').fill(email)
  151 |       await page.locator('#login-password').fill(password)
  152 |       await page.getByRole('button', { name: /^sign in$/i }).click()
> 153 |       await page.waitForURL('**/dashboard', { timeout: 30_000 })
      |                  ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  154 |
  155 |       // Return to auth page — should be redirected to dashboard
  156 |       await page.goto(`${baseURL}/en`)
  157 |       await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
  158 |     })
  159 |   })
  160 | })
  161 |
```
