'use client'

import { useState } from 'react'

import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

type AuthFormProps = {
  primaryBtnClass?: string
  variant?: 'light' | 'dark'
}

export function AuthForm({ primaryBtnClass, variant = 'dark' }: AuthFormProps) {
  const t = useTranslations()
  const locale = useLocale()

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const start = async (provider: 'guest' | 'google') => {
    setError('')
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: `/${locale}/dashboard` })
    } catch {
      setError(t('auth.errors.serverError'))
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <Button
          type="button"
          data-testid="guest-signin"
          className={cn('w-full cursor-pointer', primaryBtnClass)}
          size="lg"
          onClick={() => start('guest')}
          disabled={isLoading}
        >
          {isLoading ? t('auth.loading') : t('auth.tryInstantly')}
        </Button>

        <p
          className={cn(
            'text-center text-xs',
            variant === 'dark' ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {t('auth.guestHint')}
        </p>

        <AuthDivider label={t('auth.orContinueWith')} variant={variant} />

        <GoogleButton
          onClick={() => start('google')}
          disabled={isLoading}
          label={t('auth.continueWithGoogle')}
          variant={variant}
        />

        <p className="text-center text-xs text-slate-500">
          {t('auth.googleHint')}
        </p>
      </div>
    </>
  )
}

function AuthDivider({
  label,
  variant = 'dark',
}: {
  label: string
  variant?: 'light' | 'dark'
}) {
  return (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span
          className={cn(
            'w-full border-t',
            variant === 'dark' ? 'border-slate-700' : 'border-slate-200'
          )}
        />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span
          className={cn(
            'px-2',
            variant === 'dark'
              ? 'bg-slate-900/80 text-slate-500'
              : 'bg-white text-slate-500'
          )}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

function GoogleButton({
  onClick,
  disabled,
  label,
  variant = 'dark',
}: {
  onClick: () => void
  disabled: boolean
  label: string
  variant?: 'light' | 'dark'
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'w-full cursor-pointer',
        variant === 'dark'
          ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {label}
    </Button>
  )
}
