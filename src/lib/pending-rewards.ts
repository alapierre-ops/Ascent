import { DAILY_QUEST_BONUS_GOLD, DAILY_QUEST_BONUS_XP } from '@/lib/daily-quest'
import { getLevel } from '@/lib/levels'

export type PendingRewardType = 'LEVEL_UP' | 'DAILY_QUEST' | 'DAILY_LOGIN'

export type PendingRewardDto = {
  id: string
  type: PendingRewardType
  refLevel: number | null
  refDate: string | null
  gold: number
  xp: number
}

export function todayDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function levelRewardGold(level: number): number {
  return getLevel(level)?.reward.gold ?? 0
}

export const DAILY_QUEST_REWARD = {
  xp: DAILY_QUEST_BONUS_XP,
  gold: DAILY_QUEST_BONUS_GOLD,
}

export const DAILY_LOGIN_REWARD = {
  xp: 10,
  gold: 5,
}
