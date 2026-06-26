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

// Give the user gold by completing a 50xp mission → level 2 → claim 20g reward
async function acquireGold(
  page: Page,
  baseURL: string | undefined
): Promise<number> {
  const missionRes = await page.request.post(`${baseURL}/api/missions`, {
    data: {
      title: 'Gold setup mission',
      category: 'Productivity',
      type: 'GOAL',
      xp: 50,
      dueAt: new Date().toISOString(),
    },
  })
  const mission = await missionRes.json()
  await page.request.patch(`${baseURL}/api/missions/${mission.id}`, {
    data: { status: 'COMPLETED' },
  })

  const pendingRes = await page.request.get(`${baseURL}/api/rewards/pending`)
  const pending: Array<{ type: string; id: string; gold: number }> =
    await pendingRes.json()
  const levelUp = pending.find((r) => r.type === 'LEVEL_UP')
  if (!levelUp) return 0

  const claimRes = await page.request.post(`${baseURL}/api/rewards/claim`, {
    data: { id: levelUp.id },
  })
  const claim = await claimRes.json()
  return claim.user?.currency ?? 0
}

test.describe('Feature: Shop', () => {
  test.describe('API — reward catalog', () => {
    test.setTimeout(60_000)

    test('GET /api/rewards returns balance, empty rewards and empty history for a new user', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-get+${Date.now()}@example.com`,
        password: 'password123',
      })

      const res = await page.request.get(`${baseURL}/api/rewards`)
      expect(res.ok()).toBe(true)
      const body = await res.json()

      expect(typeof body.balance).toBe('number')
      expect(Array.isArray(body.rewards)).toBe(true)
      expect(Array.isArray(body.history)).toBe(true)
      // New user has no custom rewards and no purchase history
      expect(
        body.rewards.filter((r: { isEditable: boolean }) => r.isEditable)
      ).toHaveLength(0)
      expect(body.history).toHaveLength(0)
    })

    test('POST /api/rewards creates a custom reward that appears in the catalog', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-create+${Date.now()}@example.com`,
        password: 'password123',
      })

      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: {
          title: 'Coffee break',
          cost: 50,
          icon: '☕',
          type: 'REAL_LIFE',
        },
      })
      expect(createRes.status()).toBe(201)
      const created = await createRes.json()
      expect(created.id).toBeDefined()
      expect(created.title).toBe('Coffee break')
      expect(created.cost).toBe(50)

      const listRes = await page.request.get(`${baseURL}/api/rewards`)
      const { rewards } = await listRes.json()
      const mine = rewards.find((r: { id: string }) => r.id === created.id)
      expect(mine).toBeDefined()
      expect(mine.isEditable).toBe(true)
    })

    test('PATCH /api/rewards/[id] updates a custom reward', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-edit+${Date.now()}@example.com`,
        password: 'password123',
      })

      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: { title: 'Old title', cost: 100, icon: '🎁', type: 'REAL_LIFE' },
      })
      const { id } = await createRes.json()

      const patchRes = await page.request.patch(
        `${baseURL}/api/rewards/${id}`,
        { data: { title: 'New title', cost: 200 } }
      )
      expect(patchRes.ok()).toBe(true)
      const updated = await patchRes.json()
      expect(updated.title).toBe('New title')
      expect(updated.cost).toBe(200)
    })

    test('DELETE /api/rewards/[id] removes the reward from the catalog', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-del+${Date.now()}@example.com`,
        password: 'password123',
      })

      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: { title: 'Deletable', cost: 10, icon: null, type: 'REAL_LIFE' },
      })
      const { id } = await createRes.json()

      const deleteRes = await page.request.delete(
        `${baseURL}/api/rewards/${id}`
      )
      expect(deleteRes.ok()).toBe(true)

      const listRes = await page.request.get(`${baseURL}/api/rewards`)
      const { rewards } = await listRes.json()
      expect(rewards.find((r: { id: string }) => r.id === id)).toBeUndefined()
    })

    test('DELETE returns HAS_REDEMPTIONS when the reward has been purchased', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-delhas+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Create a free reward so it can be redeemed immediately
      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: { title: 'Free treat', cost: 0, icon: '🍬', type: 'REAL_LIFE' },
      })
      const { id } = await createRes.json()

      await page.request.post(`${baseURL}/api/rewards/redeem`, {
        data: { rewardId: id },
      })

      const deleteRes = await page.request.delete(
        `${baseURL}/api/rewards/${id}`
      )
      expect(deleteRes.status()).toBe(400)
      const body = await deleteRes.json()
      expect(body.error).toBe('HAS_REDEMPTIONS')
    })
  })

  test.describe('API — purchasing', () => {
    test.setTimeout(60_000)

    test('redeeming a cost-0 reward succeeds and appears in purchase history', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-free+${Date.now()}@example.com`,
        password: 'password123',
      })

      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: { title: 'Free reward', cost: 0, icon: '🎉', type: 'REAL_LIFE' },
      })
      const { id } = await createRes.json()

      const redeemRes = await page.request.post(
        `${baseURL}/api/rewards/redeem`,
        { data: { rewardId: id } }
      )
      expect(redeemRes.ok()).toBe(true)
      const body = await redeemRes.json()
      expect(body.reward.id).toBe(id)
      // Balance unchanged since cost is 0
      expect(body.balance).toBe(0)

      const listRes = await page.request.get(`${baseURL}/api/rewards`)
      const { history } = await listRes.json()
      expect(
        history.some((h: { title: string }) => h.title === 'Free reward')
      ).toBe(true)
    })

    test('redeeming by inline { title, cost } creates and redeems the reward in one call', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-inline+${Date.now()}@example.com`,
        password: 'password123',
      })

      const redeemRes = await page.request.post(
        `${baseURL}/api/rewards/redeem`,
        {
          data: {
            title: 'Inline treat',
            cost: 0,
            icon: '🍭',
            type: 'REAL_LIFE',
          },
        }
      )
      expect(redeemRes.ok()).toBe(true)
      const body = await redeemRes.json()
      expect(body.reward.title).toBe('Inline treat')

      const listRes = await page.request.get(`${baseURL}/api/rewards`)
      const { history } = await listRes.json()
      expect(
        history.some((h: { title: string }) => h.title === 'Inline treat')
      ).toBe(true)
    })

    test('returns INSUFFICIENT_GOLD when balance is too low', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-poor+${Date.now()}@example.com`,
        password: 'password123',
      })

      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: {
          title: 'Expensive item',
          cost: 100,
          icon: '💎',
          type: 'REAL_LIFE',
        },
      })
      const { id } = await createRes.json()

      const redeemRes = await page.request.post(
        `${baseURL}/api/rewards/redeem`,
        { data: { rewardId: id } }
      )
      expect(redeemRes.status()).toBe(400)
      const body = await redeemRes.json()
      expect(body.error).toBe('INSUFFICIENT_GOLD')
    })

    test('deducts cost from balance and records the purchase in history', async ({
      page,
      request,
      baseURL,
    }) => {
      await loginAs(page, request, baseURL, {
        email: `shop-buy+${Date.now()}@example.com`,
        password: 'password123',
      })

      // Acquire 20 gold via level-up reward (50 XP → level 2 → 20g)
      const balanceAfterLevelUp = await acquireGold(page, baseURL)
      expect(balanceAfterLevelUp).toBeGreaterThanOrEqual(20)

      const createRes = await page.request.post(`${baseURL}/api/rewards`, {
        data: {
          title: 'Treat yourself',
          cost: 15,
          icon: '🍕',
          type: 'REAL_LIFE',
        },
      })
      const { id } = await createRes.json()

      const redeemRes = await page.request.post(
        `${baseURL}/api/rewards/redeem`,
        { data: { rewardId: id } }
      )
      expect(redeemRes.ok()).toBe(true)
      const body = await redeemRes.json()

      expect(body.balance).toBe(balanceAfterLevelUp - 15)

      const listRes = await page.request.get(`${baseURL}/api/rewards`)
      const { history, balance } = await listRes.json()
      expect(balance).toBe(balanceAfterLevelUp - 15)
      expect(
        history.some((h: { title: string }) => h.title === 'Treat yourself')
      ).toBe(true)
    })
  })
})
