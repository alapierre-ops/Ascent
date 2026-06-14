'use client'

import { useEffect, useMemo, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Lock,
  Share2,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

import { toBcp47Locale } from '@/lib/locale'
import { cn } from '@/lib/utils'

type StreakData = {
  currentStreak: number
  goalDays: number
  activeDays: number[]
  monthActiveDays: number
  monthLongestStreak: number
  avatarObjectives: {
    level: number
    avatarCount: number
    unlocked: boolean
  }[]
  userLevel: number
}

type StreakModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStreakChange?: (streak: number) => void
}

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function StreakModal({
  open,
  onOpenChange,
  onStreakChange,
}: StreakModalProps) {
  const t = useTranslations('dashboard.streakModal')
  const locale = useLocale()
  const weekdayLabels = useMemo(
    () => WEEKDAY_KEYS.map((key) => t(`weekdays.${key}`)),
    [t]
  )
  const [viewDate, setViewDate] = useState(() => new Date())
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)

    fetch(
      `/api/streak?year=${viewDate.getFullYear()}&month=${viewDate.getMonth()}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: StreakData | null) => {
        if (cancelled || !data) return
        setStreakData(data)
        onStreakChange?.(data.currentStreak)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, viewDate, onStreakChange])

  const {
    monthLabel,
    days,
    startOffset,
    totalActiveDays,
    longestStreakInMonth,
  } = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const lastDay = last.getDate()
    const startOffset = (first.getDay() + 6) % 7
    const monthLabel = viewDate.toLocaleDateString(toBcp47Locale(locale), {
      month: 'long',
      year: 'numeric',
    })
    const today = new Date()
    const isViewingCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month
    const todayDate = today.getDate()
    const activeDaySet = new Set(streakData?.activeDays ?? [])

    const days: { day: number; active: boolean; isToday: boolean }[] = []
    for (let d = 1; d <= lastDay; d++) {
      const isAfterToday = isViewingCurrentMonth && d > todayDate
      days.push({
        day: d,
        active: !isAfterToday && activeDaySet.has(d),
        isToday: isViewingCurrentMonth && todayDate === d,
      })
    }

    return {
      monthLabel,
      days,
      startOffset,
      totalActiveDays: streakData?.monthActiveDays ?? 0,
      longestStreakInMonth: streakData?.monthLongestStreak ?? 0,
    }
  }, [viewDate, streakData, locale])

  const goPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }
  const goNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))
  }

  const currentStreak = streakData?.currentStreak ?? 0
  const goalDays = streakData?.goalDays ?? 7
  const progressPercent = Math.min(100, (currentStreak / goalDays) * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-onboarding="streak-modal"
        showCloseButton={false}
        className="max-h-[90dvh] overflow-hidden border-white/20 bg-slate-900/98 p-0 text-white backdrop-blur-xl sm:max-w-md"
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-white/10 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {}}
          >
            <Share2 className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{t('share')}</span>
          </Button>
          <DialogTitle className="sr-only">
            {t('streakTitle', { count: currentStreak })}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pt-4 pb-6">
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <Flame className="h-9 w-9 animate-pulse text-white" />
            </div>
            <p className="text-xl font-bold text-white">
              {loading
                ? t('loading')
                : t('streakTitle', { count: currentStreak })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-3 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
              <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-orange-400/20 blur-md" />
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.65rem] font-medium tracking-wider text-white/60 uppercase">
                    {t('monthLongestStreak')}
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {longestStreakInMonth}
                    <span className="ml-1.5 text-xs font-medium text-white/70">
                      {t('daysUnit')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-yellow-500/10 p-3 shadow-[0_0_20px_rgba(251,191,36,0.12)]">
              <div className="absolute -top-2 -right-2 h-12 w-12 rounded-full bg-amber-400/20 blur-md" />
              <div className="relative flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <CalendarDays className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.65rem] font-medium tracking-wider text-white/60 uppercase">
                    {t('monthActiveDays')}
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {totalActiveDays}
                    <span className="ml-1.5 text-xs font-medium text-white/70">
                      {t('daysUnit')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goPrevMonth}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold text-white capitalize">
                {monthLabel}
              </p>
              <button
                type="button"
                onClick={goNextMonth}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekdayLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-[0.65rem] font-medium text-white/50 uppercase"
                >
                  {label}
                </span>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <span key={`pad-${i}`} />
              ))}
              {days.map(({ day, active, isToday }) => (
                <span
                  key={day}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-sm',
                    active &&
                      'bg-gradient-to-br from-orange-500 to-amber-500 font-semibold text-white',
                    !active && 'text-white/60',
                    isToday &&
                      !active &&
                      'ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-900'
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{t('goalTitle')}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/70">
                <span>
                  {t('goalProgress', {
                    current: currentStreak,
                    target: goalDays,
                  })}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2.5 bg-white/10" />
            </div>
            <div className="flex items-start gap-2 text-xs text-white/60">
              <Lock className="h-4 w-4 shrink-0 text-amber-400/80" />
              <p>{t('goalUnlock')}</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">
              {t('avatarObjectivesTitle')}
            </p>
            <div className="space-y-2">
              {(streakData?.avatarObjectives ?? []).map((objective) => (
                <div
                  key={objective.level}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
                    objective.unlocked
                      ? 'border-emerald-400/40 bg-emerald-500/10'
                      : 'border-white/10 bg-white/[0.03]'
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {t('avatarObjectiveTitle', { level: objective.level })}
                    </p>
                    <p className="text-xs text-white/60">
                      {t('avatarObjectiveDescription', {
                        count: objective.avatarCount,
                      })}
                    </p>
                  </div>
                  {objective.unlocked ? (
                    <Check className="h-5 w-5 shrink-0 text-emerald-300" />
                  ) : (
                    <div className="flex shrink-0 items-center gap-1 text-xs text-white/60">
                      <Lock className="h-4 w-4 text-amber-400/80" />
                      {t('avatarObjectiveLocked', {
                        level: objective.level,
                        current: streakData?.userLevel ?? 1,
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
