export type OnboardingAdvanceEvent =
  | 'next'
  | 'mission-created'
  | 'reward-created'
  | 'tutorial-completed'
  | 'navigate-shop'
  | 'navigate-dashboard'

export type OnboardingRoute = 'dashboard' | 'shop'

export type OnboardingStep = {
  id: string
  type: 'modal' | 'spotlight'
  target?: string
  titleKey: string
  bodyKey: string
  ctaKey?: string
  advanceOn: OnboardingAdvanceEvent
  route: OnboardingRoute
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    type: 'modal',
    titleKey: 'welcome.title',
    bodyKey: 'welcome.body',
    ctaKey: 'welcome.cta',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'player-bar',
    type: 'spotlight',
    target: 'player-bar',
    titleKey: 'playerBar.title',
    bodyKey: 'playerBar.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'avatar',
    type: 'spotlight',
    target: 'avatar',
    titleKey: 'avatar.title',
    bodyKey: 'avatar.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'level',
    type: 'spotlight',
    target: 'level',
    titleKey: 'level.title',
    bodyKey: 'level.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'streak',
    type: 'spotlight',
    target: 'streak',
    titleKey: 'streak.title',
    bodyKey: 'streak.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'gold',
    type: 'spotlight',
    target: 'gold',
    titleKey: 'gold.title',
    bodyKey: 'gold.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'missions',
    type: 'spotlight',
    target: 'missions',
    titleKey: 'missions.title',
    bodyKey: 'missions.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'tutorial-mission',
    type: 'spotlight',
    target: 'tutorial-mission',
    titleKey: 'tutorialMission.title',
    bodyKey: 'tutorialMission.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'add-mission',
    type: 'spotlight',
    target: 'add-mission',
    titleKey: 'addMission.title',
    bodyKey: 'addMission.body',
    advanceOn: 'mission-created',
    route: 'dashboard',
  },
  {
    id: 'daily-quest',
    type: 'spotlight',
    target: 'daily-quest',
    titleKey: 'dailyQuest.title',
    bodyKey: 'dailyQuest.body',
    ctaKey: 'next',
    advanceOn: 'next',
    route: 'dashboard',
  },
  {
    id: 'shop-nav',
    type: 'spotlight',
    target: 'gold',
    titleKey: 'shopNav.title',
    bodyKey: 'shopNav.body',
    advanceOn: 'navigate-shop',
    route: 'dashboard',
  },
  {
    id: 'create-reward',
    type: 'spotlight',
    target: 'create-reward',
    titleKey: 'createReward.title',
    bodyKey: 'createReward.body',
    advanceOn: 'reward-created',
    route: 'shop',
  },
  {
    id: 'back-dashboard',
    type: 'spotlight',
    target: 'back-dashboard',
    titleKey: 'backDashboard.title',
    bodyKey: 'backDashboard.body',
    advanceOn: 'navigate-dashboard',
    route: 'shop',
  },
  {
    id: 'complete-tutorial',
    type: 'spotlight',
    target: 'tutorial-complete',
    titleKey: 'completeTutorial.title',
    bodyKey: 'completeTutorial.body',
    advanceOn: 'tutorial-completed',
    route: 'dashboard',
  },
  {
    id: 'done',
    type: 'modal',
    titleKey: 'done.title',
    bodyKey: 'done.body',
    ctaKey: 'done.cta',
    advanceOn: 'next',
    route: 'dashboard',
  },
]
