import { expect, test } from '@playwright/test'

// These tests require the app to be running with a clean database.
test.describe('auth flows', () => {
  test('signs up a new user through the UI and lands on dashboard', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(60_000)

    const email = `user+${Date.now()}@example.com`
    const password = 'Password123!'

    await page.goto(`${baseURL}/en`)

    // open signup tab and fill fields
    await page.click('text=Sign Up')
    await page.fill('input[id="signup-email"]', email)
    await page.fill('input[id="signup-password"]', password)
    await page.fill('input[id="signup-name"]', 'Playwright Tester')

    // submit signup form
    await page.click('button:has-text("Create Account")')

    // expect redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30_000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('can register via API and then login through the UI', async ({
    page,
    baseURL,
  }) => {
    const email = `user+${Date.now()}@example.com`
    const password = 'Password123!'

    // create account directly via API
    const register = await page.request.post(`${baseURL}/api/auth/register`, {
      data: {
        email,
        password,
        name: 'Existing User',
        locale: 'en',
      },
    })

    expect(register.ok()).toBeTruthy()

    // now sign in through UI
    await page.goto(`${baseURL}/en`)
    await page.fill('input[id="login-email"]', email)
    await page.fill('input[id="login-password"]', password)
    await page.click('button[type="submit"]:has-text("Sign In")')
    await page.waitForURL('**/dashboard', { timeout: 30_000 })
    expect(page.url()).toContain('/dashboard')
  })
})
