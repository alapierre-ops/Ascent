# Ascent 🚀

Turn your self-improvement into a measurable, gamified adventure.

Ascent is a web application that helps you visualize your personal growth. It transforms habits, learning, and personal goals into a game, allowing you to track your progress, build consistent streaks, and earn XP for your efforts.

---

## 🎯 Features: Level Up Your Life

Ascent is built around a core loop of setting, tracking, and completing goals.

- **✨ Gamified XP System:** Every goal you create can be assigned an XP (Experience Point) value. Completing the goal banks that XP, contributing to your overall level. Watch your "level" rise as you stick to your commitments.

- **🏆 Goal & Habit Tracking:** Create detailed goals with deadlines, categories (e.g., "Fitness," "Learning," "Productivity"), and descriptions. You can also set up recurring daily or weekly habits.

- **🔥 Automatic Streak Counter:** Consistency is key. Ascent automatically tracks your daily "streaks" for completing tasks, providing a powerful visual motivator (🔥 10 days!) to keep you going.

- **📊 Dynamic Progress Dashboard:** Your personal dashboard is your mission control. It features charts to visualize your XP earned over time, your goal completion rate, and your longest streaks, all powered by your real-time data.

- **🔒 Secure & Private:** Built with `NextAuth.js` and a serverless backend, your data is your own. Sign in quickly with social providers (like Google or GitHub) and trust that your goals and progress are stored securely.

---

## 🛠️ Tech Stack & Architecture

This project is built with a modern, full-stack, serverless architecture.

| Category            | Technology                                                                                         | Purpose                             |
| :------------------ | :------------------------------------------------------------------------------------------------- | :---------------------------------- |
| **Frontend**        | [Next.js 14 (App Router)](https://nextjs.org/)                                                     | SSR, SSG, API Routes                |
|                     | [React](https://react.dev/) / [TypeScript](https://www.typescriptlang.org/)                        | UI & Type Safety                    |
|                     | [TailwindCSS](https://tailwindcss.com/)                                                            | Utility-First Styling               |
| **UI/UX**           | [ShadCN UI](https://ui.shadcn.com/)                                                                | Accessible, Reusable Components     |
|                     | [Framer Motion](https://www.framer.com/motion/)                                                    | Animations & Transitions            |
| **Backend**         | [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | Serverless Backend Logic            |
| **Authentication**  | [NextAuth.js](https://next-auth.js.org/)                                                           | Authentication & Session Management |
| **Database**        | [PostgreSQL](https://www.postgresql.org/)                                                          | Relational Database                 |
| **ORM**             | [Prisma](https://www.prisma.io/)                                                                   | Type-safe Database Access           |
| **State**           | [Zustand](https://github.com/pmndrs/zustand)                                                       | Minimalist State Management         |
| **Validation**      | [Zod](https://zod.dev/)                                                                            | Schema Validation                   |
| **Infra & Hosting** | [Vercel](https://vercel.com/)                                                                      | Frontend Hosting & CI/CD            |

### 🏛️ Architecture

This project uses a modern full-stack architecture:

1.  **Frontend (Vercel):** The Next.js application is hosted on Vercel.
2.  **Authentication (Vercel):** `NextAuth.js` runs on Vercel, managing user sessions.
3.  **Backend (Vercel):** Secure **Next.js API Routes** act as the backend. They check the user's session, validate input with `Zod`, and use Prisma to communicate with PostgreSQL.
4.  **Database:** `PostgreSQL` acts as the persistent data layer, accessed via Prisma ORM.

---

## 🧪 Testing

End-to-end tests for authentication flows are implemented with [Playwright](https://playwright.dev/). These tests verify that the signup and login UI work correctly.

### Running Tests Locally

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Run Playwright tests
npm run test
# or
npm run test:e2e
```

### CI/CD Pipeline

Tests automatically run on every push and pull request to `main` via GitHub Actions (see [.github/workflows/ci.yml](.github/workflows/ci.yml)).

The workflow:

- Sets up a PostgreSQL database
- Installs dependencies
- Builds the application
- Runs the Playwright test suite
- Uploads test results as artifacts

Tests include:

- ✅ Login page loads successfully
- ✅ Signup form is accessible and functional
- ✅ Login form accepts input
- ✅ Form field validation works
