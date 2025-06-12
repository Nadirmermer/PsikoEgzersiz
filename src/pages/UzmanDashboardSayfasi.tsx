
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { Users, Settings, Play, Key } from 'lucide-react'
import ClientList from '../components/dashboard/ClientList'
import ClientDetail from '../components/dashboard/ClientDetail'

interface ClientInfo {
  client_identifier: string
  last_activity: string
  total_exercises: number
  is_client_mode: boolean
}

const UzmanDashboardSayfasi: React.FC = () => {
  const { professional } = useAuth()
  const [clientName, setClientName] = useState('')
  const [isStartingClientMode, setIsStartingClientMode] = useState(false)
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      if (!supabase || !professional?.id) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('client_statistics')
          .select('client_identifier, session_date, is_client_mode_session')
          .eq('professional_id', professional.id)

        if (error) {
          console.error('Clients fetch error:', error)
          return
        }

        // Group by client_identifier and aggregate data
        const clientMap = new Map<string, ClientInfo>()
        
        data?.forEach(record => {
          const clientId = record.client_identifier
          const existing = clientMap.get(clientId)
          
          if (!existing) {
            clientMap.set(clientId, {
              client_identifier: clientId,
              last_activity: record.session_date,
              total_exercises: 1,
              is_client_mode: record.is_client_mode_session
            })
          } else {
            existing.total_exercises += 1
            if (new Date(record.session_date) > new Date(existing.last_activity)) {
              existing.last_activity = record.session_date
            }
            // If any session is client mode, mark as client mode
            if (record.is_client_mode_session) {
              existing.is_client_mode = true
            }
          }
        })

        const clientsList = Array.from(clientMap.values())
          .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())

        setClients(clientsList)
        
        // Auto-select first client if exists
        if (clientsList.length > 0 && !selectedClient) {
          setSelectedClient(clientsList[0].client_identifier)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
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

    // Client mode'u başlat
    localStorage.setItem('clientMode', 'true')
    localStorage.setItem('clientModeData', JSON.stringify({
      professionalId: professional?.id,
      clientIdentifier: clientName.trim(),
      startTime: new Date().toISOString()
    }))

    toast.success(`Danışan modu başlatıldı: ${clientName}`)
    
    // Egzersizler sayfasına yönlendir
    window.location.href = '/'
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId)
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
    <div className="container mx-auto px-4 py-6 pb-24 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Uzman Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Hoş geldiniz, {professional.display_name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Panel - Uzman Bilgileri ve Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Uzman Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Uzman Bilgileri
              </CardTitle>
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
                  <Label className="text-sm font-medium">Uzman ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {professional.id.substring(0, 8)}...
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
            </CardHeader>
            <CardContent>
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
                <h2 className="text-2xl font-bold mb-2">Danışan: {selectedClient}</h2>
                <p className="text-muted-foreground">Detaylı performans analizi</p>
              </div>
              <ClientDetail 
                professionalId={professional.id}
                clientIdentifier={selectedClient}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Danışan Seçin</h3>
                  <p className="text-muted-foreground">
                    Detaylı analiz için sol panelden bir danışan seçin.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Danışan Modu Çıkış Bilgisi */}
      <Card className="mt-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
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
