'use client'

import { useTranslations } from 'next-intl'

import { Hammer } from 'lucide-react'

export default function ShopPage() {
  const t = useTranslations('shop')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-slate-200">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
        <Hammer className="h-10 w-10 text-amber-400" />
      </div>
      <h1 className="text-2xl font-semibold text-white">{t('title')}</h1>
      <p className="text-center text-white/70">{t('underConstruction')}</p>
    </div>
  )
}
