import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Moon, Sun, User, LogOut, Shield, Eye, Palette, Settings, Link, Unlink, Upload, Users, CheckCircle, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { uploadLocalDataToSupabase, saveToSupabase } from '../lib/supabaseClient'
import { useAudio } from '../hooks/useAudio'
import { Slider } from '@/components/ui/slider'

const AyarlarSayfasi: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, professional, signOut, signIn, signUp, isSupabaseConfigured } = useAuth()
  const { playSound, getAudioSettings, setVolume, toggleSoundCategory, toggleAllSounds } = useAudio()
  
  // Disleksi okuma modu için state
  const [isDyslexicMode, setIsDyslexicMode] = useState(() => {
    return localStorage.getItem('dyslexic-mode') === 'true'
  })

  // Font boyutu için state
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('font-size') || 'normal'
  })

  // Ses ayarları için state
  const [audioSettings, setAudioSettings] = useState(() => getAudioSettings())

  // Uzman giriş form states
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Uzmana bağlan form states
  const [professionalId, setProfessionalId] = useState('')
  const [clientIdentifier, setClientIdentifier] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionData, setConnectionData] = useState<{ professionalId: string; clientIdentifier: string } | null>(null)

  // Component mount olduğunda bağlantı durumunu kontrol et
  useEffect(() => {
    const existingConnection = LocalStorageManager.getConnectionData()
    setConnectionData(existingConnection)
  }, [])

  const handleDyslexicModeToggle = (enabled: boolean) => {
    setIsDyslexicMode(enabled)
    localStorage.setItem('dyslexic-mode', enabled.toString())
    
    if (enabled) {
      document.documentElement.classList.add('dyslexic-mode')
      toast.success('Disleksi okuma modu etkinleştirildi')
    } else {
      document.documentElement.classList.remove('dyslexic-mode')
      toast.success('Disleksi okuma modu kapatıldı')
    }
  }

  const handleFontSizeChange = (size: string) => {
    setFontSize(size)
    localStorage.setItem('font-size', size)
    
    // Mevcut font size class'larını temizle
    document.documentElement.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large')
    
    // Yeni font size class'ını ekle
    if (size !== 'normal') {
      document.documentElement.classList.add(`font-${size}`)
    }
    
    const sizeLabels = {
      'small': 'Küçük',
      'normal': 'Normal',
      'large': 'Büyük',
      'extra-large': 'Çok Büyük'
    }
    
    toast.success(`Font boyutu: ${sizeLabels[size as keyof typeof sizeLabels]}`)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setAudioSettings(prev => ({ ...prev, volume: newVolume }))
    
    // Test sesi çal
    playSound('button-click', { volume: newVolume })
  }

  const handleToggleAllSounds = () => {
    toggleAllSounds()
    const newSettings = getAudioSettings()
    setAudioSettings(newSettings)
    
    if (newSettings.enabled) {
      playSound('notification')
      toast.success('Sesler etkinleştirildi')
    } else {
      toast.success('Sesler kapatıldı')
    }
  }

  const handleToggleSoundCategory = (category: keyof Omit<typeof audioSettings, 'enabled' | 'volume'>) => {
    toggleSoundCategory(category)
    const newSettings = getAudioSettings()
    setAudioSettings(newSettings)
    
    const categoryLabels = {
      uiSounds: 'Arayüz Sesleri',
      exerciseSounds: 'Egzersiz Sesleri',
      feedbackSounds: 'Geri Bildirim Sesleri',
      ambientSounds: 'Ortam Sesleri'
    }
    
    const status = newSettings[category] ? 'etkinleştirildi' : 'kapatıldı'
    toast.success(`${categoryLabels[category]} ${status}`)
    
    // Test sesi çal (kategori açıksa)
    if (newSettings[category]) {
      if (category === 'uiSounds') playSound('button-click')
      else if (category === 'exerciseSounds') playSound('exercise-start')
      else if (category === 'feedbackSounds') playSound('correct-answer')
    }
  }

  const handleUzmanAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Lütfen email ve şifre girin')
      return
    }

    if (!isLoginMode && !displayName) {
      toast.error('Lütfen görünen ad girin')
      return
    }

    setIsLoading(true)

    try {
      if (isLoginMode) {
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
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setEmail('')
      setPassword('')
      setDisplayName('')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleConnectToProfessional = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!professionalId.trim() || !clientIdentifier.trim()) {
      toast.error('Lütfen uzman ID ve tanımlayıcı adınızı girin')
      return
    }

    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(professionalId.trim())) {
      toast.error('Uzman ID formatı geçersiz. UUID formatında olmalıdır (örn: 12345678-1234-1234-1234-123456789abc)')
      return
    }

    setIsConnecting(true)

    try {
      console.log('Connecting to professional:', { professionalId, clientIdentifier })
      
      // Geçmiş verileri al
      const localResults = LocalStorageManager.getExerciseResults()
      console.log('Local results found:', localResults.length)

      if (localResults.length > 0) {
        toast.info('Geçmiş verileriniz uzmanınıza yükleniyor...')
        
        // Verileri Supabase'e yükle
        const uploadResult = await uploadLocalDataToSupabase(
          professionalId.trim(),
          clientIdentifier.trim(),
          localResults
        )

        console.log('Upload result:', uploadResult)

        if (uploadResult.success) {
          toast.success(`${uploadResult.uploaded} geçmiş egzersiz verisi başarıyla yüklendi!`)
          
          // Yüklenen verileri işaretle
          const uploadedIds = localResults.map((_, index) => index.toString())
          LocalStorageManager.markResultsAsUploaded(uploadedIds)
        } else if (uploadResult.uploaded > 0) {
          toast.success(`${uploadResult.uploaded} veri yüklendi, ${uploadResult.failed} veri yüklenemedi`)
        } else {
          toast.error('Geçmiş veriler yüklenemedi. Lütfen Uzman ID\'nin doğru olduğundan emin olun.')
          setIsConnecting(false)
          return
        }
      }

      // Test veri gönderimi yaparak uzman ID'nin geçerli olduğunu kontrol edelim
      const testData = {
        professional_id: professionalId.trim(),
        client_identifier: clientIdentifier.trim(),
        exercise_data: {
          test: true,
          exercise_name: 'connection_test',
          timestamp: new Date().toISOString()
        },
        is_client_mode_session: false
      }

      const testSuccess = await saveToSupabase(testData)
      if (!testSuccess) {
        toast.error('Uzman ID bulunamadı veya geçersiz. Lütfen uzmanınızdan doğru ID\'yi alın.')
        setIsConnecting(false)
        return
      }

      // Bağlantı bilgilerini kaydet
      LocalStorageManager.setConnectionData(professionalId.trim(), clientIdentifier.trim())
      setConnectionData({
        professionalId: professionalId.trim(),
        clientIdentifier: clientIdentifier.trim()
      })

      toast.success('Uzmanınıza başarıyla bağlandınız!')
      
      // Form temizle
      setProfessionalId('')
      setClientIdentifier('')

    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Bağlantı kurulurken bir hata oluştu')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectFromProfessional = () => {
    LocalStorageManager.clearConnectionData()
    setConnectionData(null)
    toast.success('Uzman bağlantısı kesildi')
  }

  React.useEffect(() => {
    // Sayfa yüklendiğinde disleksi modunu kontrol et
    const isDyslexicEnabled = localStorage.getItem('dyslexic-mode') === 'true'
    if (isDyslexicEnabled) {
      document.documentElement.classList.add('dyslexic-mode')
    }

    // Sayfa yüklendiğinde font boyutunu kontrol et
    const savedFontSize = localStorage.getItem('font-size') || 'normal'
    if (savedFontSize !== 'normal') {
      document.documentElement.classList.add(`font-${savedFontSize}`)
    }

    // Ses ayarlarını güncelle
    setAudioSettings(getAudioSettings())
  }, [getAudioSettings])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="relative px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20 flex items-center justify-center">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight px-4">
                Ayarlar
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-6 leading-relaxed">
                Uygulamanızı kişiselleştirin ve <span className="font-medium text-primary">hesap ayarlarınızı yönetin</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tema Ayarları */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Görünüm
            </CardTitle>
            <CardDescription>
              Uygulamanın görünümünü kişiselleştirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Tema Seçimi</Label>
              <RadioGroup 
                value={theme} 
                onValueChange={toggleTheme}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="light" id="light" />
                  <Sun className="w-4 h-4 text-yellow-500" />
                  <Label htmlFor="light" className="flex-1 cursor-pointer">
                    Açık Tema
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="dark" id="dark" />
                  <Moon className="w-4 h-4 text-blue-500" />
                  <Label htmlFor="dark" className="flex-1 cursor-pointer">
                    Koyu Tema
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Erişilebilirlik Ayarları */}
            <div className="space-y-4">
              <Label className="text-base font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Erişilebilirlik
              </Label>
              
              {/* Disleksi Okuma Modu */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <Label htmlFor="dyslexic-mode" className="text-sm font-medium">
                    Disleksi Okuma Modu
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Disleksi dostu fontlar, geniş satır aralıkları ve yüksek kontrast
                  </p>
                </div>
                <Switch
                  id="dyslexic-mode"
                  checked={isDyslexicMode}
                  onCheckedChange={handleDyslexicModeToggle}
                />
              </div>

              {/* Font Boyutu Ayarı */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Font Boyutu</Label>
                <RadioGroup 
                  value={fontSize} 
                  onValueChange={handleFontSizeChange}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="small" id="font-small" />
                    <Label htmlFor="font-small" className="flex-1 cursor-pointer text-xs">
                      Küçük
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="normal" id="font-normal" />
                    <Label htmlFor="font-normal" className="flex-1 cursor-pointer text-sm">
                      Normal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="large" id="font-large" />
                    <Label htmlFor="font-large" className="flex-1 cursor-pointer text-base">
                      Büyük
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="extra-large" id="font-extra-large" />
                    <Label htmlFor="font-extra-large" className="flex-1 cursor-pointer text-lg">
                      Çok Büyük
                    </Label>
                  </div>
                </RadioGroup>
                                 <p className="text-xs text-muted-foreground">
                   Tüm uygulama için font boyutunu ayarlayın
                 </p>
               </div>

               {/* Ses Ayarları */}
               <div className="space-y-4">
                 <Label className="text-sm font-medium flex items-center gap-2">
                   {audioSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                   Ses Ayarları
                 </Label>
                 
                 {/* Ana Ses Kontrolü */}
                 <div className="flex items-center justify-between p-3 rounded-lg border">
                   <div className="space-y-1">
                     <Label className="text-sm font-medium">
                       Sesler
                     </Label>
                     <p className="text-xs text-muted-foreground">
                       Tüm ses efektlerini aç/kapat
                     </p>
                   </div>
                   <Switch
                     checked={audioSettings.enabled}
                     onCheckedChange={handleToggleAllSounds}
                   />
                 </div>

                 {/* Ses Seviyesi */}
                 {audioSettings.enabled && (
                   <div className="space-y-3">
                     <Label className="text-sm font-medium">Ses Seviyesi</Label>
                     <div className="px-3">
                       <Slider
                         value={[audioSettings.volume]}
                         onValueChange={handleVolumeChange}
                         max={1}
                         min={0}
                         step={0.1}
                         className="w-full"
                       />
                       <div className="flex justify-between text-xs text-muted-foreground mt-1">
                         <span>Sessiz</span>
                         <span>{Math.round(audioSettings.volume * 100)}%</span>
                         <span>Yüksek</span>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Ses Kategorileri */}
                 {audioSettings.enabled && (
                   <div className="space-y-3">
                     <Label className="text-sm font-medium">Ses Kategorileri</Label>
                     
                     <div className="grid grid-cols-1 gap-2">
                       <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-xs font-medium">Arayüz Sesleri</Label>
                           <p className="text-xs text-muted-foreground">Buton tıklama, hover efektleri</p>
                         </div>
                         <Switch
                           checked={audioSettings.uiSounds}
                           onCheckedChange={() => handleToggleSoundCategory('uiSounds')}
                           size="sm"
                         />
                       </div>

                       <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-xs font-medium">Egzersiz Sesleri</Label>
                           <p className="text-xs text-muted-foreground">Başlangıç, tamamlama, seviye atlama</p>
                         </div>
                         <Switch
                           checked={audioSettings.exerciseSounds}
                           onCheckedChange={() => handleToggleSoundCategory('exerciseSounds')}
                           size="sm"
                         />
                       </div>

                       <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-xs font-medium">Geri Bildirim Sesleri</Label>
                           <p className="text-xs text-muted-foreground">Doğru/yanlış cevap, başarı sesleri</p>
                         </div>
                         <Switch
                           checked={audioSettings.feedbackSounds}
                           onCheckedChange={() => handleToggleSoundCategory('feedbackSounds')}
                           size="sm"
                         />
                       </div>

                       <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                         <div className="space-y-1">
                           <Label className="text-xs font-medium">Ortam Sesleri</Label>
                           <p className="text-xs text-muted-foreground">Odaklanma müziği, arka plan sesleri</p>
                         </div>
                         <Switch
                           checked={audioSettings.ambientSounds}
                           onCheckedChange={() => handleToggleSoundCategory('ambientSounds')}
                           size="sm"
                         />
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </CardContent>
        </Card>

        {/* Uzman Hesabı */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Ruh Sağlığı Uzmanı
            </CardTitle>
            <CardDescription>
              {user ? 'Uzman hesabınızı yönetin' : 'Uzman hesabınızla giriş yapın'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSupabaseConfigured ? (
              <div className="text-center py-6">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Uzman özellikleri için Supabase bağlantısı gereklidir
                </p>
                <p className="text-xs text-muted-foreground">
                  Lütfen Supabase yapılandırmanızı kontrol edin
                </p>
              </div>
            ) : user && professional ? (
              // Uzman giriş yapmış durumda
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Giriş Yapılmış
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Ad:</strong> {professional.display_name}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>E-posta:</strong> {professional.email}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-mono bg-green-100 dark:bg-green-900/40 p-2 rounded">
                    <strong>Uzman ID:</strong> {professional.id}
                  </p>
                </div>
                
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </div>
            ) : (
              // Uzman giriş formu
              <form onSubmit={handleUzmanAuth} className="space-y-4">
                <div className="flex rounded-lg border p-1 bg-muted">
                  <Button
                    type="button"
                    variant={isLoginMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsLoginMode(true)}
                    className="flex-1"
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    type="button"
                    variant={!isLoginMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsLoginMode(false)}
                    className="flex-1"
                  >
                    Kayıt Ol
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="uzman@ornek.com"
                      disabled={isLoading}
                    />
                  </div>

                  {!isLoginMode && (
                    <div>
                      <Label htmlFor="displayName">Görünen Ad</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Dr. Ad Soyad"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'İşleniyor...' : (isLoginMode ? 'Giriş Yap' : 'Kayıt Ol')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Uzmana Bağlan Kartı - Sadece anonim kullanıcılar için */}
      {!user && isSupabaseConfigured && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Ruh Sağlığı Uzmanıyla Verilerinizi Paylaşın
            </CardTitle>
            <CardDescription>
              Çalıştığınız uzmanla egzersiz sonuçlarınızı otomatik olarak paylaşın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connectionData ? (
              // Bağlantı kurulmuş durumda
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Uzmanınıza Bağlısınız
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      <strong>Uzman ID:</strong> <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded font-mono text-xs">
                        {connectionData.professionalId.substring(0, 8)}...
                      </code>
                    </p>
                    <p>
                      <strong>Tanımlayıcı Adınız:</strong> {connectionData.clientIdentifier}
                    </p>
                  </div>
                  <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/40 rounded text-xs text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3 h-3" />
                      <span className="font-medium">Otomatik Paylaşım Aktif</span>
                    </div>
                    <p>Tamamladığınız tüm egzersizler otomatik olarak uzmanınızla paylaşılacaktır.</p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDisconnectFromProfessional}
                  variant="outline"
                  className="w-full"
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Bağlantıyı Kes
                </Button>
              </div>
            ) : (
              // Bağlantı kurma formu
              <form onSubmit={handleConnectToProfessional} className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Nasıl Bağlanabilirsiniz?
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                    <p><strong>1. Uzman ID Alma:</strong> Ruh sağlığı uzmanınız bu uygulamaya kayıt olmalı</p>
                    <p><strong>2. ID Formatı:</strong> UUID formatında (12345678-1234-1234-1234-123456789abc)</p>
                    <p><strong>3. ID Alma:</strong> Uzmanınızın Ayarlar &gt; Ruh Sağlığı Uzmanı bölümünden ID'yi alın</p>
                    <p><strong>4. Tanımlayıcı:</strong> Uzmanınızın sizi tanıyacağı isim/kod girin</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="professionalId">Uzman ID</Label>
                    <Input
                      id="professionalId"
                      type="text"
                      value={professionalId}
                      onChange={(e) => setProfessionalId(e.target.value)}
                      placeholder="Uzmanınızdan aldığınız ID"
                      disabled={isConnecting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Bu ID'yi uzmanınızdan temin edin
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="clientIdentifier">Tanımlayıcı Adınız</Label>
                    <Input
                      id="clientIdentifier"
                      type="text"
                      value={clientIdentifier}
                      onChange={(e) => setClientIdentifier(e.target.value)}
                      placeholder="Örn: Ahmet K., Danışan-01, vs."
                      disabled={isConnecting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Uzmanınızın sizi tanıyacağı isim/kod
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isConnecting || !professionalId.trim() || !clientIdentifier.trim()}
                >
                  {isConnecting ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Bağlanıyor ve Veriler Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Bağlan ve Verileri Yükle
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bilgi Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Palette className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Kişiselleştirme</h3>
            <p className="text-sm text-muted-foreground">
              Temalar ve erişilebilirlik seçenekleri
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Uzman Erişimi</h3>
            <p className="text-sm text-muted-foreground">
              Gelişmiş analiz ve danışan yönetimi
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Yapımcı</h3>
            <p className="text-sm text-muted-foreground">
              Nadir Mermer Tarafından yapılmıştır.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Veri Paylaşımı</h3>
            <p className="text-sm text-muted-foreground">
              Uzmanınızla güvenli veri paylaşımı
            </p>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  )
}

export default AyarlarSayfasi
