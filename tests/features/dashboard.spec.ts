import {
  type APIRequestContext,
  type Page,
  expect,
  test,
} from '@playwright/test'

// Helper: register a user and log in via the UI
async function loginAs(
  page: Page,
  request: APIRequestContext,
  baseURL: string | undefined,
  { email, password }: { email: string; password: string }
) {
  await request.post(`${baseURL}/api/auth/register`, {
    data: { email, password, locale: 'en' },
  })
  await page.goto(`${baseURL}/en`)
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.waitForURL('**/dashboard', { timeout: 30_000 })
  // New accounts start the onboarding tour, whose overlay blocks clicks
  // on the dashboard — skip it so tests can interact with the page.
  await page.request.patch(`${baseURL}/api/user/me`, {
    data: { onboardingCompleted: true },
  })
  // The starter mission pack is opt-in (empty state button), not seeded
  // automatically — apply it so the task list has content to assert on.
  await page.request.post(`${baseURL}/api/missions/templates/starter`)
  await page.reload()
}

test.describe('Feature: Dashboard', () => {
  test.describe('Access control', () => {
    test('unauthenticated user is redirected to the login page', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/dashboard`)
      await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
    })

    test('unauthenticated user hitting /fr/dashboard is redirected', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/dashboard`)
      await expect(page).toHaveURL(/\/(en|fr)$/, { timeout: 10_000 })
    })
  })

  test.describe('Content', () => {
    test.setTimeout(60_000)

    test('shows the level indicator in the player bar', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-level+${Date.now()}@example.com`,
        password: 'password123',
      })

      // The mock data has level 12 — verify a number is displayed
      const levelButton = page
        .locator('button')
        .filter({ hasText: '12' })
        .first()
      await expect(levelButton).toBeVisible({ timeout: 10_000 })
    })

    test('shows the streak count in the player bar', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-streak+${Date.now()}@example.com`,
        password: 'password123',
      })

      // A freshly registered user has no completed missions yet
      const streakButton = page.locator('[data-onboarding="streak"]')
      await expect(streakButton).toBeVisible({ timeout: 10_000 })
      await expect(streakButton).toContainText('0')
    })

    test("shows the user's gold balance in the player bar", async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-gold+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Mock data: gold = 3200 — formatted as "3,200"
      await expect(page.getByText('3,200')).toBeVisible({ timeout: 10_000 })
    })

    test("shows today's tasks list", async ({ page, request, baseURL }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-tasks+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Starter mission template seeded for new users
      await expect(page.getByText('Hydrate (8 glasses)')).toBeVisible({
        timeout: 10_000,
      })
    })

    test('shows an XP reward badge on each task', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-xp+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Mock data: first task rewards +20 XP
      await expect(page.getByText('+20 XP')).toBeVisible({ timeout: 10_000 })
    })

    test('marks overdue tasks with a visual indicator', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-overdue+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Create a goal due in the past so the dashboard renders it as overdue
      await page.request.post(`${baseURL}/api/missions`, {
        data: {
          title: 'Ship landing page redesign',
          category: 'Productivity',
          type: 'GOAL',
          xp: 150,
          dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      })
      await page.reload()

      await expect(page.getByText('Ship landing page redesign')).toBeVisible({
        timeout: 10_000,
      })
      await expect(page.getByText(/overdue/i).first()).toBeVisible()
    })
  })

  test.describe('Interactions', () => {
    test.setTimeout(60_000)

    test('opens the levels dialog when clicking the level button', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-levels+${Date.now()}@example.com`,
        password: 'password123',
      })

      await page.locator('[data-onboarding="level"]').click()
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    })

    test('avatar picker opens when clicking the avatar', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-avatar+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Avatar button has aria-label containing the user's name welcome message
      const avatarBtn = page.locator('button[aria-label]').first()
      await avatarBtn.click()
      // Avatar picker dialog should open
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    })
  })

  test.describe('Navigation', () => {
    test.setTimeout(60_000)

    test('gold link navigates to the shop', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `dash-nav+${Date.now()}@example.com`,
        password: 'password123',
      })

      await page.getByRole('link', { name: /3,200/i }).click()
      await expect(page).toHaveURL(/\/shop/, { timeout: 10_000 })
    })
  })
})
