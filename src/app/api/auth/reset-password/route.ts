import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { token, newPassword } = validation.data

    const user = await prisma.user.findUnique({
      where: { resetToken: token },
      select: { id: true, resetTokenExpiry: true },
    })

    if (!user || !user.resetTokenExpiry) {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 400 })
    }

    if (user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'TOKEN_EXPIRED' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
