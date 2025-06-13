import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Users, Settings, Play, Copy, BarChart3, TrendingUp, Clock, Trophy, Target, Brain, CheckCircle, XCircle, Activity, Calendar, Star, Sparkles } from 'lucide-react'
import ClientList from '../components/dashboard/ClientList'
import ClientDetail from '../components/dashboard/ClientDetail'
import { useAudio } from '../hooks/useAudio'

interface ClientInfo {
  client_identifier: string
  last_activity: string
  total_exercises: number
  is_client_mode: boolean
  client_mode_sessions: number
  anonymous_sessions: number
  average_score: number
  best_score: number
}

const UzmanDashboardSayfasi: React.FC = () => {
  const { playSound } = useAudio()
  const { professional, loading: authLoading } = useAuth()
  const [clientName, setClientName] = useState('')
  const [isStartingClientMode, setIsStartingClientMode] = useState(false)
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Debug: Auth state'i logla
  useEffect(() => {
    console.log('UzmanDashboard - Auth state:', { professional, authLoading })
  }, [professional, authLoading])

  useEffect(() => {
    const fetchClients = async () => {
      if (!supabase || !professional?.id) {
        console.log('UzmanDashboard - Skipping fetch:', { supabase: !!supabase, professionalId: professional?.id })
        setLoading(false)
        return
      }

      setLoading(true)
      console.log('UzmanDashboard - Fetching clients for professional:', professional.id)
      
      try {
        const { data, error } = await supabase
          .from('client_statistics')
          .select('client_identifier, session_date, is_client_mode_session, exercise_data')
          .eq('professional_id', professional.id)
          .order('session_date', { ascending: false })

        console.log('UzmanDashboard - Supabase query result:', { data, error })

        if (error) {
          console.error('Clients fetch error:', error)
          toast.error(`Danışan verileri yüklenirken hata: ${error.message}`)
          return
        }

        if (!data || data.length === 0) {
          console.log('UzmanDashboard - No client data found')
          setClients([])
          setLoading(false)
          return
        }

        // Group by client_identifier and aggregate detailed data
        const clientMap = new Map<string, {
          client_identifier: string
          last_activity: string
          total_exercises: number
          client_mode_sessions: number
          anonymous_sessions: number
          scores: number[]
        }>()
        
        data.forEach(record => {
          const clientId = record.client_identifier
          const existing = clientMap.get(clientId)
          const score = record.exercise_data?.score || record.exercise_data?.details?.score || 0
          
          console.log('UzmanDashboard - Processing record:', { 
            clientId, 
            score, 
            exercise_data: record.exercise_data,
            is_client_mode_session: record.is_client_mode_session 
          })
          
          if (!existing) {
            clientMap.set(clientId, {
              client_identifier: clientId,
              last_activity: record.session_date,
              total_exercises: 1,
              client_mode_sessions: record.is_client_mode_session ? 1 : 0,
              anonymous_sessions: record.is_client_mode_session ? 0 : 1,
              scores: [score]
            })
          } else {
            existing.total_exercises += 1
            if (new Date(record.session_date) > new Date(existing.last_activity)) {
              existing.last_activity = record.session_date
            }
            if (record.is_client_mode_session) {
              existing.client_mode_sessions += 1
            } else {
              existing.anonymous_sessions += 1
            }
            existing.scores.push(score)
          }
        })

        const clientsList: ClientInfo[] = Array.from(clientMap.values()).map(client => ({
          client_identifier: client.client_identifier,
          last_activity: client.last_activity,
          total_exercises: client.total_exercises,
          is_client_mode: client.client_mode_sessions > 0,
          client_mode_sessions: client.client_mode_sessions,
          anonymous_sessions: client.anonymous_sessions,
          average_score: client.scores.length > 0 ? Math.round(client.scores.reduce((a, b) => a + b, 0) / client.scores.length) : 0,
          best_score: client.scores.length > 0 ? Math.max(...client.scores) : 0
        })).sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())

        console.log('UzmanDashboard - Processed clients:', clientsList)
        setClients(clientsList)
        
        // Auto-select first client if exists and no client is currently selected
        if (clientsList.length > 0 && !selectedClient) {
          setSelectedClient(clientsList[0].client_identifier)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
        toast.error('Danışan verileri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if auth is not loading and we have professional
    if (!authLoading) {
      fetchClients()
    }
  }, [professional?.id, authLoading])

  const handleStartClientMode = () => {
    if (!clientName.trim()) {
      toast.error('Lütfen danışan adını girin')
      return
    }

    playSound('button-click')
    setIsStartingClientMode(true)

    // Client mode'u başlat
    localStorage.setItem('clientMode', 'true')
    localStorage.setItem('clientModeData', JSON.stringify({
      professionalId: professional?.id,
      clientIdentifier: clientName.trim(),
      startTime: new Date().toISOString()
    }))

    console.log('Starting client mode with data:', {
      professionalId: professional?.id,
      clientIdentifier: clientName.trim(),
      startTime: new Date().toISOString()
    })

    toast.success(`Danışan modu başlatıldı: ${clientName}`)
    
    // Dialog'u kapat ve form'u temizle
    setDialogOpen(false)
    setClientName('')
    setIsStartingClientMode(false)
    
    // Egzersizler sayfasına yönlendir
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId)
  }

  const handleCopyId = () => {
    playSound('button-click')
    if (professional?.id) {
      navigator.clipboard.writeText(professional.id)
      toast.success('Uzman ID kopyalandı!')
    }
  }

  // Calculate stats
  const totalSessions = clients.reduce((acc, client) => acc + client.total_exercises, 0)
  const totalClientModeSessions = clients.reduce((acc, client) => acc + client.client_mode_sessions, 0)
  const totalAnonymousSessions = clients.reduce((acc, client) => acc + client.anonymous_sessions, 0)
  const averageScore = clients.length > 0 ? Math.round(clients.reduce((acc, client) => acc + client.average_score, 0) / clients.length) : 0

  // Auth yükleniyor durumu
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <div className="px-4 pt-8 pb-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Settings className="w-8 h-8 text-primary/60" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Yükleniyor...</h1>
                <p className="text-muted-foreground">
                  Uzman bilgileri getiriliyor...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <div className="px-4 pt-8 pb-24 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Erişim Reddedildi</h1>
                <p className="text-muted-foreground mb-6">
                  Bu sayfaya erişmek için uzman hesabınızla giriş yapmanız gerekmektedir.
                </p>
                <Button onClick={() => {
                  playSound('button-click')
                  window.location.href = '/ayarlar'
                }} className="rounded-lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar Sayfasına Git
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="relative px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight px-4">
                Uzman Kontrol Paneli
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-6 leading-relaxed">
                Hoş geldiniz, <span className="font-medium text-primary">{professional.display_name}</span>. Danışanlarınızın ilerlemesini takip edin.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Stats Overview - Mobile First */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{clients.length}</p>
                    <p className="text-xs text-muted-foreground truncate">Toplam Danışan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSessions}</p>
                    <p className="text-xs text-muted-foreground truncate">Toplam Oturum</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{averageScore}</p>
                    <p className="text-xs text-muted-foreground truncate">Ortalama Skor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalClientModeSessions}</p>
                    <p className="text-xs text-muted-foreground truncate">Danışan Modu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sol Panel - Uzman Bilgileri ve Controls */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Uzman Bilgileri - Modernize */}
              <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    Uzman Profili
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uzman Adı</Label>
                      <p className="text-base font-semibold">{professional.display_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>
                      <p className="text-sm truncate">{professional.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Uzman ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted/50 px-2 py-1.5 rounded-lg text-xs font-mono flex-1 truncate border">
                          {professional.id}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyId}
                          className="px-3 rounded-lg"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danışan Modu - Modernize */}
              <Card className="bg-gradient-to-br from-primary/5 via-purple-50/50 to-pink-50/50 dark:from-primary/5 dark:via-purple-900/20 dark:to-pink-900/20 border border-primary/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    Danışan Modu
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Danışanınızla birlikte egzersiz yapın
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-lg h-11 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                        <Play className="w-4 h-4 mr-2" />
                        Danışan Modunu Başlat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Play className="w-5 h-5 text-primary" />
                          Danışan Modu
                        </DialogTitle>
                        <DialogDescription>
                          Danışanınızın adını girin ve birlikte egzersiz yapmaya başlayın
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="clientName" className="text-sm font-medium">Danışan Adı *</Label>
                          <Input
                            id="clientName"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Örn: Ahmet Yılmaz"
                            className="mt-1.5 rounded-lg"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && clientName.trim()) {
                                handleStartClientMode()
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Bu isim raporlarda görünecektir
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={handleStartClientMode}
                            disabled={!clientName.trim() || isStartingClientMode}
                            className="flex-1 rounded-lg"
                          >
                            {isStartingClientMode ? (
                              <>
                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                Başlatılıyor...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Modu Başlat
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                                                onClick={() => {
                      playSound('button-click')
                      setDialogOpen(false)
                      setClientName('')
                    }}
                            className="rounded-lg"
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Danışan Listesi */}
              <ClientList 
                clients={clients}
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                loading={loading}
              />
            </div>

            {/* Ana İçerik Alanı - Danışan Detayları */}
            <div className="lg:col-span-3">
              {selectedClient && professional.id ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedClient}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        Detaylı performans analizi ve egzersiz geçmişi
                      </p>
                    </div>
                  </div>
                  <ClientDetail 
                    professionalId={professional.id}
                    clientIdentifier={selectedClient}
                  />
                </div>
              ) : (
                <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm">
                  <CardContent className="p-12">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Users className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Danışan Seçin</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          {clients.length === 0 
                            ? "Henüz danışan veriniz bulunmuyor. Danışan modu ile veri toplamaya başlayın veya danışanlarınızın size bağlanmasını bekleyin."
                            : "Detaylı analiz için sol panelden bir danışan seçin."
                          }
                        </p>
                      </div>
                      {clients.length === 0 && (
                        <Button 
                          onClick={() => {
                            playSound('button-click')
                            setDialogOpen(true)
                          }}
                          className="rounded-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Danışan Modu ile Başlayın
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Danışan Modu Çıkış Bilgisi */}
          <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                Danışan Modundan Çıkış
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                Danışan modu başladıktan sonra, normal uzman arayüzüne dönmek için 
                <span className="font-mono bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded mx-1 font-semibold">1923</span> 
                şifresini kullanmanız gerekecektir.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

export default UzmanDashboardSayfasi
