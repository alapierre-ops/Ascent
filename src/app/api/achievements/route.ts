import { NextResponse } from 'next/server'

import { TOTAL_ACHIEVEMENT_TIERS } from '@/lib/achievements/definitions'
import { buildAchievementViews } from '@/lib/achievements/service'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const achievements = await buildAchievementViews(prisma, session.user.id)
    const unlockedTiers = achievements.reduce((s, a) => s + a.currentTier, 0)
    const pendingCount = achievements.reduce(
      (s, a) => s + a.tiers.filter((t) => t.pendingId).length,
      0
    )

    return NextResponse.json({
      achievements,
      unlockedTiers,
      totalTiers: TOTAL_ACHIEVEMENT_TIERS,
      pendingCount,
    })
  } catch (error) {
    console.error('Achievements GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
