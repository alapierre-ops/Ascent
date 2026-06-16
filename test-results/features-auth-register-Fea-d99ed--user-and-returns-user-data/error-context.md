# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features\auth-register.spec.ts >> Feature: User Registration >> registers a new user and returns user data
- Location: tests\features\auth-register.spec.ts:6:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   |
  3   | const ENDPOINT = '/api/auth/register'
  4   |
  5   | test.describe('Feature: User Registration', () => {
  6   |   test('registers a new user and returns user data', async ({
  7   |     request,
  8   |     baseURL,
  9   |   }) => {
  10  |     const email = `register+${Date.now()}@example.com`
  11  |
  12  |     const res = await request.post(`${baseURL}${ENDPOINT}`, {
  13  |       data: { email, password: 'password123', name: 'Test User', locale: 'en' },
  14  |     })
  15  |
> 16  |     expect(res.status()).toBe(200)
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  17  |     const body = await res.json()
  18  |     expect(body.success).toBe(true)
  19  |     expect(body.user.email).toBe(email)
  20  |     expect(body.user.name).toBe('Test User')
  21  |     expect(body.user.id).toBeDefined()
  22  |     expect(body.user.password).toBeUndefined()
  23  |   })
  24  |
  25  |   test('rejects a duplicate email with EMAIL_ALREADY_EXISTS', async ({
  26  |     request,
  27  |     baseURL,
  28  |   }) => {
  29  |     const email = `dup+${Date.now()}@example.com`
  30  |
  31  |     await request.post(`${baseURL}${ENDPOINT}`, {
  32  |       data: { email, password: 'password123', name: 'First', locale: 'en' },
  33  |     })
  34  |
  35  |     const res = await request.post(`${baseURL}${ENDPOINT}`, {
  36  |       data: { email, password: 'password456', name: 'Second', locale: 'en' },
  37  |     })
  38  |
  39  |     expect(res.status()).toBe(400)
  40  |     const body = await res.json()
  41  |     expect(body.error).toBe('EMAIL_ALREADY_EXISTS')
  42  |   })
  43  |
  44  |   test('rejects an invalid email format with VALIDATION_ERROR', async ({
  45  |     request,
  46  |     baseURL,
  47  |   }) => {
  48  |     const res = await request.post(`${baseURL}${ENDPOINT}`, {
  49  |       data: {
  50  |         email: 'not-an-email',
  51  |         password: 'password123',
  52  |         name: 'Test',
  53  |         locale: 'en',
  54  |       },
  55  |     })
  56  |
  57  |     expect(res.status()).toBe(400)
  58  |     const body = await res.json()
  59  |     expect(body.error).toBe('VALIDATION_ERROR')
  60  |   })
  61  |
  62  |   test('rejects a password shorter than 6 characters', async ({
  63  |     request,
  64  |     baseURL,
  65  |   }) => {
  66  |     const res = await request.post(`${baseURL}${ENDPOINT}`, {
  67  |       data: {
  68  |         email: `short+${Date.now()}@example.com`,
  69  |         password: '12345',
  70  |         name: 'Test',
  71  |         locale: 'en',
  72  |       },
  73  |     })
  74  |
  75  |     expect(res.status()).toBe(400)
  76  |     const body = await res.json()
  77  |     expect(body.error).toBe('VALIDATION_ERROR')
  78  |     expect(body.message).toMatch(/6/)
  79  |   })
  80  |
  81  |   test('rejects a name shorter than 2 characters', async ({
  82  |     request,
  83  |     baseURL,
  84  |   }) => {
  85  |     const res = await request.post(`${baseURL}${ENDPOINT}`, {
  86  |       data: {
  87  |         email: `shortname+${Date.now()}@example.com`,
  88  |         password: 'password123',
  89  |         name: 'A',
  90  |         locale: 'en',
  91  |       },
  92  |     })
  93  |
  94  |     expect(res.status()).toBe(400)
  95  |     const body = await res.json()
  96  |     expect(body.error).toBe('VALIDATION_ERROR')
  97  |     expect(body.message).toMatch(/2/)
  98  |   })
  99  |
  100 |   test('accepts registration with French locale', async ({
  101 |     request,
  102 |     baseURL,
  103 |   }) => {
  104 |     const email = `fr+${Date.now()}@example.com`
  105 |
  106 |     const res = await request.post(`${baseURL}${ENDPOINT}`, {
  107 |       data: {
  108 |         email,
  109 |         password: 'password123',
  110 |         name: 'Utilisateur Test',
  111 |         locale: 'fr',
  112 |       },
  113 |     })
  114 |
  115 |     expect(res.status()).toBe(200)
  116 |     const body = await res.json()
```
