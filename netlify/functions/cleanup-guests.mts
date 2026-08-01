import type { Config } from '@netlify/functions'

/**
 * Nightly guest cleanup. Netlify invokes this on a schedule (not via a public URL).
 * It calls the existing App Router route so purge logic stays in one place.
 */
export default async () => {
  const secret = process.env.CRON_SECRET
  const baseUrl = process.env.URL ?? process.env.DEPLOY_PRIME_URL

  if (!secret) {
    console.error('CRON_SECRET is not set; skipping guest cleanup')
    return
  }

  if (!baseUrl) {
    console.error('URL is not set; skipping guest cleanup')
    return
  }

  const res = await fetch(`${baseUrl}/api/cron/cleanup-guests`, {
    headers: { Authorization: `Bearer ${secret}` },
  })

  const body = await res.text()
  if (!res.ok) {
    console.error(`Guest cleanup failed (${res.status}): ${body}`)
    throw new Error(`cleanup-guests returned ${res.status}`)
  }

  console.log(`Guest cleanup ok: ${body}`)
}

export const config: Config = {
  schedule: '0 4 * * *', // 04:00 UTC daily
}
