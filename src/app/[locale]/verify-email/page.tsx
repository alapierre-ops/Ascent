'use client'

import { useEffect, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

import { TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const t = useTranslations()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  )

  useEffect(() => {
    if (!token) return

    async function verify() {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json()
        setStatus(data.success ? 'success' : 'error')
      } catch {
        setStatus('error')
      }
    }

    verify()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
            Ascent
          </span>
        </div>

        <Card className="border-slate-200/50 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold">
              {t('auth.verifyEmail.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('auth.verifyEmail.verifying')}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="rounded-md border border-green-300 bg-green-100 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                  {t('auth.verifyEmail.success')}
                </div>
                <Button
                  type="button"
                  className="w-full cursor-pointer"
                  size="lg"
                  onClick={() => router.push(`/${locale}/dashboard`)}
                >
                  {t('auth.verifyEmail.goToDashboard')}
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {t('auth.verifyEmail.errors.invalidToken')}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full cursor-pointer"
                  onClick={() => router.push(`/${locale}`)}
                >
                  {t('auth.resetPassword.backToLogin')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
