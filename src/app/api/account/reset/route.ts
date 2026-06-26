import { NextRequest, NextResponse } from 'next/server'

import {
  isValidResetConfirmation,
  resetAccount,
} from '@/lib/account/reset-account'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const confirmation =
      typeof body.confirmation === 'string' ? body.confirmation : ''

    if (!isValidResetConfirmation(confirmation)) {
      return NextResponse.json(
        { error: 'invalid_confirmation' },
        { status: 400 }
      )
    }

    await resetAccount(prisma, session.user.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Account reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
