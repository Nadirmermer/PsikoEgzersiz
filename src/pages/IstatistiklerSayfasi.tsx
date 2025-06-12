
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LocalStorageManager, ExerciseResult } from '../utils/localStorage'
import { useAuth } from '../contexts/AuthContext'

const IstatistiklerSayfasi: React.FC = () => {
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([])
  const { professional } = useAuth()

  useEffect(() => {
    const results = LocalStorageManager.getExerciseResults()
    setExerciseResults(results)
  }, [])

  const totalExercises = exerciseResults.length
  const averageScore = totalExercises > 0 
    ? (exerciseResults.reduce((sum, result) => sum + result.score, 0) / totalExercises).toFixed(1)
    : '0'
  const totalTime = exerciseResults.reduce((sum, result) => sum + result.duration, 0)

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
      title: 'Toplam Süre',
      value: formatTime(totalTime),
      description: 'Egzersizlerde geçirilen toplam zaman',
      icon: '⏱️'
    },
    {
      title: 'Günlük Ortalama',
      value: '0',
      description: 'Günde ortalama egzersiz sayısı',
      icon: '📅'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
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

      {/* Recent Results */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Son Egzersizler
          </CardTitle>
          <CardDescription>
            En son tamamladığınız egzersizlerin detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exerciseResults.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">
                Henüz egzersiz yapmadınız
              </h3>
              <p className="text-muted-foreground mb-4">
                İlk egzersiznizi tamamladığınızda istatistikleriniz burada görünecek
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exerciseResults.slice(-5).reverse().map((result, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{result.exerciseName}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(result.date).toLocaleDateString('tr-TR')}
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
          )}
        </CardContent>
      </Card>

      {/* Professional Info */}
      {professional && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
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
        <Card>
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
