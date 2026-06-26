import {
  type APIRequestContext,
  type Page,
  expect,
  test,
} from '@playwright/test'

async function loginAs(
  page: Page,
  request: APIRequestContext,
  baseURL: string | undefined,
  { email, password }: { email: string; password: string }
) {
  await request.post(`${baseURL}/api/auth/register`, {
    data: { email, password, locale: 'en' },
  })
  await page.goto(`${baseURL}/en/login`)
  await page.locator('#login-email').fill(email)
  await page.locator('#login-password').fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.waitForURL('**/dashboard', { timeout: 30_000 })
  await page.request.patch(`${baseURL}/api/user/me`, {
    data: { onboardingCompleted: true },
  })
  await page.reload()
}

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

function todayAt(minutesFromMidnightUTC: number): string {
  const now = new Date()
  const date = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  date.setUTCMinutes(date.getUTCMinutes() + minutesFromMidnightUTC)
  return date.toISOString()
}

test.describe('Feature: Mission Completion', () => {
  test.describe('API — XP rewards', () => {
    test.setTimeout(60_000)

    test('completing a mission returns status COMPLETED and awards XP', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `complete-xp+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Morning run',
        category: 'Health',
        type: 'HABIT',
        xp: 20,
        dueAt: todayAt(8 * 60),
      })

      const beforeRes = await page.request.get(`${baseURL}/api/user/me`)
      const before = await beforeRes.json()

      const res = await page.request.patch(
        `${baseURL}/api/missions/${mission.id}`,
        { data: { status: 'COMPLETED' } }
      )
      expect(res.ok()).toBe(true)

      const body = await res.json()
      expect(body.status).toBe('COMPLETED')
      // A brand-new user has no streak, so effectiveXp equals the base xp
      expect(body.effectiveXp).toBe(20)
      expect(body.user.xp).toBe(before.xp + 20)
    })

    test('XP gain is reflected in /api/user/me after completion', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `complete-me+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Read 20 pages',
        category: 'Learning',
        type: 'HABIT',
        xp: 30,
        dueAt: todayAt(9 * 60),
      })

      const beforeRes = await page.request.get(`${baseURL}/api/user/me`)
      const before = await beforeRes.json()

      await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
        data: { status: 'COMPLETED' },
      })

      const afterRes = await page.request.get(`${baseURL}/api/user/me`)
      const after = await afterRes.json()

      expect(after.xp).toBe(before.xp + 30)
    })

    test('un-completing a mission removes its XP', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `uncomplete+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Meditate',
        category: 'Wellness',
        type: 'HABIT',
        xp: 15,
        dueAt: todayAt(7 * 60),
      })

      await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
        data: { status: 'COMPLETED' },
      })
      const afterCompleteRes = await page.request.get(`${baseURL}/api/user/me`)
      const afterComplete = await afterCompleteRes.json()

      await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
        data: { status: 'SCHEDULED' },
      })
      const afterUncompleteRes = await page.request.get(
        `${baseURL}/api/user/me`
      )
      const afterUncomplete = await afterUncompleteRes.json()

      expect(afterUncomplete.xp).toBe(afterComplete.xp - 15)
    })

    test('completing a high-xp mission can trigger a level up', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `levelup+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Epic quest',
        category: 'Productivity',
        type: 'GOAL',
        xp: 500,
        dueAt: todayAt(10 * 60),
      })

      const res = await page.request.patch(
        `${baseURL}/api/missions/${mission.id}`,
        { data: { status: 'COMPLETED' } }
      )
      expect(res.ok()).toBe(true)

      const body = await res.json()
      // If a level-up occurred, the API creates pending level rewards
      expect(body.user.level).toBeGreaterThanOrEqual(1)
      expect(body.user.xp).toBeGreaterThan(0)
    })
  })

  test.describe('API — gold rewards', () => {
    test.setTimeout(60_000)

    test('completing 3 missions creates a claimable daily quest reward with gold', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `gold-quest+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Complete 3 missions — daily login mission is auto-created but excluded
      // from the daily quest counter, so these 3 are the ones that count
      for (let i = 0; i < 3; i++) {
        const mission = await createMission(page, baseURL, {
          title: `Quest mission ${i + 1}`,
          category: 'Health',
          type: 'HABIT',
          xp: 10,
          dueAt: todayAt(8 * 60 + i),
        })
        await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
          data: { status: 'COMPLETED' },
        })
      }

      const pendingRes = await page.request.get(
        `${baseURL}/api/rewards/pending`
      )
      expect(pendingRes.ok()).toBe(true)
      const rewards: Array<{
        type: string
        gold: number
        xp: number
        id: string
      }> = await pendingRes.json()

      const quest = rewards.find((r) => r.type === 'DAILY_QUEST')
      expect(quest).toBeDefined()
      expect(quest!.gold).toBe(10)
      expect(quest!.xp).toBe(25)
    })

    test('claiming the daily quest reward increases the gold balance', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `gold-claim+${Date.now()}@example.com`,
        password: 'password123',
      })

      for (let i = 0; i < 3; i++) {
        const mission = await createMission(page, baseURL, {
          title: `Claim mission ${i + 1}`,
          category: 'Productivity',
          type: 'HABIT',
          xp: 10,
          dueAt: todayAt(8 * 60 + i),
        })
        await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
          data: { status: 'COMPLETED' },
        })
      }

      const beforeRes = await page.request.get(`${baseURL}/api/user/me`)
      const before = await beforeRes.json()

      const pendingRes = await page.request.get(
        `${baseURL}/api/rewards/pending`
      )
      const rewards: Array<{ type: string; gold: number; id: string }> =
        await pendingRes.json()
      const quest = rewards.find((r) => r.type === 'DAILY_QUEST')
      expect(quest).toBeDefined()

      const claimRes = await page.request.post(`${baseURL}/api/rewards/claim`, {
        data: { id: quest!.id },
      })
      expect(claimRes.ok()).toBe(true)
      const claim = await claimRes.json()

      expect(claim.gold).toBe(10)
      expect(claim.user.currency).toBe(before.currency + 10)
    })

    test('reaching level 2 creates a claimable level-up reward with gold', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `gold-level+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Level 2 requires 50 XP; one mission with xp: 50 is enough
      const mission = await createMission(page, baseURL, {
        title: 'Level-up mission',
        category: 'Learning',
        type: 'GOAL',
        xp: 50,
        dueAt: todayAt(10 * 60),
      })

      const patchRes = await page.request.patch(
        `${baseURL}/api/missions/${mission.id}`,
        { data: { status: 'COMPLETED' } }
      )
      const patchBody = await patchRes.json()
      // Confirm level-up happened
      expect(patchBody.user.level).toBeGreaterThanOrEqual(2)
      expect(patchBody.newLevelRewards).toBeGreaterThanOrEqual(1)

      const pendingRes = await page.request.get(
        `${baseURL}/api/rewards/pending`
      )
      const rewards: Array<{
        type: string
        refLevel: number
        gold: number
        id: string
      }> = await pendingRes.json()

      const levelUp = rewards.find(
        (r) => r.type === 'LEVEL_UP' && r.refLevel === 2
      )
      expect(levelUp).toBeDefined()
      // Level 2 reward = 20 gold (from LEVELS table)
      expect(levelUp!.gold).toBe(20)
    })

    test('claiming a level-up reward increases the gold balance', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `gold-levelclaim+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Level-up claim mission',
        category: 'Learning',
        type: 'GOAL',
        xp: 50,
        dueAt: todayAt(10 * 60),
      })
      await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
        data: { status: 'COMPLETED' },
      })

      const beforeRes = await page.request.get(`${baseURL}/api/user/me`)
      const before = await beforeRes.json()

      const pendingRes = await page.request.get(
        `${baseURL}/api/rewards/pending`
      )
      const rewards: Array<{
        type: string
        refLevel: number
        gold: number
        id: string
      }> = await pendingRes.json()
      const levelUp = rewards.find(
        (r) => r.type === 'LEVEL_UP' && r.refLevel === 2
      )
      expect(levelUp).toBeDefined()

      const claimRes = await page.request.post(`${baseURL}/api/rewards/claim`, {
        data: { id: levelUp!.id },
      })
      expect(claimRes.ok()).toBe(true)
      const claim = await claimRes.json()

      expect(claim.gold).toBe(20)
      expect(claim.user.currency).toBe(before.currency + 20)
    })
  })

  test.describe('UI — complete button', () => {
    test.setTimeout(60_000)

    test('clicking Complete marks the mission as done in the UI', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `ui-complete+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Drink water',
        category: 'Health',
        type: 'HABIT',
        xp: 10,
        dueAt: todayAt(8 * 60),
      })
      await page.reload()

      const card = page.locator(`[data-mission-id="${mission.id}"]`)
      await expect(card).toBeVisible({ timeout: 10_000 })
      // CSS selector — aria-label is reliable and unaffected by the
      // RewardedAdPrompt dialog that opens after completion (Radix sets
      // aria-hidden on background content, which would break getByRole)
      await card.locator('button[aria-label="Complete"]').click()

      await expect(
        card.locator('button[aria-label="Mark as to-do"]')
      ).toBeVisible({ timeout: 10_000 })
    })

    test('un-clicking complete restores the mission to scheduled', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `ui-uncomplete+${Date.now()}@example.com`,
        password: 'password123',
      })

      const mission = await createMission(page, baseURL, {
        title: 'Journal entry',
        category: 'Wellness',
        type: 'HABIT',
        xp: 0,
        dueAt: todayAt(8 * 60),
      })
      await page.reload()

      const card = page.locator(`[data-mission-id="${mission.id}"]`)
      await card.locator('button[aria-label="Complete"]').click()
      await expect(
        card.locator('button[aria-label="Mark as to-do"]')
      ).toBeVisible({ timeout: 10_000 })

      await card.locator('button[aria-label="Mark as to-do"]').click()
      await expect(card.locator('button[aria-label="Complete"]')).toBeVisible({
        timeout: 10_000,
      })
    })
  })
})
