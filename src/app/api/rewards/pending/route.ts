import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { listUnclaimedRewards } from '@/lib/pending-rewards-service'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rewards = await listUnclaimedRewards(prisma, session.user.id)

    return NextResponse.json(
      rewards.map((r) => ({
        id: r.id,
        type: r.type,
        refLevel: r.refLevel,
        refDate: r.refDate,
        refAchievementId: r.refAchievementId,
        refTier: r.refTier,
        gold: r.gold,
        xp: r.xp,
      }))
    )
  } catch (error) {
    console.error('Pending rewards GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
