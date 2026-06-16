import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import {
  TUTORIAL_MISSION_CATEGORY,
  TUTORIAL_MISSION_TITLES,
  TUTORIAL_MISSION_XP,
} from '@/lib/onboarding/constants'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (user.onboardingCompletedAt) {
      return NextResponse.json({ skipped: true, tutorialMissionId: null })
    }

    const body = await request.json().catch(() => ({}))
    const locale =
      typeof body.locale === 'string' && body.locale.startsWith('fr')
        ? 'fr'
        : 'en'

    const now = new Date()
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )
    const todayEnd = new Date(todayStart)
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1)

    const existing = await prisma.mission.findFirst({
      where: {
        userId: session.user.id,
        category: TUTORIAL_MISSION_CATEGORY,
        dueAt: { gte: todayStart, lt: todayEnd },
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({
        skipped: false,
        tutorialMissionId: existing.id,
      })
    }

    const dueAt = new Date(now)
    dueAt.setHours(23, 59, 0, 0)

    const mission = await prisma.mission.create({
      data: {
        userId: session.user.id,
        title: TUTORIAL_MISSION_TITLES[locale],
        category: TUTORIAL_MISSION_CATEGORY,
        type: 'GOAL',
        xp: TUTORIAL_MISSION_XP,
        dueAt,
        status: 'SCHEDULED',
      },
      select: { id: true },
    })

    return NextResponse.json({
      skipped: false,
      tutorialMissionId: mission.id,
    })
  } catch (error) {
    console.error('Onboarding init error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
