
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { LocalStorageManager } from '../utils/localStorage'
import { uploadLocalDataToSupabase } from '../lib/supabaseClient'
import { toast } from 'sonner'
import { Palette, User, Link, Shield, Settings, Moon, Sun, CheckCircle, AlertCircle, LogOut, UserPlus, Info, Zap, Unlink } from 'lucide-react'

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
    <div className="container mx-auto px-4 py-6 pb-28 max-w-6xl">
      {/* Enhanced Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-6">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Ayarlar
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Uygulamanızı kişiselleştirin ve hesabınızı yönetin
        </p>
      </div>

      <div className="space-y-8">
        {/* Theme Settings */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              Görünüm Ayarları
            </CardTitle>
            <CardDescription className="text-base">
              Uygulamanın görünümünü ve temasını kişiselleştirin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/30">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-background/60 rounded-lg">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dark-mode" className="text-base font-semibold cursor-pointer">
                    Karanlık Mod
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Karanlık tema aktif - gözlerinizi koruyor' : 'Aydınlık tema aktif - net görünüm'}
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="scale-125"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Connection - Only show for non-professionals */}
        {!user && (
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
                  <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                Ruh Sağlığı Uzmanı Bağlantısı
              </CardTitle>
              <CardDescription className="text-base">
                Egzersiz verilerinizi ruh sağlığı uzmanınızla güvenli bir şekilde paylaşın
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionData ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-success/10 to-emerald-500/5 border border-success/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-success dark:text-success text-lg mb-3">
                          Uzman Bağlantısı Aktif
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg border border-border/30">
                            <span className="font-semibold text-sm">Uzman ID:</span>
                            <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {connectionData.professionalId.substring(0, 8)}...
                            </code>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-background/60 rounded-lg border border-border/30">
                            <span className="font-semibold text-sm">Tanımlayıcınız:</span>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              {connectionData.clientIdentifier}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-success/80 text-sm mt-4 p-3 bg-success/5 rounded-lg border border-success/10">
                          <Zap className="w-4 h-4 inline mr-2" />
                          Yeni egzersiz verileriniz otomatik olarak uzmanınıza gönderilecektir.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleDisconnectFromProfessional}
                    className="w-full font-semibold py-3"
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Bağlantıyı Kaldır
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/30">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Info className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Uzman Bağlantısı Nasıl Çalışır?</h4>
                        <ul className="text-sm text-muted-foreground space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>Ruh sağlığı uzmanınızdan ID'sini alın</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>Kendinizi tanımlayacak bir ad belirleyin</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>Mevcut ve gelecekteki verileriniz otomatik paylaşılır</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <Dialog open={connectionDialogOpen} onOpenChange={setConnectionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full font-semibold py-3">
                        <Link className="w-4 h-4 mr-2" />
                        Uzman Bağlantısı Kur
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Link className="w-5 h-5 text-primary" />
                          Ruh Sağlığı Uzmanına Bağlan
                        </DialogTitle>
                        <DialogDescription>
                          Uzmanınızın size verdiği bilgileri dikkatli bir şekilde girin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="professionalId" className="font-semibold">Uzman ID</Label>
                          <Input
                            id="professionalId"
                            value={professionalId}
                            onChange={(e) => setProfessionalId(e.target.value)}
                            placeholder="Uzman ID'sini buraya yapıştırın"
                            autoComplete="off"
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientIdentifier" className="font-semibold">Tanımlayıcı Adınız</Label>
                          <Input
                            id="clientIdentifier"
                            value={clientIdentifier}
                            onChange={(e) => setClientIdentifier(e.target.value)}
                            placeholder="Adınızı veya takma adınızı girin"
                            autoComplete="name"
                          />
                          <p className="text-xs text-muted-foreground">
                            Bu ad uzmanınızın sizi tanımlaması için kullanılacaktır
                          </p>
                        </div>
                        <Button 
                          onClick={handleConnectToProfessional}
                          disabled={!professionalId.trim() || !clientIdentifier.trim() || uploading}
                          className="w-full font-semibold py-3"
                        >
                          {uploading ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              Bağlanıyor...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Bağlan ve Verileri Yükle
                            </>
                          )}
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
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              Uzman Hesabı
            </CardTitle>
            <CardDescription className="text-base">
              Ruh sağlığı uzmanları için özel hesap yönetimi ve dashboard erişimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
                <div className="text-muted-foreground">Hesap bilgileri yükleniyor...</div>
              </div>
            ) : user && professional ? (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-success/10 to-emerald-500/5 border border-success/20 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-success/10 rounded-xl">
                      <User className="w-8 h-8 text-success" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-success text-xl mb-2">
                        Hoş geldiniz, {professional.display_name}!
                      </h4>
                      <p className="text-success/80 mb-4">
                        Uzman hesabınızla başarıyla giriş yaptınız. Dashboard'a erişiminiz bulunmaktadır.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-background/60 rounded-lg border border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">Email Adresi</span>
                          </div>
                          <p className="text-sm font-mono">{professional.email}</p>
                        </div>
                        <div className="p-4 bg-background/60 rounded-lg border border-border/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">Uzman ID</span>
                          </div>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {professional.id.substring(0, 12)}...
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full font-semibold py-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Hesaptan Çıkış Yap
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as 'login' | 'register')}>
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 h-12">
                    <TabsTrigger value="login" className="font-semibold">
                      <User className="w-4 h-4 mr-2" />
                      Giriş Yap
                    </TabsTrigger>
                    <TabsTrigger value="register" className="font-semibold">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kayıt Ol
                    </TabsTrigger>
                  </TabsList>
                  
                  <form onSubmit={handleAuth} className="mt-6">
                    <TabsContent value="login" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email Adresi</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="uzman@email.com"
                          autoComplete="email"
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-semibold">Şifre</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          required
                          className="h-12"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full font-semibold py-3 h-12"
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Giriş yapılıyor...
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Hesaba Giriş Yap
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="font-semibold">Ad Soyad</Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Dr. Ahmet Yılmaz"
                          autoComplete="name"
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold">Email Adresi</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="uzman@email.com"
                          autoComplete="email"
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-semibold">Şifre</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                          minLength={6}
                          className="h-12"
                        />
                        <p className="text-xs text-muted-foreground">En az 6 karakter olmalıdır</p>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full font-semibold py-3 h-12"
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Hesap oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Uzman Hesabı Oluştur
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </form>
                </Tabs>

                <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Uzman Hesabı Hakkında</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Uzman hesabı ile danışanlarınızın egzersiz verilerini takip edebilir, 
                        detaylı performans analizleri yapabilir ve özel dashboard'a erişebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg">
                <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              Uygulama Bilgileri
            </CardTitle>
            <CardDescription className="text-base">
              Uygulamanın teknik detayları ve özellikler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="font-semibold">Versiyon</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="font-semibold">Platform</span>
                  <Badge variant="outline">Web Uygulaması</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                  <span className="font-semibold">Dil</span>
                  <Badge variant="outline">Türkçe</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-center p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/30">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Veri Güvenliği</h4>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Verileriniz güvenli bir şekilde saklanır ve sadece sizin kontrolünüzdedir.
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Bu uygulama bilişsel egzersizler yapmanıza ve performansınızı takip etmenize yardımcı olur. 
                Tüm verileriniz yerel olarak saklanır ve uzman bağlantısı kurduğunuzda güvenli bir şekilde paylaşılır.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AyarlarSayfasi
