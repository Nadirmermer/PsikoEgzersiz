
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LocalStorageManager, ExerciseResult } from '../utils/localStorage'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, Clock, Trophy, Target, Brain, User, Trash2, Download, Zap, Award, Star, Layers } from 'lucide-react'

const IstatistiklerSayfasi: React.FC = () => {
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([])
  const { professional } = useAuth()

  useEffect(() => {
    const results = LocalStorageManager.getExerciseResults()
    setExerciseResults(results)
  }, [])

  const memoryGameResults = exerciseResults.filter(result => result.exerciseName === 'Hafıza Oyunu')
  const towerOfLondonResults = exerciseResults.filter(result => result.exerciseName === 'Londra Kulesi Testi')
  const imageWordResults = exerciseResults.filter(result => result.exerciseName === 'Resim-Kelime Eşleştirme')
  const wordImageResults = exerciseResults.filter(result => result.exerciseName === 'Kelime-Resim Eşleştirme')
  
  const totalExercises = exerciseResults.length
  const averageScore = totalExercises > 0 
    ? (exerciseResults.reduce((sum, result) => sum + result.score, 0) / totalExercises).toFixed(1)
    : '0'
  const totalTime = exerciseResults.reduce((sum, result) => sum + result.duration, 0)
  const highestScore = totalExercises > 0 
    ? Math.max(...exerciseResults.map(result => result.score))
    : 0

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}s ${minutes}d ${secs}sn`
    } else if (minutes > 0) {
      return `${minutes}d ${secs}sn`
    } else {
      return `${secs}sn`
    }
  }

  const clearData = () => {
    LocalStorageManager.clearExerciseResults()
    setExerciseResults([])
  }

  // Hafıza oyunu verilerini grafik için hazırla
  const prepareMemoryChartData = () => {
    return memoryGameResults.map((result, index) => ({
      index: index + 1,
      oyun: `Oyun ${index + 1}`,
      skor: result.score,
      sure: result.duration,
      tarih: new Date(result.date).toLocaleDateString('tr-TR'),
      seviye: result.details?.level_identifier || 'Bilinmiyor',
      hamle: result.details?.moves_count || 0,
      hata: result.details?.incorrect_moves_count || 0
    }))
  }

  // Londra Kulesi verilerini grafik için hazırla
  const prepareTowerChartData = () => {
    return towerOfLondonResults.map((result, index) => ({
      index: index + 1,
      oyun: `Seviye ${result.details?.level_number || index + 1}`,
      skor: result.score,
      sure: result.duration,
      tarih: new Date(result.date).toLocaleDateString('tr-TR'),
      seviye: result.details?.level_identifier || 'Bilinmiyor',
      hamle: result.details?.user_moves_taken || 0,
      minHamle: result.details?.min_moves_required || 0,
      verimlilik: result.details?.efficiency_percentage || 0,
      optimal: result.details?.completed_optimally || false
    }))
  }

  const memoryChartData = prepareMemoryChartData()
  const towerChartData = prepareTowerChartData()

  // Seviye bazlı performans - Hafıza Oyunu
  const memoryLevelPerformance = memoryGameResults.reduce((acc, result) => {
    const level = result.details?.level_identifier || 'Bilinmiyor'
    if (!acc[level]) {
      acc[level] = { totalScore: 0, count: 0, totalTime: 0 }
    }
    acc[level].totalScore += result.score
    acc[level].totalTime += result.duration
    acc[level].count += 1
    return acc
  }, {} as Record<string, { totalScore: number; count: number; totalTime: number }>)

  const memoryLevelStats = Object.entries(memoryLevelPerformance).map(([level, stats]) => ({
    seviye: level,
    ortalamaSkor: Math.round(stats.totalScore / stats.count),
    ortalamaSure: Math.round(stats.totalTime / stats.count),
    oyunSayisi: stats.count
  }))

  // Seviye bazlı performans - Londra Kulesi
  const towerLevelPerformance = towerOfLondonResults.reduce((acc, result) => {
    const level = result.details?.level_identifier || 'Bilinmiyor'
    if (!acc[level]) {
      acc[level] = { totalScore: 0, count: 0, totalTime: 0, totalEfficiency: 0 }
    }
    acc[level].totalScore += result.score
    acc[level].totalTime += result.duration
    acc[level].totalEfficiency += result.details?.efficiency_percentage || 0
    acc[level].count += 1
    return acc
  }, {} as Record<string, { totalScore: number; count: number; totalTime: number; totalEfficiency: number }>)

  const towerLevelStats = Object.entries(towerLevelPerformance).map(([level, stats]) => ({
    seviye: level,
    ortalamaSkor: Math.round(stats.totalScore / stats.count),
    ortalamaSure: Math.round(stats.totalTime / stats.count),
    ortalamaVerimlilik: Math.round(stats.totalEfficiency / stats.count),
    oyunSayisi: stats.count
  }))

  const chartConfig = {
    skor: {
      label: "Skor",
      color: "hsl(var(--primary))",
    },
    sure: {
      label: "Süre (sn)",
      color: "hsl(var(--chart-2))",
    },
    verimlilik: {
      label: "Verimlilik (%)",
      color: "hsl(var(--chart-3))",
    },
  }

  const stats = [
    {
      title: 'Toplam Egzersiz',
      value: totalExercises.toString(),
      description: 'Tamamlanan egzersiz sayısı',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Ortalama Skor',
      value: averageScore,
      description: 'Genel performans ortalaması',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      title: 'En Yüksek Skor',
      value: highestScore.toString(),
      description: 'Şimdiye kadarki en iyi performans',
      icon: Trophy,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      title: 'Toplam Süre',
      value: formatTime(totalTime),
      description: 'Egzersizlerde geçirilen toplam zaman',
      icon: Clock,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30'
    }
  ]

  // Egzersiz türlerine göre özet
  const exerciseTypeSummary = [
    {
      name: 'Hafıza Oyunu',
      count: memoryGameResults.length,
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      name: 'Londra Kulesi',
      count: towerOfLondonResults.length,
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      name: 'Resim-Kelime',
      count: imageWordResults.length,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      name: 'Kelime-Resim',
      count: wordImageResults.length,
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 pb-28 max-w-7xl">
      {/* Enhanced Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mb-6">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          İstatistiklerim
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Bilişsel egzersiz performansınızı takip edin ve gelişiminizi analiz edin
        </p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="card-enhanced hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className={`absolute inset-0 ${stat.bgColor} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-background/80 shadow-sm`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {index === 2 && highestScore > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                      <Star className="w-3 h-3 mr-1" />
                      Rekor
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                  {stat.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {stat.title}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Egzersiz Türleri Özeti */}
      <div className="grid gap-4 md:grid-cols-4 mb-12">
        {exerciseTypeSummary.map((exercise, index) => {
          const IconComponent = exercise.icon;
          return (
            <Card key={index} className="card-enhanced">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${exercise.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <IconComponent className={`w-6 h-6 ${exercise.color}`} />
                </div>
                <div className="text-2xl font-bold">{exercise.count}</div>
                <div className="text-sm text-muted-foreground">{exercise.name}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {exerciseResults.length === 0 ? (
        <Card className="card-enhanced">
          <CardContent className="text-center py-16">
            <div className="w-24 h-24 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">
              Henüz egzersiz yapmadınız
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              İlk egzersiznizi tamamladığınızda performans istatistikleriniz burada görünecek
            </p>
            <Badge variant="outline" className="text-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Hafıza Oyunu ile başlayın
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 h-12">
            <TabsTrigger value="overview" className="font-semibold">
              <BarChart3 className="w-4 h-4 mr-2" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="charts" className="font-semibold">
              <TrendingUp className="w-4 h-4 mr-2" />
              Grafikler
            </TabsTrigger>
            <TabsTrigger value="details" className="font-semibold">
              <Target className="w-4 h-4 mr-2" />
              Detaylar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Hafıza Oyunu Seviye Performansı */}
            {memoryLevelStats.length > 0 && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    Hafıza Oyunu - Seviye Performansı
                  </CardTitle>
                  <CardDescription className="text-base">
                    Her zorluk seviyesindeki ortalama performansınız
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {memoryLevelStats.map((stat, index) => (
                      <div key={index} className="p-6 bg-gradient-to-br from-blue-50/30 to-blue-50/10 dark:from-blue-950/20 dark:to-blue-950/10 rounded-xl border border-border/50 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-semibold text-sm text-muted-foreground">{stat.seviye}</div>
                          <Badge variant="outline" className="text-xs">
                            {stat.oyunSayisi} oyun
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-2">{stat.ortalamaSkor}</div>
                        <div className="text-sm text-muted-foreground">
                          Ortalama süre: <span className="font-medium">{stat.ortalamaSure}sn</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Londra Kulesi Seviye Performansı */}
            {towerLevelStats.length > 0 && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    Londra Kulesi - Seviye Performansı
                  </CardTitle>
                  <CardDescription className="text-base">
                    Her seviyedeki problem çözme performansınız
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {towerLevelStats.map((stat, index) => (
                      <div key={index} className="p-6 bg-gradient-to-br from-purple-50/30 to-purple-50/10 dark:from-purple-950/20 dark:to-purple-950/10 rounded-xl border border-border/50 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-semibold text-sm text-muted-foreground">{stat.seviye}</div>
                          <Badge variant="outline" className="text-xs">
                            {stat.oyunSayisi} oyun
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-2">{stat.ortalamaSkor}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Süre: <span className="font-medium">{stat.ortalamaSure}sn</span></div>
                          <div>Verimlilik: <span className="font-medium text-purple-600">{stat.ortalamaVerimlilik}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Son Egzersizler */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  Son Egzersizler
                </CardTitle>
                <CardDescription className="text-base">
                  En son tamamladığınız egzersizlerin detayları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exerciseResults.slice(-5).reverse().map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/30 hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {result.exerciseName === 'Hafıza Oyunu' && <Brain className="w-5 h-5 text-blue-600" />}
                          {result.exerciseName === 'Londra Kulesi Testi' && <Layers className="w-5 h-5 text-purple-600" />}
                          {result.exerciseName.includes('Eşleştirme') && <Target className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div>
                          <div className="font-semibold text-base">{result.exerciseName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-3">
                            <span>{new Date(result.date).toLocaleDateString('tr-TR')}</span>
                            <span>•</span>
                            <span>{result.details?.level_identifier || 'Detay Yok'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary">{result.score} puan</div>
                        <div className="text-sm text-muted-foreground">
                          {formatTime(result.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-8">
            {/* Hafıza Oyunu Grafikleri */}
            {memoryGameResults.length > 0 && (
              <>
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Brain className="w-6 h-6 text-blue-600" />
                      Hafıza Oyunu - Skor Gelişimi
                    </CardTitle>
                    <CardDescription className="text-base">
                      Hafıza oyunundaki performansınızın zamanla gelişimi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={memoryChartData}>
                          <defs>
                            <linearGradient id="memorySkorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(220, 91%, 60%)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(220, 91%, 60%)" stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="oyun" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area 
                            type="monotone" 
                            dataKey="skor" 
                            stroke="hsl(220, 91%, 60%)" 
                            fill="url(#memorySkorGradient)"
                            strokeWidth={3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Londra Kulesi Grafikleri */}
            {towerOfLondonResults.length > 0 && (
              <>
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Layers className="w-6 h-6 text-purple-600" />
                      Londra Kulesi - Skor ve Verimlilik Gelişimi
                    </CardTitle>
                    <CardDescription className="text-base">
                      Problem çözme performansınızın gelişimi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={towerChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="oyun" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="skor" 
                            stroke="hsl(262, 83%, 58%)" 
                            strokeWidth={3}
                            name="Skor"
                            dot={{ fill: "hsl(262, 83%, 58%)", strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="verimlilik" 
                            stroke="hsl(142, 76%, 36%)" 
                            strokeWidth={3}
                            name="Verimlilik (%)"
                            dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-8">
            {/* Detaylı Oyun Tablosu */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Target className="w-6 h-6 text-primary" />
                  Tüm Egzersiz Sonuçları
                </CardTitle>
                <CardDescription className="text-base">
                  Tamamladığınız tüm egzersizlerin detaylı analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold">Tarih</TableHead>
                        <TableHead className="font-semibold">Egzersiz</TableHead>
                        <TableHead className="font-semibold">Seviye</TableHead>
                        <TableHead className="font-semibold">Skor</TableHead>
                        <TableHead className="font-semibold">Süre</TableHead>
                        <TableHead className="font-semibold">Detay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exerciseResults.slice().reverse().map((result, index) => (
                        <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="text-sm font-medium">
                            {new Date(result.date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="font-semibold">{result.exerciseName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {result.details?.level_identifier || 'Bilinmiyor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-primary text-lg">{result.score}</span>
                          </TableCell>
                          <TableCell className="font-medium">{formatTime(result.duration)}</TableCell>
                          <TableCell className="text-sm">
                            {result.exerciseName === 'Hafıza Oyunu' && (
                              <span>Hamle: {result.details?.moves_count || '-'}, Hata: {result.details?.incorrect_moves_count || '-'}</span>
                            )}
                            {result.exerciseName === 'Londra Kulesi Testi' && (
                              <span>
                                Hamle: {result.details?.user_moves_taken || '-'}/{result.details?.min_moves_required || '-'}, 
                                Verimlilik: {result.details?.efficiency_percentage || '-'}%
                                {result.details?.completed_optimally && <Star className="w-3 h-3 inline ml-1 text-amber-500" />}
                              </span>
                            )}
                            {result.exerciseName.includes('Eşleştirme') && (
                              <span>Doğru: {result.details?.correct_answers || '-'}/{result.details?.total_questions || '-'}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Professional Info */}
      {professional && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/60 dark:border-blue-800/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              Uzman Hesabı Bilgileri
            </CardTitle>
            <CardDescription className="text-base">
              Uzman hesabı detayları ve danışan bağlantı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Uzman ID</label>
                  <div className="font-mono text-sm bg-background/60 p-3 rounded-lg border border-border/30 mt-1">
                    {professional.id}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Ad Soyad</label>
                  <div className="font-semibold text-lg mt-1">{professional.display_name}</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-background/40 rounded-xl border border-border/30">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Danışanlarınız bu ID'yi kullanarak verilerini sizinle paylaşabilir.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Data Management */}
      {exerciseResults.length > 0 && (
        <Card className="mt-8 border-amber-200/60 dark:border-amber-800/60 bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Trash2 className="w-6 h-6 text-amber-600" />
              </div>
              Veri Yönetimi
            </CardTitle>
            <CardDescription className="text-base">
              Yerel olarak saklanan egzersiz verilerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="destructive" 
                onClick={clearData}
                className="flex-1 font-semibold"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Tüm Verileri Temizle
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold"
                disabled
              >
                <Download className="w-4 h-4 mr-2" />
                Verileri Dışa Aktar (Yakında)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 p-3 bg-background/40 rounded-lg border border-border/30">
              <strong>Uyarı:</strong> Veri temizleme işlemi geri alınamaz. Tüm egzersiz sonuçlarınız kalıcı olarak silinecektir.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default IstatistiklerSayfasi
