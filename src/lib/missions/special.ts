export const DAILY_LOGIN_MISSION_CATEGORY = '__DAILY_LOGIN__'
export const TUTORIAL_MISSION_CATEGORY = '__ONBOARDING__'
/** Demo one-off carried to today during onboarding — not a “special” mission for queries. */
export const ONBOARDING_OVERDUE_MISSION_CATEGORY = '__ONBOARDING_OVERDUE__'

export const TUTORIAL_MISSION_XP = 50
export const ONBOARDING_OVERDUE_MISSION_XP = 20

export const ONBOARDING_OVERDUE_MISSION_TITLES: Record<string, string> = {
  en: 'Read 10 pages (yesterday)',
  fr: 'Lire 10 pages (hier)',
}

export const TUTORIAL_MISSION_TITLES: Record<string, string> = {
  en: 'Finish tutorial',
  fr: 'Terminer le tutoriel',
}

export const DAILY_LOGIN_TITLES: Record<string, string> = {
  en: 'Log in to Ascent',
  fr: 'Se connecter à Ascent',
}

export const DAILY_LOGIN_REWARD_XP = 10
export const DAILY_LOGIN_REWARD_GOLD = 5
