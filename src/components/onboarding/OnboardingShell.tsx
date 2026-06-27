'use client'

import { useEffect } from 'react'

import { useJuice } from '@/components/juice/useJuice'
import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay'
import {
  OnboardingProvider,
  useOnboarding,
} from '@/components/onboarding/OnboardingProvider'

function OnboardingJuiceBridge() {
  const onboarding = useOnboarding()
  const juice = useJuice()

  useEffect(() => {
    juice.setOnboardingActive(onboarding.active)
  }, [onboarding.active, juice])

  return null
}

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <OnboardingJuiceBridge />
      {children}
      <OnboardingOverlay />
    </OnboardingProvider>
  )
}
