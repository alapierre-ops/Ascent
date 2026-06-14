import { routing } from '@/i18n/routing'

export type AppLocale = (typeof routing.locales)[number]

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value)
}

/** BCP 47 tag for Intl date/number formatters (fr → fr-FR). */
export function toBcp47Locale(locale: string): string {
  if (locale.startsWith('fr')) return 'fr-FR'
  return 'en-US'
}
