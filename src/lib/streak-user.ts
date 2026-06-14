import type { PrismaClient } from '@prisma/client'

import {
  addDays,
  computeCurrentStreak,
  getActiveDateKeys,
  toDateKey,
} from '@/lib/streak'

export const STREAK_BONUS_PER_WEEK = 10
export const DAYS_PER_STREAK_WEEK = 7

export function parseFrozenDates(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((d): d is string => typeof d === 'string')
}

/** +10% XP bonus per full week of streak, no cap. */
export function getStreakBonus(streak: number) {
  const completedWeeks = Math.floor(streak / DAYS_PER_STREAK_WEEK)
  const bonusPercent = completedWeeks * STREAK_BONUS_PER_WEEK
  const multiplier = 1 + bonusPercent / 100
  const daysToNextBonus =
    streak === 0
      ? DAYS_PER_STREAK_WEEK
      : streak % DAYS_PER_STREAK_WEEK === 0
        ? DAYS_PER_STREAK_WEEK
        : DAYS_PER_STREAK_WEEK - (streak % DAYS_PER_STREAK_WEEK)
  const nextBonusPercent = bonusPercent + STREAK_BONUS_PER_WEEK

  return {
    bonusPercent,
    completedWeeks,
    multiplier,
    daysToNextBonus,
    nextBonusPercent,
  }
}

export async function getUserStreakContext(
  prisma: PrismaClient,
  userId: string,
  today = new Date()
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakFreeze: true, frozenStreakDates: true },
  })

  const historyStart = new Date(today)
  historyStart.setDate(historyStart.getDate() - 120)
  historyStart.setHours(0, 0, 0, 0)

  const completedMissions = await prisma.mission.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      dueAt: { gte: historyStart },
    },
    select: { dueAt: true },
  })

  const frozenDates = parseFrozenDates(user?.frozenStreakDates)
  const activeKeys = getActiveDateKeys(completedMissions.map((m) => m.dueAt))
  for (const d of frozenDates) {
    activeKeys.add(d)
  }

  const currentStreak = computeCurrentStreak(activeKeys, today)
  const bonusInfo = getStreakBonus(currentStreak)
  const canUseFreeze = computeCanUseFreeze(
    activeKeys,
    frozenDates,
    user?.streakFreeze ?? 0,
    today
  )

  return {
    activeKeys,
    frozenDates,
    currentStreak,
    streakFreeze: user?.streakFreeze ?? 0,
    canUseFreeze,
    ...bonusInfo,
  }
}

function computeCanUseFreeze(
  activeKeys: Set<string>,
  frozenDates: string[],
  streakFreeze: number,
  today: Date
): boolean {
  if (streakFreeze <= 0) return false
  const yesterday = toDateKey(addDays(today, -1))
  if (activeKeys.has(yesterday) || frozenDates.includes(yesterday)) {
    return false
  }
  const dayBefore = toDateKey(addDays(today, -2))
  return activeKeys.has(dayBefore) || frozenDates.includes(dayBefore)
}

export function applyStreakMultiplier(
  baseXp: number,
  multiplier: number
): number {
  return Math.floor(baseXp * multiplier)
}
