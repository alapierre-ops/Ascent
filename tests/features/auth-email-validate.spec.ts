import { expect, test } from '@playwright/test'

const ENDPOINT = '/api/auth/validate'

test.describe('Feature: Email Validation (login pre-check)', () => {
  test('returns MISSING_EMAIL when no email is provided', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {},
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('MISSING_EMAIL')
  })

  test('returns canProceed for an email that does not exist', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: { email: `ghost+${Date.now()}@example.com` },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.canProceed).toBe(true)
  })

  test('returns canProceed for a registered email with a password', async ({
    request,
    baseURL,
  }) => {
    const email = `validate+${Date.now()}@example.com`

    await request.post(`${baseURL}/api/auth/register`, {
      data: {
        email,
        password: 'password123',
        name: 'Validate User',
        locale: 'en',
      },
    })

    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: { email },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.canProceed).toBe(true)
  })
})
