
import { useState, useEffect } from 'react'

interface ClientModeData {
  professionalId: string
  clientIdentifier: string
  startTime: string
}

export const useClientMode = () => {
  const [isClientMode, setIsClientMode] = useState(false)
  const [clientModeData, setClientModeData] = useState<ClientModeData | null>(null)

  useEffect(() => {
    const checkClientMode = () => {
      const clientMode = localStorage.getItem('clientMode')
      const clientDataStr = localStorage.getItem('clientModeData')
      
      if (clientMode === 'true' && clientDataStr) {
        try {
          const clientData = JSON.parse(clientDataStr)
          setIsClientMode(true)
          setClientModeData(clientData)
        } catch (error) {
          console.error('Client mode data parse error:', error)
          // Clear invalid data
          localStorage.removeItem('clientMode')
          localStorage.removeItem('clientModeData')
        }
      } else {
        setIsClientMode(false)
        setClientModeData(null)
      }
    }

    checkClientMode()
    
    // Listen for storage changes
    window.addEventListener('storage', checkClientMode)
    
    return () => {
      window.removeEventListener('storage', checkClientMode)
    }
  }, [])

  const exitClientMode = () => {
    localStorage.removeItem('clientMode')
    localStorage.removeItem('clientModeData')
    setIsClientMode(false)
    setClientModeData(null)
  }

  return {
    isClientMode,
    clientModeData,
    exitClientMode
  }
}
