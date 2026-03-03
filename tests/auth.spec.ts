import { expect, test } from '@playwright/test'

// These tests require the app to be running with a clean database.
test.describe('authentication flows', () => {
  test('loads login page successfully', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/en`)

    // Check page title and main heading
    await expect(page).toHaveTitle(/Ascent/)

    // Check sign in tab is visible
    await expect(page.getByRole('tab', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Sign Up/i })).toBeVisible()
  })

  test('displays signup form when Sign Up tab clicked', async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/en`)

    // Click Sign Up tab
    await page.getByRole('tab', { name: /Sign Up/i }).click()

    // Check that signup inputs are visible
    await expect(page.locator('input[id="signup-email"]')).toBeVisible()
    await expect(page.locator('input[id="signup-password"]')).toBeVisible()
    await expect(page.locator('input[id="signup-name"]')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Create Account/i })
    ).toBeVisible()
  })

  test('displays login form when Sign In tab clicked', async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/en`)

    // Sign In tab should be active by default
    await expect(page.locator('input[id="login-email"]')).toBeVisible()
    await expect(page.locator('input[id="login-password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })

  test('can fill signup form fields', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/en`)

    // Click Sign Up tab
    await page.getByRole('tab', { name: /Sign Up/i }).click()

    // Fill in the form
    const email = `test+${Date.now()}@example.com`
    await page.locator('input[id="signup-email"]').fill(email)
    await page.locator('input[id="signup-password"]').fill('TestPassword123!')
    await page.locator('input[id="signup-name"]').fill('Test User')

    // Verify values were entered
    await expect(page.locator('input[id="signup-email"]')).toHaveValue(email)
    await expect(page.locator('input[id="signup-password"]')).toHaveValue(
      'TestPassword123!'
    )
    await expect(page.locator('input[id="signup-name"]')).toHaveValue(
      'Test User'
    )
  })

  test('can fill login form fields', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/en`)

    const email = `test+${Date.now()}@example.com`
    await page.locator('input[id="login-email"]').fill(email)
    await page.locator('input[id="login-password"]').fill('TestPassword123!')

    // Verify values were entered
    await expect(page.locator('input[id="login-email"]')).toHaveValue(email)
    await expect(page.locator('input[id="login-password"]')).toHaveValue(
      'TestPassword123!'
    )
  })
})
