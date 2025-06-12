
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { LocalStorageManager } from '../utils/localStorage'
import { uploadLocalDataToSupabase } from '../lib/supabaseClient'
import { toast } from 'sonner'

const AyarlarSayfasi: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, professional, signUp, signIn, signOut, loading } = useAuth()
  
  // Auth form states
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Professional connection states
  const [professionalId, setProfessionalId] = useState('')
  const [clientIdentifier, setClientIdentifier] = useState('')
  const [uploading, setUploading] = useState(false)
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)

  // Check if already connected
  const connectionData = LocalStorageManager.getConnectionData()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)

    try {
      if (authTab === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName)
      }
      // Clear form
      setEmail('')
      setPassword('')
      setDisplayName('')
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleConnectToProfessional = async () => {
    if (!professionalId.trim() || !clientIdentifier.trim()) {
      toast.error('Lütfen tüm alanları doldurun')
      return
    }

    setUploading(true)

    try {
      // Get unuploaded local data
      const localData = LocalStorageManager.getUnuploadedResults()
      
      if (localData.length === 0) {
        // Just save connection without uploading
        LocalStorageManager.setConnectionData(professionalId.trim(), clientIdentifier.trim())
        toast.success('Uzman bağlantısı kaydedildi!')
        setConnectionDialogOpen(false)
        setProfessionalId('')
        setClientIdentifier('')
        return
      }

      // Upload existing data
      const result = await uploadLocalDataToSupabase(
        professionalId.trim(),
        clientIdentifier.trim(),
        localData
      )

      if (result.success) {
        // Save connection data
        LocalStorageManager.setConnectionData(professionalId.trim(), clientIdentifier.trim())
        
        // Mark results as uploaded
        const resultIds = localData.map((_, index) => index.toString())
        LocalStorageManager.markResultsAsUploaded(resultIds)
        
        toast.success(`Bağlantı kuruldu ve ${result.uploaded} veri başarıyla yüklendi!`)
        setConnectionDialogOpen(false)
        setProfessionalId('')
        setClientIdentifier('')
      } else {
        toast.error(`Yükleme sırasında hata: ${result.failed} veri yüklenemedi`)
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Bağlantı kurulurken hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleDisconnectFromProfessional = () => {
    LocalStorageManager.clearConnectionData()
    toast.success('Uzman bağlantısı kaldırıldı')
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Ayarlar
        </h1>
        <p className="text-muted-foreground text-lg">
          Uygulamanızı kişiselleştirin ve hesabınızı yönetin
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎨 Görünüm Ayarları
            </CardTitle>
            <CardDescription>
              Uygulamanın görünümünü kişiselleştirin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode">Karanlık Mod</Label>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Karanlık tema aktif' : 'Aydınlık tema aktif'}
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Connection - Only show for non-professionals */}
        {!user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 Ruh Sağlığı Uzmanı Bağlantısı
              </CardTitle>
              <CardDescription>
                Verilerinizi ruh sağlığı uzmanınızla paylaşın
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionData ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Uzman Bağlantısı Aktif
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Uzman ID: </span>
                        <span className="font-mono">{connectionData.professionalId}</span>
                      </div>
                      <div>
                        <span className="font-medium">Tanımlayıcınız: </span>
                        <span>{connectionData.clientIdentifier}</span>
                      </div>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-sm mt-2">
                      Yeni egzersiz verileriniz otomatik olarak uzmanınıza gönderilecektir.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleDisconnectFromProfessional}
                    className="w-full"
                  >
                    Bağlantıyı Kaldır
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ruh sağlığı uzmanınızın ID'sini kullanarak bağlantı kurun. 
                    Mevcut ve gelecekteki egzersiz verileriniz uzmanınızla paylaşılacaktır.
                  </p>
                  
                  <Dialog open={connectionDialogOpen} onOpenChange={setConnectionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Uzman Bağlantısı Kur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ruh Sağlığı Uzmanına Bağlan</DialogTitle>
                        <DialogDescription>
                          Uzmanınızın size verdiği bilgileri girin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="professionalId">Uzman ID</Label>
                          <Input
                            id="professionalId"
                            value={professionalId}
                            onChange={(e) => setProfessionalId(e.target.value)}
                            placeholder="Uzman ID'sini girin"
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientIdentifier">Tanımlayıcı Adınız</Label>
                          <Input
                            id="clientIdentifier"
                            value={clientIdentifier}
                            onChange={(e) => setClientIdentifier(e.target.value)}
                            placeholder="Adınızı veya takma adınızı girin"
                            autoComplete="name"
                          />
                        </div>
                        <Button 
                          onClick={handleConnectToProfessional}
                          disabled={!professionalId.trim() || !clientIdentifier.trim() || uploading}
                          className="w-full"
                        >
                          {uploading ? 'Bağlanıyor...' : 'Bağlan ve Verileri Yükle'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Professional Auth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👨‍⚕️ Uzman Hesabı
            </CardTitle>
            <CardDescription>
              Ruh sağlığı uzmanları için özel hesap yönetimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="text-muted-foreground">Yükleniyor...</div>
              </div>
            ) : user && professional ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Hoş geldiniz, {professional.display_name}!
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Uzman hesabınızla başarıyla giriş yaptınız.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Email: </span>
                      <span className="text-sm">{professional.email}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Uzman ID: </span>
                      <span className="text-sm font-mono">{professional.id}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full"
                >
                  Çıkış Yap
                </Button>
              </div>
            ) : (
              <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                  <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleAuth} className="mt-4">
                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="uzman@email.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={authLoading}
                    >
                      {authLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Ad Soyad</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Dr. Ahmet Yılmaz"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="uzman@email.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifre</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        minLength={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={authLoading}
                    >
                      {authLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
                    </Button>
                  </TabsContent>
                </form>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📱 Uygulama Bilgileri
            </CardTitle>
            <CardDescription>
              Uygulama hakkında bilgiler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Versiyon</span>
                <span className="text-muted-foreground">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Platform</span>
                <span className="text-muted-foreground">Web App</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Dil</span>
                <span className="text-muted-foreground">Türkçe</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Bu uygulama bilişsel egzersizler yapmanıza ve performansınızı takip etmenize yardımcı olur. 
                  Verileriniz güvenli bir şekilde saklanır.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AyarlarSayfasi
