# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: features\auth-email-verification.spec.ts >> Feature: Email Verification >> Valid token flow >> successfully verifies an email with the token from registration
- Location: tests\features\auth-email-verification.spec.ts:44:9

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
  3   | const ENDPOINT = '/api/auth/verify-email'
  4   |
  5   | test.describe('Feature: Email Verification', () => {
  6   |   test.describe('Invalid token cases', () => {
  7   |     test('returns INVALID_TOKEN when no token is provided', async ({
  8   |       request,
  9   |       baseURL,
  10  |     }) => {
  11  |       const res = await request.get(`${baseURL}${ENDPOINT}`)
  12  |
  13  |       expect(res.status()).toBe(400)
  14  |       const body = await res.json()
  15  |       expect(body.error).toBe('INVALID_TOKEN')
  16  |     })
  17  |
  18  |     test('returns INVALID_TOKEN for an unknown token', async ({
  19  |       request,
  20  |       baseURL,
  21  |     }) => {
  22  |       const res = await request.get(
  23  |         `${baseURL}${ENDPOINT}?token=abc123notavalidtoken`
  24  |       )
  25  |
  26  |       expect(res.status()).toBe(400)
  27  |       const body = await res.json()
  28  |       expect(body.error).toBe('INVALID_TOKEN')
  29  |     })
  30  |
  31  |     test('returns INVALID_TOKEN for an empty token string', async ({
  32  |       request,
  33  |       baseURL,
  34  |     }) => {
  35  |       const res = await request.get(`${baseURL}${ENDPOINT}?token=`)
  36  |
  37  |       expect(res.status()).toBe(400)
  38  |       const body = await res.json()
  39  |       expect(body.error).toBe('INVALID_TOKEN')
  40  |     })
  41  |   })
  42  |
  43  |   test.describe('Valid token flow', () => {
  44  |     test('successfully verifies an email with the token from registration', async ({
  45  |       request,
  46  |       baseURL,
  47  |     }) => {
  48  |       const email = `verify+${Date.now()}@example.com`
  49  |
  50  |       const registerRes = await request.post(`${baseURL}/api/auth/register`, {
  51  |         data: {
  52  |           email,
  53  |           password: 'password123',
  54  |           name: 'Verify User',
  55  |           locale: 'en',
  56  |         },
  57  |       })
  58  |
> 59  |       expect(registerRes.status()).toBe(200)
      |                                    ^ Error: expect(received).toBe(expected) // Object.is equality
  60  |       const { verificationToken } = await registerRes.json()
  61  |       expect(verificationToken).toBeDefined()
  62  |
  63  |       const verifyRes = await request.get(
  64  |         `${baseURL}${ENDPOINT}?token=${verificationToken}`
  65  |       )
  66  |
  67  |       expect(verifyRes.status()).toBe(200)
  68  |       const body = await verifyRes.json()
  69  |       expect(body.success).toBe(true)
  70  |     })
  71  |
  72  |     test('token is consumed — reusing it returns INVALID_TOKEN', async ({
  73  |       request,
  74  |       baseURL,
  75  |     }) => {
  76  |       const email = `reuse+${Date.now()}@example.com`
  77  |
  78  |       const registerRes = await request.post(`${baseURL}/api/auth/register`, {
  79  |         data: {
  80  |           email,
  81  |           password: 'password123',
  82  |           name: 'Reuse User',
  83  |           locale: 'en',
  84  |         },
  85  |       })
  86  |
  87  |       const { verificationToken } = await registerRes.json()
  88  |
  89  |       // First use — should succeed
  90  |       await request.get(`${baseURL}${ENDPOINT}?token=${verificationToken}`)
  91  |
  92  |       // Second use — token is gone
  93  |       const reuseRes = await request.get(
  94  |         `${baseURL}${ENDPOINT}?token=${verificationToken}`
  95  |       )
  96  |
  97  |       expect(reuseRes.status()).toBe(400)
  98  |       const body = await reuseRes.json()
  99  |       expect(body.error).toBe('INVALID_TOKEN')
  100 |     })
  101 |   })
  102 | })
  103 |
```
