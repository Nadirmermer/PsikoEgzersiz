import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/sonner'

export type OrientationType = 'portrait' | 'landscape' | 'portrait-reverse' | 'landscape-reverse'

// Types for orientation lock
export type OrientationLockType = 
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary'

// Type guards for orientation API
const hasOrientationLock = (orientation: ScreenOrientation): orientation is ScreenOrientation & { lock: (orientation: OrientationLockType) => Promise<void> } => {
  return 'lock' in orientation && typeof (orientation as unknown as { lock?: unknown }).lock === 'function'
}

const hasOrientationUnlock = (orientation: ScreenOrientation): orientation is ScreenOrientation & { unlock: () => void } => {
  return 'unlock' in orientation && typeof (orientation as unknown as { unlock?: unknown }).unlock === 'function'
}

interface OrientationState {
  orientation: OrientationType
  angle: number
  isLandscape: boolean
  isPortrait: boolean
  isTabletSize: boolean
  screenWidth: number
  screenHeight: number
}

interface OrientationHookReturn extends OrientationState {
  lockOrientation: (orientation: OrientationLockType) => Promise<boolean>
  unlockOrientation: () => Promise<boolean>
  isOrientationSupported: boolean
  onOrientationChange: (callback: (orientation: OrientationState) => void) => () => void
}

export const useOrientation = (): OrientationHookReturn => {
  const [orientationState, setOrientationState] = useState<OrientationState>(() => ({
    orientation: 'portrait',
    angle: 0,
    isLandscape: false,
    isPortrait: true,
    isTabletSize: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 768,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1024
  }))

  const [callbacks] = useState<Set<(orientation: OrientationState) => void>>(new Set())

  const getOrientationType = useCallback((angle: number, width: number, height: number): OrientationType => {
    const isLandscape = width > height
    
    if (angle === 0) return 'portrait'
    if (angle === 90 || angle === -270) return 'landscape'
    if (angle === 180 || angle === -180) return 'portrait-reverse'
    if (angle === 270 || angle === -90) return 'landscape-reverse'
    
    // Fallback based on dimensions
    return isLandscape ? 'landscape' : 'portrait'
  }, [])

  const updateOrientation = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const angle = window.screen?.orientation?.angle ?? 0
    const isLandscape = width > height
    const isPortrait = !isLandscape
    const isTabletSize = Math.min(width, height) >= 768 // Minimum tablet size
    
    const newState: OrientationState = {
      orientation: getOrientationType(angle, width, height),
      angle,
      isLandscape,
      isPortrait,
      isTabletSize,
      screenWidth: width,
      screenHeight: height
    }

    setOrientationState(prev => {
      // Only update if there's a meaningful change
      if (
        prev.orientation !== newState.orientation ||
        prev.screenWidth !== newState.screenWidth ||
        prev.screenHeight !== newState.screenHeight
      ) {
        // Notify all registered callbacks
        callbacks.forEach(callback => callback(newState))
        
        // Show orientation change notification for games
        if (prev.orientation !== newState.orientation && isTabletSize) {
          const orientationNames = {
            'portrait': 'Dikey',
            'landscape': 'Yatay',
            'portrait-reverse': 'Ters Dikey',
            'landscape-reverse': 'Ters Yatay'
          }
          
          toast.info(`📱 Ekran Yönü: ${orientationNames[newState.orientation]}`, {
            description: 'Oyun durumu korundu'
          })
        }
      }
      
      return newState
    })
  }, [getOrientationType, callbacks])

  const lockOrientation = useCallback(async (orientation: OrientationLockType): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.screen?.orientation) {
      console.warn('Orientation lock not supported')
      return false
    }

    try {
      const screenOrientation = window.screen.orientation
      if (hasOrientationLock(screenOrientation)) {
        await screenOrientation.lock(orientation)
        toast.success(`🔒 Ekran yönü ${orientation} olarak sabitlendi`)
        return true
      } else {
        console.warn('Orientation lock method not available')
        return false
      }
    } catch (error) {
      console.warn('Failed to lock orientation:', error)
      toast.warning('Ekran yönü sabitlenemedi')
      return false
    }
  }, [])

  const unlockOrientation = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.screen?.orientation) {
      console.warn('Orientation unlock not supported')
      return false
    }

    try {
      const screenOrientation = window.screen.orientation
      if (hasOrientationUnlock(screenOrientation)) {
        screenOrientation.unlock()
        toast.info('🔓 Ekran yönü serbest bırakıldı')
        return true
      } else {
        console.warn('Orientation unlock method not available')
        return false
      }
    } catch (error) {
      console.warn('Failed to unlock orientation:', error)
      return false
    }
  }, [])

  const onOrientationChange = useCallback((callback: (orientation: OrientationState) => void) => {
    callbacks.add(callback)
    
    // Return cleanup function
    return () => {
      callbacks.delete(callback)
    }
  }, [callbacks])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initial update
    updateOrientation()

    // Listen to both orientation and resize events
    const handleOrientationChange = () => {
      // Small delay to ensure the browser has updated dimensions
      setTimeout(updateOrientation, 100)
    }

    const handleResize = () => {
      updateOrientation()
    }

    // Modern orientation API
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange)
    }

    // Legacy orientation API
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Window resize as fallback
    window.addEventListener('resize', handleResize)

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange)
      }
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleResize)
    }
  }, [updateOrientation])

  return {
    ...orientationState,
    lockOrientation,
    unlockOrientation,
    isOrientationSupported: typeof window !== 'undefined' && !!window.screen?.orientation,
    onOrientationChange
  }
}

// Game state preservation helper
export const useGameStatePreservation = <T>(key: string, initialState: T) => {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialState
    
    try {
      const saved = sessionStorage.getItem(`gameState_${key}`)
      return saved ? JSON.parse(saved) : initialState
    } catch {
      return initialState
    }
  })

  const { onOrientationChange } = useOrientation()

  // Save state on orientation change
  useEffect(() => {
    const cleanup = onOrientationChange(() => {
      try {
        sessionStorage.setItem(`gameState_${key}`, JSON.stringify(state))
      } catch (error) {
        console.warn('Failed to save game state:', error)
      }
    })

    return cleanup
  }, [key, state, onOrientationChange])

  // Clear saved state when component unmounts
  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem(`gameState_${key}`)
      } catch (error) {
        console.warn('Failed to clear game state:', error)
      }
    }
  }, [key])

  return [state, setState] as const
} 