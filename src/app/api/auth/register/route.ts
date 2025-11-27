import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { hashPassword } from '@/lib/password'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: validation.error.issues[0].message,
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_ALREADY_EXISTS' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        level: 1,
        xp: 0,
        currency: 0,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
