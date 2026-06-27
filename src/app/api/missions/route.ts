import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import {
  addLocalDays,
  endOfLocalDay,
  getClientTzOffset,
  getLocalDateKey,
} from '@/lib/missions/dates'
import {
  dayBounds,
  missionsForDayWhere,
  todayStartForTz,
} from '@/lib/missions/queries'
import { newRepeatKey } from '@/lib/missions/recurrence'
import { prisma } from '@/lib/prisma'
import { createMissionSchema } from '@/lib/validation/mission'

function parseTzOffset(searchParams: URLSearchParams, body?: unknown): number {
  const raw = searchParams.get('tzOffset')
  if (raw != null && raw !== '') {
    const n = Number(raw)
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

function mapMission(m: {
  id: string
  title: string
  category: string
  type: string
  xp: number
  dueAt: Date
  status: string
  repeatKey: string | null
  createdAt: Date
}) {
  return {
    id: m.id,
    title: m.title,
    category: m.category,
    type: m.type,
    xp: m.xp,
    dueAt: m.dueAt.toISOString(),
    status: m.status,
    repeatKey: m.repeatKey,
    createdAt: m.createdAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const tzOffset = parseTzOffset(searchParams)
    const todayKey = getLocalDateKey(new Date(), tzOffset)
    const requestedDate = dateStr ?? todayKey
    const bounds = dayBounds(requestedDate, tzOffset)
    const todayStart = todayStartForTz(tzOffset)

    const isToday = requestedDate === todayKey
    const missions = await prisma.mission.findMany({
      where: missionsForDayWhere(session.user.id, bounds, {
        isToday,
        todayStart,
      }),
      orderBy: { dueAt: 'asc' },
    })

    return NextResponse.json(missions.map(mapMission))
  } catch (error) {
    console.error('Missions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createMissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const tzOffset = parseTzOffset(new URL(request.url).searchParams, body)
    const userId = session.user.id
    const { title, category, type, xp, repeat, repeatCount } = parsed.data
    const repeatMode = repeat ?? 'NONE'
    const occurrences = repeatMode === 'NONE' ? 1 : (repeatCount ?? 14)
    const repeatKey = repeatMode === 'NONE' ? null : newRepeatKey()
    const todayKey = getLocalDateKey(new Date(), tzOffset)

    const created = await prisma.$transaction(
      Array.from({ length: occurrences }).map((_, index) => {
        const dayOffset = repeatMode === 'WEEKLY' ? index * 7 : index
        const dayKey = addLocalDays(todayKey, dayOffset, tzOffset)
        const dueAt = endOfLocalDay(dayKey, tzOffset)
        return prisma.mission.create({
          data: {
            userId,
            title,
            category,
            type,
            xp,
            dueAt,
            status: 'SCHEDULED',
            repeatKey,
          },
        })
      })
    )

    const first = created[0]
    return NextResponse.json(
      {
        ...mapMission(first),
        createdCount: created.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Missions POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
