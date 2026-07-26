# Ascent

Gamified habit and goal tracker: XP, streaks, categories, and a simple progression loop.

**Live:** https://ascent.axel-lapierre.dev

## Features

- **XP & levels** — Assign XP to goals; completing them raises your level.
- **Goals & habits** — Deadlines, categories, descriptions; recurring daily/weekly habits.
- **Streaks** — Current streak, monthly activity calendar, longest streak, consistency rewards.
- **Gold & shop** — Gold from leveling (shop still WIP).
- **Auth** — NextAuth with social providers; data stays in your account (PostgreSQL).

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

## Getting started

```bash
npm install
cp .env.example .env   # fill DATABASE_URL, NextAuth secrets, OAuth if used
npx prisma db push
npm run dev
```
