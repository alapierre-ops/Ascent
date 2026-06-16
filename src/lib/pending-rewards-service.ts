import type { PrismaClient } from '@prisma/client'

import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'
import {
  DAILY_LOGIN_REWARD_GOLD,
  DAILY_LOGIN_REWARD_XP,
} from '@/lib/missions/special'
import {
  DAILY_QUEST_REWARD,
  levelRewardGold,
  todayDateKey,
} from '@/lib/pending-rewards'

export async function createLevelUpRewards(
  prisma: PrismaClient,
  userId: string,
  newLevels: number[]
) {
  for (const level of newLevels) {
    await prisma.pendingReward.upsert({
      where: {
        userId_type_refLevel: {
          userId,
          type: 'LEVEL_UP',
          refLevel: level,
        },
      },
      create: {
        userId,
        type: 'LEVEL_UP',
        refLevel: level,
        gold: levelRewardGold(level),
        xp: 0,
      },
      update: {},
    })
  }
}

export async function maybeCreateDailyQuestReward(
  prisma: PrismaClient,
  userId: string,
  target: number
) {
  const now = new Date()
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  const todayEnd = new Date(todayStart)
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1)

  const completedToday = await prisma.mission.count({
    where: {
      userId,
      status: 'COMPLETED',
      dueAt: { gte: todayStart, lt: todayEnd },
      category: {
        notIn: [DAILY_LOGIN_MISSION_CATEGORY, TUTORIAL_MISSION_CATEGORY],
      },
    },
  })

  if (completedToday < target) return

  const refDate = todayDateKey(now)
  await prisma.pendingReward.upsert({
    where: {
      userId_type_refDate: {
        userId,
        type: 'DAILY_QUEST',
        refDate,
      },
    },
    create: {
      userId,
      type: 'DAILY_QUEST',
      refDate,
      gold: DAILY_QUEST_REWARD.gold,
      xp: DAILY_QUEST_REWARD.xp,
    },
    update: {},
  })
}

export async function ensureDailyLoginReward(
  prisma: PrismaClient,
  userId: string
) {
  const refDate = todayDateKey()
  return prisma.pendingReward.upsert({
    where: {
      userId_type_refDate: {
        userId,
        type: 'DAILY_LOGIN',
        refDate,
      },
    },
    create: {
      userId,
      type: 'DAILY_LOGIN',
      refDate,
      gold: DAILY_LOGIN_REWARD_GOLD,
      xp: DAILY_LOGIN_REWARD_XP,
    },
    update: {},
  })
}

export async function maybeRevokeDailyQuestReward(
  prisma: PrismaClient,
  userId: string,
  target: number
) {
  const now = new Date()
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  const todayEnd = new Date(todayStart)
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1)

  const completedToday = await prisma.mission.count({
    where: {
      userId,
      status: 'COMPLETED',
      dueAt: { gte: todayStart, lt: todayEnd },
      category: {
        notIn: [DAILY_LOGIN_MISSION_CATEGORY, TUTORIAL_MISSION_CATEGORY],
      },
    },
  })

  if (completedToday >= target) return

  const refDate = todayDateKey(now)
  await prisma.pendingReward.deleteMany({
    where: {
      userId,
      type: 'DAILY_QUEST',
      refDate,
      claimedAt: null,
    },
  })
}

export async function listUnclaimedRewards(
  prisma: PrismaClient,
  userId: string
) {
  return prisma.pendingReward.findMany({
    where: { userId, claimedAt: null },
    orderBy: { createdAt: 'asc' },
  })
}

export async function pruneStaleLevelRewards(
  prisma: PrismaClient,
  userId: string,
  maxLevel: number
) {
  await prisma.pendingReward.deleteMany({
    where: {
      userId,
      type: 'LEVEL_UP',
      claimedAt: null,
      refLevel: { gt: maxLevel },
    },
  })
}
