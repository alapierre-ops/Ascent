/** Client `new Date().getTimezoneOffset()` — minutes to add to local time to get UTC. */
export type TzOffsetMinutes = number

export function getClientTzOffset(): TzOffsetMinutes {
  return new Date().getTimezoneOffset()
}

export function getLocalDateKey(
  ref: Date,
  tzOffsetMinutes: TzOffsetMinutes
): string {
  const localMs = ref.getTime() - tzOffsetMinutes * 60 * 1000
  const d = new Date(localMs)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function localDayBounds(
  dateKey: string,
  tzOffsetMinutes: TzOffsetMinutes
): { start: Date; end: Date } {
  const [year, month, day] = dateKey.split('-').map(Number)
  const startMs = Date.UTC(year, month - 1, day) + tzOffsetMinutes * 60 * 1000
  return {
    start: new Date(startMs),
    end: new Date(startMs + 24 * 60 * 60 * 1000),
  }
}

export function localTodayStart(
  tzOffsetMinutes: TzOffsetMinutes,
  ref = new Date()
): Date {
  const key = getLocalDateKey(ref, tzOffsetMinutes)
  return localDayBounds(key, tzOffsetMinutes).start
}

const DAY_MS = 24 * 60 * 60 * 1000

export function addLocalDays(
  dateKey: string,
  days: number,
  tzOffsetMinutes: TzOffsetMinutes
): string {
  const { start } = localDayBounds(dateKey, tzOffsetMinutes)
  return getLocalDateKey(
    new Date(start.getTime() + days * DAY_MS),
    tzOffsetMinutes
  )
}

/** End of local calendar day, used as internal mission bucket. */
export function endOfLocalDay(
  dateKey: string,
  tzOffsetMinutes: TzOffsetMinutes
): Date {
  const { end } = localDayBounds(dateKey, tzOffsetMinutes)
  return new Date(end.getTime() - 60_000)
}
