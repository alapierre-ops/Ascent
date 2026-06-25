'use client'

import { useEffect, useState } from 'react'

import { signOut } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { ArrowLeft, LogOut, RotateCcw, Settings, Sparkles } from 'lucide-react'

import { useJuice } from '@/components/juice/useJuice'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SettingsToggleRow } from '@/components/settings/SettingsToggleRow'
import { useAscentTheme } from '@/components/themes/ThemeProvider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

import { usePathname, useRouter } from '@/i18n/routing'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const juice = useJuice()
  const { refreshTheme } = useAscentTheme()

  const [email, setEmail] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemStatus, setRedeemStatus] = useState<
    'idle' | 'loading' | 'success' | 'invalid' | 'unavailable' | 'error'
  >('idle')
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null)
  const [resetPhrase, setResetPhrase] = useState('')
  const [resetStatus, setResetStatus] = useState<
    'idle' | 'loading' | 'success' | 'invalid' | 'error'
  >('idle')
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const resetConfirmPhrase = t('account.reset.confirmPhrase')
  const resetPhraseMatches =
    resetPhrase.trim().toUpperCase() === resetConfirmPhrase.toUpperCase() ||
    resetPhrase.trim().toUpperCase().normalize('NFD').replace(/\p{M}/gu, '') ===
      resetConfirmPhrase.toUpperCase().normalize('NFD').replace(/\p{M}/gu, '')

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) setEmail(data.email)
      })
      .catch(() => {})
  }, [])

  const handleLanguageChange = (nextLocale: 'en' | 'fr') => {
    if (nextLocale === locale) return
    juice.playUiClick()
    router.replace(pathname, { locale: nextLocale })
  }

  const handleSignOut = () => {
    juice.playUiClick()
    void signOut({ callbackUrl: `/${locale}` })
  }

  const handleRedeem = async () => {
    const code = redeemCode.trim()
    if (!code) return

    juice.playUiClick()
    setRedeemStatus('loading')
    setRedeemMessage(null)

    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (res.status === 503) {
        setRedeemStatus('unavailable')
        setRedeemMessage(t('redeem.unavailable'))
        return
      }

      if (res.status === 403 || res.status === 400) {
        setRedeemStatus('invalid')
        setRedeemMessage(t('redeem.invalid'))
        return
      }

      if (!res.ok) {
        setRedeemStatus('error')
        setRedeemMessage(t('redeem.error'))
        return
      }

      await refreshTheme()
      setRedeemStatus('success')
      setRedeemMessage(t('redeem.success'))
      setRedeemCode('')
    } catch {
      setRedeemStatus('error')
      setRedeemMessage(t('redeem.error'))
    }
  }

  const handleResetAccount = async () => {
    if (!resetPhraseMatches) return

    juice.playUiClick()
    setResetStatus('loading')
    setResetMessage(null)

    try {
      const res = await fetch('/api/account/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: resetPhrase.trim() }),
      })

      if (res.status === 400) {
        setResetStatus('invalid')
        setResetMessage(t('account.reset.invalid'))
        return
      }

      if (!res.ok) {
        setResetStatus('error')
        setResetMessage(t('account.reset.error'))
        return
      }

      setResetStatus('success')
      setResetMessage(t('account.reset.success'))
      window.setTimeout(() => {
        window.location.href = `/${locale}/dashboard`
      }, 800)
    } catch {
      setResetStatus('error')
      setResetMessage(t('account.reset.error'))
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
            <Settings className="h-6 w-6 text-violet-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
            <p className="text-sm text-white/60">{t('subtitle')}</p>
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {t('preferences.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-white/10 pt-0">
            <SettingsToggleRow
              id="settings-sound"
              label={t('preferences.sound')}
              description={t('preferences.soundDescription')}
              checked={juice.soundEnabled}
              onCheckedChange={(checked) => {
                juice.playUiClick()
                juice.setSoundEnabled(checked)
              }}
            />
            <SettingsToggleRow
              id="settings-animations"
              label={t('preferences.animations')}
              description={t('preferences.animationsDescription')}
              checked={juice.animationsEnabled}
              onCheckedChange={(checked) => {
                juice.playUiClick()
                juice.setAnimationsEnabled(checked)
              }}
            />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {t('language.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['en', 'fr'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition',
                    locale === lang
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                  )}
                >
                  {t(`language.${lang}`)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {t('redeem.title')}
            </CardTitle>
            <CardDescription className="text-white/60">
              {t('redeem.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={redeemCode}
                onChange={(e) => {
                  setRedeemCode(e.target.value)
                  if (redeemStatus !== 'idle' && redeemStatus !== 'loading') {
                    setRedeemStatus('idle')
                    setRedeemMessage(null)
                  }
                }}
                placeholder={t('redeem.placeholder')}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleRedeem()
                }}
              />
              <Button
                type="button"
                onClick={() => void handleRedeem()}
                disabled={redeemStatus === 'loading' || !redeemCode.trim()}
                className="shrink-0 bg-violet-500 hover:bg-violet-600"
              >
                {redeemStatus === 'loading' ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  t('redeem.submit')
                )}
              </Button>
            </div>
            {redeemMessage ? (
              <p
                className={cn(
                  'text-sm',
                  redeemStatus === 'success'
                    ? 'text-emerald-400'
                    : 'text-red-300'
                )}
              >
                {redeemMessage}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {t('account.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {email ? (
              <div>
                <p className="text-xs text-white/50">{t('account.email')}</p>
                <p className="text-sm text-white">{email}</p>
              </div>
            ) : null}
            <div className="space-y-3 rounded-lg border border-red-400/20 bg-red-500/5 p-4">
              <div>
                <p className="text-sm font-medium text-red-100">
                  {t('account.reset.title')}
                </p>
                <p className="mt-1 text-xs text-white/60">
                  {t('account.reset.description')}
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  value={resetPhrase}
                  onChange={(e) => {
                    setResetPhrase(e.target.value)
                    if (resetStatus !== 'idle' && resetStatus !== 'loading') {
                      setResetStatus('idle')
                      setResetMessage(null)
                    }
                  }}
                  placeholder={t('account.reset.placeholder')}
                  className="border-red-400/20 bg-black/20 text-white placeholder:text-white/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleResetAccount()
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleResetAccount()}
                  disabled={resetStatus === 'loading' || !resetPhraseMatches}
                  className="shrink-0 border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                >
                  {resetStatus === 'loading' ? (
                    <RotateCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t('account.reset.submit')}
                    </>
                  )}
                </Button>
              </div>
              {resetMessage ? (
                <p
                  className={cn(
                    'text-sm',
                    resetStatus === 'success'
                      ? 'text-emerald-400'
                      : 'text-red-300'
                  )}
                >
                  {resetMessage}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('account.signOut')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
