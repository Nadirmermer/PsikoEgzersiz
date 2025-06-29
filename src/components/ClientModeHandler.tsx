import React, { useState, useEffect } from 'react'
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
  onNavigateToDashboard?: () => void  // Yeni prop: React state navigation için
  showHeader?: boolean  // Yeni prop: Header gösterilip gösterilmeyeceği
}

interface ClientModeData {
  professionalId: string
  clientIdentifier: string
  startTime: string
}

const ClientModeHandler: React.FC<ClientModeHandlerProps> = ({ 
  isClientMode, 
  onExitClientMode,
  onNavigateToDashboard,
  showHeader = true  // Default true (backward compatibility)
}) => {
  const [password, setPassword] = useState('')
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [clientModeData, setClientModeData] = useState<ClientModeData | null>(null)
  
  const { professional, refreshProfessional, verifyPassword, user } = useAuth()

  // Client mode data'sını yükle
  useEffect(() => {
    if (isClientMode) {
      const clientDataStr = localStorage.getItem('clientModeData')
      if (clientDataStr) {
        try {
          const data: ClientModeData = JSON.parse(clientDataStr)
          setClientModeData(data)
          console.log('ClientModeHandler - Client mode data loaded:', {
            professionalId: data.professionalId.substring(0, 8) + '...',
            clientIdentifier: data.clientIdentifier
          })
        } catch (error) {
          console.error('ClientModeHandler - Error parsing client mode data:', error)
        }
      }
    }
  }, [isClientMode])

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast.error('Şifre girin!')
      setPassword('')
      return
    }
    
    // Professional bilgilerini kontrol et - önce AuthContext'ten, sonra localStorage'dan
    let professionalEmail = professional?.email
    let professionalId = professional?.id
    
    if (!professionalEmail && clientModeData) {
      console.log('ClientModeHandler - Professional not in context, using client mode data')
      professionalId = clientModeData.professionalId
      
      // Professional email'ini almak için refreshProfessional dene
      try {
        await refreshProfessional()
        professionalEmail = professional?.email
      } catch (error) {
        console.error('ClientModeHandler - Error refreshing professional:', error)
      }
    }
    
    if (!professionalEmail && !professionalId) {
      toast.error('Uzman bilgisi bulunamadı! Lütfen sayfayı yenileyin ve tekrar deneyin.')
      console.error('ClientModeHandler - No professional data available')
      return
    }

    console.log('ClientModeHandler - Verifying password for professional:', 
      professionalEmail ? professionalEmail : `ID: ${professionalId?.substring(0, 8)}...`)
    setIsExiting(true)

    try {
      // Şifre doğrulama - email yoksa direkt Supabase'den kontrol et
      let isPasswordValid = false
      
      if (professionalEmail && user?.email) {
        // Normal verifyPassword kullan
        isPasswordValid = await verifyPassword(password)
      } else if (professionalId) {
        // Manuel şifre doğrulama - professional ID'si ile
        console.log('ClientModeHandler - Manual password verification for professional ID')
        
        // Supabase'den professional email'ini al
        const { supabase } = await import('../lib/supabase')
        if (supabase) {
          const { data: professionalData, error } = await supabase
            .from('professionals')
            .select('email')
            .eq('id', professionalId)
            .single()
            
          if (professionalData?.email) {
            // Email ile şifre doğrulama
            const { error: authError } = await supabase.auth.signInWithPassword({
              email: professionalData.email,
              password: password,
            })
            
            isPasswordValid = !authError
            if (authError) {
              console.log('ClientModeHandler - Password verification failed:', authError.message)
            }
          }
        }
      }
      
      if (!isPasswordValid) {
        toast.error('Hatalı şifre!')
        setPassword('')
        setIsExiting(false)
        return
      }

      console.log('ClientModeHandler - Password verified, starting exit process')
      
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
      
      // 🚀 İYİLEŞTİRME: Window.location yerine React state navigation
      setTimeout(async () => {
        try {
          console.log('ClientModeHandler - Refreshing professional data and navigating to dashboard')
          
          // Refresh professional data without page reload
          await refreshProfessional()
          
          // Use React state navigation instead of window.location
          if (onNavigateToDashboard) {
            onNavigateToDashboard()
          } else {
            // Fallback - only if navigation prop not provided
            console.log('ClientModeHandler - No navigation prop provided, using URL fallback')
            // Bu durumda bile window.location.reload() kullanmayalım
            // Sadece URL güncelle ama reload etme
            const url = new URL(window.location.href)
            url.searchParams.set('page', 'uzman-dashboard')
            window.history.pushState({}, '', url.toString())
            
            // Custom event ile ana component'e bildir
            window.dispatchEvent(new CustomEvent('navigateToPage', { 
              detail: { page: 'uzman-dashboard' }
            }))
          }
          
        } catch (error) {
          console.error('ClientModeHandler - Error during session refresh:', error)
          toast.error('Oturum yenileme sırasında hata oluştu. Lütfen manuel olarak dashboard\'a gidin.')
        }
      }, 300) // Reduced timeout for better UX
      
    } catch (error) {
      console.error('ClientModeHandler - Exit error:', error)
      toast.error('Çıkış sırasında hata oluştu. Lütfen tekrar deneyin.')
      setPassword('')
      setIsExiting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit()
    }
  }

  if (!isClientMode) return null

  return (
    <>
      {/* 🚀 İYİLEŞTİRME: Header sadece showHeader=true iken gösterilir */}
      {showHeader && (
        <>
          {/* Danışan modu göstergesi - Sadece ana sayfalarda */}
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center z-[9999] shadow-lg">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold">
                    🩺 Danışan Modu Aktif
                  </span>
                  {clientModeData && (
                    <div className="text-xs opacity-90">
                      Danışan: {clientModeData.clientIdentifier}
                    </div>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowExitDialog(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-colors"
              >
                Modu Sonlandır
              </Button>
            </div>
          </div>

          {/* Body padding için global style - sadece header gösterildiğinde */}
          <style>{`
            body { padding-top: 64px !important; }
          `}</style>
        </>
      )}

      {/* Şifre doğrulama dialogu - Her zaman mevcut */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Danışan Modundan Çıkış
            </DialogTitle>
            <DialogDescription>
              Danışan modundan çıkmak için hesap şifrenizi girin.
              {professional ? (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Uzman:</strong> {professional.display_name}<br/>
                  <strong>Email:</strong> {professional.email}
                </div>
              ) : clientModeData ? (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <strong>Uzman ID:</strong> {clientModeData.professionalId.substring(0, 8)}...<br/>
                  <strong>Danışan:</strong> {clientModeData.clientIdentifier}
                </div>
              ) : null}
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
                onKeyPress={handleKeyPress}
                placeholder="Hesap şifrenizi girin"
                disabled={isExiting}
                autoFocus
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowExitDialog(false)
                  setPassword('')
                }}
                disabled={isExiting}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={handlePasswordSubmit}
                disabled={isExiting || !password}
                className="flex-1"
              >
                {isExiting ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ClientModeHandler
