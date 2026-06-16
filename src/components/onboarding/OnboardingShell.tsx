'use client'

import { OnboardingOverlay } from '@/components/onboarding/OnboardingOverlay'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      {children}
      <OnboardingOverlay />
    </OnboardingProvider>
  )
}
