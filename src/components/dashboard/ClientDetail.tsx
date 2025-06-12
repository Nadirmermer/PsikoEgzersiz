
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { supabase } from '../../lib/supabase'
import { Brain, TrendingUp, Clock, Target } from 'lucide-react'

interface ClientDetailProps {
  professionalId: string
  clientIdentifier: string
}

interface ExerciseSession {
  id: string
  session_date: string
  exercise_data: any
  is_client_mode_session: boolean
}

interface PerformanceData {
  date: string
  score: number
  duration: number
}

const ClientDetail: React.FC<ClientDetailProps> = ({ 
  professionalId, 
  clientIdentifier 
}) => {
  const [sessions, setSessions] = useState<ExerciseSession[]>([])
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])

  useEffect(() => {
    const fetchClientData = async () => {
      if (!supabase) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('client_statistics')
          .select('*')
          .eq('professional_id', professionalId)
          .eq('client_identifier', clientIdentifier)
          .order('session_date', { ascending: false })

        if (error) {
          console.error('Client data fetch error:', error)
          return
        }

        setSessions(data || [])

        // Performance data için grafik verisi oluştur
        const chartData = data?.map((session, index) => ({
          date: new Date(session.session_date).toLocaleDateString('tr-TR'),
          score: session.exercise_data?.score || 0,
          duration: session.exercise_data?.duration || 0
        })) || []

        setPerformanceData(chartData.reverse()) // Chronological order for chart
      } catch (error) {
        console.error('Error fetching client data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [professionalId, clientIdentifier])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalSessions = sessions.length
  const averageScore = sessions.length > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + (s.exercise_data?.score || 0), 0) / sessions.length)
    : 0
  const averageDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.exercise_data?.duration || 0), 0) / sessions.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Oturum</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Skor</p>
                <p className="text-2xl font-bold">{averageScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Süre</p>
                <p className="text-2xl font-bold">{averageDuration}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performans Grafikleri */}
      {performanceData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skor Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Skor" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Süre Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="duration" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Süre (saniye)" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Oturum Detayları Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Egzersiz Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bu danışan için henüz egzersiz verisi bulunmuyor.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Egzersiz</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Süre</TableHead>
                  <TableHead>Seviye</TableHead>
                  <TableHead>Mod</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {new Date(session.session_date).toLocaleDateString('tr-TR')} {' '}
                      {new Date(session.session_date).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </TableCell>
                    <TableCell>{session.exercise_data?.exerciseName || 'Hafıza Oyunu'}</TableCell>
                    <TableCell className="font-medium">{session.exercise_data?.score || 0}</TableCell>
                    <TableCell>{session.exercise_data?.duration || 0}s</TableCell>
                    <TableCell>
                      {session.exercise_data?.details?.level_identifier || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.is_client_mode_session ? "default" : "secondary"}>
                        {session.is_client_mode_session ? "Danışan Modu" : "Anonim"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientDetail
