import type { PrismaClient } from '@prisma/client'

export const DAILY_AD_LIMIT = 5

export type MissionDoubleOffer = {
  bonusXp: number
  remainingToday: number
}

export async function getMissionDoubleOffer(
  prisma: PrismaClient,
  userId: string,
  missionId: string,
  bonusXp: number,
  isPremium: boolean
): Promise<MissionDoubleOffer | null> {
  if (isPremium || bonusXp <= 0) return null

  const existing = await prisma.adRewardLog.findFirst({
    where: {
      userId,
      type: 'MISSION_DOUBLE',
      refId: missionId,
    },
  })
  if (existing) return null

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayCount = await prisma.adRewardLog.count({
    where: {
      userId,
      type: 'MISSION_DOUBLE',
      createdAt: { gte: todayStart },
    },
  })
  if (todayCount >= DAILY_AD_LIMIT) return null

  return {
    bonusXp,
    remainingToday: DAILY_AD_LIMIT - todayCount,
  }
}
