# Ascent

Gamified habit and goal tracker: XP, streaks, categories, and a simple progression loop.

**Live:** https://ascent.axel-lapierre.dev — click **Try it instantly**. No email, no password, no signup form.

## Features

- **XP & levels** — Assign XP to goals; completing them raises your level.
- **Goals & habits** — Deadlines, categories, descriptions; recurring daily/weekly habits.
- **Streaks** — Current streak, monthly activity calendar, longest streak, consistency rewards.
- **Gold & shop** — Gold from leveling (shop still WIP).
- **One-click demo accounts** — A single button creates a throwaway account so the app can be tried without signing up. Google sign-in is there for anyone who wants progress that persists across devices.

## Stack

| Layer        | Tech                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| App          | Next.js 14 (App Router), React, TypeScript, Tailwind, shadcn/ui, Framer Motion |
| Auth         | NextAuth.js                                                                    |
| Data         | PostgreSQL, Prisma, Zod                                                        |
| Client state | Zustand                                                                        |
| Hosting      | Vercel (app + API routes)                                                      |

## Architecture

1. Next.js on Vercel serves UI and route handlers.
2. Handlers check the session, validate with Zod, then talk to Postgres through Prisma.
3. Auth sessions are managed by NextAuth on the same deploy.

## Auth

Two providers, no passwords anywhere:

- **Guest** — a NextAuth credentials provider that takes no input. Clicking the button creates a `User` row with `isGuest: true` and a null email, then signs the JWT session straight in.
- **Google** — OAuth, for a persistent account.

Guest accounts are disposable by design, so they're garbage-collected: `/api/cron/cleanup-guests` deletes any guest untouched for `GUEST_RETENTION_DAYS` (default 7) and everything attached to it. Vercel Cron calls it nightly (see `vercel.json`) with `Authorization: Bearer $CRON_SECRET`; the route refuses to run if that secret isn't set. Sessions refresh `lastActiveAt` at most once an hour, so an account in active use is never collected.

## Getting started

```bash
npm install
cp .env.example .env   # fill DATABASE_URL, AUTH_SECRET, CRON_SECRET, Google OAuth if used
npx prisma db push
npm run dev
```
