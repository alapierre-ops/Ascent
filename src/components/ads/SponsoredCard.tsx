'use client'

import { useTranslations } from 'next-intl'

import { ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function SponsoredCard() {
  const t = useTranslations('shop.sponsored')

  return (
    <Card className="border-teal-400/30 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-xl">
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="space-y-2">
          <Badge className="border-teal-400/40 bg-teal-500/20 text-teal-100">
            {t('badge')}
          </Badge>
          <h3 className="text-base font-semibold text-white">{t('title')}</h3>
          <p className="text-sm text-white/70">{t('description')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-auto border-teal-400/40 bg-teal-500/10 text-teal-100 hover:bg-teal-500/20"
          onClick={() => {
            /* demo placeholder */
          }}
        >
          {t('cta')}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
