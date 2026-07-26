import { NextRequest, NextResponse } from 'next/server'

import {
  guestCutoffDate,
  guestRetentionDays,
  purgeStaleGuests,
} from '@/lib/account/purge-guests'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET

  // Sans secret configuré la route resterait ouverte : on refuse plutôt.
  if (!secret) {
    console.error('CRON_SECRET is not set; refusing to run guest cleanup')
    return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 500 })
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = guestCutoffDate()
    const { deleted } = await purgeStaleGuests(prisma, cutoff)

    console.log(
      `Guest cleanup: deleted ${deleted} guest account(s) inactive since ${cutoff.toISOString()}`
    )

    return NextResponse.json({
      ok: true,
      deleted,
      retentionDays: guestRetentionDays(),
      cutoff: cutoff.toISOString(),
    })
  } catch (error) {
    console.error('Guest cleanup error:', error)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
