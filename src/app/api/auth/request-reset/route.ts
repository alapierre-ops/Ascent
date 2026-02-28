import { NextRequest, NextResponse } from 'next/server'

import crypto from 'crypto'
import { z } from 'zod'

import { sendPasswordResetEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

const requestResetSchema = z.object({
  email: z.string().email('Invalid email format'),
  locale: z.enum(['en', 'fr']).default('en'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = requestResetSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, locale } = validation.data

    // Toujours retourner 200 — ne jamais révéler si l'email existe (anti-énumération)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    console.log(
      'Reset request — user found:',
      !!user,
      '| has password:',
      !!user?.password
    )

    if (!user || !user.password) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin
    const resetLink = `${baseUrl}/${locale}/reset-password?token=${token}`

    await sendPasswordResetEmail({ to: email, resetLink, locale })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Request reset error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
