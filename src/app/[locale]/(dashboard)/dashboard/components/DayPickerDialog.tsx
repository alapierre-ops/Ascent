'use client'

import { useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { toBcp47Locale } from '@/lib/locale'
import { cn } from '@/lib/utils'

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

type DayPickerCalendarProps = {
  selectedDate: string
  onSelectDate: (date: string) => void
  onClose: () => void
  locale: string
}

function DayPickerCalendar({
  selectedDate,
  onSelectDate,
  onClose,
  locale,
}: DayPickerCalendarProps) {
  const t = useTranslations('dashboard.overview.missions')
  const tStreak = useTranslations('dashboard.streakModal')

  const [viewDate, setViewDate] = useState(
    () => new Date(selectedDate + 'T12:00:00')
  )

  const weekdayLabels = useMemo(
    () => WEEKDAY_KEYS.map((key) => tStreak(`weekdays.${key}`)),
    [tStreak]
  )

  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const { monthLabel, days, startOffset } = useMemo(() => {
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

    const days: { day: number; dateKey: string }[] = []
    for (let d = 1; d <= lastDay; d++) {
      days.push({
        day: d,
        dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      })
    }

    return { monthLabel, days, startOffset }
  }, [viewDate, locale])

  const goPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  const goNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const handleSelect = (dateKey: string) => {
    onSelectDate(dateKey)
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-white">
          {t('pickDate')}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label={t('prevMonth')}
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
            aria-label={t('nextMonth')}
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
          {days.map(({ day, dateKey }) => {
            const isSelected = dateKey === selectedDate
            const isToday = dateKey === todayKey
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleSelect(dateKey)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition',
                  isSelected &&
                    'bg-gradient-to-br from-indigo-500 to-purple-500 font-semibold text-white shadow-md',
                  !isSelected && 'text-white/80 hover:bg-white/10',
                  isToday &&
                    !isSelected &&
                    'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                )}
              >
                {day}
              </button>
            )
          })}
        </div>

        {selectedDate !== todayKey && (
          <Button
            type="button"
            variant="ghost"
            className="w-full text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => handleSelect(todayKey)}
          >
            {t('goToToday')}
          </Button>
        )}
      </div>
    </>
  )
}

type DayPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDate: string
  onSelectDate: (date: string) => void
  locale: string
}

export function DayPickerDialog({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
  locale,
}: DayPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-onboarding="day-picker-dialog"
        className="border-white/20 bg-slate-900/98 text-white backdrop-blur-xl sm:max-w-sm"
      >
        {open ? (
          <DayPickerCalendar
            key={selectedDate}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onClose={() => onOpenChange(false)}
            locale={locale}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
