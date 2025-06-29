import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/components/ui/sonner'

export type ScreenOrientation = 'portrait' | 'landscape'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

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

interface OrientationState {
  orientation: ScreenOrientation
  deviceType: DeviceType
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

interface OrientationHookReturn extends OrientationState {
  lockOrientation: (orientation: OrientationLockType) => Promise<boolean>
  unlockOrientation: () => Promise<boolean>
  isOrientationSupported: boolean
  onOrientationChange: (callback: (orientation: OrientationState) => void) => () => void
}

/**
 * Orientation ve device type detection hook'u
 * Responsive memory game layout için optimize edilmiş
 */
export const useOrientation = (): OrientationState => {
  const [orientationState, setOrientationState] = useState<OrientationState>(() => {
    if (typeof window === 'undefined') {
      return {
        orientation: 'portrait',
        deviceType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: 1024,
        height: 768
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    const orientation: ScreenOrientation = width > height ? 'landscape' : 'portrait'
    
    // Device type detection
    let deviceType: DeviceType = 'desktop'
    if (width < 640) {
      deviceType = 'mobile'
    } else if (width < 1024) {
      deviceType = 'tablet'
    }

    return {
      orientation,
      deviceType,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      width,
      height
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const orientation: ScreenOrientation = width > height ? 'landscape' : 'portrait'
      
      let deviceType: DeviceType = 'desktop'
      if (width < 640) {
        deviceType = 'mobile'
      } else if (width < 1024) {
        deviceType = 'tablet'
      }

      setOrientationState({
        orientation,
        deviceType,
        isMobile: deviceType === 'mobile',
        isTablet: deviceType === 'tablet',
        isDesktop: deviceType === 'desktop',
        width,
        height
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  return orientationState
}

/**
 * TABLET-FRIENDLY Memory game için optimal grid layout hesaplama
 * Yaşlılar ve çocuklar için tablet-optimized
 */
export const getOptimalGridForDevice = (
  originalGrid: { rows: number; cols: number },
  orientation: OrientationState
): { rows: number; cols: number } => {
  const { isMobile, isTablet, orientation: screenOrientation } = orientation

  // 🎯 TABLET - Ana hedef platform (Yaşlılar ve çocuklar için)
  // Tablet'ta ASLA grid rotation yapma - optimal layout'ı koru
  if (isTablet) {
    return originalGrid // Tablet'ta daima orijinal grid kullan (perfect squares ve rectangles)
  }

  // 📱 MOBILE - Sadece mobile'da rotation yap
  // Mobile portrait'ta grid'i rotate et (daha az satır, daha fazla sütun)
  if (isMobile && screenOrientation === 'portrait') {
    // Sadece aspect ratio > 1.0 olan layout'ları rotate et
    const aspectRatio = originalGrid.cols / originalGrid.rows
    if (aspectRatio > 1.0) {
      return {
        rows: originalGrid.cols,  // Sütunları satır yap
        cols: originalGrid.rows   // Satırları sütun yap
      }
    }
  }

  // 🖥️ DESKTOP - Original grid'i kullan
  return originalGrid
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

  // 🔧 FIX: Removed onOrientationChange usage to fix type errors
  // Game state preservation is handled by component level logic instead

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