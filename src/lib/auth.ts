import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'

import { prisma } from '@/lib/prisma'
import { ensureDefaultTheme } from '@/lib/themes/service'

// Un compte invité inactif est purgé par le cron ; on rafraîchit lastActiveAt
// au plus une fois par heure pour éviter une écriture à chaque requête.
const TOUCH_INTERVAL_MS = 60 * 60 * 1000

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/en/login',
    error: '/en/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Compte démo : un clic, aucune saisie. Le portfolio doit être testable
    // sans créer de vrais identifiants.
    Credentials({
      id: 'guest',
      name: 'Guest',
      credentials: {},
      async authorize() {
        const user = await prisma.user.create({
          data: {
            email: null,
            isGuest: true,
            level: 1,
            xp: 0,
            currency: 0,
          },
          select: { id: true },
        })

        await ensureDefaultTheme(prisma, user.id)

        return { id: user.id }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id!
        const dbUser = await prisma.user.findUnique({ where: { id: user.id! } })
        token.isPremium = dbUser?.isPremium ?? false
        token.isGuest = dbUser?.isGuest ?? false
        token.lastTouch = Date.now()
      }
      if (account?.provider === 'google' && profile?.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        })

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: profile.email,
              level: 1,
              xp: 0,
              currency: 0,
            },
          })
          await ensureDefaultTheme(prisma, dbUser.id)
        }
        token.id = dbUser.id
        token.isGuest = false
      }

      if (
        token.isGuest &&
        token.id &&
        Date.now() - ((token.lastTouch as number) ?? 0) > TOUCH_INTERVAL_MS
      ) {
        token.lastTouch = Date.now()
        // Le compte a pu être purgé entre-temps : ne pas casser la session.
        await prisma.user
          .updateMany({
            where: { id: token.id as string },
            data: { lastActiveAt: new Date() },
          })
          .catch(() => undefined)
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isPremium = token.isPremium as boolean
        session.user.isGuest = token.isGuest as boolean
      }
      return session
    },
  },
})
