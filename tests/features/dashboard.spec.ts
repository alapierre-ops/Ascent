import { type Page, expect, test } from '@playwright/test'

import { loginAsGuest } from '../helpers/auth'

// Create a mission directly via the API. The starter mission pack
// (`/api/missions/templates/starter`) is unreliable here: the dashboard's
// own "daily login" mission is created as a side effect of mounting, and it
// races with this seeding call — whichever wins, the starter pack sees an
// existing mission for today and silently skips seeding.
async function createMission(
  page: Page,
  baseURL: string | undefined,
  data: {
    title: string
    category: string
    type: 'HABIT' | 'GOAL'
    xp: number
    dueAt: string
  }
) {
  const res = await page.request.post(`${baseURL}/api/missions`, { data })
  if (!res.ok()) {
    throw new Error(
      `Failed to create mission: ${res.status()} ${await res.text()}`
    )
  }
  return res.json()
}

// Builds an ISO timestamp within "today" (UTC), the window the dashboard
// and the missions API both use to decide what counts as due today.
function todayAt(minutesFromMidnightUTC: number): string {
  const now = new Date()
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  date.setUTCMinutes(date.getUTCMinutes() + minutesFromMidnightUTC)
  return date.toISOString()
}

test.describe('Feature: Dashboard', () => {
  test.describe('Access control', () => {
    test('unauthenticated user is redirected to the login page', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/en/dashboard`)
      await expect(page).toHaveURL(/\/(en|fr)\/login$/, { timeout: 10_000 })
    })

    test('unauthenticated user hitting /fr/dashboard is redirected', async ({
      page,
      baseURL,
    }) => {
      await page.goto(`${baseURL}/fr/dashboard`)
      await expect(page).toHaveURL(/\/(en|fr)\/login$/, { timeout: 10_000 })
    })
  })

  test.describe('Content', () => {
    test.setTimeout(60_000)

    test('shows the level indicator in the player bar', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)

      await expect(page.locator('[data-onboarding="level"]')).toBeVisible({
        timeout: 10_000,
      })
    })

    test('shows the streak count in the player bar', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)

      // A freshly registered user has no completed missions yet
      const streakButton = page.locator('[data-onboarding="streak"]')
      await expect(streakButton).toBeVisible({ timeout: 10_000 })
      await expect(streakButton).toContainText('0')
    })

    test("shows the user's gold balance in the player bar", async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)

      await expect(page.locator('[data-onboarding="gold"]')).toBeVisible({
        timeout: 10_000,
      })
    })

    test("shows today's tasks list", async ({ page, baseURL }) => {
      await loginAsGuest(page, baseURL)

      await createMission(page, baseURL, {
        title: 'Hydrate (8 glasses)',
        category: 'Health',
        type: 'HABIT',
        xp: 20,
        dueAt: todayAt(8 * 60),
      })
      await page.reload()

      await expect(page.getByText('Hydrate (8 glasses)')).toBeVisible({
        timeout: 10_000,
      })
    })

    test('shows an XP reward badge on each task', async ({ page, baseURL }) => {
      await loginAsGuest(page, baseURL)

      const hydrate = await createMission(page, baseURL, {
        title: 'Hydrate (8 glasses)',
        category: 'Health',
        type: 'HABIT',
        xp: 20,
        dueAt: todayAt(8 * 60),
      })
      await page.reload()

      await expect(
        page.locator(`[data-mission-id="${hydrate.id}"]`)
      ).toContainText('+20 XP')
    })

    test('marks overdue tasks with a visual indicator', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)

      // Only an uncompleted one-off carried over from a *previous* day counts
      // as overdue (see isCarriedOneOff on the dashboard) — a goal due earlier
      // the same day does not. POST /api/missions ignores the dueAt we send and
      // always schedules for today, so the mission has to be backdated with a
      // follow-up PATCH, which does honour dueAt.
      const stale = await createMission(page, baseURL, {
        title: 'Ship landing page redesign',
        category: 'Productivity',
        type: 'GOAL',
        xp: 150,
        dueAt: todayAt(12 * 60),
      })
      const backdate = await page.request.patch(
        `${baseURL}/api/missions/${stale.id}`,
        { data: { dueAt: todayAt(-12 * 60) } }
      )
      if (!backdate.ok()) {
        throw new Error(`Failed to backdate mission: ${backdate.status()}`)
      }
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
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)

      await page.locator('[data-onboarding="level"]').click()
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    })

    test('avatar picker opens when clicking the avatar', async ({
      page,
      baseURL,
    }) => {
      await loginAsGuest(page, baseURL)

      // Avatar button has aria-label containing the user's name welcome message
      const avatarBtn = page.locator('button[aria-label]').first()
      await avatarBtn.click()
      // Avatar picker dialog should open
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    })
  })

  test.describe('Navigation', () => {
    test.setTimeout(60_000)

    test('gold link navigates to the shop', async ({ page, baseURL }) => {
      await loginAsGuest(page, baseURL)

      await page.locator('[data-onboarding="gold"]').click()
      await expect(page).toHaveURL(/\/shop/, { timeout: 10_000 })
    })
  })
})
