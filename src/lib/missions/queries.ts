import type { Prisma } from '@prisma/client'

import type { TzOffsetMinutes } from '@/lib/missions/dates'
import { localDayBounds, localTodayStart } from '@/lib/missions/dates'
import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'

export const MISSION_SPECIAL_CATEGORIES = [
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
] as const

/** One-off missions still open from a previous day — shown on today only. */
function carriedOneOffWhere(todayStart: Date): Prisma.MissionWhereInput {
  return {
    repeatKey: null,
    status: 'SCHEDULED',
    dueAt: { lt: todayStart },
    category: { notIn: [...MISSION_SPECIAL_CATEGORIES] },
  }
}

export function missionsForDayWhere(
  userId: string,
  bounds: { start: Date; end: Date },
  options: { isToday: boolean; todayStart: Date }
): Prisma.MissionWhereInput {
  const dueInDay: Prisma.MissionWhereInput = {
    dueAt: { gte: bounds.start, lt: bounds.end },
  }

  if (options.isToday) {
    return {
      userId,
      OR: [dueInDay, carriedOneOffWhere(options.todayStart)],
    }
  }

  return {
    userId,
    AND: [
      dueInDay,
      {
        NOT: carriedOneOffWhere(options.todayStart),
      },
    ],
  }
}

export function todayStartForTz(tzOffsetMinutes: TzOffsetMinutes): Date {
  return localTodayStart(tzOffsetMinutes)
}

export function dayBounds(
  dateKey: string,
  tzOffsetMinutes: TzOffsetMinutes
): { start: Date; end: Date } {
  return localDayBounds(dateKey, tzOffsetMinutes)
}
