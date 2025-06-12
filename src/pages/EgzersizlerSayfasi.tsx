
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LocalStorageManager, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { Brain, Target, Puzzle, Settings, Play, Clock, Trophy, CheckCircle, Star, Award, Zap } from 'lucide-react'

interface EgzersizlerSayfasiProps {
  onMemoryGameStart: () => void
}

const EgzersizlerSayfasi: React.FC<EgzersizlerSayfasiProps> = ({ onMemoryGameStart }) => {
  const currentLevel = LocalStorageManager.getCurrentMemoryGameLevel()
  const currentLevelData = MEMORY_GAME_LEVELS[currentLevel - 1] || MEMORY_GAME_LEVELS[0]
  const progressPercentage = ((currentLevel - 1) / MEMORY_GAME_LEVELS.length) * 100

  const exerciseCategories = [
    {
      title: 'Hafıza Egzersizleri',
      description: 'Kısa ve uzun süreli hafızanızı güçlendirin',
      icon: Brain,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-100 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-indigo-900/40',
      borderColor: 'border-blue-200/60 dark:border-blue-800/60',
      exercises: ['Kart Eşleştirme', 'Sayı Dizisi', 'Görsel Hafıza'],
      available: true,
      onStart: onMemoryGameStart,
      currentProgress: `Seviye ${currentLevel}: ${currentLevelData.name}`,
      stats: {
        completed: currentLevel - 1,
        total: MEMORY_GAME_LEVELS.length,
        percentage: progressPercentage
      },
      highlights: ['4 Zorluk Seviyesi', 'Otomatik İlerleme', 'Detaylı Analiz']
    },
    {
      title: 'Dikkat Egzersizleri',
      description: 'Odaklanma ve dikkat sürenizi artırın',
      icon: Target,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 dark:from-emerald-950/40 dark:via-green-900/30 dark:to-teal-900/40',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/60',
      exercises: ['Stroop Testi', 'Görsel Arama', 'Sürekli Performans'],
      available: false,
      comingSoon: true,
      highlights: ['Reaksiyon Zamanı', 'Görsel Odak', 'Konsantrasyon']
    },
    {
      title: 'Problem Çözme',
      description: 'Mantıksal düşünme ve problem çözme becerilerinizi geliştirin',
      icon: Puzzle,
      iconColor: 'text-violet-600 dark:text-violet-400',
      bgGradient: 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 dark:from-violet-950/40 dark:via-purple-900/30 dark:to-fuchsia-900/40',
      borderColor: 'border-violet-200/60 dark:border-violet-800/60',
      exercises: ['Matematik Problemleri', 'Mantık Bulmacaları', 'Planlama Görevleri'],
      available: false,
      comingSoon: true,
      highlights: ['Analitik Düşünme', 'Stratejik Planlama', 'Yaratıcılık']
    },
    {
      title: 'Yürütücü Fonksiyonlar',
      description: 'Planlama, organizasyon ve karar verme becerilerinizi güçlendirin',
      icon: Settings,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-amber-950/40 dark:via-orange-900/30 dark:to-yellow-900/40',
      borderColor: 'border-amber-200/60 dark:border-amber-800/60',
      exercises: ['Görev Değiştirme', 'Çalışma Hafızası', 'İnhibisyon Kontrolü'],
      available: false,
      comingSoon: true,
      highlights: ['Karar Verme', 'Çoklu Görev', 'Impulse Kontrolü']
    }
  ]

  return (
    <div className="container mx-auto section-padding pb-28 max-w-7xl">
      {/* Enhanced Hero Section */}
      <div className="text-center mb-16 slide-up">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          Bilişsel Egzersizler
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
          Zihin sağlığınızı destekleyen bilimsel egzersizlerle 
          <span className="text-primary font-semibold"> beyin gücünüzü artırın</span>
        </p>

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 mt-8 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>1 Aktif Egzersiz</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-warning" />
            <span>3 Yakında</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-primary" />
            <span>Seviye Sistemi</span>
          </div>
        </div>
      </div>

      {/* Enhanced Exercise Categories Grid */}
      <div className="grid gap-8 lg:grid-cols-2 content-spacing mb-12">
        {exerciseCategories.map((category, index) => {
          const IconComponent = category.icon;
          const isMemoryGame = category.available;
          
          return (
            <Card 
              key={index} 
              className={`card-enhanced interactive-lift relative overflow-hidden ${category.bgGradient} ${category.borderColor} group transition-all duration-500 hover:shadow-xl`}
              role="article"
              aria-labelledby={`exercise-${index}-title`}
              tabIndex={0}
            >
              {/* Status Badge */}
              <div className="absolute top-6 right-6 z-10">
                {category.available ? (
                  <Badge className="bg-success/15 text-success border-success/30 font-semibold px-3 py-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Aktif
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-semibold px-3 py-1.5 bg-muted/60 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Yakında
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-6 relative">
                {/* Icon and Title */}
                <div className="flex items-start gap-6 mb-6">
                  <div className={`p-4 rounded-2xl bg-background/80 backdrop-blur-sm shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 ring-1 ring-border/20`}>
                    <IconComponent className={`w-10 h-10 ${category.iconColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <CardTitle 
                      id={`exercise-${index}-title`}
                      className="text-2xl mb-3 group-hover:text-primary transition-colors duration-300 leading-tight"
                    >
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground/90">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Progress Section for Active Exercises */}
                {isMemoryGame && category.stats && (
                  <div className="bg-background/70 backdrop-blur-sm rounded-xl p-5 border border-border/30 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        İlerleme Durumu
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {category.stats.completed}/{category.stats.total} Seviye
                      </span>
                    </div>
                    
                    <Progress 
                      value={category.stats.percentage} 
                      className="h-3 mb-3"
                      aria-label={`İlerleme: ${category.stats.percentage.toFixed(0)}%`}
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">
                        {category.currentProgress}
                      </span>
                      <span className="text-primary font-semibold">
                        %{category.stats.percentage.toFixed(0)} Tamamlandı
                      </span>
                    </div>
                  </div>
                )}

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {category.highlights.map((highlight, highlightIndex) => (
                    <Badge 
                      key={highlightIndex}
                      variant="outline"
                      className="text-xs bg-background/60 hover:bg-background/80 transition-colors duration-200 px-2.5 py-1"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-0">
                {/* Exercise Types */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Egzersiz Türleri
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.exercises.map((exercise, exerciseIndex) => (
                      <Badge 
                        key={exerciseIndex}
                        variant="outline"
                        className="text-xs bg-background/40 hover:bg-background/60 transition-colors duration-200 border-border/40 px-3 py-1.5"
                      >
                        {exercise}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Action Button */}
                <Button 
                  className={`w-full font-semibold text-base py-6 transition-all duration-300 ${
                    category.available 
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02]' 
                      : 'opacity-60 cursor-not-allowed bg-muted hover:bg-muted text-muted-foreground'
                  }`}
                  disabled={!category.available}
                  onClick={category.onStart}
                  aria-label={category.available ? `${category.title} egzersizine başla` : `${category.title} yakında geliyor`}
                >
                  {category.available ? (
                    <>
                      <Play className="w-5 h-5 mr-3" />
                      Egzersize Başla
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5 mr-3" />
                      Yakında Geliyor
                    </>
                  )}
                </Button>
              </CardContent>

              {/* Decorative Elements */}
              <div className="absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Feature Highlight */}
      <Card className="card-enhanced bg-gradient-to-r from-primary/5 via-primary/8 to-primary/5 border-primary/20 mb-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />
        
        <CardHeader className="relative">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl shadow-sm">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-primary mb-2 flex items-center gap-3">
                🎮 Hafıza Oyunu - İlerlemeli Seviye Sistemi
                <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                  <Award className="w-3 h-3 mr-1" />
                  Yeni
                </Badge>
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Hafıza oyunu artık 4 farklı zorluk seviyesine sahip. Her seviyeyi başarıyla tamamladığınızda 
                otomatik olarak bir sonrakine geçeceksiniz.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-4 text-primary flex items-center gap-2">
                <Star className="w-5 h-5" />
                Seviye Detayları
              </h4>
              <div className="space-y-3">
                {MEMORY_GAME_LEVELS.map((level, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className={`w-3 h-3 rounded-full ${index < currentLevel - 1 ? 'bg-success' : index === currentLevel - 1 ? 'bg-primary' : 'bg-muted'}`} />
                    <span className={`text-sm ${index < currentLevel ? 'font-semibold' : 'text-muted-foreground'}`}>
                      Seviye {index + 1}: {level.name} ({level.rows}×{level.cols} grid)
                    </span>
                    {index < currentLevel - 1 && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                    {index === currentLevel - 1 && <Play className="w-4 h-4 text-primary ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-primary flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Özellikler
              </h4>
              <div className="space-y-3">
                {[
                  'Her seviye başında kartları inceleme süresi',
                  'Detaylı performans takibi ve analiz',
                  'Otomatik seviye ilerlemesi sistemi',
                  'Kapsamlı istatistik ve gelişim raporları'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Development Notice */}
      <Card className="card-enhanced bg-muted/30 border-border/50 text-center">
        <CardContent className="py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/50 rounded-2xl mb-6">
            <Brain className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-3">Diğer Egzersizler Geliştiriliyor</h3>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
            Bilimsel araştırmalara dayalı daha fazla egzersiz yakında eklenecek.
            Her yeni egzersiz, farklı bilişsel becerileri hedefleyecek şekilde özenle tasarlanmaktadır.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>3 Egzersiz Geliştiriliyor</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Bilimsel Temelli</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EgzersizlerSayfasi
