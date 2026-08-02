export type UserMe = {
  email: string | null
  themeId: string
  unlockedThemeIds: string[]
  level: number
  xp: number
  currency: number
  onboardingCompleted: boolean
  isPremium: boolean
}

let inflight: Promise<UserMe | null> | null = null
let cached: UserMe | null = null
let cachedAt = 0

const CACHE_TTL_MS = 4_000

/** Dedupes concurrent /api/user/me calls across ThemeProvider, ads, onboarding, pages. */
export function fetchUserMe(options?: {
  force?: boolean
}): Promise<UserMe | null> {
  const force = options?.force ?? false
  if (!force && cached && Date.now() - cachedAt < CACHE_TTL_MS) {
    return Promise.resolve(cached)
  }
  if (!force && inflight) return inflight

  inflight = fetch('/api/user/me')
    .then(async (res) => {
      if (!res.ok) return null
      const data = (await res.json()) as UserMe
      cached = data
      cachedAt = Date.now()
      return data
    })
    .catch(() => null)
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function invalidateUserMeCache() {
  cached = null
  cachedAt = 0
  inflight = null
}

export function patchUserMeCache(partial: Partial<UserMe>) {
  if (!cached) return
  cached = { ...cached, ...partial }
  cachedAt = Date.now()
}
