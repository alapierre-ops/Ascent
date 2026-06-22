import {
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
} from '@/lib/missions/special'

export const DAILY_QUEST_TARGET = 3
export const DAILY_QUEST_BONUS_XP = 25
export const DAILY_QUEST_BONUS_GOLD = 10

const DAILY_QUEST_EXCLUDED_CATEGORIES = [
  DAILY_LOGIN_MISSION_CATEGORY,
  TUTORIAL_MISSION_CATEGORY,
] as const

export function countsTowardDailyQuest(category: string): boolean {
  return !DAILY_QUEST_EXCLUDED_CATEGORIES.includes(
    category as (typeof DAILY_QUEST_EXCLUDED_CATEGORIES)[number]
  )
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
