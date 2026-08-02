'use client'

import { useCallback, useEffect, useRef } from 'react'

import { SOUND_DEFS, type SoundId, type SoundTier } from '@/lib/juice/sounds'

export { readSoundEnabled, writeSoundEnabled } from '@/lib/juice/prefs'

/**
 * Lazy HTMLAudioElement pool — sounds download on first play instead of
 * blocking dashboard mount with 11 parallel Howler loads (~300KB WAV).
 */
function getAudio(id: SoundId, cache: Map<SoundId, HTMLAudioElement>) {
  let audio = cache.get(id)
  if (!audio) {
    audio = new Audio(SOUND_DEFS[id].src)
    audio.preload = 'auto'
    cache.set(id, audio)
  }
  return audio
}

export function useJuiceSounds(
  soundEnabled: boolean,
  onboardingActive: boolean,
  reducedMotion: boolean
) {
  const audioCacheRef = useRef<Map<SoundId, HTMLAudioElement>>(new Map())
  const coinDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (coinDebounceRef.current) clearTimeout(coinDebounceRef.current)
      for (const audio of audioCacheRef.current.values()) {
        audio.pause()
        audio.src = ''
      }
      audioCacheRef.current.clear()
    }
  }, [])

  // Warm a couple of frequent sounds during idle time (non-blocking).
  useEffect(() => {
    if (!soundEnabled || typeof window === 'undefined') return
    const warm = () => {
      getAudio('ui-click', audioCacheRef.current)
      getAudio('mission-pop', audioCacheRef.current)
    }
    const ric = window.requestIdleCallback?.bind(window)
    if (ric) {
      const id = ric(warm, { timeout: 2500 })
      return () => window.cancelIdleCallback?.(id)
    }
    const timer = window.setTimeout(warm, 1200)
    return () => window.clearTimeout(timer)
  }, [soundEnabled])

  const shouldPlayTier = useCallback(
    (tier: SoundTier) => {
      if (!soundEnabled) return false
      if (onboardingActive && tier === 'subtle') return false
      if (reducedMotion && tier === 'loud') return false
      return true
    },
    [soundEnabled, onboardingActive, reducedMotion]
  )

  const playSound = useCallback(
    (id: SoundId) => {
      const def = SOUND_DEFS[id]
      if (!shouldPlayTier(def.tier)) return
      try {
        const audio = getAudio(id, audioCacheRef.current)
        audio.volume = def.volume
        audio.currentTime = 0
        void audio.play().catch(() => {})
      } catch {
        // Autoplay / missing asset — ignore
      }
    },
    [shouldPlayTier]
  )

  const playCoinTickDebounced = useCallback(() => {
    if (!shouldPlayTier('subtle')) return
    if (coinDebounceRef.current) clearTimeout(coinDebounceRef.current)
    coinDebounceRef.current = setTimeout(() => {
      playSound('coin-tick')
    }, 150)
  }, [shouldPlayTier, playSound])

  const vibrate = useCallback((ms = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(ms)
    }
  }, [])

  const confettiIntensity = onboardingActive ? 0.5 : 1

  return {
    playSound,
    playCoinTickDebounced,
    vibrate,
    confettiIntensity,
  }
}
