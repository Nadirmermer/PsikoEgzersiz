import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/sonner'
import { syncPendingData } from '../lib/supabaseClient'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
  previousOnlineState: boolean
}

// Network Connection API types
interface NetworkConnection extends EventTarget {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
  saveData?: boolean
  addEventListener(type: 'change', listener: EventListener): void
  removeEventListener(type: 'change', listener: EventListener): void
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    previousOnlineState: typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine
      const connection = (navigator as NavigatorWithConnection).connection || 
                        (navigator as NavigatorWithConnection).mozConnection || 
                        (navigator as NavigatorWithConnection).webkitConnection

      const previousState = networkStatus.isOnline
      
      let connectionType = 'unknown'
      let isSlowConnection = false
      
      if (connection) {
        connectionType = connection.effectiveType || 'unknown'
        isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        connectionType,
        previousOnlineState: previousState
      })

      // Toast notifications for state changes
      if (previousState && !isOnline) {
        toast.error('🔴 İnternet bağlantısı kesildi! Veriler yerel olarak saklanacak.')
      } else if (!previousState && isOnline) {
        toast.success('🟢 İnternet bağlantısı yeniden kuruldu! Veriler senkronize ediliyor.')
      } else if (isOnline && isSlowConnection) {
        toast.warning('🟡 Yavaş internet bağlantısı tespit edildi.')
      }
    }

    const handleOnline = () => {
      updateNetworkStatus()
      // Auto-sync when coming back online
      setTimeout(() => {
        syncPendingData()
      }, 1000)
    }

    const handleOffline = () => {
      updateNetworkStatus()
    }

    const handleConnectionChange = () => {
      updateNetworkStatus()
    }

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Modern browsers
    if ((navigator as NavigatorWithConnection).connection) {
      (navigator as NavigatorWithConnection).connection!.addEventListener('change', handleConnectionChange)
    }

    // Initial status
    updateNetworkStatus()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ((navigator as NavigatorWithConnection).connection) {
        (navigator as NavigatorWithConnection).connection!.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [networkStatus.isOnline])

  return networkStatus
}

// Type augmentation for Navigator with connection API
interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection
  mozConnection?: NetworkConnection
  webkitConnection?: NetworkConnection
}

// Utility functions for network-aware operations
export const withNetworkCheck = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  fallback?: (...args: T) => R
) => {
  return async (...args: T): Promise<R> => {
    if (!navigator.onLine) {
      if (fallback) {
        return fallback(...args)
      }
      throw new Error('İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.')
    }
    return fn(...args)
  }
}

export const isNetworkSlow = (): boolean => {
  const connection = (navigator as NavigatorWithConnection).connection || 
                     (navigator as NavigatorWithConnection).mozConnection || 
                     (navigator as NavigatorWithConnection).webkitConnection
  if (!connection) return false
  
  const effectiveType = connection.effectiveType
  return effectiveType === '2g' || effectiveType === 'slow-2g'
} 