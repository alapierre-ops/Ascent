'use client'

import { useTranslations } from 'next-intl'

import { Coins, Sparkles, Trophy } from 'lucide-react'

import { AchievementIcon } from '@/components/achievements/AchievementIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AchievementFrame } from '@/lib/achievements/definitions'
import type { PendingRewardType } from '@/lib/pending-rewards'

export type ClaimCelebration = {
  gold: number
  xp: number
  type: PendingRewardType
  refLevel: number | null
  refAchievementId?: string | null
  refTier?: number | null
  achievementIcon?: string | null
  achievementFrame?: AchievementFrame | null
} | null

type ClaimRewardModalProps = {
  celebration: ClaimCelebration
  onClose: () => void
}

export function ClaimRewardModal({
  celebration,
  onClose,
}: ClaimRewardModalProps) {
  const t = useTranslations('dashboard.overview.missions')
  const tAch = useTranslations('achievements')
  const open = celebration != null

  const isAchievement = celebration?.type === 'ACHIEVEMENT'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-orange-600/25 text-white backdrop-blur-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-3 text-center text-xl">
            {isAchievement && celebration?.achievementIcon ? (
              <AchievementIcon
                icon={celebration.achievementIcon}
                frame={celebration.achievementFrame ?? 'gold'}
                size="lg"
                progress={100}
                pulse
              />
            ) : (
              <span className="reward-pop-badge flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/40">
                <Trophy className="h-8 w-8 text-white" />
              </span>
            )}
            {isAchievement
              ? tAch('claimTitle', { tier: celebration?.refTier ?? 1 })
              : celebration?.type === 'LEVEL_UP'
                ? t('claimLevelTitle', {
                    level: celebration.refLevel ?? '',
                  })
                : t('claimCelebrationTitle')}
          </DialogTitle>
        </DialogHeader>
        {celebration && (
          <div className="flex flex-col items-center gap-3 py-2">
            {celebration.gold > 0 && (
              <p className="flex items-center gap-2 text-2xl font-bold text-amber-200">
                <Coins className="h-6 w-6" />
                {t('claimGold', { gold: celebration.gold })}
              </p>
            )}
            {celebration.xp > 0 && (
              <p className="flex items-center gap-2 text-lg font-semibold text-indigo-200">
                <Sparkles className="h-5 w-5" />
                {t('claimXp', { xp: celebration.xp })}
              </p>
            )}
            <Button
              type="button"
              onClick={onClose}
              className="mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
            >
              {t('claimCta')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
