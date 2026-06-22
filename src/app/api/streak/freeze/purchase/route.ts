import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const STREAK_FREEZE_COST = 250

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { currency: true, streakFreeze: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.currency < STREAK_FREEZE_COST) {
      return NextResponse.json({ error: 'INSUFFICIENT_GOLD' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currency: { decrement: STREAK_FREEZE_COST },
        streakFreeze: { increment: 1 },
      },
      select: { currency: true, streakFreeze: true },
    })

    return NextResponse.json({
      balance: updated.currency,
      streakFreeze: updated.streakFreeze,
      cost: STREAK_FREEZE_COST,
    })
  } catch (error) {
    console.error('Streak freeze purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
