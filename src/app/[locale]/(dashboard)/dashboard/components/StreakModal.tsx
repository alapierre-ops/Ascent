'use client'

import { useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import {
  CalendarDays,
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

import { cn } from '@/lib/utils'

const DEMO_STREAK_DAYS = 3
const DEMO_GOAL_DAYS = 7
const DEMO_ACTIVE_DAY_INDICES = new Set([
  1, 2, 3, 5, 8, 12, 15, 18, 20, 22, 23, 24,
])

type StreakModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function StreakModal({ open, onOpenChange }: StreakModalProps) {
  const t = useTranslations('dashboard.streakModal')
  const weekdayLabels = useMemo(
    () => WEEKDAY_KEYS.map((key) => t(`weekdays.${key}`)),
    [t]
  )
  const [viewDate, setViewDate] = useState(() => new Date())

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
    const monthLabel = viewDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
    const today = new Date()
    const isViewingCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month
    const isViewingFutureMonth =
      year > today.getFullYear() ||
      (year === today.getFullYear() && month > today.getMonth())
    const todayDate = today.getDate()

    const maxDayToConsider = isViewingFutureMonth
      ? 0
      : isViewingCurrentMonth
        ? todayDate
        : lastDay

    const activeDayNumbers: number[] = []
    for (let d = 1; d <= maxDayToConsider; d++) {
      if (DEMO_ACTIVE_DAY_INDICES.has(d)) activeDayNumbers.push(d)
    }

    let longestStreak = 0
    if (activeDayNumbers.length > 0) {
      activeDayNumbers.sort((a, b) => a - b)
      let run = 1
      for (let i = 1; i < activeDayNumbers.length; i++) {
        if (activeDayNumbers[i] === activeDayNumbers[i - 1] + 1) run++
        else {
          longestStreak = Math.max(longestStreak, run)
          run = 1
        }
      }
      longestStreak = Math.max(longestStreak, run)
    }

    const days: { day: number; active: boolean; isToday: boolean }[] = []
    for (let d = 1; d <= lastDay; d++) {
      const isCurrentMonth =
        today.getFullYear() === year && today.getMonth() === month
      const isAfterToday = isViewingCurrentMonth && d > todayDate
      const active =
        !isAfterToday && !isViewingFutureMonth && DEMO_ACTIVE_DAY_INDICES.has(d)
      days.push({
        day: d,
        active,
        isToday: isCurrentMonth && todayDate === d,
      })
    }

    return {
      monthLabel,
      days,
      startOffset,
      totalActiveDays: activeDayNumbers.length,
      longestStreakInMonth: longestStreak,
    }
  }, [viewDate])

  const goPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }
  const goNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))
  }

  const progressPercent = Math.min(
    100,
    (DEMO_STREAK_DAYS / DEMO_GOAL_DAYS) * 100
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
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
            {t('streakTitle', { count: DEMO_STREAK_DAYS })}
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
          {/* Block 1: Flame + streak title */}
          <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <Flame className="h-9 w-9 animate-pulse text-white" />
            </div>
            <p className="text-xl font-bold text-white">
              {t('streakTitle', { count: DEMO_STREAK_DAYS })}
            </p>
          </div>

          {/* Month stats (only up to today) — mobile-game style */}
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

          {/* Block 2: Calendar */}
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

          {/* Block 3: Streak goal + lock */}
          <div className="space-y-3 rounded-2xl bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{t('goalTitle')}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-white/70">
                <span>
                  {t('goalProgress', {
                    current: DEMO_STREAK_DAYS,
                    target: DEMO_GOAL_DAYS,
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
