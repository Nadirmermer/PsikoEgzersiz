import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  User, 
  LogOut, 
  Eye,
  Accessibility,
  Palette
} from 'lucide-react'

const AyarlarSayfasi = () => {
  const { theme, setTheme } = useTheme()
  const { user, professional, logout } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // Disleksi okuma modu state'i
  const [dyslexiaMode, setDyslexiaMode] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.user_metadata.full_name || '')
      setEmail(user.email || '')
    }
  }, [user])

  useEffect(() => {
    const savedDyslexiaMode = localStorage.getItem('dyslexia-mode') === 'true'
    setDyslexiaMode(savedDyslexiaMode)
    applyDyslexiaMode(savedDyslexiaMode)
  }, [])

  const handleDyslexiaModeChange = (enabled: boolean) => {
    setDyslexiaMode(enabled)
    localStorage.setItem('dyslexia-mode', enabled.toString())
    applyDyslexiaMode(enabled)
    
    toast({
      title: enabled ? "Disleksi okuma modu açıldı" : "Disleksi okuma modu kapatıldı",
      description: enabled 
        ? "Metinler daha okunabilir hale getirildi." 
        : "Normal görünüm geri yüklendi."
    })
  }

  const applyDyslexiaMode = (enabled: boolean) => {
    const root = document.documentElement
    if (enabled) {
      root.style.setProperty('--dyslexia-font', '"Verdana", "Tahoma", "Arial", sans-serif')
      root.style.setProperty('--dyslexia-letter-spacing', '0.12em')
      root.style.setProperty('--dyslexia-word-spacing', '0.16em')
      root.style.setProperty('--dyslexia-line-height', '1.8')
      root.classList.add('dyslexia-mode')
    } else {
      root.style.removeProperty('--dyslexia-font')
      root.style.removeProperty('--dyslexia-letter-spacing')
      root.style.removeProperty('--dyslexia-word-spacing')
      root.style.removeProperty('--dyslexia-line-height')
      root.classList.remove('dyslexia-mode')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Çıkış yapılamadı",
        description: "Lütfen tekrar deneyin.",
      })
    }
  }

  return (
    <div className="container mx-auto section-padding pb-28 max-w-4xl">
      <div className="text-center mb-8 animate-fade-in">
        <div className="relative inline-flex items-center justify-center mb-5">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Settings className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          Hesap Ayarları
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Hesap bilgilerinizi yönetin, temayı değiştirin ve erişilebilirlik ayarlarını düzenleyin.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Tema Ayarları */}
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Tema Ayarları</CardTitle>
                <CardDescription>Uygulamanın görünümünü kişiselleştirin</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Görünüm</Label>
                <p className="text-xs text-muted-foreground">
                  Açık veya koyu tema seçin. Sistem ayarlarını takip etmesi için "Otomatik" seçeneğini kullanın.
                </p>
              </div>
              <div className="space-x-2 flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  className={theme === "light" ? "active" : ""}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Açık
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={theme === "dark" ? "active" : ""}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Koyu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={theme === "system" ? "active" : ""}
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Otomatik
                </Button>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Arka Plan Gürültüsü</Label>
                <p className="text-xs text-muted-foreground">
                  Daha az dikkat dağıtıcı bir deneyim için arka plan animasyonlarını kapatın.
                </p>
              </div>
              <Badge className="bg-muted-foreground/10 text-muted-foreground rounded-md px-2 py-1">
                Yakında
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Erişilebilirlik Ayarları - Yeni bölüm */}
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Accessibility className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Erişilebilirlik</CardTitle>
                <CardDescription>Okuma ve kullanım kolaylığı ayarları</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Disleksi Okuma Modu</Label>
                <p className="text-xs text-muted-foreground">
                  Metinleri daha okunabilir hale getirir. Harf aralıkları artırılır ve özel font kullanılır.
                </p>
              </div>
              <Switch
                checked={dyslexiaMode}
                onCheckedChange={handleDyslexiaModeChange}
                aria-label="Disleksi okuma modu"
              />
            </div>
            
            {dyslexiaMode && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">Disleksi modu aktif</span>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Tüm metinler daha okunabilir font ve aralıklarla gösterilmektedir.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Uzman Hesabı */}
        {professional && (
          <Card className="card-enhanced">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Uzman Hesabı</CardTitle>
                  <CardDescription>
                    Uzman paneline erişin ve hasta hesaplarını yönetin.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bu hesap, uzman ayrıcalıklarına sahiptir.
              </p>
              <Button variant="secondary" asChild>
                <a href="/?page=uzman-dashboard">Uzman Paneline Git</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hesap Bilgileri */}
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Hesap Bilgileri</CardTitle>
                <CardDescription>
                  Adınızı ve e-posta adresinizi güncelleyin.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Adınız</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresiniz</Label>
              <Input id="email" type="email" value={email} readOnly />
            </div>
            <Button disabled={isUpdating}>
              {isUpdating ? "Güncelleniyor..." : "Bilgileri Güncelle"}
            </Button>
          </CardContent>
        </Card>

        {/* Güvenlik */}
        <Card className="card-enhanced">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Güvenlik</CardTitle>
                <CardDescription>
                  Hesabınızdan çıkış yapın.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AyarlarSayfasi
