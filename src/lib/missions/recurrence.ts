import type { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

import type { TzOffsetMinutes } from '@/lib/missions/dates'
import {
  getLocalDateKey,
  localDayBounds,
  localTodayStart,
} from '@/lib/missions/dates'
import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'

const HORIZON_DAYS = 14
const SPECIAL_CATEGORIES = [
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
]

const DAY_MS = 24 * 60 * 60 * 1000

export function newRepeatKey(): string {
  return randomUUID()
}

function localTimeOnDay(
  dayStart: Date,
  referenceDueAt: Date,
  tzOffsetMinutes: TzOffsetMinutes
): Date {
  const refBounds = localDayBounds(
    getLocalDateKey(referenceDueAt, tzOffsetMinutes),
    tzOffsetMinutes
  )
  const timeOffsetMs = referenceDueAt.getTime() - refBounds.start.getTime()
  return new Date(dayStart.getTime() + timeOffsetMs)
}

async function prunePastScheduledRecurring(
  prisma: PrismaClient,
  userId: string,
  todayStart: Date
) {
  await prisma.mission.deleteMany({
    where: {
      userId,
      repeatKey: { not: null },
      status: 'SCHEDULED',
      dueAt: { lt: todayStart },
      category: { notIn: SPECIAL_CATEGORIES },
    },
  })
}

export async function ensureRecurringHabits(
  prisma: PrismaClient,
  userId: string,
  tzOffsetMinutes: TzOffsetMinutes
) {
  const now = new Date()
  const todayStart = localTodayStart(tzOffsetMinutes, now)
  const horizonEnd = new Date(todayStart.getTime() + HORIZON_DAYS * DAY_MS)

  await prunePastScheduledRecurring(prisma, userId, todayStart)

  const habits = await prisma.mission.findMany({
    where: {
      userId,
      type: 'HABIT',
      repeatKey: { not: null },
      category: { notIn: SPECIAL_CATEGORIES },
    },
    orderBy: { dueAt: 'asc' },
  })

  const byKey = new Map<string, typeof habits>()
  for (const m of habits) {
    if (!m.repeatKey) continue
    const list = byKey.get(m.repeatKey) ?? []
    list.push(m)
    byKey.set(m.repeatKey, list)
  }

  for (const group of byKey.values()) {
    const sample = group[0]
    const maxDue = group.reduce(
      (max, m) => (m.dueAt > max ? m.dueAt : max),
      group[0].dueAt
    )

    if (maxDue >= horizonEnd) continue

    let cursor = todayStart
    if (maxDue >= todayStart) {
      const maxDay = localDayBounds(
        getLocalDateKey(maxDue, tzOffsetMinutes),
        tzOffsetMinutes
      )
      const nextDay = new Date(maxDay.end.getTime())
      if (nextDay > cursor) cursor = nextDay
    }

    while (cursor <= horizonEnd) {
      const dayEnd = new Date(cursor.getTime() + DAY_MS)
      const exists = group.some((m) => m.dueAt >= cursor && m.dueAt < dayEnd)
      if (!exists) {
        const due = localTimeOnDay(cursor, sample.dueAt, tzOffsetMinutes)
        const created = await prisma.mission.create({
          data: {
            userId,
            title: sample.title,
            category: sample.category,
            type: sample.type,
            xp: sample.xp,
            dueAt: due,
            status: 'SCHEDULED',
            repeatKey: sample.repeatKey,
          },
        })
        group.push(created)
      }
      cursor = new Date(cursor.getTime() + DAY_MS)
    }
  }
}

export function isRecurringHabit(mission: {
  type: string
  repeatKey?: string | null
  category: string
}): boolean {
  if (mission.type !== 'HABIT') return false
  if (SPECIAL_CATEGORIES.includes(mission.category)) return false
  return mission.repeatKey != null
}
