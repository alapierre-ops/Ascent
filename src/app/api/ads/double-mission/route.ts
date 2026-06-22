import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { applyXpAndLevelOnly } from '@/lib/levels'
import { createLevelUpRewards } from '@/lib/pending-rewards-service'
import { prisma } from '@/lib/prisma'

const DAILY_AD_LIMIT = 5

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const missionId = typeof body.missionId === 'string' ? body.missionId : null
    if (!missionId) {
      return NextResponse.json({ error: 'Missing missionId' }, { status: 400 })
    }

    const mission = await prisma.mission.findFirst({
      where: { id: missionId, userId: session.user.id, status: 'COMPLETED' },
    })
    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    const existing = await prisma.adRewardLog.findFirst({
      where: {
        userId: session.user.id,
        type: 'MISSION_DOUBLE',
        refId: missionId,
      },
    })
    if (existing) {
      return NextResponse.json({ error: 'ALREADY_DOUBLED' }, { status: 400 })
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCount = await prisma.adRewardLog.count({
      where: {
        userId: session.user.id,
        type: 'MISSION_DOUBLE',
        createdAt: { gte: todayStart },
      },
    })
    if (todayCount >= DAILY_AD_LIMIT) {
      return NextResponse.json({ error: 'DAILY_LIMIT' }, { status: 429 })
    }

    const bonusXp = mission.xpApplied ?? mission.xp
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, level: true, currency: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const applied = applyXpAndLevelOnly(user.xp, user.level, bonusXp)

    await prisma.$transaction([
      prisma.adRewardLog.create({
        data: {
          userId: session.user.id,
          type: 'MISSION_DOUBLE',
          refId: missionId,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { xp: applied.xp, level: applied.level },
      }),
    ])

    if (applied.newLevels.length > 0) {
      await createLevelUpRewards(prisma, session.user.id, applied.newLevels)
    }

    return NextResponse.json({
      bonusXp,
      user: {
        level: applied.level,
        xp: applied.xp,
        currency: user.currency,
      },
      remainingToday: DAILY_AD_LIMIT - todayCount - 1,
    })
  } catch (error) {
    console.error('Ad double mission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
