
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

interface ClientModeHandlerProps {
  isClientMode: boolean
  onExitClientMode: () => void
}

const ClientModeHandler: React.FC<ClientModeHandlerProps> = ({ 
  isClientMode, 
  onExitClientMode 
}) => {
  const [password, setPassword] = useState('')
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const { professional } = useAuth()

  const handlePasswordSubmit = async () => {
    if (password !== '1923') {
      toast.error('Hatalı şifre!')
      setPassword('')
      return
    }

    console.log('ClientModeHandler - Starting exit process')
    setIsExiting(true)
    
    try {
      // Clear client mode data
      localStorage.removeItem('clientMode')
      localStorage.removeItem('clientModeData')
      console.log('ClientModeHandler - Client mode data cleared from localStorage')
      
      // Close dialog and reset form
      setShowExitDialog(false)
      setPassword('')
      
      // Call the exit callback to update parent state
      onExitClientMode()
      console.log('ClientModeHandler - Exit callback called')
      
      toast.success('Danışan modundan çıkıldı')
      
      // Force refresh professional data and navigate to dashboard
      setTimeout(async () => {
        try {
          console.log('ClientModeHandler - Refreshing session and navigating to dashboard')
          
          // Force page reload to ensure clean state
          window.location.href = '/?page=uzman-dashboard'
        } catch (error) {
          console.error('ClientModeHandler - Error during session refresh:', error)
          // Fallback to simple reload
          window.location.reload()
        }
      }, 500)
      
    } catch (error) {
      console.error('ClientModeHandler - Exit error:', error)
      toast.error('Çıkış sırasında hata oluştu')
    } finally {
      setIsExiting(false)
    }
  }

  if (!isClientMode) return null

  return (
    <>
      {/* Client Mode Banner */}
      <div className="bg-blue-500 text-white px-4 py-2 text-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="text-sm font-medium">
            🩺 Danışan Modu Aktif
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowExitDialog(true)}
            disabled={isExiting}
          >
            {isExiting ? 'Çıkılıyor...' : 'Modu Sonlandır'}
          </Button>
        </div>
      </div>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Danışan Modundan Çıkış</DialogTitle>
            <DialogDescription>
              Uzman arayüzüne dönmek için şifrenizi girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                onKeyPress={(e) => e.key === 'Enter' && !isExiting && handlePasswordSubmit()}
                disabled={isExiting}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePasswordSubmit}
                disabled={!password || isExiting}
                className="flex-1"
              >
                {isExiting ? 'Çıkılıyor...' : 'Çıkış Yap'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!isExiting) {
                    setShowExitDialog(false)
                    setPassword('')
                  }
                }}
                className="flex-1"
                disabled={isExiting}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ClientModeHandler
