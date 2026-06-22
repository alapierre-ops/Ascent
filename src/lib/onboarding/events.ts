export const ONBOARDING_TUTORIAL_READY_EVENT =
  'ascent:onboarding-tutorial-ready'

export function dispatchOnboardingTutorialReady() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ONBOARDING_TUTORIAL_READY_EVENT))
}
