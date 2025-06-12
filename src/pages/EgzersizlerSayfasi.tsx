
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LocalStorageManager, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { Brain, Target, Play, Clock, Trophy, CheckCircle, Star, ArrowRightLeft, Eye, Layers, Hash, Palette, BookOpen, Calculator } from 'lucide-react'

interface EgzersizlerSayfasiProps {
  onMemoryGameStart: () => void
  onImageWordMatchingStart: () => void
  onWordImageMatchingStart: () => void
  onTowerOfLondonStart: () => void
  onNumberSequenceStart: () => void
  onColorSequenceStart: () => void
  onWordCirclePuzzleStart: () => void
  onLogicSequencesStart: () => void
}

const EgzersizlerSayfasi: React.FC<EgzersizlerSayfasiProps> = ({ 
  onMemoryGameStart, 
  onImageWordMatchingStart,
  onWordImageMatchingStart,
  onTowerOfLondonStart,
  onNumberSequenceStart,
  onColorSequenceStart,
  onWordCirclePuzzleStart,
  onLogicSequencesStart
}) => {
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
      available: true,
      onStart: onMemoryGameStart,
      currentProgress: `Seviye ${currentLevel}`,
      stats: {
        completed: currentLevel - 1,
        total: MEMORY_GAME_LEVELS.length,
        percentage: progressPercentage
      },
      highlights: ['Seviyeli İlerleme', 'Görsel Hafıza', 'Eşleştirme']
    },
    {
      title: 'Resim-Kelime Eşleştirme',
      description: 'Görseli doğru kelimeyle eşleştirin',
      icon: Eye,
      iconColor: 'text-primary',
      bgGradient: 'bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15',
      borderColor: 'border-primary/20',
      available: true,
      onStart: onImageWordMatchingStart,
      currentProgress: '15 Soru - Karışık Kategoriler',
      highlights: ['Görsel Tanıma', 'Hızlı Düşünme', 'Kategori Bilgisi']
    },
    {
      title: 'Kelime-Resim Eşleştirme',
      description: 'Kelimeyi doğru görselle eşleştirin',
      icon: ArrowRightLeft,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 dark:from-emerald-950/40 dark:via-green-900/30 dark:to-teal-900/40',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/60',
      available: true,
      onStart: onWordImageMatchingStart,
      currentProgress: '15 Soru - Karışık Kategoriler',
      highlights: ['Kelime Anlama', 'Görsel İlişki', 'Hızlı Karar']
    },
    {
      title: 'Londra Kulesi Testi',
      description: 'Planlama ve strateji geliştirin',
      icon: Layers,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100 dark:from-purple-950/40 dark:via-indigo-900/30 dark:to-violet-900/40',
      borderColor: 'border-purple-200/60 dark:border-purple-800/60',
      available: true,
      onStart: onTowerOfLondonStart,
      currentProgress: '15 Seviye - Artan Zorluk',
      highlights: ['Strateji', 'Problem Çözme', 'Planlama']
    },
    {
      title: 'Sayı Dizisi Takibi',
      description: 'Sayı dizilerini hatırlayın ve tekrarlayın',
      icon: Hash,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      bgGradient: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 dark:from-cyan-950/40 dark:via-blue-900/30 dark:to-sky-900/40',
      borderColor: 'border-cyan-200/60 dark:border-cyan-800/60',
      available: true,
      onStart: onNumberSequenceStart,
      currentProgress: 'Sonsuz Seviye',
      highlights: ['Sıralı Hafıza', 'Dikkat', 'Konsantrasyon']
    },
    {
      title: 'Renk Dizisi Takibi',
      description: 'Renk sıralarını hatırlayın ve tekrarlayın',
      icon: Palette,
      iconColor: 'text-pink-600 dark:text-pink-400',
      bgGradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-100 dark:from-pink-950/40 dark:via-rose-900/30 dark:to-red-900/40',
      borderColor: 'border-pink-200/60 dark:border-pink-800/60',
      available: true,
      onStart: onColorSequenceStart,
      currentProgress: 'Sonsuz Seviye',
      highlights: ['Görsel Hafıza', 'Renk Tanıma', 'Simon Oyunu']
    },
    {
      title: 'Kelime Çemberi Bulmacası',
      description: 'Harfleri birleştirerek kelimeleri bulun',
      icon: BookOpen,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgGradient: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 dark:from-indigo-950/40 dark:via-blue-900/30 dark:to-purple-900/40',
      borderColor: 'border-indigo-200/60 dark:border-indigo-800/60',
      available: true,
      onStart: onWordCirclePuzzleStart,
      currentProgress: '7 Seviye - Bonus Kelimeler',
      highlights: ['Kelime Oyunu', 'WOW Tarzı', 'Bonus Sistem']
    },
    {
      title: 'Mantık Dizileri',
      description: 'Sayısal örüntüleri keşfedin ve tamamlayın',
      icon: Calculator,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-amber-950/40 dark:via-orange-900/30 dark:to-yellow-900/40',
      borderColor: 'border-amber-200/60 dark:border-amber-800/60',
      available: true,
      onStart: onLogicSequencesStart,
      currentProgress: 'Sonsuz Soru - 15 Dizi Türü',
      highlights: ['Matematik', 'Örüntü Tanıma', 'Mantık']
    }
  ]

  return (
    <div className="container mx-auto section-padding pb-28 max-w-7xl">
      {/* Hero Section - Temizlenmiş ve odaklanmış */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          Bilişsel Egzersizler
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Zihin sağlığınızı destekleyen bilimsel egzersizlerle 
          <span className="text-primary font-semibold"> beyin gücünüzü artırın</span>
        </p>

        {/* Özet istatistikler - kompakt */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>8 Egzersiz</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-primary" />
            <span>Bilimsel</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="w-4 h-4 text-warning" />
            <span>İlerleme Takibi</span>
          </div>
        </div>
      </div>

      {/* Egzersiz Kartları Grid - Tutarlı tasarım */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {exerciseCategories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <Card 
              key={index} 
              className={`card-enhanced interactive-lift relative overflow-hidden ${category.bgGradient} ${category.borderColor} group transition-all duration-500 hover:shadow-xl border-2`}
              role="article"
              aria-labelledby={`exercise-${index}-title`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-success/15 text-success border-success/30 font-medium px-2.5 py-1 shadow-sm">
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  Aktif
                </Badge>
              </div>

              <CardHeader className="pb-4">
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-background/80 backdrop-blur-sm shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <IconComponent className={`w-8 h-8 ${category.iconColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <CardTitle 
                      id={`exercise-${index}-title`}
                      className="text-xl mb-2 group-hover:text-primary transition-colors duration-300 leading-tight"
                    >
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground/90">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Progress Section - Sadece hafıza oyunu için */}
                {category.stats && (
                  <div className="bg-background/70 backdrop-blur-sm rounded-lg p-4 border border-border/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-3 h-3" />
                        İlerleme
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {category.stats.completed}/{category.stats.total}
                      </span>
                    </div>
                    
                    <Progress 
                      value={category.stats.percentage} 
                      className="h-2 mb-2"
                      aria-label={`İlerleme: ${category.stats.percentage.toFixed(0)}%`}
                    />
                    
                    <span className="text-xs text-muted-foreground">
                      {category.currentProgress}
                    </span>
                  </div>
                )}

                {/* Diğer egzersizler için sadece bilgi */}
                {!category.stats && (
                  <div className="bg-background/70 backdrop-blur-sm rounded-lg p-4 border border-border/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Egzersiz Bilgi
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.currentProgress}
                    </span>
                  </div>
                )}

                {/* Highlights - kompakt */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {category.highlights.map((highlight, highlightIndex) => (
                    <Badge 
                      key={highlightIndex}
                      variant="outline"
                      className="text-xs bg-background/60 hover:bg-background/80 transition-colors duration-200 px-2 py-1"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Action Button */}
                <Button 
                  className="w-full font-semibold text-sm py-5 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02]"
                  onClick={category.onStart}
                  aria-label={`${category.title} egzersizine başla`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Başla
                </Button>
              </CardContent>

              {/* Hover efekti */}
              <div className="absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bilgi kartı - basitleştirilmiş */}
      <Card className="card-enhanced bg-muted/30 border-border/50 text-center">
        <CardContent className="py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/50 rounded-xl mb-4">
            <Brain className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">8 Aktif Egzersiz Hazır!</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Bilişsel egzersiz platformumuz 8 farklı egzersiz türüyle komplet. 
            Her egzersiz farklı bilişsel becerileri hedefler.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default EgzersizlerSayfasi
