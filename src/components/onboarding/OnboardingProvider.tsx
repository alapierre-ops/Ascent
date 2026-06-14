'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'

import { dispatchOnboardingTutorialReady } from '@/lib/onboarding/events'
import {
  ONBOARDING_STEPS,
  type OnboardingAdvanceEvent,
  type OnboardingRoute,
} from '@/lib/onboarding/steps'

type OnboardingContextValue = {
  active: boolean
  paused: boolean
  stepIndex: number
  currentStep: (typeof ONBOARDING_STEPS)[number] | null
  tutorialMissionId: string | null
  totalSteps: number
  advance: () => void
  signal: (event: OnboardingAdvanceEvent) => void
  skip: () => void
  pause: () => void
  resume: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

function routeFromPathname(pathname: string): OnboardingRoute | null {
  if (pathname.includes('/shop')) return 'shop'
  if (pathname.includes('/dashboard')) return 'dashboard'
  return null
}

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const pathname = usePathname()
  const currentRoute = routeFromPathname(pathname)

  const [active, setActive] = useState(false)
  const [paused, setPaused] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [tutorialMissionId, setTutorialMissionId] = useState<string | null>(
    null
  )
  const [initialized, setInitialized] = useState(false)

  const currentStep = active ? (ONBOARDING_STEPS[stepIndex] ?? null) : null

  const completeOnboarding = useCallback(async () => {
    setActive(false)
    setPaused(false)
    await fetch('/api/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: true }),
    }).catch(() => {})
  }, [])

  const goToNextStep = useCallback(() => {
    const next = stepIndex + 1
    if (next >= ONBOARDING_STEPS.length) {
      void completeOnboarding()
      return
    }
    setStepIndex(next)
    setPaused(false)
  }, [stepIndex, completeOnboarding])

  const advance = useCallback(() => {
    if (!active || !currentStep) return
    if (currentStep.advanceOn !== 'next') return
    if (currentStep.id === 'done') {
      void completeOnboarding()
      return
    }
    goToNextStep()
  }, [active, currentStep, goToNextStep, completeOnboarding])

  const signal = useCallback(
    (event: OnboardingAdvanceEvent) => {
      if (!active || !currentStep) return
      if (currentStep.advanceOn !== event) return
      if (event === 'next') return
      setPaused(false)
      goToNextStep()
    },
    [active, currentStep, goToNextStep]
  )

  const skip = useCallback(() => {
    void completeOnboarding()
  }, [completeOnboarding])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])

  useEffect(() => {
    if (initialized) return
    let cancelled = false

    async function init() {
      const meRes = await fetch('/api/user/me')
      if (!meRes.ok || cancelled) return
      const me = await meRes.json()
      if (me.onboardingCompleted || cancelled) {
        setInitialized(true)
        return
      }

      const initRes = await fetch('/api/onboarding/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      if (cancelled) return
      if (initRes.ok) {
        const data = await initRes.json()
        if (data.tutorialMissionId) {
          setTutorialMissionId(data.tutorialMissionId)
          dispatchOnboardingTutorialReady()
        }
      }

      setActive(true)
      setStepIndex(0)
      setInitialized(true)
    }

    void init()
    return () => {
      cancelled = true
    }
  }, [initialized, locale])

  useEffect(() => {
    if (!active || !currentStep || paused) return
    if (currentStep.advanceOn === 'navigate-shop' && currentRoute === 'shop') {
      const id = window.setTimeout(() => goToNextStep(), 0)
      return () => window.clearTimeout(id)
    }
    if (
      currentStep.advanceOn === 'navigate-dashboard' &&
      currentRoute === 'dashboard'
    ) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const id = window.setTimeout(() => goToNextStep(), 0)
      return () => window.clearTimeout(id)
    }
  }, [active, currentStep, currentRoute, paused, goToNextStep])

  const value = useMemo(
    () => ({
      active,
      paused,
      stepIndex,
      currentStep,
      tutorialMissionId,
      totalSteps: ONBOARDING_STEPS.length,
      advance,
      signal,
      skip,
      pause,
      resume,
    }),
    [
      active,
      paused,
      stepIndex,
      currentStep,
      tutorialMissionId,
      advance,
      signal,
      skip,
      pause,
      resume,
    ]
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return ctx
}

export function useOnboardingOptional() {
  return useContext(OnboardingContext)
}
