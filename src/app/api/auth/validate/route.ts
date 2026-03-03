import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'MISSING_EMAIL' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ canProceed: true })
    }

    if (!user.password) {
      return NextResponse.json({ error: 'USE_GOOGLE_SIGNIN' }, { status: 400 })
    }

    return NextResponse.json({ canProceed: true })
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
