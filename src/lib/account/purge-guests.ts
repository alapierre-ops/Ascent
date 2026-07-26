import type { PrismaClient } from '@prisma/client'

export const DEFAULT_GUEST_RETENTION_DAYS = 7

// Les comptes invités s'accumulent (un par visiteur du portfolio). On les purge
// après une période d'inactivité pour garder la base petite.
export function guestRetentionDays(): number {
  const raw = Number(process.env.GUEST_RETENTION_DAYS)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_GUEST_RETENTION_DAYS
}

export function guestCutoffDate(now: Date = new Date()): Date {
  return new Date(now.getTime() - guestRetentionDays() * 24 * 60 * 60 * 1000)
}

/**
 * Supprime les comptes invités inactifs depuis `cutoff` et tout ce qui leur est
 * rattaché. UserReward et Reward n'ont pas de cascade en base : il faut les
 * effacer explicitement avant le User.
 */
export async function purgeStaleGuests(
  prisma: PrismaClient,
  cutoff: Date = guestCutoffDate()
): Promise<{ deleted: number }> {
  const stale = await prisma.user.findMany({
    where: { isGuest: true, lastActiveAt: { lt: cutoff } },
    select: { id: true },
  })

  if (stale.length === 0) {
    return { deleted: 0 }
  }

  const userIds = stale.map((user) => user.id)

  await prisma.$transaction([
    prisma.userReward.deleteMany({
      where: {
        OR: [
          { userId: { in: userIds } },
          { reward: { creatorId: { in: userIds } } },
        ],
      },
    }),
    prisma.reward.deleteMany({ where: { creatorId: { in: userIds } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ])

  return { deleted: userIds.length }
}
