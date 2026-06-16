import { expect, test } from '@playwright/test'

const ENDPOINT = '/api/auth/register'

test.describe('Feature: User Registration', () => {
  test('registers a new user and returns user data', async ({
    request,
    baseURL,
  }) => {
    const email = `register+${Date.now()}@example.com`

    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: { email, password: 'password123', name: 'Test User', locale: 'en' },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.user.email).toBe(email)
    expect(body.user.name).toBe('Test User')
    expect(body.user.id).toBeDefined()
    expect(body.user.password).toBeUndefined()
  })

  test('rejects a duplicate email with EMAIL_ALREADY_EXISTS', async ({
    request,
    baseURL,
  }) => {
    const email = `dup+${Date.now()}@example.com`

    await request.post(`${baseURL}${ENDPOINT}`, {
      data: { email, password: 'password123', name: 'First', locale: 'en' },
    })

    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: { email, password: 'password456', name: 'Second', locale: 'en' },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('EMAIL_ALREADY_EXISTS')
  })

  test('rejects an invalid email format with VALIDATION_ERROR', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {
        email: 'not-an-email',
        password: 'password123',
        name: 'Test',
        locale: 'en',
      },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
  })

  test('rejects a password shorter than 6 characters', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {
        email: `short+${Date.now()}@example.com`,
        password: '12345',
        name: 'Test',
        locale: 'en',
      },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
    expect(body.message).toMatch(/6/)
  })

  test('rejects a name shorter than 2 characters', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {
        email: `shortname+${Date.now()}@example.com`,
        password: 'password123',
        name: 'A',
        locale: 'en',
      },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
    expect(body.message).toMatch(/2/)
  })

  test('accepts registration with French locale', async ({
    request,
    baseURL,
  }) => {
    const email = `fr+${Date.now()}@example.com`

    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {
        email,
        password: 'password123',
        name: 'Utilisateur Test',
        locale: 'fr',
      },
    })

    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('rejects an invalid locale', async ({ request, baseURL }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {
        email: `locale+${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test',
        locale: 'de',
      },
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
  })

  test('rejects request with missing required fields', async ({
    request,
    baseURL,
  }) => {
    const res = await request.post(`${baseURL}${ENDPOINT}`, {
      data: {},
    })

    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('VALIDATION_ERROR')
  })
})
