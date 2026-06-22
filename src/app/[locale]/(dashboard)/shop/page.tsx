'use client'

import { useState } from 'react'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { CheckCircle, Sparkles, Zap } from 'lucide-react'

export default function ShopPage() {
  const t = useTranslations('shop')
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPremium = (session?.user as { isPremium?: boolean })?.isPremium

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(t('premium.error'))
        return
      }

      window.location.href = data.url
    } catch {
      setError(t('premium.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-4">
      <div className="w-full max-w-sm">
        {isPremium ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
            <h2 className="mb-2 text-xl font-bold text-white">
              {t('premium.alreadyPremium')}
            </h2>
            <p className="text-white/60">{t('premium.alreadyPremiumDesc')}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-6 text-center">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
                <Sparkles className="h-3 w-3" />
                {t('premium.badge')}
              </span>
              <h2 className="mt-3 text-2xl font-bold text-white">
                {t('premium.title')}
              </h2>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-white">
                  {t('premium.price')}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50">
                {t('premium.priceLabel')}
              </p>
            </div>

            <p className="mb-6 text-center text-sm text-white/60">
              {t('premium.description')}
            </p>

            <ul className="mb-8 space-y-3">
              {(t.raw('premium.perks') as string[]).map(
                (perk: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-white/80"
                  >
                    <Zap className="h-4 w-4 shrink-0 text-amber-400" />
                    {perk}
                  </li>
                )
              )}
            </ul>

            {error && (
              <p className="mb-4 text-center text-sm text-red-400">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t('premium.loading') : t('premium.cta')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
