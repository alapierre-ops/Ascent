'use client'

import { useTranslations } from 'next-intl'

import { Lock } from 'lucide-react'

import type { AchievementView } from '@/lib/achievements/service'
import { cn } from '@/lib/utils'

import { AchievementIcon } from './AchievementIcon'

type AchievementCardProps = {
  achievement: AchievementView
  onClick: () => void
}

export function AchievementCard({
  achievement,
  onClick,
}: AchievementCardProps) {
  const t = useTranslations('achievements')
  const hasPending = achievement.tiers.some((tier) => tier.pendingId)
  const currentFrame =
    achievement.tiers.find((tier) => tier.tier === achievement.currentTier)
      ?.frame ?? null
  const locked = achievement.currentTier === 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-2xl border bg-white/[0.04] p-4 text-center backdrop-blur-xl transition active:scale-[0.98]',
        hasPending
          ? 'border-amber-400/50 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
          : 'border-white/10 hover:border-white/25 hover:bg-white/[0.07]'
      )}
    >
      {hasPending && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shadow-lg" />
      )}
      <AchievementIcon
        icon={achievement.icon}
        frame={locked ? null : currentFrame}
        size="md"
        locked={locked}
        pulse={hasPending}
        progress={achievement.percentToNext}
      />
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-semibold text-white">
          {t(achievement.nameKey)}
        </p>
        <p className="text-xs text-white/50">
          {locked ? (
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              {t('locked')}
            </span>
          ) : (
            t('tierProgress', {
              current: achievement.currentTier,
              max: achievement.maxTier,
            })
          )}
        </p>
      </div>
    </button>
  )
}
