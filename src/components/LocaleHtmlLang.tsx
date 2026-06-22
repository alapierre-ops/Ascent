'use client'

import { useEffect } from 'react'

import { useLocale } from 'next-intl'

export function LocaleHtmlLang() {
  const locale = useLocale()

  useEffect(() => {
    document.documentElement.lang = locale.startsWith('fr') ? 'fr-FR' : 'en'
  }, [locale])

  return null
}
