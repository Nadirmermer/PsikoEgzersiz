import { useCallback, useRef, useEffect } from 'react'

export type SoundType = 
  | 'button-click'
  | 'button-hover'
  | 'notification'
  | 'exercise-start'
  | 'exercise-complete'
  | 'level-up'
  | 'countdown'
  | 'timer-tick'
  | 'correct-answer'
  | 'wrong-answer'
  | 'perfect-score'
  | 'achievement'
  | 'focus-ambient'
  | 'relaxing-background'

interface AudioSettings {
  enabled: boolean
  volume: number
  uiSounds: boolean
  exerciseSounds: boolean
  feedbackSounds: boolean
  ambientSounds: boolean
}

const SOUND_PATHS: Record<SoundType, string> = {
  // UI Sounds
  'button-click': '/audio/ui/button-click.mp3',
  'button-hover': '/audio/ui/button-hover.mp3',
  'notification': '/audio/ui/notification.mp3',
  
  // Exercise Sounds
  'exercise-start': '/audio/exercises/exercise-start.mp3',
  'exercise-complete': '/audio/exercises/exercise-complete.mp3',
  'level-up': '/audio/exercises/level-up.mp3',
  'countdown': '/audio/exercises/countdown.mp3',
  'timer-tick': '/audio/exercises/timer-tick.mp3',
  
  // Feedback Sounds
  'correct-answer': '/audio/feedback/correct-answer.mp3',
  'wrong-answer': '/audio/feedback/wrong-answer.mp3',
  'perfect-score': '/audio/feedback/perfect-score.mp3',
  'achievement': '/audio/feedback/achievement.mp3',
  
  // Ambient Sounds
  'focus-ambient': '/audio/ambient/focus-ambient.mp3',
  'relaxing-background': '/audio/ambient/relaxing-background.mp3',
}

const SOUND_CATEGORIES: Record<SoundType, keyof Omit<AudioSettings, 'enabled' | 'volume'>> = {
  'button-click': 'uiSounds',
  'button-hover': 'uiSounds',
  'notification': 'uiSounds',
  'exercise-start': 'exerciseSounds',
  'exercise-complete': 'exerciseSounds',
  'level-up': 'exerciseSounds',
  'countdown': 'exerciseSounds',
  'timer-tick': 'exerciseSounds',
  'correct-answer': 'feedbackSounds',
  'wrong-answer': 'feedbackSounds',
  'perfect-score': 'feedbackSounds',
  'achievement': 'feedbackSounds',
  'focus-ambient': 'ambientSounds',
  'relaxing-background': 'ambientSounds',
}

export const useAudio = () => {
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map())
  const currentAmbient = useRef<HTMLAudioElement | null>(null)
  const userHasInteracted = useRef<boolean>(false)

  // 🔧 FIX: Track user interaction for audio autoplay policy compliance
  useEffect(() => {
    const handleUserInteraction = () => {
      userHasInteracted.current = true
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    // Listen for user interactions
    document.addEventListener('click', handleUserInteraction, { passive: true })
    document.addEventListener('keydown', handleUserInteraction, { passive: true })
    document.addEventListener('touchstart', handleUserInteraction, { passive: true })

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  // Ses ayarlarını localStorage'dan al
  const getAudioSettings = useCallback((): AudioSettings => {
    const saved = localStorage.getItem('audio-settings')
    if (saved) {
      return JSON.parse(saved)
    }
    
    // Varsayılan ayarlar
    return {
      enabled: true,
      volume: 0.7,
      uiSounds: true,
      exerciseSounds: true,
      feedbackSounds: true,
      ambientSounds: false, // Varsayılan olarak kapalı
    }
  }, [])

  // Ses ayarlarını kaydet
  const saveAudioSettings = useCallback((settings: AudioSettings) => {
    localStorage.setItem('audio-settings', JSON.stringify(settings))
  }, [])

  // Ses dosyasını önceden yükle
  const preloadSound = useCallback((soundType: SoundType) => {
    if (!audioCache.current.has(soundType)) {
      const audio = new Audio(SOUND_PATHS[soundType])
      audio.preload = 'auto'
      audioCache.current.set(soundType, audio)
    }
  }, [])

  // Ses çal
  const playSound = useCallback((soundType: SoundType, options?: { volume?: number; loop?: boolean }) => {
    const settings = getAudioSettings()
    
    // Genel ses ayarı kapalıysa çalma
    if (!settings.enabled) return
    
    // Kategori ayarı kapalıysa çalma
    const category = SOUND_CATEGORIES[soundType]
    if (!settings[category]) return

    // 🔧 FIX: Skip hover sounds if user hasn't interacted yet
    if (soundType === 'button-hover' && !userHasInteracted.current) {
      return
    }

    try {
      // Ses dosyasını cache'den al veya oluştur
      let audio = audioCache.current.get(soundType)
      if (!audio) {
        audio = new Audio(SOUND_PATHS[soundType])
        audioCache.current.set(soundType, audio)
      }

      // 🔧 FIX: Prevent audio conflicts
      // Önce mevcut audio'yu tamamen durdur
      if (!audio.paused) {
        audio.pause()
      }
      
      // Ses ayarları
      audio.volume = (options?.volume ?? settings.volume) * settings.volume
      audio.loop = options?.loop ?? false

      // Baştan başlat
      audio.currentTime = 0
      
      // 🔧 FIX: Safe audio play with better error handling
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Only log if it's not an AbortError (which is expected when interrupting)
          if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
            console.warn('Audio play failed:', soundType, error.name, error.message)
          }
          // NotAllowedError için sessizce geç (hover sounds için normal)
        })
      }

      return audio
    } catch (error) {
      console.warn('Failed to play sound:', soundType, error)
    }
  }, [getAudioSettings])

  // Ortam sesini başlat
  const startAmbientSound = useCallback((soundType: 'focus-ambient' | 'relaxing-background') => {
    const settings = getAudioSettings()
    
    if (!settings.enabled || !settings.ambientSounds) return

    // Mevcut ortam sesini durdur
    if (currentAmbient.current) {
      currentAmbient.current.pause()
      currentAmbient.current = null
    }

    try {
      const audio = new Audio(SOUND_PATHS[soundType])
      audio.volume = settings.volume * 0.3 // Ortam sesleri daha düşük
      audio.loop = true
      
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.then(() => {
          currentAmbient.current = audio
        }).catch(error => {
          console.warn('Ambient audio play failed:', error)
        })
      }
    } catch (error) {
      console.warn('Failed to start ambient sound:', soundType, error)
    }
  }, [getAudioSettings])

  // Ortam sesini durdur
  const stopAmbientSound = useCallback(() => {
    if (currentAmbient.current) {
      currentAmbient.current.pause()
      currentAmbient.current = null
    }
  }, [])

  // Tüm sesleri durdur
  const stopAllSounds = useCallback(() => {
    audioCache.current.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
    stopAmbientSound()
  }, [stopAmbientSound])

  // Ses seviyesini ayarla
  const setVolume = useCallback((volume: number) => {
    const settings = getAudioSettings()
    const newSettings = { ...settings, volume: Math.max(0, Math.min(1, volume)) }
    saveAudioSettings(newSettings)
    
    // Mevcut ortam sesinin seviyesini güncelle
    if (currentAmbient.current) {
      currentAmbient.current.volume = newSettings.volume * 0.3
    }
  }, [getAudioSettings, saveAudioSettings])

  // Ses kategorisini aç/kapat
  const toggleSoundCategory = useCallback((category: keyof Omit<AudioSettings, 'enabled' | 'volume'>) => {
    const settings = getAudioSettings()
    const newSettings = { ...settings, [category]: !settings[category] }
    saveAudioSettings(newSettings)
    
    // Ortam sesi kapatıldıysa durdur
    if (category === 'ambientSounds' && !newSettings.ambientSounds) {
      stopAmbientSound()
    }
  }, [getAudioSettings, saveAudioSettings, stopAmbientSound])

  // Tüm sesleri aç/kapat
  const toggleAllSounds = useCallback(() => {
    const settings = getAudioSettings()
    const newSettings = { ...settings, enabled: !settings.enabled }
    saveAudioSettings(newSettings)
    
    // Sesler kapatıldıysa tümünü durdur
    if (!newSettings.enabled) {
      stopAllSounds()
    }
  }, [getAudioSettings, saveAudioSettings, stopAllSounds])

  // Önemli sesleri önceden yükle
  useEffect(() => {
    const importantSounds: SoundType[] = [
      'button-click',
      'exercise-start',
      'correct-answer',
      'wrong-answer',
      'exercise-complete'
    ]
    
    importantSounds.forEach(preloadSound)
  }, [preloadSound])

  // Sayfa arka plana geçtiğinde sesleri durdur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Sayfa arka plana geçti, tüm sesleri durdur
        stopAllSounds()
      }
    }

    const handleBlur = () => {
      // Pencere focus kaybetti, sesleri durdur
      stopAllSounds()
    }

    // Event listener'ları ekle
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('pagehide', stopAllSounds)

    return () => {
      // Event listener'ları temizle
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('pagehide', stopAllSounds)
    }
  }, [stopAllSounds])

  // Cleanup
  useEffect(() => {
    return () => {
      stopAllSounds()
    }
  }, [stopAllSounds])

  return {
    playSound,
    startAmbientSound,
    stopAmbientSound,
    stopAllSounds,
    setVolume,
    toggleSoundCategory,
    toggleAllSounds,
    getAudioSettings,
    preloadSound,
  }
} 