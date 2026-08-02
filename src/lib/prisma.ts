import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Supabase session-mode pooler (port 5432) caps ~15 clients. Netlify serverless
 * opens one Prisma client per concurrent request, so the dashboard's parallel
 * /api/* calls hit EMAXCONNSESSION and return 500. Prefer transaction mode
 * (6543 + pgbouncer) and a single connection per isolate.
 */
function getDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined

  try {
    const url = new URL(raw)
    const isSupabasePooler = url.hostname.includes('pooler.supabase.com')

    if (isSupabasePooler && (url.port === '5432' || url.port === '')) {
      url.port = '6543'
    }

    if (url.port === '6543' && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true')
    }

    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set(
        'connection_limit',
        process.env.NODE_ENV === 'development' ? '5' : '1'
      )
    }

    return url.toString()
  } catch {
    return raw
  }
}

const datasourceUrl = getDatasourceUrl()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    ...(datasourceUrl && {
      datasources: { db: { url: datasourceUrl } },
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
