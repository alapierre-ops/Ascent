import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, toDateKey } from '@/lib/streak'
import { getUserStreakContext, parseFrozenDates } from '@/lib/streak-user'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ctx = await getUserStreakContext(prisma, session.user.id)
    if (!ctx.canUseFreeze) {
      return NextResponse.json({ error: 'CANNOT_USE_FREEZE' }, { status: 400 })
    }

    const yesterday = toDateKey(addDays(new Date(), -1))
    const frozenDates = [...ctx.frozenDates]
    if (!frozenDates.includes(yesterday)) {
      frozenDates.push(yesterday)
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streakFreeze: { decrement: 1 },
        frozenStreakDates: frozenDates,
      },
      select: { streakFreeze: true, frozenStreakDates: true },
    })

    const newCtx = await getUserStreakContext(prisma, session.user.id)

    return NextResponse.json({
      streakFreeze: updated.streakFreeze,
      frozenDates: parseFrozenDates(updated.frozenStreakDates),
      currentStreak: newCtx.currentStreak,
      canUseFreeze: newCtx.canUseFreeze,
      multiplier: newCtx.multiplier,
      bonusPercent: newCtx.bonusPercent,
    })
  } catch (error) {
    console.error('Streak freeze POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
