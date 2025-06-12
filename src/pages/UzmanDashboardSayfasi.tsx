
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Users, Settings, Play, Key, BarChart3 } from 'lucide-react'
import ClientList from '../components/dashboard/ClientList'
import ClientDetail from '../components/dashboard/ClientDetail'

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
  const { professional } = useAuth()
  const [clientName, setClientName] = useState('')
  const [isStartingClientMode, setIsStartingClientMode] = useState(false)
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      if (!supabase || !professional?.id) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('client_statistics')
          .select('client_identifier, session_date, is_client_mode_session, exercise_data')
          .eq('professional_id', professional.id)

        if (error) {
          console.error('Clients fetch error:', error)
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
        
        data?.forEach(record => {
          const clientId = record.client_identifier
          const existing = clientMap.get(clientId)
          const score = record.exercise_data?.score || 0
          
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
          is_client_mode: client.client_mode_sessions > 0, // Eğer herhangi bir danışan modu varsa true
          client_mode_sessions: client.client_mode_sessions,
          anonymous_sessions: client.anonymous_sessions,
          average_score: Math.round(client.scores.reduce((a, b) => a + b, 0) / client.scores.length),
          best_score: Math.max(...client.scores)
        })).sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())

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

    fetchClients()
  }, [professional?.id])

  const handleStartClientMode = () => {
    if (!clientName.trim()) {
      toast.error('Lütfen danışan adını girin')
      return
    }

    setIsStartingClientMode(true)

    // Client mode'u başlat
    localStorage.setItem('clientMode', 'true')
    localStorage.setItem('clientModeData', JSON.stringify({
      professionalId: professional?.id,
      clientIdentifier: clientName.trim(),
      startTime: new Date().toISOString()
    }))

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

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <Card className="card-enhanced">
          <CardContent className="text-center py-16">
            <div className="w-24 h-24 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Settings className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Erişim Reddedildi</h1>
            <p className="text-muted-foreground mb-6">
              Bu sayfaya erişmek için uzman hesabınızla giriş yapmanız gerekmektedir.
            </p>
            <Button onClick={() => window.location.href = '/ayarlar'}>
              Ayarlar Sayfasına Git
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-7xl">
      {/* Enhanced Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-6">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Uzman Dashboard
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hoş geldiniz, <strong>{professional.display_name}</strong>. Danışanlarınızın performansını analiz edin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Panel - Uzman Bilgileri ve Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Uzman Bilgileri */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Uzman Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Uzman Adı</Label>
                  <p className="text-lg font-semibold">{professional.display_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{professional.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Uzman ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-1 truncate">
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
                </div>
                <div className="pt-2 border-t">
                  <Label className="text-sm font-medium text-muted-foreground">Toplam Danışan</Label>
                  <p className="text-2xl font-bold text-primary">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danışan Modu */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Danışan Modu
              </CardTitle>
              <CardDescription>
                Danışanınızla birlikte egzersiz yapın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Danışan Modunu Başlat
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Danışan Modu</DialogTitle>
                    <DialogDescription>
                      Danışanınızın adını girin ve birlikte egzersiz yapmaya başlayın
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Danışan Adı *</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="mt-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && clientName.trim()) {
                            handleStartClientMode()
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Bu isim raporlarda görünecektir
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleStartClientMode}
                        disabled={!clientName.trim() || isStartingClientMode}
                        className="flex-1"
                      >
                        {isStartingClientMode ? 'Başlatılıyor...' : 'Modu Başlat'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setDialogOpen(false)
                          setClientName('')
                        }}
                        className="flex-1"
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
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Danışan: {selectedClient}
                </h2>
                <p className="text-muted-foreground">
                  Detaylı performans analizi ve egzersiz geçmişi
                </p>
              </div>
              <ClientDetail 
                professionalId={professional.id}
                clientIdentifier={selectedClient}
              />
            </div>
          ) : (
            <Card className="card-enhanced">
              <CardContent className="p-12">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Danışan Seçin</h3>
                  <p className="text-muted-foreground mb-6">
                    {clients.length === 0 
                      ? "Henüz danışan veriniz bulunmuyor. Danışan modu ile veri eklemeye başlayın."
                      : "Detaylı analiz için sol panelden bir danışan seçin."
                    }
                  </p>
                  {clients.length === 0 && (
                    <Button 
                      onClick={() => setDialogOpen(true)}
                      className="mt-4"
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
      <Card className="mt-8 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
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
  )
}

export default UzmanDashboardSayfasi
