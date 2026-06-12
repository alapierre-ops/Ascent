'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Check } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

const PREDEFINED_AVATARS = [
  {
    id: 'bottts-1',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1',
  },
  {
    id: 'bottts-2',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2',
  },
  {
    id: 'bottts-3',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot3',
  },
  {
    id: 'bottts-4',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robot4',
  },
  {
    id: 'personas-1',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Person1',
  },
  {
    id: 'personas-2',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Person2',
  },
  {
    id: 'personas-3',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Person3',
  },
  {
    id: 'personas-4',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Person4',
  },
  {
    id: 'pixel-art-1',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel1',
  },
  {
    id: 'pixel-art-2',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel2',
  },
  {
    id: 'pixel-art-3',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel3',
  },
  {
    id: 'pixel-art-4',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel4',
  },
]

interface AvatarPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAvatar?: string | null
  currentInitials: string
  onAvatarSelect: (avatarUrl: string | null) => void
}

export function AvatarPicker({
  open,
  onOpenChange,
  currentAvatar,
  currentInitials,
  onAvatarSelect,
}: AvatarPickerProps) {
  const t = useTranslations('dashboard.avatarPicker')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    currentAvatar || null
  )

  const handleSave = () => {
    onAvatarSelect(selectedAvatar)
    onOpenChange(false)
  }

  const handleRemove = () => {
    setSelectedAvatar(null)
    onAvatarSelect(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/20 bg-slate-900/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('title')}</DialogTitle>
          <DialogDescription className="text-white/70">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-white/70">{t('preview')}</p>
            <Avatar className="h-24 w-24 border-2 border-white/40 shadow-lg">
              {selectedAvatar ? (
                <AvatarImage src={selectedAvatar} alt="Selected avatar" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-semibold text-white">
                {currentInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
            {PREDEFINED_AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.url
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-full border-2 transition-all',
                    isSelected
                      ? 'border-indigo-400 ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-slate-900'
                      : 'border-white/20 hover:border-white/40'
                  )}
                >
                  <img
                    src={avatar.url}
                    alt={`Avatar ${avatar.id}`}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              {t('actions.remove')}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                {t('actions.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:from-indigo-600 hover:to-purple-600"
              >
                {t('actions.save')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
