'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Sparkles, Tv } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { FakeVideoAd } from './FakeVideoAd'

type RewardedAdPromptProps = {
  open: boolean
  bonusXp: number
  missionId: string | null
  onClose: () => void
  onRewarded: (bonusXp: number) => void
}

export function RewardedAdPrompt({
  open,
  bonusXp,
  missionId,
  onClose,
  onRewarded,
}: RewardedAdPromptProps) {
  const t = useTranslations('ads.rewarded')
  const [showVideo, setShowVideo] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleWatch = () => {
    setShowVideo(true)
  }

  const handleVideoComplete = async () => {
    setShowVideo(false)
    if (!missionId) {
      onClose()
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ads/double-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      })
      if (res.ok) {
        const data = await res.json()
        onRewarded(data.bonusXp ?? bonusXp)
      }
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <>
      <Dialog
        open={open && !showVideo}
        onOpenChange={(v) => !v && !loading && onClose()}
      >
        <DialogContent className="border-indigo-500/40 bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-fuchsia-600/20 text-white backdrop-blur-xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/30 shadow-lg">
                <Tv className="h-7 w-7 text-indigo-200" />
              </span>
              {t('title')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <p className="text-sm text-white/80">{t('description')}</p>
            <p className="flex items-center gap-2 text-2xl font-bold text-indigo-200">
              <Sparkles className="h-6 w-6" />+{bonusXp} XP
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={handleWatch}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95"
              >
                {t('watch')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="flex-1 text-white/70 hover:bg-white/10 hover:text-white"
              >
                {t('skip')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <FakeVideoAd open={showVideo} onComplete={handleVideoComplete} />
    </>
  )
}
