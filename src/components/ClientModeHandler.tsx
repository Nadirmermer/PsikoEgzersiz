
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

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

  const handlePasswordSubmit = () => {
    if (password === '1923') {
      // Client mode'dan çık
      localStorage.removeItem('clientMode')
      localStorage.removeItem('clientModeData')
      onExitClientMode()
      setShowExitDialog(false)
      setPassword('')
      toast.success('Danışan modundan çıkıldı')
      window.location.href = '/'
    } else {
      toast.error('Hatalı şifre!')
      setPassword('')
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
          >
            Modu Sonlandır
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
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handlePasswordSubmit}
                disabled={!password}
                className="flex-1"
              >
                Çıkış Yap
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowExitDialog(false)
                  setPassword('')
                }}
                className="flex-1"
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
