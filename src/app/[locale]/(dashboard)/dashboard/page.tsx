'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { signOut } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Flame,
  Gift,
  Loader2,
  Plus,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
} from 'lucide-react'

import { useOnboardingOptional } from '@/components/onboarding/OnboardingProvider'
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

import {
  DAILY_QUEST_BONUS_GOLD,
  DAILY_QUEST_BONUS_XP,
  DAILY_QUEST_TARGET,
  countsTowardDailyQuest,
} from '@/lib/daily-quest'
import { toBcp47Locale } from '@/lib/locale'
import { DAILY_LOGIN_MISSION_CATEGORY } from '@/lib/missions/special'
import { TUTORIAL_MISSION_CATEGORY } from '@/lib/onboarding/constants'
import { ONBOARDING_TUTORIAL_READY_EVENT } from '@/lib/onboarding/events'
import type { OnboardingAdvanceEvent } from '@/lib/onboarding/steps'
import type { PendingRewardDto } from '@/lib/pending-rewards'
import { cn } from '@/lib/utils'

import { dashboardData } from '@/data/dashboard'

import { AvatarPicker } from './components/AvatarPicker'
import {
  type ClaimCelebration,
  ClaimRewardModal,
} from './components/ClaimRewardModal'
import { type MissionForModal, MissionModal } from './components/MissionModal'
import { StreakModal } from './components/StreakModal'

const missionIconMap: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  HABIT: Sparkles,
  GOAL: Target,
}

function formatDueLabel(dueAt: string, locale: string): string {
  const bcp47 = toBcp47Locale(locale)
  const d = new Date(dueAt)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const dueDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (dueDate.getTime() === today.getTime()) {
    return d.toLocaleTimeString(bcp47, { hour: '2-digit', minute: '2-digit' })
  }
  if (dueDate.getTime() === yesterday.getTime()) {
    return locale.startsWith('fr') ? 'Hier' : 'Yesterday'
  }
  return d.toLocaleDateString(bcp47, { day: 'numeric', month: 'short' })
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tMissions = useTranslations('dashboard.overview.missions')
  const locale = useLocale()

  const { user, overview, levels } = dashboardData

  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const [levelsDialogOpen, setLevelsDialogOpen] = useState(false)
  const [streakModalOpen, setStreakModalOpen] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [missions, setMissions] = useState<MissionForModal[]>([])
  const [missionsLoading, setMissionsLoading] = useState(true)
  const [missionModalOpen, setMissionModalOpen] = useState(false)
  const [missionEditing, setMissionEditing] = useState<MissionForModal | null>(
    null
  )
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
  })
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [justCompletedMissionId, setJustCompletedMissionId] = useState<
    string | null
  >(null)
  const [starterLoading, setStarterLoading] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState<{
    completed: number
    scheduled: number
    totalXp: number
  } | null>(null)
  const [goldGain, setGoldGain] = useState<number | null>(null)
  const [pendingRewards, setPendingRewards] = useState<PendingRewardDto[]>([])
  const [claimCelebration, setClaimCelebration] =
    useState<ClaimCelebration>(null)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<{
    level: number
    xp: number
    currency: number
  } | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  const onboarding = useOnboardingOptional()
  const pendingOnboardingClaim = useRef<OnboardingAdvanceEvent | null>(null)

  const fetchPendingRewards = useCallback(async () => {
    try {
      const res = await fetch('/api/rewards/pending')
      if (res.ok) {
        setPendingRewards(await res.json())
      }
    } catch {
      setPendingRewards([])
    }
  }, [])

  const fetchMissions = useCallback(
    async (date?: string) => {
      setMissionsLoading(true)
      const d = date ?? selectedDate
      try {
        const res = await fetch(`/api/missions?date=${d}`)
        if (res.ok) {
          const data = await res.json()
          setMissions(data)
        } else {
          setMissions([])
        }
      } catch {
        setMissions([])
      } finally {
        setMissionsLoading(false)
      }
    },
    [selectedDate]
  )

  const claimReward = useCallback(
    async (rewardId: string) => {
      setClaimingId(rewardId)
      try {
        const res = await fetch('/api/rewards/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: rewardId }),
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.user) {
          setUserStats(data.user)
          if (data.gold > 0) {
            setGoldGain(data.gold)
            setTimeout(() => setGoldGain(null), 2200)
          }
        }
        setClaimCelebration({
          gold: data.gold,
          xp: data.xp,
          type: data.type,
          refLevel: data.refLevel,
        })
        if (
          onboarding?.currentStep?.id === 'daily-login' &&
          data.type === 'DAILY_LOGIN'
        ) {
          pendingOnboardingClaim.current = 'daily-login-claimed'
          onboarding.pause()
        } else if (
          onboarding?.currentStep?.id === 'claim-level-modal' &&
          data.type === 'LEVEL_UP'
        ) {
          pendingOnboardingClaim.current = 'level-reward-claimed'
          onboarding.pause()
        }
        await fetchPendingRewards()
        await fetchMissions()
      } finally {
        setClaimingId(null)
      }
    },
    [fetchMissions, fetchPendingRewards, onboarding]
  )

  const closeCelebration = useCallback(() => {
    setClaimCelebration(null)
    const event = pendingOnboardingClaim.current
    if (!event || !onboarding?.currentStep) return
    const stepId = onboarding.currentStep.id
    const matches =
      (event === 'daily-login-claimed' && stepId === 'daily-login') ||
      (event === 'level-reward-claimed' && stepId === 'claim-level-modal')
    if (!matches) return
    pendingOnboardingClaim.current = null
    onboarding.signal(event)
  }, [onboarding])

  const dailyQuestPending = pendingRewards.find((r) => r.type === 'DAILY_QUEST')
  const dailyLoginPending = pendingRewards.find((r) => r.type === 'DAILY_LOGIN')
  const levelPendingCount = pendingRewards.filter(
    (r) => r.type === 'LEVEL_UP'
  ).length

  const goToPrevDay = useCallback(() => {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setSelectedDate(next)
  }, [selectedDate])

  const goToNextDay = useCallback(() => {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setSelectedDate(next)
  }, [selectedDate])

  const selectedDateLabel = useMemo(() => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
    if (selectedDate === todayStr) return tMissions('dayToday')
    if (selectedDate === yesterdayStr) return tMissions('dayYesterday')
    if (selectedDate === tomorrowStr) return tMissions('dayTomorrow')
    const d = new Date(selectedDate + 'T12:00:00')
    return d.toLocaleDateString(toBcp47Locale(locale), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }, [selectedDate, locale, tMissions])

  const completeMission = useCallback(
    async (missionId: string) => {
      setCompletingId(missionId)
      try {
        const res = await fetch(`/api/missions/${missionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUserStats(data.user)
          }
          if (onboarding?.tutorialMissionId === missionId) {
            onboarding.signal('tutorial-completed')
          }
          await fetchPendingRewards()
          setJustCompletedMissionId(missionId)
          setTimeout(() => setJustCompletedMissionId(null), 1200)
          await fetchMissions()
        }
      } finally {
        setCompletingId(null)
      }
    },
    [fetchMissions, onboarding, fetchPendingRewards]
  )

  const uncompleteMission = useCallback(
    async (missionId: string) => {
      setCompletingId(missionId)
      try {
        const res = await fetch(`/api/missions/${missionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SCHEDULED' }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.user) setUserStats(data.user)
          await fetchMissions()
          await fetchPendingRewards()
        }
      } finally {
        setCompletingId(null)
      }
    },
    [fetchMissions, fetchPendingRewards]
  )

  useEffect(() => {
    let cancelled = false
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data?.level != null)
          setUserStats({
            level: data.level,
            xp: data.xp ?? 0,
            currency: data.currency ?? 0,
          })
        if (data?.image !== undefined) setUserAvatar(data.image ?? null)
        if (data?.name) setUserName(data.name)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const openMissionModal = useCallback(
    (mission: MissionForModal | null) => {
      setMissionEditing(mission)
      setMissionModalOpen(true)
      if (
        onboarding?.currentStep?.id === 'add-mission' &&
        !mission &&
        onboarding.active
      ) {
        onboarding.pause()
      }
    },
    [onboarding]
  )

  const displayName = userName ?? user.name
  const avatarInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || user.avatarInitials

  const displayLevel = userStats?.level ?? user.level
  const displayXp = userStats?.xp ?? overview.summary.currentXP
  const currentLevel = levels.find((l) => l.level === displayLevel)
  const nextLevel = levels.find((l) => l.level === displayLevel + 1)
  const xpProgress =
    ((displayXp - (currentLevel?.xpRequired || 0)) /
      ((nextLevel?.xpRequired || 10000) - (currentLevel?.xpRequired || 0))) *
    100
  const xpNeeded = (nextLevel?.xpRequired || 10000) - displayXp
  const hasMissions = missions.length > 0
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isTodaySelected = selectedDate === todayStr
  const completedTodayCount = missions.filter(
    (m) => m.status === 'COMPLETED' && countsTowardDailyQuest(m.category)
  ).length
  const questTarget = DAILY_QUEST_TARGET
  const questProgress = Math.min(100, (completedTodayCount / questTarget) * 100)

  useEffect(() => {
    fetch('/api/daily/ensure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale }),
    })
      .then(() => fetchMissions(todayStr))
      .then(() => fetchPendingRewards())
      .catch(() => {})
  }, [locale, todayStr, fetchMissions, fetchPendingRewards])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMissions(selectedDate)
  }, [selectedDate, fetchMissions])

  useEffect(() => {
    let cancelled = false
    fetch('/api/missions/weekly')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setWeeklySummary(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [missions])

  useEffect(() => {
    let cancelled = false
    fetch('/api/streak')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.currentStreak != null) {
          setCurrentStreak(data.currentStreak)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [missions])

  const applyStarterPack = useCallback(async () => {
    setStarterLoading(true)
    try {
      const res = await fetch('/api/missions/templates/starter', {
        method: 'POST',
      })
      if (res.ok) {
        await fetchMissions(todayStr)
        setSelectedDate(todayStr)
      }
    } finally {
      setStarterLoading(false)
    }
  }, [fetchMissions, todayStr])

  useEffect(() => {
    if (!onboarding?.active) return
    const stepId = onboarding.currentStep?.id
    const id = window.setTimeout(() => {
      if (stepId !== 'claim-level' && stepId !== 'claim-level-modal') {
        setLevelsDialogOpen(false)
      }
      if (stepId !== 'streak' && stepId !== 'streak-modal') {
        setStreakModalOpen(false)
      }
    }, 0)
    return () => window.clearTimeout(id)
  }, [onboarding?.active, onboarding?.currentStep?.id])

  useEffect(() => {
    if (levelsDialogOpen && onboarding?.currentStep?.id === 'claim-level') {
      onboarding.signal('level-modal-opened')
    }
  }, [levelsDialogOpen, onboarding])

  useEffect(() => {
    if (streakModalOpen && onboarding?.currentStep?.id === 'streak') {
      onboarding.signal('streak-modal-opened')
    }
  }, [streakModalOpen, onboarding])

  useEffect(() => {
    const onTutorialReady = () => {
      void fetchMissions(todayStr)
      setSelectedDate(todayStr)
    }
    window.addEventListener(ONBOARDING_TUTORIAL_READY_EVENT, onTutorialReady)
    return () => {
      window.removeEventListener(
        ONBOARDING_TUTORIAL_READY_EVENT,
        onTutorialReady
      )
    }
  }, [fetchMissions, todayStr])

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
          <Card
            data-onboarding="player-bar"
            className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white shadow-[0_12px_40px_rgba(88,28,135,0.4)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),transparent_50%)] opacity-90" />
            <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
              <button
                type="button"
                data-onboarding="avatar"
                onClick={() => setAvatarPickerOpen(true)}
                className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
                aria-label={t('welcome', { name: displayName })}
              >
                <Avatar className="h-12 w-12 border-2 border-white/50 shadow-xl sm:h-14 sm:w-14">
                  {userAvatar && (
                    <AvatarImage src={userAvatar} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-white/25 text-base font-bold text-white sm:text-lg">
                    {avatarInitials}
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
                      data-onboarding="level"
                      className="relative flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:gap-2 sm:px-4"
                      aria-label={`${t('overview.summary.level')} ${userStats?.level ?? overview.summary.level}`}
                    >
                      {levelPendingCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-lg">
                          {levelPendingCount}
                        </span>
                      )}
                      <Sparkles className="h-4 w-4 text-amber-200 sm:h-5 sm:w-5" />
                      <span className="text-lg font-bold sm:text-xl">
                        {userStats?.level ?? overview.summary.level}
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    data-onboarding="levels-dialog"
                    className="flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] min-h-0 max-w-2xl flex-col border-white/20 bg-slate-900/95 text-white backdrop-blur-xl max-sm:top-4 max-sm:right-auto max-sm:left-1/2 max-sm:h-[calc(100dvh-2rem)] max-sm:max-h-[calc(100dvh-2rem)] max-sm:w-[calc(100%-2rem)] max-sm:-translate-x-1/2 max-sm:translate-y-0 max-sm:overflow-visible sm:h-auto sm:max-h-[80vh] sm:min-h-0"
                  >
                    <DialogHeader className="sticky top-0 -mx-6 -mt-1 shrink-0 border-b border-white/10 bg-slate-900/95 px-6 pt-1 pb-4 backdrop-blur-sm">
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
                        const isCurrent = level.level === displayLevel
                        const isCompleted = level.level < displayLevel
                        const isNext = level.level === displayLevel + 1
                        const isLocked = level.level > displayLevel + 1
                        const levelPending = pendingRewards.find(
                          (r) =>
                            r.type === 'LEVEL_UP' && r.refLevel === level.level
                        )
                        return (
                          <div
                            key={level.level}
                            className={cn(
                              'relative flex items-center gap-4 rounded-xl border p-4 transition-all',
                              levelPending &&
                                'animate-pulse border-amber-400/70 bg-amber-500/15 ring-2 ring-amber-400/60',
                              isCurrent &&
                                !levelPending &&
                                'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                              isNext &&
                                !levelPending &&
                                'border-purple-500/50 bg-purple-500/10',
                              isCompleted &&
                                !levelPending &&
                                '!border-emerald-400/70 bg-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
                              isLocked &&
                                !levelPending &&
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
                                {t(`overview.level.rewards.${level.level}`)}
                              </p>
                              {isNext && (
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
                              {isCurrent && !nextLevel && (
                                <p className="mt-2 text-xs text-emerald-200/80">
                                  {t('overview.level.maxLevel')}
                                </p>
                              )}
                              <div
                                className={cn(
                                  'mt-1 flex items-center gap-4 text-xs',
                                  isCompleted
                                    ? 'text-emerald-200/80'
                                    : 'text-white/60',
                                  isNext && 'mt-2'
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
                            {levelPending ? (
                              <Button
                                type="button"
                                size="sm"
                                data-onboarding="level-claim"
                                disabled={claimingId === levelPending.id}
                                onClick={() => claimReward(levelPending.id)}
                                className="shrink-0 animate-pulse bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
                              >
                                {claimingId === levelPending.id
                                  ? '…'
                                  : tMissions('claimReward')}
                              </Button>
                            ) : (
                              isNext && (
                                <ChevronRight className="h-5 w-5 text-purple-400" />
                              )
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </DialogContent>
                </Dialog>

                <button
                  type="button"
                  data-onboarding="streak"
                  onClick={() => setStreakModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:gap-2 sm:px-4"
                  title={t('overview.streaks.days', {
                    count: currentStreak,
                  })}
                >
                  <Flame className="h-4 w-4 animate-pulse text-orange-200 sm:h-5 sm:w-5" />
                  <span className="text-lg font-bold sm:text-xl">
                    {currentStreak}
                  </span>
                </button>

                <Link
                  href={`/${locale}/shop`}
                  data-onboarding="gold"
                  className="relative flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 shadow-lg backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:gap-2 sm:px-4"
                  title={t('overview.summary.gold')}
                >
                  <Coins className="h-4 w-4 text-yellow-300 sm:h-5 sm:w-5" />
                  <span
                    className={cn(
                      'text-lg font-bold sm:text-xl',
                      goldGain != null && 'gold-just-updated'
                    )}
                  >
                    {numberFormatter.format(
                      userStats?.currency ?? overview.summary.gold
                    )}
                  </span>
                  {goldGain != null && (
                    <span className="gold-gain-badge animate-in fade-in zoom-in absolute -top-1 -right-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-xs font-bold text-slate-900 duration-200">
                      +{numberFormatter.format(goldGain)}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </Card>

          {/* Missions — main landing content with day navigation */}
          <section data-onboarding="missions" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevDay}
                  className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={tMissions('dayYesterday')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="min-w-[8rem] text-center">
                  <h2 className="text-xl font-semibold text-white capitalize sm:text-2xl">
                    {selectedDateLabel}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={goToNextDay}
                  className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={tMissions('dayTomorrow')}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <Button
                data-onboarding="add-mission"
                className="w-full shrink-0 gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-lg transition hover:opacity-95 sm:w-auto"
                onClick={() => openMissionModal(null)}
              >
                <Plus className="h-4 w-4" />
                {tMissions('addMission')}
              </Button>
            </div>

            {missionsLoading ? (
              <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2
                    className="h-10 w-10 animate-spin text-indigo-400"
                    aria-hidden
                  />
                  <p className="mt-4 text-sm text-white/60">
                    {tMissions('loading')}
                  </p>
                </CardContent>
              </Card>
            ) : !hasMissions ? (
              <Card className="border border-dashed border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <Target className="h-7 w-7 text-white/60" />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">
                    {tMissions('emptyTitle')}
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-white/60">
                    {tMissions('emptyDescription')}
                  </p>
                  <Button
                    className="mt-4 gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                    onClick={() => openMissionModal(null)}
                  >
                    <Plus className="h-4 w-4" />
                    {tMissions('emptyCta')}
                  </Button>
                  <Button
                    className="mt-3 gap-2 border border-indigo-400/40 bg-indigo-500/15 text-indigo-100 hover:bg-indigo-500/25"
                    onClick={applyStarterPack}
                    disabled={starterLoading}
                  >
                    <Rocket className="h-4 w-4" />
                    {starterLoading
                      ? tMissions('loading')
                      : tMissions('starterPackCta')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {isTodaySelected && (
                  <Card
                    data-onboarding="daily-quest"
                    className="border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                  >
                    <CardContent className="space-y-3 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">
                          {tMissions('dailyQuestTitle')}
                        </p>
                        <span className="text-xs text-white/70">
                          {tMissions('dailyQuestProgress', {
                            completed: completedTodayCount,
                            target: questTarget,
                          })}
                        </span>
                      </div>
                      <Progress
                        value={questProgress}
                        className="h-2 bg-white/10"
                        aria-label={tMissions('dailyQuestTitle')}
                      />
                      {dailyQuestPending ? (
                        <Button
                          type="button"
                          size="sm"
                          data-onboarding="daily-quest-claim"
                          disabled={claimingId === dailyQuestPending.id}
                          onClick={() => claimReward(dailyQuestPending.id)}
                          className="w-full animate-pulse bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
                        >
                          {claimingId === dailyQuestPending.id
                            ? '…'
                            : tMissions('claimDailyQuest')}
                        </Button>
                      ) : (
                        <p className="text-xs text-white/60">
                          {tMissions('dailyQuestReward', {
                            xp: DAILY_QUEST_BONUS_XP,
                            gold: DAILY_QUEST_BONUS_GOLD,
                            target: questTarget,
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {weeklySummary && (
                  <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                    <CardContent className="grid grid-cols-3 gap-2 py-4 text-center">
                      <div>
                        <p className="text-xs text-white/60">
                          {tMissions('weeklyCompleted')}
                        </p>
                        <p className="text-lg font-bold text-white">
                          {numberFormatter.format(weeklySummary.completed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">
                          {tMissions('weeklyScheduled')}
                        </p>
                        <p className="text-lg font-bold text-white">
                          {numberFormatter.format(weeklySummary.scheduled)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60">
                          {tMissions('weeklyXp')}
                        </p>
                        <p className="text-lg font-bold text-emerald-300">
                          +{numberFormatter.format(weeklySummary.totalXp)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {missions.map((mission) => {
                  const Icon = missionIconMap[mission.type] ?? Sparkles
                  const isCompleted = mission.status === 'COMPLETED'
                  const isTutorial =
                    mission.category === TUTORIAL_MISSION_CATEGORY ||
                    mission.id === onboarding?.tutorialMissionId
                  const isDailyLogin =
                    mission.category === DAILY_LOGIN_MISSION_CATEGORY
                  const isDailyLoginClaimed = isDailyLogin && isCompleted
                  const isTutorialStep =
                    isTutorial &&
                    onboarding?.currentStep?.id === 'complete-tutorial' &&
                    !isCompleted
                  const isOverdue =
                    !isCompleted &&
                    (mission.status === 'OVERDUE' ||
                      (mission.status === 'SCHEDULED' &&
                        new Date(mission.dueAt) < new Date()))
                  return (
                    <div
                      key={mission.id}
                      data-onboarding={
                        isTutorial
                          ? 'tutorial-mission'
                          : isDailyLogin
                            ? 'daily-login-mission'
                            : undefined
                      }
                      className={cn(
                        'relative flex w-full items-center gap-3 rounded-xl border p-4 transition-all duration-300',
                        isTutorialStep &&
                          'animate-pulse border-indigo-400/70 bg-indigo-500/15 ring-2 ring-indigo-400/60',
                        isDailyLogin &&
                          dailyLoginPending &&
                          'animate-pulse border-amber-400/70 bg-amber-500/15 ring-2 ring-amber-400/50',
                        justCompletedMissionId === mission.id &&
                          'mission-just-completed',
                        isDailyLoginClaimed &&
                          'border-white/10 bg-white/[0.03] opacity-60',
                        isCompleted &&
                          !isDailyLogin &&
                          '!border-emerald-400/70 bg-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
                        !isCompleted &&
                          !isTutorialStep &&
                          (isOverdue
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-white/10 bg-white/[0.06]')
                      )}
                    >
                      {isDailyLogin && dailyLoginPending ? (
                        <button
                          type="button"
                          data-onboarding="daily-login-claim"
                          onClick={(e) => {
                            e.stopPropagation()
                            void claimReward(dailyLoginPending.id)
                          }}
                          disabled={claimingId === dailyLoginPending.id}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/30 transition hover:opacity-90 disabled:opacity-50"
                          aria-label={tMissions('claimReward')}
                        >
                          <Gift className="h-6 w-6" />
                        </button>
                      ) : isDailyLoginClaimed ? (
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white/25"
                          aria-hidden
                        >
                          <Gift className="h-6 w-6" />
                        </div>
                      ) : !isCompleted ? (
                        <button
                          type="button"
                          data-onboarding={
                            isTutorial ? 'tutorial-complete' : undefined
                          }
                          onClick={(e) => {
                            e.stopPropagation()
                            completeMission(mission.id)
                          }}
                          disabled={completingId === mission.id}
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50',
                            isTutorialStep
                              ? 'relative z-[81] bg-indigo-500/30 text-indigo-100 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          )}
                          aria-label={t('overview.missionModal.complete')}
                        >
                          <Check className="h-6 w-6" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            uncompleteMission(mission.id)
                          }}
                          disabled={completingId === mission.id}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                          aria-label={t('overview.missionModal.uncomplete')}
                        >
                          <X className="h-6 w-6" />
                        </button>
                      )}
                      <button
                        type="button"
                        className={cn(
                          'flex min-w-0 flex-1 items-center gap-3 text-left',
                          isTutorialStep && 'pointer-events-none'
                        )}
                        onClick={() => openMissionModal(mission)}
                      >
                        <div
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-lg',
                            isDailyLoginClaimed &&
                              'bg-white/8 text-white/25 shadow-none',
                            isCompleted &&
                              !isDailyLogin &&
                              'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30',
                            !isCompleted &&
                              (isOverdue
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-white/10 text-white/90')
                          )}
                        >
                          {isDailyLoginClaimed ? (
                            <Gift className="h-6 w-6" aria-hidden />
                          ) : isCompleted ? (
                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <Icon className="h-6 w-6" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              'truncate font-semibold',
                              isDailyLoginClaimed &&
                                'text-white/45 line-through',
                              isCompleted &&
                                !isDailyLogin &&
                                'text-emerald-200/95 line-through',
                              !isCompleted && 'text-white'
                            )}
                          >
                            {mission.title}
                          </p>
                          <p
                            className={cn(
                              'text-xs',
                              isDailyLoginClaimed && 'text-white/40',
                              isCompleted &&
                                !isDailyLogin &&
                                'text-emerald-200/80',
                              !isCompleted && 'text-white/60'
                            )}
                          >
                            {formatDueLabel(mission.dueAt, locale)}
                            {isOverdue && !isCompleted && (
                              <span className="ml-1.5 text-amber-400">
                                · {tMissions('status.overdue')}
                              </span>
                            )}
                            {isCompleted && (
                              <span
                                className={cn(
                                  'ml-1.5',
                                  isDailyLoginClaimed
                                    ? 'text-white/40'
                                    : 'text-emerald-200/90'
                                )}
                              >
                                · {tMissions('status.completed')}
                              </span>
                            )}
                          </p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold',
                            isDailyLoginClaimed
                              ? 'bg-white/10 text-white/40'
                              : 'bg-gradient-to-r from-indigo-500/80 to-fuchsia-500/80 text-white'
                          )}
                        >
                          {isDailyLogin
                            ? tMissions('dailyLoginRewardHint')
                            : `+${mission.xp} XP`}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                      </button>
                    </div>
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
        currentInitials={avatarInitials}
        userLevel={userStats?.level ?? user.level}
        onAvatarSelect={async (url) => {
          setUserAvatar(url)
          await fetch('/api/user/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: url }),
          })
        }}
        onSignOut={() => signOut({ callbackUrl: `/${locale}` })}
        signOutLabel={t('profile.actions.signOut')}
      />
      <StreakModal
        open={streakModalOpen}
        onOpenChange={setStreakModalOpen}
        onStreakChange={setCurrentStreak}
      />
      <MissionModal
        open={missionModalOpen}
        onOpenChange={(open) => {
          setMissionModalOpen(open)
          if (!open && onboarding?.paused) {
            onboarding.resume()
          }
        }}
        mission={missionEditing}
        onSuccess={() => {
          void fetchMissions()
        }}
        onCreated={() => {
          onboarding?.signal('mission-created')
        }}
      />

      <ClaimRewardModal
        celebration={claimCelebration}
        onClose={closeCelebration}
      />
    </div>
  )
}
