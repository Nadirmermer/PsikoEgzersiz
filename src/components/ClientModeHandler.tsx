import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield } from 'lucide-react'
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
  const { professional, refreshProfessional, verifyPassword } = useAuth()

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast.error('Şifre girin!')
      setPassword('')
      return
    }
    
    if (!professional?.email) {
      toast.error('Uzman bilgisi bulunamadı!')
      return
    }

    console.log('ClientModeHandler - Verifying password')
    setIsExiting(true)

    // Gerçek şifre doğrulama - Supabase authentication
    const isPasswordValid = await verifyPassword(password)
    
    if (!isPasswordValid) {
      toast.error('Hatalı şifre!')
      setPassword('')
      setIsExiting(false)
      return
    }

    console.log('ClientModeHandler - Password verified, starting exit process')
    
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
          
          // Refresh professional data first
          await refreshProfessional()
          
          // Navigate to dashboard with URL parameter
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
      {/* Client Mode Banner - Tablet Optimized */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 text-center fixed top-0 left-0 right-0 z-[60] shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-medium truncate">
                🩺 Danışan Modu Aktif
              </div>
              {professional?.display_name && (
                <div className="text-xs opacity-90 truncate hidden sm:block">
                  Uzman: {professional.display_name}
                </div>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowExitDialog(true)}
            disabled={isExiting}
            className="text-white hover:bg-white/20 h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm flex-shrink-0"
          >
            {isExiting ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">Çıkılıyor...</span>
                <span className="sm:hidden">...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline">Modu Sonlandır</span>
                <span className="sm:hidden">Çıkış</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Spacer for fixed banner */}
      <div className="h-10 sm:h-12" />

      {/* Exit Dialog - Tablet Optimized */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              Danışan Modundan Çıkış
            </DialogTitle>
            <DialogDescription className="text-sm">
              Uzman arayüzüne dönmek için şifrenizi girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Uzman Şifresi</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                onKeyPress={(e) => e.key === 'Enter' && !isExiting && handlePasswordSubmit()}
                disabled={isExiting}
                className="mt-1.5 h-10 sm:h-11"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Hesabınızın şifresini girin
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handlePasswordSubmit}
                disabled={!password || isExiting}
                className="flex-1 h-9 sm:h-10"
              >
                {isExiting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Çıkılıyor...
                  </div>
                ) : (
                  'Çıkış Yap'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (!isExiting) {
                    setShowExitDialog(false)
                    setPassword('')
                  }
                }}
                className="flex-1 h-9 sm:h-10"
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
