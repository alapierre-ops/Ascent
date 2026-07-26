import { type Page } from '@playwright/test'

/**
 * Signs in through the one-click guest flow and lands on the dashboard.
 *
 * Every call creates a fresh throwaway account, so specs are isolated from each
 * other without having to invent unique emails.
 */
export async function loginAsGuest(
  page: Page,
  baseURL: string | undefined,
  locale: 'en' | 'fr' = 'en'
) {
  await page.goto(`${baseURL}/${locale}/login`)
  await page.getByTestId('guest-signin').click()
  await page.waitForURL('**/dashboard', { timeout: 30_000 })

  // New accounts start the onboarding tour, whose overlay blocks clicks
  // on the dashboard — skip it so tests can interact with the page.
  await page.request.patch(`${baseURL}/api/user/me`, {
    data: { onboardingCompleted: true },
  })
  await page.reload()
}
