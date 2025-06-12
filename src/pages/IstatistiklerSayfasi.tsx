
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LocalStorageManager, ExerciseResult } from '../utils/localStorage'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const IstatistiklerSayfasi: React.FC = () => {
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([])
  const { professional } = useAuth()

  useEffect(() => {
    const results = LocalStorageManager.getExerciseResults()
    setExerciseResults(results)
  }, [])

  const memoryGameResults = exerciseResults.filter(result => result.exerciseName === 'Hafıza Oyunu')
  
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
  const prepareChartData = () => {
    return memoryGameResults.map((result, index) => ({
      index: index + 1,
      skor: result.score,
      sure: result.duration,
      tarih: new Date(result.date).toLocaleDateString('tr-TR'),
      seviye: result.details?.level_identifier || 'Bilinmiyor',
      hamle: result.details?.moves_count || 0,
      hata: result.details?.incorrect_moves_count || 0
    }))
  }

  const chartData = prepareChartData()

  // Seviye bazlı performans
  const levelPerformance = memoryGameResults.reduce((acc, result) => {
    const level = result.details?.level_identifier || 'Bilinmiyor'
    if (!acc[level]) {
      acc[level] = { totalScore: 0, count: 0, totalTime: 0 }
    }
    acc[level].totalScore += result.score
    acc[level].totalTime += result.duration
    acc[level].count += 1
    return acc
  }, {} as Record<string, { totalScore: number; count: number; totalTime: number }>)

  const levelStats = Object.entries(levelPerformance).map(([level, stats]) => ({
    seviye: level,
    ortalamaSkor: Math.round(stats.totalScore / stats.count),
    ortalamaSure: Math.round(stats.totalTime / stats.count),
    oyunSayisi: stats.count
  }))

  const chartConfig = {
    skor: {
      label: "Skor",
      color: "hsl(var(--chart-1))",
    },
    sure: {
      label: "Süre (sn)",
      color: "hsl(var(--chart-2))",
    },
  }

  const stats = [
    {
      title: 'Toplam Egzersiz',
      value: totalExercises.toString(),
      description: 'Tamamlanan egzersiz sayısı',
      icon: '🎯'
    },
    {
      title: 'Ortalama Skor',
      value: averageScore,
      description: 'Genel performans ortalaması',
      icon: '📈'
    },
    {
      title: 'En Yüksek Skor',
      value: highestScore.toString(),
      description: 'Şimdiye kadarki en iyi performans',
      icon: '🏆'
    },
    {
      title: 'Toplam Süre',
      value: formatTime(totalTime),
      description: 'Egzersizlerde geçirilen toplam zaman',
      icon: '⏱️'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          İstatistiklerim
        </h1>
        <p className="text-muted-foreground text-lg">
          Bilişsel egzersiz performansınızı takip edin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardHeader className="pb-2">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <CardDescription className="text-xs">
                {stat.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium">
                {stat.title}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {exerciseResults.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">
              Henüz egzersiz yapmadınız
            </h3>
            <p className="text-muted-foreground mb-4">
              İlk egzersiznizi tamamladığınızda istatistikleriniz burada görünecek
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="charts">Grafikler</TabsTrigger>
            <TabsTrigger value="details">Detaylar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Seviye Performansı */}
            {levelStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎮 Seviye Performansı
                  </CardTitle>
                  <CardDescription>
                    Her seviyedeki ortalama performansınız
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {levelStats.map((stat, index) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="font-medium text-sm text-muted-foreground">{stat.seviye}</div>
                        <div className="text-2xl font-bold text-primary">{stat.ortalamaSkor}</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.oyunSayisi} oyun • {stat.ortalamaSure}sn ortalama
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Son Egzersizler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Son Egzersizler
                </CardTitle>
                <CardDescription>
                  En son tamamladığınız egzersizlerin detayları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exerciseResults.slice(-5).reverse().map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="font-medium">{result.exerciseName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(result.date).toLocaleDateString('tr-TR')} • {result.details?.level_identifier || 'Seviye Bilinmiyor'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{result.score} puan</div>
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

          <TabsContent value="charts" className="space-y-6">
            {memoryGameResults.length > 0 && (
              <>
                {/* Skor Trendi */}
                <Card>
                  <CardHeader>
                    <CardTitle>📈 Skor Gelişimi</CardTitle>
                    <CardDescription>
                      Hafıza oyunundaki skor performansınızın zamanla değişimi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Area type="monotone" dataKey="skor" stroke="var(--color-skor)" fill="var(--color-skor)" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Süre Trendi */}
                <Card>
                  <CardHeader>
                    <CardTitle>⏱️ Tamamlama Süresi Trendi</CardTitle>
                    <CardDescription>
                      Hafıza oyununu tamamlama sürenizin gelişimi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="sure" stroke="var(--color-sure)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Seviye Bazlı Performans */}
                {levelStats.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🎯 Seviye Bazlı Performans</CardTitle>
                      <CardDescription>
                        Farklı zorluk seviyelerindeki performans karşılaştırması
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={levelStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="seviye" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="ortalamaSkor" fill="var(--color-skor)" name="Ortalama Skor" />
                            <Bar dataKey="ortalamaSure" fill="var(--color-sure)" name="Ortalama Süre (sn)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Detaylı Oyun Tablosu */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Tüm Egzersiz Sonuçları
                </CardTitle>
                <CardDescription>
                  Tamamladığınız tüm egzersizlerin detaylı listesi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Egzersiz</TableHead>
                      <TableHead>Seviye</TableHead>
                      <TableHead>Skor</TableHead>
                      <TableHead>Süre</TableHead>
                      <TableHead>Hamle</TableHead>
                      <TableHead>Hata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exerciseResults.slice().reverse().map((result, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {new Date(result.date).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="font-medium">{result.exerciseName}</TableCell>
                        <TableCell className="text-sm">
                          {result.details?.level_identifier || 'Bilinmiyor'}
                        </TableCell>
                        <TableCell className="font-bold text-primary">{result.score}</TableCell>
                        <TableCell>{formatTime(result.duration)}</TableCell>
                        <TableCell>{result.details?.moves_count || '-'}</TableCell>
                        <TableCell>{result.details?.incorrect_moves_count || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Professional Info */}
      {professional && (
        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👨‍⚕️ Uzman Hesabı
            </CardTitle>
            <CardDescription>
              Uzman hesabı bilgileri ve danışan bağlantısı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Uzman ID</label>
                <div className="font-mono text-sm bg-background p-2 rounded border">
                  {professional.id}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Soyad</label>
                <div className="font-medium">{professional.display_name}</div>
              </div>
              <p className="text-sm text-muted-foreground">
                Danışanlarınız bu ID'yi kullanarak verilerini sizinle paylaşabilir.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      {exerciseResults.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🗑️ Veri Yönetimi
            </CardTitle>
            <CardDescription>
              Yerel verileri yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={clearData}
              className="w-full"
            >
              Tüm Verileri Temizle
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Bu işlem geri alınamaz. Tüm egzersiz sonuçlarınız silinecektir.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default IstatistiklerSayfasi
