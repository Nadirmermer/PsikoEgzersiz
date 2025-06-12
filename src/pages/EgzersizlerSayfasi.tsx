
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LocalStorageManager, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { Brain, Target, Puzzle, Settings, Play, Clock, Trophy, CheckCircle } from 'lucide-react'

interface EgzersizlerSayfasiProps {
  onMemoryGameStart: () => void
}

const EgzersizlerSayfasi: React.FC<EgzersizlerSayfasiProps> = ({ onMemoryGameStart }) => {
  const currentLevel = LocalStorageManager.getCurrentMemoryGameLevel()
  const currentLevelData = MEMORY_GAME_LEVELS[currentLevel - 1] || MEMORY_GAME_LEVELS[0]

  const exerciseCategories = [
    {
      title: 'Hafıza Egzersizleri',
      description: 'Kısa ve uzun süreli hafızanızı güçlendirin',
      icon: Brain,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      exercises: ['Kart Eşleştirme', 'Sayı Dizisi', 'Görsel Hafıza'],
      available: true,
      onStart: onMemoryGameStart,
      currentProgress: `Seviye ${currentLevel}: ${currentLevelData.name}`,
      stats: {
        completed: currentLevel - 1,
        total: MEMORY_GAME_LEVELS.length
      }
    },
    {
      title: 'Dikkat Egzersizleri',
      description: 'Odaklanma ve dikkat sürenizi artırın',
      icon: Target,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      exercises: ['Stroop Testi', 'Görsel Arama', 'Sürekli Performans'],
      available: false,
      comingSoon: true
    },
    {
      title: 'Problem Çözme',
      description: 'Mantıksal düşünme ve problem çözme becerilerinizi geliştirin',
      icon: Puzzle,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      exercises: ['Matematik Problemleri', 'Mantık Bulmacaları', 'Planlama Görevleri'],
      available: false,
      comingSoon: true
    },
    {
      title: 'Yürütücü Fonksiyonlar',
      description: 'Planlama, organizasyon ve karar verme becerilerinizi güçlendirin',
      icon: Settings,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      exercises: ['Görev Değiştirme', 'Çalışma Hafızası', 'İnhibisyon Kontrolü'],
      available: false,
      comingSoon: true
    }
  ]

  return (
    <div className="container mx-auto section-padding pb-24 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12 slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Bilişsel Egzersizler
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Zihin sağlığınızı destekleyen bilimsel egzersizlerle beyin gücünüzü artırın
        </p>
      </div>

      {/* Exercise Categories Grid */}
      <div className="grid gap-8 md:grid-cols-2 content-spacing mb-12">
        {exerciseCategories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <Card 
              key={index} 
              className={`card-enhanced interactive-lift relative overflow-hidden ${category.bgColor} ${category.borderColor} group`}
            >
              {/* Available Badge */}
              {category.available && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-success/10 text-success border-success/20 font-medium">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aktif
                  </Badge>
                </div>
              )}
              
              {/* Coming Soon Badge */}
              {category.comingSoon && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    Yakında
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 relative">
                <div className="flex items-start gap-4 mb-3">
                  <div className={`p-3 rounded-xl bg-background/80 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${category.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors duration-300">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Progress for available exercises */}
                {category.available && category.stats && (
                  <div className="bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">İlerleme</span>
                      <span className="text-sm font-semibold text-primary">
                        {category.stats.completed}/{category.stats.total} Seviye
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(category.stats.completed / category.stats.total) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {category.currentProgress}
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Exercise Tags */}
                <div className="flex flex-wrap gap-2">
                  {category.exercises.map((exercise, exerciseIndex) => (
                    <Badge 
                      key={exerciseIndex}
                      variant="outline"
                      className="text-xs bg-background/60 hover:bg-background/80 transition-colors duration-200"
                    >
                      {exercise}
                    </Badge>
                  ))}
                </div>
                
                {/* Action Button */}
                <Button 
                  className={`w-full font-medium transition-all duration-300 ${
                    category.available 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  disabled={!category.available}
                  onClick={category.onStart}
                >
                  {category.available ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Egzersize Başla
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Yakında Geliyor
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Highlight Card */}
      <Card className="card-enhanced bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20 mb-8">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl text-primary">
              🎮 Hafıza Oyunu - İlerlemeli Seviye Sistemi!
            </CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            Hafıza oyunu artık 4 farklı zorluk seviyesine sahip. Her seviyeyi tamamladığınızda 
            otomatik olarak bir sonrakine geçeceksiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-3 text-primary">Seviye Detayları:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Seviye 1: 2x4 grid (8 kart) - Başlangıç</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Seviye 2: 3x4 grid (12 kart) - Kolay</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Seviye 3: 4x4 grid (16 kart) - Orta</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Seviye 4: 4x5 grid (20 kart) - Zor</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-primary">Özellikler:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Her seviye başında kartları inceleme süresi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Detaylı performans takibi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Otomatik seviye ilerlemesi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>İstatistik ve analiz raporları</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Notice */}
      <Card className="card-enhanced bg-muted/50 border-border/50">
        <CardContent className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
            <Brain className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Diğer Egzersizler Geliştiriliyor</h3>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Bilimsel araştırmalara dayalı daha fazla egzersiz yakında eklenecek.
            Her yeni egzersiz, farklı bilişsel becerileri hedefleyecek şekilde tasarlanmaktadır.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default EgzersizlerSayfasi
