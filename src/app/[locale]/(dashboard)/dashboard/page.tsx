'use client'

import { useMemo, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import {
  BookOpen,
  ChevronRight,
  Coins,
  Dumbbell,
  Flame,
  Gift,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

const streakIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  dumbbell: Dumbbell,
  book: BookOpen,
  target: Target,
}

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

  const [xpRange, setXpRange] = useState<'7' | '30'>('7')
  const [levelsDialogOpen, setLevelsDialogOpen] = useState(false)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  const xpDataset =
    xpRange === '7' ? overview.xpTrends.last7Days : overview.xpTrends.last30Days
  const xpMax = Math.max(...xpDataset.map((point) => point.xp))
  const weeklyXpGain = Math.max(overview.summary.currentXP - 7800, 0)

  const currentLevel = levels.find((l) => l.level === user.level)
  const nextLevel = levels.find((l) => l.level === user.level + 1)
  const xpProgress =
    ((overview.summary.currentXP - (currentLevel?.xpRequired || 0)) /
      ((nextLevel?.xpRequired || 10000) - (currentLevel?.xpRequired || 0))) *
    100
  const xpNeeded = (nextLevel?.xpRequired || 10000) - overview.summary.currentXP

  const summaryCards = [
    {
      key: 'level',
      label: t('overview.summary.level'),
      value: `Lv ${overview.summary.level}`,
      icon: Sparkles,
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      shadow: 'shadow-[0_0_32px_rgba(59,130,246,0.45)]',
      progress: xpProgress,
      clickable: true,
    },
    {
      key: 'gold',
      label: t('overview.summary.gold'),
      value: numberFormatter.format(overview.summary.gold),
      icon: Coins,
      gradient: 'from-amber-400 via-yellow-400 to-orange-400',
      shadow: 'shadow-[0_0_32px_rgba(251,191,36,0.5)]',
    },
    {
      key: 'totalXP',
      label: t('overview.summary.totalXP'),
      value: numberFormatter.format(user.totalXP),
      icon: TrendingUp,
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      shadow: 'shadow-[0_0_32px_rgba(52,211,153,0.45)]',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] size-[420px] rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute bottom-[-20%] left-1/4 size-[380px] rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-slate-50">
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white shadow-[0_18px_60px_rgba(88,28,135,0.45)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),rgba(255,255,255,0))] opacity-80" />
            <CardHeader className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/15 px-3 py-1 text-xs tracking-wide text-white uppercase">
                    {t('overview.summary.level')} {overview.summary.level}
                  </Badge>
                  <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    <Flame className="h-3.5 w-3.5 animate-pulse" />{' '}
                    {topStreak?.days || 0}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-semibold md:text-4xl">
                    {t('title')}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
                    {t('welcome', { name: user.name })}
                  </p>
                  {topStreak && (
                    <p className="mt-2 text-xs tracking-[0.3em] text-white/60 uppercase">
                      {t('overview.hero.subtitle', { streak: topStreak.days })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-xs tracking-[0.25em] text-white/70 uppercase">
                    {t('overview.summary.gold')}
                  </span>
                  <span className="flex items-center gap-2 text-3xl font-bold">
                    <Coins className="h-6 w-6 text-yellow-300" />
                    {numberFormatter.format(overview.summary.gold)}
                  </span>
                  <Badge className="bg-white/20 text-xs font-semibold text-white">
                    {t('overview.hero.weeklyGain', {
                      xp: numberFormatter.format(weeklyXpGain),
                    })}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarPickerOpen(true)}
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <Avatar className="h-16 w-16 border-2 border-white/40 shadow-lg">
                    {userAvatar && (
                      <AvatarImage src={userAvatar} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-white/20 text-lg font-semibold text-white">
                      {user.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </CardHeader>
          </Card>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {summaryCards.map((card, index) => {
              const Icon = card.icon
              const isLevelCard = card.key === 'level'

              const cardContent = (
                <Card
                  className={cn(
                    'relative overflow-hidden border border-white/10 bg-white/10 backdrop-blur-xl transition-all',
                    'before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-0 before:transition-opacity hover:before:opacity-20',
                    card.shadow,
                    isLevelCard &&
                      'cursor-pointer hover:scale-[1.02] hover:border-white/20'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full opacity-40 blur-3xl',
                      `animate-[pulse_${6 + index}s_ease-in-out_infinite]`,
                      card.gradient.replace('from', 'from bg-gradient-to-br')
                    )}
                  />
                  <CardHeader className="relative flex flex-row items-center justify-between pb-3">
                    <CardDescription className="text-[0.7rem] tracking-[0.25em] text-white/60 uppercase">
                      {card.label}
                    </CardDescription>
                    <span
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-inner',
                        'bg-gradient-to-br',
                        card.gradient
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </CardHeader>
                  <CardContent className="relative space-y-2">
                    <div className="text-3xl font-semibold text-white drop-shadow">
                      {card.value}
                    </div>
                    {isLevelCard && nextLevel && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/70">
                          <span>{t('overview.level.nextReward')}</span>
                          <span className="flex items-center gap-1 font-semibold text-yellow-300">
                            <Gift className="h-3.5 w-3.5" />
                            {nextLevel.reward.gold} {t('overview.summary.gold')}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[0.65rem] tracking-[0.3em] text-white/50 uppercase">
                            <span>{t('overview.level.progress')}</span>
                            <span>{Math.round(card.progress ?? 0)}%</span>
                          </div>
                          <Progress
                            value={card.progress}
                            className="h-2.5 bg-white/10"
                          />
                          <p className="text-xs text-white/60">
                            {t('overview.level.xpNeeded', {
                              xp: numberFormatter.format(xpNeeded),
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {!isLevelCard && (
                      <p className="text-xs text-white/70">{card.label}</p>
                    )}
                  </CardContent>
                </Card>
              )

              if (isLevelCard) {
                return (
                  <Dialog
                    key={card.key}
                    open={levelsDialogOpen}
                    onOpenChange={setLevelsDialogOpen}
                  >
                    <DialogTrigger asChild>{cardContent}</DialogTrigger>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto border-white/20 bg-slate-900/95 text-white backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                          <Trophy className="h-6 w-6 text-yellow-400" />
                          {t('overview.level.allLevels')}
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                          {t('overview.level.description')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3">
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
                                isNext &&
                                  'border-purple-500/50 bg-purple-500/10',
                                isCompleted &&
                                  'border-emerald-500/30 bg-emerald-500/5 opacity-75',
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
                                    'bg-gradient-to-br from-emerald-500 to-teal-600',
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
                              <div className="flex-1">
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
                                <p className="text-sm text-white/70">
                                  {level.reward.title}
                                </p>
                                <div className="mt-1 flex items-center gap-4 text-xs text-white/60">
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
                )
              }

              return <div key={card.key}>{cardContent}</div>
            })}
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border border-white/10 bg-white/[0.08] backdrop-blur-xl lg:col-span-2">
              <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-purple-200" />
                    {t('overview.tasks.title')}
                  </CardTitle>
                  <CardDescription className="text-sm text-white/70">
                    {t('overview.tasks.subtitle')}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  {t('overview.hero.cta')}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                  <div className="space-y-4">
                    {overview.todayTasks.map((task, index) => {
                      const Icon = taskIconMap[task.type] ?? Sparkles
                      return (
                        <div
                          key={task.id}
                          className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:bg-white/[0.08]"
                        >
                          <div className="absolute top-4 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white shadow-lg">
                            {index + 1}
                          </div>
                          <div className="ml-8 flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-white/15 text-[0.65rem] tracking-[0.3em] text-white uppercase">
                                  {task.status === 'overdue' ? '⚠️' : '✨'}{' '}
                                  {t(`overview.tasks.status.${task.status}`)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="border-white/20 bg-white/10 text-xs text-white"
                                >
                                  {task.category}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="border-none bg-indigo-500/20 text-xs text-indigo-100"
                                >
                                  <Icon className="mr-1 h-3 w-3" />
                                  {t(`overview.tasks.type.${task.type}`)}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm font-medium text-white md:text-base">
                                {task.title}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right">
                              <span className="text-xs text-white/60">
                                {t('overview.tasks.due')}
                              </span>
                              <span className="text-sm font-semibold text-white">
                                {task.due}
                              </span>
                              <Badge className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white shadow-lg">
                                {t('overview.tasks.points', { xp: task.xp })}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border border-white/10 bg-white/[0.08] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Flame className="h-5 w-5 text-orange-300" />
                    {t('overview.streaks.title')}
                  </CardTitle>
                  <CardDescription className="text-sm text-white/65">
                    {t('overview.streaks.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {overview.streaks.map((streak, index) => {
                    const Icon = streakIconMap[streak.icon] ?? Flame
                    return (
                      <div
                        key={streak.id}
                        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:bg-white/[0.12]"
                      >
                        <div
                          className="absolute inset-0 opacity-0 blur-3xl transition group-hover:opacity-60"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(244,63,94,0.2))',
                          }}
                        />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="relative flex-1">
                          <p className="text-sm font-semibold text-white">
                            {streak.label}
                          </p>
                          <p className="text-xs text-white/60">
                            {t('overview.streaks.days', { count: streak.days })}
                          </p>
                        </div>
                        <div className="relative flex flex-col items-end text-right">
                          <Badge
                            variant="outline"
                            className="border-white/20 bg-white/10 text-[0.65rem] tracking-[0.3em] text-white uppercase"
                          >
                            {t('overview.streaks.rank', { rank: index + 1 })}
                          </Badge>
                          <span className="mt-1 text-xs text-white/60">
                            {streak.category}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="border border-white/10 bg-white/[0.08] backdrop-blur-xl">
                <CardHeader className="flex flex-col gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Star className="h-5 w-5 text-yellow-200" />
                      {t('overview.progress.title')}
                    </CardTitle>
                    <CardDescription className="text-sm text-white/70">
                      {t('overview.progress.subtitle')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={xpRange === '7' ? 'default' : 'outline'}
                      className={cn(
                        'border-white/20',
                        xpRange === '7'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                      onClick={() => setXpRange('7')}
                    >
                      {t('overview.progress.toggle.last7')}
                    </Button>
                    <Button
                      size="sm"
                      variant={xpRange === '30' ? 'default' : 'outline'}
                      className={cn(
                        'border-white/20',
                        xpRange === '30'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                      onClick={() => setXpRange('30')}
                    >
                      {t('overview.progress.toggle.last30')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex h-48 items-end gap-3">
                    {xpDataset.map((point, index) => (
                      <div
                        key={point.label}
                        className="flex min-w-[2.4rem] flex-1 flex-col items-center gap-2"
                      >
                        <div className="relative flex h-full w-full items-end overflow-hidden rounded-2xl bg-white/10">
                          <div
                            className="absolute inset-x-0 bottom-0 origin-bottom animate-[pulse_4s_ease-in-out_infinite] rounded-2xl bg-gradient-to-t from-blue-500 via-indigo-500 to-purple-500"
                            style={{
                              height: `${(point.xp / xpMax) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-[0.65rem] tracking-[0.3em] text-white/50 uppercase">
                          {point.label}
                        </span>
                        <span className="text-xs text-white/70">
                          {point.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AvatarPicker
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        currentAvatar={userAvatar}
        currentInitials={user.avatarInitials}
        onAvatarSelect={setUserAvatar}
      />
    </div>
  )
}
