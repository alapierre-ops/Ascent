import {
  MissionStatus,
  MissionType,
  type PrismaClient,
  RewardType,
} from '@prisma/client'

import { ACHIEVEMENTS } from '@/lib/achievements/definitions'
import { THEMES, unlockSourceKey } from '@/lib/themes/definitions'

const MAX_TIER = 4
const MAX_LEVEL = 20
const DEMO_GOLD = 10_000
const DEMO_XP = 15_000
const TX_TIMEOUT_MS = 60_000

export type GrantDemoUnlocksResult = {
  themes: number
  achievements: number
  level: number
  gold: number
}

function atDaysAgo(daysAgo: number, hour = 12): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 0, 0, 0)
  return date
}

function buildDemoMissions(userId: string) {
  const missions: Array<{
    userId: string
    title: string
    category: string
    type: MissionType
    xp: number
    dueAt: Date
    status: MissionStatus
  }> = []

  for (let i = 0; i < 150; i += 1) {
    const dayOffset = i % 7
    missions.push({
      userId,
      title: `Demo weekly ${i + 1}`,
      category: 'Demo',
      type: i % 4 === 0 ? MissionType.GOAL : MissionType.HABIT,
      xp: 10,
      dueAt: atDaysAgo(dayOffset, 9 + (i % 8)),
      status: MissionStatus.COMPLETED,
    })
  }

  for (let day = 0; day < 35; day += 1) {
    missions.push({
      userId,
      title: `Demo streak day ${day + 1}`,
      category: 'Demo',
      type: MissionType.HABIT,
      xp: 12,
      dueAt: atDaysAgo(day, 8),
      status: MissionStatus.COMPLETED,
    })
  }

  for (let day = 35; day < 110; day += 1) {
    for (let slot = 0; slot < 3; slot += 1) {
      missions.push({
        userId,
        title: `Demo perfect ${day}-${slot}`,
        category: 'Demo',
        type: slot === 2 ? MissionType.GOAL : MissionType.HABIT,
        xp: 10,
        dueAt: atDaysAgo(day, 10 + slot),
        status: MissionStatus.COMPLETED,
      })
    }
  }

  for (let i = 0; i < 120; i += 1) {
    missions.push({
      userId,
      title: `Demo extra ${i + 1}`,
      category: 'Demo',
      type: MissionType.HABIT,
      xp: 8,
      dueAt: atDaysAgo(110 + (i % 60), 14),
      status: MissionStatus.COMPLETED,
    })
  }

  return missions
}

function buildFrozenDates(count: number): string[] {
  const dates: string[] = []
  for (let i = 0; i < count; i += 1) {
    const d = atDaysAgo(200 + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export async function grantDemoUnlocks(
  prisma: PrismaClient,
  userId: string
): Promise<GrantDemoUnlocksResult> {
  return prisma.$transaction(
    async (tx) => {
      const frozenDates = buildFrozenDates(20)

      await tx.user.update({
        where: { id: userId },
        data: {
          level: MAX_LEVEL,
          xp: DEMO_XP,
          currency: DEMO_GOLD,
          frozenStreakDates: frozenDates,
        },
      })

      const demoMissionCount = await tx.mission.count({
        where: { userId, category: 'Demo' },
      })
      if (demoMissionCount === 0) {
        await tx.mission.createMany({
          data: buildDemoMissions(userId),
        })
      }

      const customRewardCount = await tx.reward.count({
        where: { creatorId: userId, title: { startsWith: 'Demo reward' } },
      })
      if (customRewardCount === 0) {
        await tx.reward.createMany({
          data: Array.from({ length: 20 }, (_, i) => ({
            creatorId: userId,
            title: `Demo reward ${i + 1}`,
            cost: 50,
            type: RewardType.REAL_LIFE,
            icon: '🎁',
          })),
        })
      }

      const shopRedeemCount = await tx.userReward.count({ where: { userId } })
      if (shopRedeemCount < 35) {
        const shopReward = await tx.reward.create({
          data: {
            title: 'Demo shop item',
            cost: 100,
            type: RewardType.COSMETIC,
            icon: '🛍️',
          },
        })

        await tx.userReward.createMany({
          data: Array.from({ length: 35 - shopRedeemCount }, () => ({
            userId,
            rewardId: shopReward.id,
          })),
        })
      }

      const dailyQuestClaimed = await tx.pendingReward.count({
        where: { userId, type: 'DAILY_QUEST', claimedAt: { not: null } },
      })
      if (dailyQuestClaimed < 75) {
        await tx.pendingReward.createMany({
          data: Array.from({ length: 75 - dailyQuestClaimed }, (_, offset) => ({
            userId,
            type: 'DAILY_QUEST' as const,
            gold: 10,
            xp: 25,
            claimedAt: atDaysAgo((dailyQuestClaimed + offset) % 30),
          })),
        })
      }

      const dailyLoginClaimed = await tx.pendingReward.count({
        where: { userId, type: 'DAILY_LOGIN', claimedAt: { not: null } },
      })
      if (dailyLoginClaimed < 30) {
        await tx.pendingReward.createMany({
          data: Array.from({ length: 30 - dailyLoginClaimed }, (_, offset) => ({
            userId,
            type: 'DAILY_LOGIN' as const,
            gold: 5,
            xp: 10,
            claimedAt: atDaysAgo(dailyLoginClaimed + offset),
          })),
        })
      }

      await tx.userThemeUnlock.createMany({
        data: THEMES.map((theme) => ({
          userId,
          themeId: theme.id,
          source: unlockSourceKey(theme.unlock),
        })),
        skipDuplicates: true,
      })

      for (const def of ACHIEVEMENTS) {
        const lastTier = def.tiers[def.tiers.length - 1]
        await tx.userAchievement.upsert({
          where: {
            userId_achievementId: { userId, achievementId: def.id },
          },
          create: {
            userId,
            achievementId: def.id,
            progress: lastTier.threshold,
            currentTier: MAX_TIER,
          },
          update: { progress: lastTier.threshold, currentTier: MAX_TIER },
        })
      }

      const existingAchievementRewards = await tx.pendingReward.findMany({
        where: { userId, type: 'ACHIEVEMENT' },
        select: { refAchievementId: true, refTier: true },
      })
      const existingKeys = new Set(
        existingAchievementRewards.map(
          (r) => `${r.refAchievementId}:${r.refTier}`
        )
      )

      const missingAchievementRewards = ACHIEVEMENTS.flatMap((def) =>
        def.tiers
          .filter((tier) => !existingKeys.has(`${def.id}:${tier.tier}`))
          .map((tier) => ({
            userId,
            type: 'ACHIEVEMENT' as const,
            refAchievementId: def.id,
            refTier: tier.tier,
            gold: tier.gold,
            xp: tier.xp,
            claimedAt: new Date(),
          }))
      )

      if (missingAchievementRewards.length > 0) {
        await tx.pendingReward.createMany({ data: missingAchievementRewards })
      }

      return {
        themes: THEMES.length,
        achievements: ACHIEVEMENTS.length,
        level: MAX_LEVEL,
        gold: DEMO_GOLD,
      }
    },
    { timeout: TX_TIMEOUT_MS }
  )
}
