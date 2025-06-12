
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
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
