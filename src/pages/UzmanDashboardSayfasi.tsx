
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { Users, Settings, Play, Key } from 'lucide-react'

const UzmanDashboardSayfasi: React.FC = () => {
  const { professional } = useAuth()
  const [clientName, setClientName] = useState('')
  const [isStartingClientMode, setIsStartingClientMode] = useState(false)

  const handleStartClientMode = () => {
    if (!clientName.trim()) {
      toast.error('Lütfen danışan adını girin')
      return
    }

    // Client mode'u başlat
    localStorage.setItem('clientMode', 'true')
    localStorage.setItem('clientModeData', JSON.stringify({
      professionalId: professional?.id,
      clientIdentifier: clientName.trim(),
      startTime: new Date().toISOString()
    }))

    toast.success(`Danışan modu başlatıldı: ${clientName}`)
    
    // Egzersizler sayfasına yönlendir
    window.location.href = '/egzersizler'
  }

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erişim Reddedildi</h1>
          <p className="text-muted-foreground">
            Bu sayfaya erişmek için uzman hesabınızla giriş yapmanız gerekmektedir.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Uzman Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Hoş geldiniz, {professional.display_name}
        </p>
      </div>

      <div className="space-y-6">
        {/* Uzman Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Uzman Bilgileriniz
            </CardTitle>
            <CardDescription>
              Hesap bilgileriniz ve danışanların bağlantı kurması için gerekli ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Uzman Adı</Label>
                <p className="text-lg">{professional.display_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{professional.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Uzman ID (Danışanlar İçin)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {professional.id}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(professional.id)
                      toast.success('ID kopyalandı!')
                    }}
                  >
                    Kopyala
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Danışanlarınız bu ID'yi kullanarak verilerini size gönderebilir
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danışan Modu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Danışan Modu
            </CardTitle>
            <CardDescription>
              Danışanınızın egzersizleri çözmesi için kısıtlı mod başlatın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bu modda danışanınız sadece egzersizlere erişebilir ve tüm veriler 
                otomatik olarak hesabınıza kaydedilir.
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    Danışan Modunu Başlat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Danışan Modu</DialogTitle>
                    <DialogDescription>
                      Danışanınızın adını girin ve modu başlatın
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Danışan Adı</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Danışan adını girin"
                      />
                    </div>
                    <Button 
                      onClick={handleStartClientMode}
                      disabled={!clientName.trim() || isStartingClientMode}
                      className="w-full"
                    >
                      {isStartingClientMode ? 'Başlatılıyor...' : 'Modu Başlat'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Danışan İstatistikleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Danışanlarımın İstatistikleri
            </CardTitle>
            <CardDescription>
              Danışanlarınızın egzersiz performansları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Henüz danışan verisi bulunmamaktadır.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Danışanlarınız verilerini paylaştıkça burada görüntülenecektir.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danışan Modu Çıkış Bilgisi */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Key className="h-5 w-5" />
              Danışan Modundan Çıkış
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300 text-sm">
              Danışan modu başladıktan sonra, normal uzman arayüzüne dönmek için 
              <strong> "1923" </strong> şifresini kullanmanız gerekecektir. 
              Bu şifreyi unutmayın.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UzmanDashboardSayfasi
