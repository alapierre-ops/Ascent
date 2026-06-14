'use client'

import type { AchievementFrame } from '@/lib/achievements/definitions'
import { cn } from '@/lib/utils'

type AchievementIconProps = {
  icon: string
  frame?: AchievementFrame | null
  size?: 'sm' | 'md' | 'lg'
  locked?: boolean
  pulse?: boolean
  progress?: number
  className?: string
}

const sizeMap = {
  sm: { outer: 56, inner: 44, emoji: 'text-xl' },
  md: { outer: 72, inner: 56, emoji: 'text-2xl' },
  lg: { outer: 96, inner: 76, emoji: 'text-4xl' },
}

const frameClass: Record<AchievementFrame, string> = {
  bronze: 'achievement-frame-bronze',
  silver: 'achievement-frame-silver',
  gold: 'achievement-frame-gold',
}

export function AchievementIcon({
  icon,
  frame,
  size = 'md',
  locked = false,
  pulse = false,
  progress = 0,
  className,
}: AchievementIconProps) {
  const s = sizeMap[size]
  const radius = s.outer / 2 - 4
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center',
        pulse && 'achievement-pulse',
        className
      )}
      style={{ width: s.outer, height: s.outer }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={s.outer}
        height={s.outer}
        aria-hidden
      >
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={3}
        />
        {!locked && (
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={radius}
            fill="none"
            stroke="url(#achievementRing)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        )}
        <defs>
          <linearGradient
            id="achievementRing"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-2xl border-2 bg-slate-900/80 shadow-lg',
          s.emoji,
          locked && 'opacity-50 grayscale',
          frame && !locked ? frameClass[frame] : 'border-white/20'
        )}
        style={{ width: s.inner, height: s.inner }}
      >
        <span role="img" aria-hidden>
          {icon}
        </span>
      </div>
    </div>
  )
}
