'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { useOnboarding } from './OnboardingProvider'

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

const SPOTLIGHT_PADDING = 8

function routeFromPathname(pathname: string): string | null {
  if (pathname.includes('/shop')) return 'shop'
  if (pathname.includes('/dashboard')) return 'dashboard'
  return null
}

function BackdropPanels({ rect }: { rect: Rect | null }) {
  if (!rect) {
    return <div className="absolute inset-0 bg-black/72 backdrop-blur-[1px]" />
  }

  const panels = [
    { top: 0, left: 0, width: '100%', height: rect.top },
    {
      top: rect.top,
      left: 0,
      width: rect.left,
      height: rect.height,
    },
    {
      top: rect.top,
      left: rect.left + rect.width,
      right: 0,
      height: rect.height,
    },
    {
      top: rect.top + rect.height,
      left: 0,
      width: '100%',
      bottom: 0,
    },
  ]

  return (
    <>
      {panels.map((style, i) => (
        <div
          key={i}
          className="absolute bg-black/72 backdrop-blur-[1px]"
          style={style}
        />
      ))}
    </>
  )
}

export function OnboardingOverlay() {
  const t = useTranslations('onboarding')
  const pathname = usePathname()
  const currentRoute = routeFromPathname(pathname)
  const { active, paused, currentStep, stepIndex, totalSteps, advance, skip } =
    useOnboarding()

  const [targetRect, setTargetRect] = useState<Rect | null>(null)

  const updateRect = useCallback(() => {
    if (
      !currentStep ||
      currentStep.type !== 'spotlight' ||
      !currentStep.target
    ) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(
      `[data-onboarding="${currentStep.target}"]`
    )
    if (!el) {
      setTargetRect(null)
      return
    }
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const box = el.getBoundingClientRect()
    setTargetRect({
      top: box.top - SPOTLIGHT_PADDING,
      left: box.left - SPOTLIGHT_PADDING,
      width: box.width + SPOTLIGHT_PADDING * 2,
      height: box.height + SPOTLIGHT_PADDING * 2,
    })
  }, [currentStep])

  useLayoutEffect(() => {
    if (!active || paused || !currentStep) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetRect(null)
      return
    }
    if (currentStep.route !== currentRoute) {
      setTargetRect(null)
      return
    }
    updateRect()
    const timer = setTimeout(updateRect, 350)
    return () => clearTimeout(timer)
  }, [active, paused, currentStep, currentRoute, stepIndex, updateRect])

  useEffect(() => {
    if (!active || paused) return
    const onResize = () => updateRect()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [active, paused, updateRect])

  useEffect(() => {
    if (!active || paused || !currentStep?.target) return
    const el = document.querySelector(
      `[data-onboarding="${currentStep.target}"]`
    )
    if (!el) return
    el.classList.add('relative', 'z-[71]')
    return () => {
      el.classList.remove('relative', 'z-[71]')
    }
  }, [active, paused, currentStep, stepIndex])

  if (!active || paused || !currentStep) return null
  if (currentStep.route !== currentRoute) return null

  const showNextButton = currentStep.advanceOn === 'next'
  const title = t(currentStep.titleKey)
  const body = t(currentStep.bodyKey)
  const cta = currentStep.ctaKey ? t(currentStep.ctaKey) : t('next')

  if (currentStep.type === 'modal') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-900/98 p-6 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-medium text-white/40">
            {t('progress', { current: stepIndex + 1, total: totalSteps })}
          </p>
          <h2 className="mt-2 text-xl font-bold">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{body}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={skip}
              className="text-xs text-white/35 transition hover:text-white/55"
            >
              {t('skip')}
            </button>
            <Button
              type="button"
              onClick={advance}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95"
            >
              {cta}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const popoverTop = targetRect
    ? Math.min(
        targetRect.top + targetRect.height + 12,
        window.innerHeight - 220
      )
    : window.innerHeight / 2 - 100

  const popoverLeft = targetRect
    ? Math.max(16, Math.min(targetRect.left, window.innerWidth - 336))
    : window.innerWidth / 2 - 160

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <div className="pointer-events-auto absolute inset-0">
        <BackdropPanels rect={targetRect} />
      </div>

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-indigo-400/80"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      )}

      <div
        className={cn(
          'pointer-events-auto absolute w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/20 bg-slate-900/98 p-4 text-white shadow-2xl backdrop-blur-xl',
          !targetRect && 'max-w-sm'
        )}
        style={{
          top: popoverTop,
          left: popoverLeft,
        }}
      >
        <p className="text-xs font-medium text-white/40">
          {t('progress', { current: stepIndex + 1, total: totalSteps })}
        </p>
        <h2 className="mt-1.5 text-base font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={skip}
            className="text-xs text-white/35 transition hover:text-white/55"
          >
            {t('skip')}
          </button>
          {showNextButton && (
            <Button
              type="button"
              size="sm"
              onClick={advance}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-95"
            >
              {cta}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
