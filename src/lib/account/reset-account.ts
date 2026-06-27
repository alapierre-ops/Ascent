import type { PrismaClient } from '@prisma/client'

import { DEFAULT_THEME_ID } from '@/lib/themes/definitions'
import { ensureDefaultTheme } from '@/lib/themes/service'

const RESET_CONFIRM_PHRASES = new Set(['RESET', 'REINITIALISER'])

function normalizeConfirmationPhrase(phrase: string): string {
  return phrase.trim().toUpperCase().normalize('NFD').replace(/\p{M}/gu, '')
}

export function isValidResetConfirmation(phrase: string): boolean {
  return RESET_CONFIRM_PHRASES.has(normalizeConfirmationPhrase(phrase))
}

export async function resetAccount(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  // Batch transaction: one round-trip, avoids interactive tx default 5s timeout on slow DB.
  await prisma.$transaction([
    prisma.adRewardLog.deleteMany({ where: { userId } }),
    prisma.pendingReward.deleteMany({ where: { userId } }),
    prisma.userAchievement.deleteMany({ where: { userId } }),
    prisma.userReward.deleteMany({
      where: {
        OR: [{ userId }, { reward: { creatorId: userId } }],
      },
    }),
    prisma.mission.deleteMany({ where: { userId } }),
    prisma.userThemeUnlock.deleteMany({ where: { userId } }),
    prisma.reward.deleteMany({ where: { creatorId: userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        level: 1,
        xp: 0,
        currency: 0,
        themeId: DEFAULT_THEME_ID,
        streakFreeze: 0,
        frozenStreakDates: [],
        onboardingCompletedAt: null,
      },
    }),
  ])

  await ensureDefaultTheme(prisma, userId)
}
