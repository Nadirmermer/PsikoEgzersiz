import React, { useState } from 'react'
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
import { Moon, Sun, User, LogOut, Shield, Eye, Palette, Settings } from 'lucide-react'

const AyarlarSayfasi: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, professional, signOut, signIn, signUp, isSupabaseConfigured } = useAuth()
  
  // Disleksi okuma modu için state
  const [isDyslexicMode, setIsDyslexicMode] = useState(() => {
    return localStorage.getItem('dyslexic-mode') === 'true'
  })

  // Uzman giriş form states
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  React.useEffect(() => {
    // Sayfa yüklendiğinde disleksi modunu kontrol et
    if (isDyslexicMode) {
      document.documentElement.classList.add('dyslexic-mode')
    }
  }, [])

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

            {/* Disleksi Okuma Modu */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Erişilebilirlik
              </Label>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <Label htmlFor="dyslexic-mode" className="text-sm font-medium">
                    Disleksi Okuma Modu
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Okumayı kolaylaştıran font ve boşluklar
                  </p>
                </div>
                <Switch
                  id="dyslexic-mode"
                  checked={isDyslexicMode}
                  onCheckedChange={handleDyslexicModeToggle}
                />
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
            <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Erişilebilirlik</h3>
            <p className="text-sm text-muted-foreground">
              Herkes için kolay kullanım
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
