import { expect, test } from '@playwright/test'

const ENDPOINT = '/api/auth/verify-email'

test.describe('Feature: Email Verification', () => {
  test.describe('Invalid token cases', () => {
    test('returns INVALID_TOKEN when no token is provided', async ({
      request,
      baseURL,
    }) => {
      const res = await request.get(`${baseURL}${ENDPOINT}`)

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('INVALID_TOKEN')
    })

    test('returns INVALID_TOKEN for an unknown token', async ({
      request,
      baseURL,
    }) => {
      const res = await request.get(
        `${baseURL}${ENDPOINT}?token=abc123notavalidtoken`
      )

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('INVALID_TOKEN')
    })

    test('returns INVALID_TOKEN for an empty token string', async ({
      request,
      baseURL,
    }) => {
      const res = await request.get(`${baseURL}${ENDPOINT}?token=`)

      expect(res.status()).toBe(400)
      const body = await res.json()
      expect(body.error).toBe('INVALID_TOKEN')
    })
  })

  test.describe('Valid token flow', () => {
    test('successfully verifies an email with the token from registration', async ({
      request,
      baseURL,
    }) => {
      const email = `verify+${Date.now()}@example.com`

      const registerRes = await request.post(`${baseURL}/api/auth/register`, {
        data: {
          email,
          password: 'password123',
          name: 'Verify User',
          locale: 'en',
        },
      })

      expect(registerRes.status()).toBe(200)
      const { verificationToken } = await registerRes.json()
      expect(verificationToken).toBeDefined()

      const verifyRes = await request.get(
        `${baseURL}${ENDPOINT}?token=${verificationToken}`
      )

      expect(verifyRes.status()).toBe(200)
      const body = await verifyRes.json()
      expect(body.success).toBe(true)
    })

    test('token is consumed — reusing it returns INVALID_TOKEN', async ({
      request,
      baseURL,
    }) => {
      const email = `reuse+${Date.now()}@example.com`

      const registerRes = await request.post(`${baseURL}/api/auth/register`, {
        data: {
          email,
          password: 'password123',
          name: 'Reuse User',
          locale: 'en',
        },
      })

      const { verificationToken } = await registerRes.json()

      // First use — should succeed
      await request.get(`${baseURL}${ENDPOINT}?token=${verificationToken}`)

      // Second use — token is gone
      const reuseRes = await request.get(
        `${baseURL}${ENDPOINT}?token=${verificationToken}`
      )

      expect(reuseRes.status()).toBe(400)
      const body = await reuseRes.json()
      expect(body.error).toBe('INVALID_TOKEN')
    })
  })
})
