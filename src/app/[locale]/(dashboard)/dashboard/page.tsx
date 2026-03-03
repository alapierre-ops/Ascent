'use client'

import { useMemo, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  ChevronRight,
  Coins,
  Flame,
  Plus,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

import { cn } from '@/lib/utils'

import { dashboardData } from '@/data/dashboard'

import { AvatarPicker } from './components/AvatarPicker'
import { StreakModal } from './components/StreakModal'

const taskIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  habit: Sparkles,
  goal: Target,
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const locale = useLocale()

  const { user, overview, levels } = dashboardData

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const topStreak = overview.streaks[0]

  const [levelsDialogOpen, setLevelsDialogOpen] = useState(false)
  const [streakModalOpen, setStreakModalOpen] = useState(false)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  const currentLevel = levels.find((l) => l.level === user.level)
  const nextLevel = levels.find((l) => l.level === user.level + 1)
  const xpProgress =
    ((overview.summary.currentXP - (currentLevel?.xpRequired || 0)) /
      ((nextLevel?.xpRequired || 10000) - (currentLevel?.xpRequired || 0))) *
    100
  const xpNeeded = (nextLevel?.xpRequired || 10000) - overview.summary.currentXP
  const todayTasks = overview.todayTasks
  const hasTasks = todayTasks.length > 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] size-[420px] rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute bottom-[-20%] left-1/4 size-[380px] rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-slate-50">
          {/* Player bar — mobile-game style: avatar + stats as icons only */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white shadow-[0_12px_40px_rgba(88,28,135,0.4)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),transparent_50%)] opacity-90" />
            <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
              <button
                type="button"
                onClick={() => setAvatarPickerOpen(true)}
                className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                aria-label={t('welcome', { name: user.name })}
              >
                <Avatar className="h-12 w-12 border-2 border-white/50 shadow-xl sm:h-14 sm:w-14">
                  {userAvatar && (
                    <AvatarImage src={userAvatar} alt={user.name} />
                  )}
                  <AvatarFallback className="bg-white/25 text-base font-bold text-white sm:text-lg">
                    {user.avatarInitials}
                  </AvatarFallback>
                </Avatar>
              </button>

              <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
                <Dialog
                  open={levelsDialogOpen}
                  onOpenChange={setLevelsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:gap-2 sm:px-4"
                      aria-label={`${t('overview.summary.level')} ${overview.summary.level}`}
                    >
                      <Sparkles className="h-4 w-4 text-amber-200 sm:h-5 sm:w-5" />
                      <span className="text-lg font-bold sm:text-xl">
                        {overview.summary.level}
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 max-w-2xl flex-col border-white/20 bg-slate-900/95 text-white backdrop-blur-xl max-sm:top-4 max-sm:right-auto max-sm:left-1/2 max-sm:h-[calc(100dvh-2rem)] max-sm:max-h-[calc(100dvh-2rem)] max-sm:w-[calc(100%-2rem)] max-sm:-translate-x-1/2 max-sm:translate-y-0 max-sm:overflow-visible sm:h-auto sm:max-h-[80vh] sm:min-h-0">
                    <DialogHeader className="sticky top-0 z-10 -mx-6 -mt-1 shrink-0 border-b border-white/10 bg-slate-900/95 px-6 pt-1 pb-4 backdrop-blur-sm">
                      <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                        <Trophy className="h-5 w-5 text-yellow-400 sm:h-6 sm:w-6" />
                        {t('overview.level.allLevels')}
                      </DialogTitle>
                      <DialogDescription className="text-sm text-white/70">
                        {t('overview.level.description')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="levels-dialog-scroll mt-4 -mr-1 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      {levels.map((level) => {
                        const isCurrent = level.level === user.level
                        const isCompleted = level.level < user.level
                        const isNext = level.level === user.level + 1
                        const isLocked = level.level > user.level + 1
                        return (
                          <div
                            key={level.level}
                            className={cn(
                              'relative flex items-center gap-4 rounded-xl border p-4 transition-all',
                              isCurrent &&
                                'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                              isNext && 'border-purple-500/50 bg-purple-500/10',
                              isCompleted &&
                                '!border-emerald-400/70 bg-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
                              isLocked &&
                                'border-white/10 bg-white/5 opacity-50'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white shadow-lg',
                                isCurrent &&
                                  'bg-gradient-to-br from-blue-500 to-indigo-600',
                                isNext &&
                                  'bg-gradient-to-br from-purple-500 to-fuchsia-600',
                                isCompleted &&
                                  'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30',
                                isLocked &&
                                  'bg-gradient-to-br from-slate-600 to-slate-700'
                              )}
                            >
                              {isCompleted ? (
                                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                              ) : (
                                level.level
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">
                                  {t('overview.level.level')} {level.level}
                                </p>
                                {isCurrent && (
                                  <Badge className="bg-blue-500/20 text-blue-200">
                                    {t('overview.level.current')}
                                  </Badge>
                                )}
                                {isNext && (
                                  <Badge className="bg-purple-500/20 text-purple-200">
                                    {t('overview.level.next')}
                                  </Badge>
                                )}
                              </div>
                              <p
                                className={cn(
                                  'text-sm',
                                  isCompleted
                                    ? 'text-emerald-200/95'
                                    : 'text-white/70'
                                )}
                              >
                                {level.reward.title}
                              </p>
                              {isCurrent && nextLevel && (
                                <div className="mt-2 space-y-1.5">
                                  <div className="flex items-center justify-between text-xs text-white/80">
                                    <span>{t('overview.level.progress')}</span>
                                    <span className="font-semibold">
                                      {Math.round(xpProgress)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={xpProgress}
                                    className="h-2 bg-white/10"
                                    aria-label={t('overview.level.progress')}
                                  />
                                  <p className="text-xs text-white/60">
                                    {t('overview.level.xpNeeded', {
                                      xp: numberFormatter.format(xpNeeded),
                                    })}
                                  </p>
                                </div>
                              )}
                              <div
                                className={cn(
                                  'mt-1 flex items-center gap-4 text-xs',
                                  isCompleted
                                    ? 'text-emerald-200/80'
                                    : 'text-white/60',
                                  isCurrent && nextLevel && 'mt-2'
                                )}
                              >
                                <span>
                                  {t('overview.level.xpRequired')}:{' '}
                                  {numberFormatter.format(level.xpRequired)}
                                </span>
                                <span className="flex items-center gap-1 text-yellow-300">
                                  <Coins className="h-3 w-3" />
                                  {level.reward.gold}{' '}
                                  {t('overview.summary.gold')}
                                </span>
                              </div>
                            </div>
                            {isNext && (
                              <ChevronRight className="h-5 w-5 text-purple-400" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </DialogContent>
                </Dialog>

                <button
                  type="button"
                  onClick={() => setStreakModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:gap-2 sm:px-4"
                  title={t('overview.streaks.days', {
                    count: topStreak?.days ?? 0,
                  })}
                >
                  <Flame className="h-4 w-4 animate-pulse text-orange-200 sm:h-5 sm:w-5" />
                  <span className="text-lg font-bold sm:text-xl">
                    {topStreak?.days ?? 0}
                  </span>
                </button>

                <Link
                  href={`/${locale}/shop`}
                  className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:gap-2 sm:px-4"
                  title={t('overview.summary.gold')}
                >
                  <Coins className="h-4 w-4 text-yellow-300 sm:h-5 sm:w-5" />
                  <span className="text-lg font-bold sm:text-xl">
                    {numberFormatter.format(overview.summary.gold)}
                  </span>
                </Link>
              </div>
            </div>
          </Card>

          {/* Today's tasks — main landing content */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  {t('overview.tasks.title')}
                </h2>
                <p className="mt-0.5 text-sm text-white/70">
                  {hasTasks
                    ? t('overview.tasks.taskCount', {
                        count: todayTasks.length,
                      })
                    : t('overview.tasks.subtitle')}
                </p>
              </div>
              <Button
                className="w-full shrink-0 gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-lg transition hover:opacity-95 sm:w-auto"
                onClick={() => {}}
              >
                <Plus className="h-4 w-4" />
                {t('overview.tasks.addTask')}
              </Button>
            </div>

            {!hasTasks ? (
              <Card className="border border-dashed border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Target className="h-7 w-7 text-white/60" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">
                    {t('overview.tasks.emptyTitle')}
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-white/60">
                    {t('overview.tasks.emptyDescription')}
                  </p>
                  <Button
                    className="mt-4 gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    onClick={() => {}}
                  >
                    <Plus className="h-4 w-4" />
                    {t('overview.tasks.emptyCta')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((task) => {
                  const Icon = taskIconMap[task.type] ?? Sparkles
                  const isOverdue = task.status === 'overdue'
                  return (
                    <button
                      key={task.id}
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition hover:bg-white/[0.06] active:scale-[0.99]',
                        isOverdue
                          ? 'border-amber-500/30 bg-amber-500/5'
                          : 'border-white/10 bg-white/[0.06]'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          isOverdue
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/10 text-white/90'
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {task.title}
                        </p>
                        <p className="text-xs text-white/60">
                          {task.due}
                          {isOverdue && (
                            <span className="ml-1.5 text-amber-400">
                              · {t('overview.tasks.status.overdue')}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-500/80 to-fuchsia-500/80 px-2.5 py-1 text-xs font-semibold text-white">
                        +{task.xp} XP
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <AvatarPicker
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        currentAvatar={userAvatar}
        currentInitials={user.avatarInitials}
        onAvatarSelect={setUserAvatar}
      />
      <StreakModal open={streakModalOpen} onOpenChange={setStreakModalOpen} />
    </div>
  )
}
