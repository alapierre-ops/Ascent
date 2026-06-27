import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import {
  getClientTzOffset,
  getLocalDateKey,
  localDayBounds,
} from '@/lib/missions/dates'
import { ensureRecurringHabits } from '@/lib/missions/recurrence'
import {
  DAILY_LOGIN_MISSION_CATEGORY,
  DAILY_LOGIN_TITLES,
} from '@/lib/missions/special'
import { ensureDailyLoginReward } from '@/lib/pending-rewards-service'
import { prisma } from '@/lib/prisma'

function parseTzOffset(body: unknown, searchParams: URLSearchParams): number {
  const fromQuery = searchParams.get('tzOffset')
  if (fromQuery != null && fromQuery !== '') {
    const n = Number(fromQuery)
    if (!Number.isNaN(n)) return n
  }
  if (
    body &&
    typeof body === 'object' &&
    'tzOffset' in body &&
    typeof (body as { tzOffset: unknown }).tzOffset === 'number'
  ) {
    return (body as { tzOffset: number }).tzOffset
  }
  return getClientTzOffset()
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const locale =
      typeof body.locale === 'string' && body.locale.startsWith('fr')
        ? 'fr'
        : 'en'
    const tzOffset = parseTzOffset(body, new URL(request.url).searchParams)

    const now = new Date()
    const { start: todayStart, end: todayEnd } = localDayBounds(
      getLocalDateKey(now, tzOffset),
      tzOffset
    )

    let dailyLoginMissionId: string | null = null
    const existingMission = await prisma.mission.findFirst({
      where: {
        userId: session.user.id,
        category: DAILY_LOGIN_MISSION_CATEGORY,
        dueAt: { gte: todayStart, lt: todayEnd },
      },
      select: { id: true },
    })

    if (existingMission) {
      dailyLoginMissionId = existingMission.id
    } else {
      const dueAt = new Date(todayEnd.getTime() - 60 * 1000)
      const mission = await prisma.mission.create({
        data: {
          userId: session.user.id,
          title: DAILY_LOGIN_TITLES[locale],
          category: DAILY_LOGIN_MISSION_CATEGORY,
          type: 'HABIT',
          xp: 0,
          dueAt,
          status: 'SCHEDULED',
        },
        select: { id: true },
      })
      dailyLoginMissionId = mission.id
    }

    const pending = await ensureDailyLoginReward(prisma, session.user.id)
    await ensureRecurringHabits(prisma, session.user.id, tzOffset)

    return NextResponse.json({
      dailyLoginMissionId,
      dailyLoginRewardId: pending.claimedAt == null ? pending.id : null,
    })
  } catch (error) {
    console.error('Daily ensure error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
