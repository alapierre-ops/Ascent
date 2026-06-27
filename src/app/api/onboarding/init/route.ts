import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import {
  ONBOARDING_OVERDUE_MISSION_CATEGORY,
  ONBOARDING_OVERDUE_MISSION_TITLES,
  ONBOARDING_OVERDUE_MISSION_XP,
  TUTORIAL_MISSION_CATEGORY,
  TUTORIAL_MISSION_TITLES,
  TUTORIAL_MISSION_XP,
} from '@/lib/onboarding/constants'
import { prisma } from '@/lib/prisma'

function dueAtDaysAgo(daysAgo: number, hour = 18): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 0, 0, 0)
  return date
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompletedAt: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (user.onboardingCompletedAt) {
      return NextResponse.json({
        skipped: true,
        tutorialMissionId: null,
        overdueMissionId: null,
      })
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

    let tutorialMission = await prisma.mission.findFirst({
      where: {
        userId,
        category: TUTORIAL_MISSION_CATEGORY,
        dueAt: { gte: todayStart, lt: todayEnd },
      },
      select: { id: true },
    })

    if (!tutorialMission) {
      const dueAt = new Date(now)
      dueAt.setHours(23, 59, 0, 0)

      tutorialMission = await prisma.mission.create({
        data: {
          userId,
          title: TUTORIAL_MISSION_TITLES[locale],
          category: TUTORIAL_MISSION_CATEGORY,
          type: 'GOAL',
          xp: TUTORIAL_MISSION_XP,
          dueAt,
          status: 'SCHEDULED',
        },
        select: { id: true },
      })
    }

    let overdueMission = await prisma.mission.findFirst({
      where: {
        userId,
        category: ONBOARDING_OVERDUE_MISSION_CATEGORY,
        status: 'SCHEDULED',
      },
      select: { id: true },
      orderBy: { dueAt: 'asc' },
    })

    if (!overdueMission) {
      overdueMission = await prisma.mission.create({
        data: {
          userId,
          title: ONBOARDING_OVERDUE_MISSION_TITLES[locale],
          category: ONBOARDING_OVERDUE_MISSION_CATEGORY,
          type: 'GOAL',
          xp: ONBOARDING_OVERDUE_MISSION_XP,
          dueAt: dueAtDaysAgo(1),
          status: 'SCHEDULED',
        },
        select: { id: true },
      })
    }

    return NextResponse.json({
      skipped: false,
      tutorialMissionId: tutorialMission.id,
      overdueMissionId: overdueMission.id,
    })
  } catch (error) {
    console.error('Onboarding init error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
