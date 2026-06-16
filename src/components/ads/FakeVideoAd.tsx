'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Progress } from '@/components/ui/progress'

type FakeVideoAdProps = {
  open: boolean
  onComplete: () => void
  durationMs?: number
}

function FakeVideoAdPlayer({
  onComplete,
  durationMs,
}: {
  onComplete: () => void
  durationMs: number
}) {
  const t = useTranslations('ads')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / durationMs) * 100)
      setProgress(pct)
      if (elapsed >= durationMs) {
        window.clearInterval(tick)
        onComplete()
      }
    }, 50)

    return () => window.clearInterval(tick)
  }, [durationMs, onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/10 bg-slate-900 p-6 text-center text-white shadow-2xl">
        <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
          {t('label')}
        </p>
        <div className="mx-auto flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40">
          <span className="text-4xl">📺</span>
        </div>
        <p className="text-sm text-white/70">{t('playing')}</p>
        <Progress value={progress} className="h-2 bg-white/10" />
      </div>
    </div>
  )
}

// TODO: replace FakeVideoAd with AdMob rewarded unit
export function FakeVideoAd({
  open,
  onComplete,
  durationMs = 3000,
}: FakeVideoAdProps) {
  if (!open) return null

  return (
    <FakeVideoAdPlayer
      key={durationMs}
      onComplete={onComplete}
      durationMs={durationMs}
    />
  )
}
