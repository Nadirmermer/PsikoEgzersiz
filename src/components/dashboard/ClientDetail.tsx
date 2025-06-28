import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { supabase } from '../../lib/supabase'
import { Brain, TrendingUp, Clock, Target, Award, Activity, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react'

interface ClientDetailProps {
  professionalId: string
  clientIdentifier: string
}

interface ExerciseSession {
  id: string
  session_date: string
  exercise_data: Record<string, unknown>
  is_client_mode_session: boolean
}

interface PerformanceData {
  date: string
  score: number
  duration: number
  level_identifier: string
  moves_count: number
  incorrect_moves_count: number
  session_type: 'Danışan Modu' | 'Anonim Bağlantı'
}

interface LevelStats {
  level: string
  totalGames: number
  averageScore: number
  averageDuration: number
  bestScore: number
  averageMoves: number
  averageErrors: number
}

const ClientDetail: React.FC<ClientDetailProps> = ({ 
  professionalId, 
  clientIdentifier 
}) => {
  const [sessions, setSessions] = useState<ExerciseSession[]>([])
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [levelStats, setLevelStats] = useState<LevelStats[]>([])

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
          date: new Date(session.session_date).toLocaleDateString('tr-TR', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          score: session.exercise_data?.score || 0,
          duration: session.exercise_data?.duration || 0,
          level_identifier: session.exercise_data?.details?.level_identifier || 'Bilinmiyor',
          moves_count: session.exercise_data?.details?.moves_count || 0,
          incorrect_moves_count: session.exercise_data?.details?.incorrect_moves_count || 0,
          session_type: session.is_client_mode_session ? 'Danışan Modu' as const : 'Anonim Bağlantı' as const
        })) || []

        setPerformanceData(chartData.reverse()) // Chronological order for chart

        // Seviye bazlı istatistikleri hesapla
        const levelStatsMap = new Map<string, {
          scores: number[]
          durations: number[]
          moves: number[]
          errors: number[]
        }>()

        data?.forEach(session => {
          const level = session.exercise_data?.details?.level_identifier || 'Bilinmiyor'
          if (!levelStatsMap.has(level)) {
            levelStatsMap.set(level, { scores: [], durations: [], moves: [], errors: [] })
          }
          
          const stats = levelStatsMap.get(level)!
          stats.scores.push(session.exercise_data?.score || 0)
          stats.durations.push(session.exercise_data?.duration || 0)
          stats.moves.push(session.exercise_data?.details?.moves_count || 0)
          stats.errors.push(session.exercise_data?.details?.incorrect_moves_count || 0)
        })

        const levelStatsArray: LevelStats[] = Array.from(levelStatsMap.entries()).map(([level, stats]) => ({
          level,
          totalGames: stats.scores.length,
          averageScore: Math.round(stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length),
          averageDuration: Math.round(stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length),
          bestScore: Math.max(...stats.scores),
          averageMoves: Math.round(stats.moves.reduce((a, b) => a + b, 0) / stats.moves.length),
          averageErrors: Math.round(stats.errors.reduce((a, b) => a + b, 0) / stats.errors.length)
        }))

        setLevelStats(levelStatsArray)

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalSessions = sessions.length
  const clientModeSessions = sessions.filter(s => s.is_client_mode_session).length
  const anonymousConnections = sessions.filter(s => !s.is_client_mode_session).length
  const averageScore = totalSessions > 0 
    ? Math.round(sessions.reduce((sum, s) => sum + ((s.exercise_data as any)?.score || 0), 0) / totalSessions)
    : 0
  const averageDuration = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + ((s.exercise_data as any)?.duration || 0), 0) / totalSessions)
    : 0
  const bestScore = totalSessions > 0 
    ? Math.max(...sessions.map(s => (s.exercise_data as any)?.score || 0))
    : 0

  const chartConfig = {
    score: {
      label: "Skor",
      color: "hsl(var(--primary))",
    },
    duration: {
      label: "Süre (sn)",
      color: "hsl(var(--chart-2))",
    },
  }

  if (totalSessions === 0) {
    return (
      <Card className="card-enhanced">
        <CardContent className="text-center py-16">
          <div className="w-24 h-24 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">
            Henüz Egzersiz Verisi Bulunmuyor
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            <strong>{clientIdentifier}</strong> adlı danışanın henüz tamamlanmış egzersizi bulunmuyor.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Veri eklemek için:</p>
            <p>• Danışan modunu kullanarak egzersiz yaptırın</p>
            <p>• Danışanın uzman ID'nizle bağlanmasını sağlayın</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-enhanced">
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

        <Card className="card-enhanced">
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

        <Card className="card-enhanced">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Yüksek Skor</p>
                <p className="text-2xl font-bold">{bestScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ortalama Süre</p>
                <p className="text-2xl font-bold">{averageDuration}sn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Veri Kaynağı Özeti */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Veri Kaynağı Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="p-2 bg-blue-500 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Danışan Modu</p>
                <p className="text-sm text-muted-foreground">{clientModeSessions} oturum</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Anonim Bağlantı</p>
                <p className="text-sm text-muted-foreground">{anonymousConnections} oturum</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detaylı Analiz Sekmeleri */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 h-12">
          <TabsTrigger value="performance" className="font-semibold">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performans
          </TabsTrigger>
          <TabsTrigger value="levels" className="font-semibold">
            <Target className="w-4 h-4 mr-2" />
            Seviye Analizi
          </TabsTrigger>
          <TabsTrigger value="history" className="font-semibold">
            <Calendar className="w-4 h-4 mr-2" />
            Geçmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performans Grafikleri */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Skor Trendi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#scoreGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Süre Trendi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          {/* Seviye Bazlı İstatistikler */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Seviye Bazlı Performans Analizi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {levelStats.map((stat, index) => (
                  <div key={index} className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{stat.level}</h4>
                      <Badge variant="outline">{stat.totalGames} oyun</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ortalama Skor:</span>
                        <span className="font-medium">{stat.averageScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">En İyi Skor:</span>
                        <span className="font-medium text-primary">{stat.bestScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ortalama Süre:</span>
                        <span className="font-medium">{stat.averageDuration}sn</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ortalama Hamle:</span>
                        <span className="font-medium">{stat.averageMoves}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ortalama Hata:</span>
                        <span className="font-medium text-destructive">{stat.averageErrors}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Oturum Geçmişi Tablosu */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Egzersiz Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Seviye</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Hamle</TableHead>
                    <TableHead>Hata</TableHead>
                    <TableHead>Kaynak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {new Date(session.session_date).toLocaleDateString('tr-TR')} {' '}
                        <span className="text-muted-foreground text-xs">
                          {new Date(session.session_date).toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {((session.exercise_data as any)?.details?.level_identifier as string) || 'Bilinmiyor'}
                        </Badge>
                      </TableCell>  
                      <TableCell className="font-bold text-primary">
                        {((session.exercise_data as any)?.score as number) || 0}
                      </TableCell>
                      <TableCell>{((session.exercise_data as any)?.duration as number) || 0}sn</TableCell>
                      <TableCell>{((session.exercise_data as any)?.details?.moves_count as number) || 0}</TableCell>
                      <TableCell className="text-destructive">
                        {((session.exercise_data as any)?.details?.incorrect_moves_count as number) || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.is_client_mode_session ? "default" : "secondary"}>
                          {session.is_client_mode_session ? "Danışan Modu" : "Anonim Bağlantı"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClientDetail
