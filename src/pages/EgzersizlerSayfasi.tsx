
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
      exercises: ['Kart Eşleştirme', 'Görsel Hafıza', 'Sıralı Hafıza'],
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
      title: 'Resim-Kelime Eşleştirme',
      description: 'Görseli karşılık gelen kelimeyle eşleştirin',
      icon: Eye,
      iconColor: 'text-primary',
      bgGradient: 'bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15',
      borderColor: 'border-primary/20',
      exercises: ['Emoji-Kelime', 'Görsel Tanıma', 'Kategori Eşleştirme'],
      available: true,
      onStart: onImageWordMatchingStart,
      currentProgress: '15 Soru - Karışık Kategoriler',
      highlights: ['10 Farklı Kategori', 'Akıllı Çeldiriciler', 'Hızlı Değerlendirme']
    },
    {
      title: 'Kelime-Resim Eşleştirme',
      description: 'Kelimeyi karşılık gelen görselle eşleştirin',
      icon: ArrowRightLeft,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 dark:from-emerald-950/40 dark:via-green-900/30 dark:to-teal-900/40',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/60',
      exercises: ['Kelime-Emoji', 'Anlam Eşleştirme', 'Dil Becerileri'],
      available: true,
      onStart: onWordImageMatchingStart,
      currentProgress: '15 Soru - Karışık Kategoriler',
      highlights: ['Görsel İfade', 'Kelime Dağarcığı', 'Anlık Geri Bildirim']
    },
    {
      title: 'Londra Kulesi Testi',
      description: 'Planlama ve problem çözme becerilerinizi geliştirin',
      icon: Layers,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-100 dark:from-purple-950/40 dark:via-indigo-900/30 dark:to-violet-900/40',
      borderColor: 'border-purple-200/60 dark:border-purple-800/60',
      exercises: ['Strateji Planlama', 'Problem Çözme', 'Mantıksal Düşünme'],
      available: true,
      onStart: onTowerOfLondonStart,
      currentProgress: '15 Seviye - Artan Zorluk',
      highlights: ['15 Zorluk Seviyesi', 'Optimal Çözüm Analizi', 'Strateji Geliştirme']
    },
    {
      title: 'Sayı Dizisi Takibi',
      description: 'Sayı dizilerini hatırlayın ve tekrar edin',
      icon: Hash,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      bgGradient: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 dark:from-cyan-950/40 dark:via-blue-900/30 dark:to-sky-900/40',
      borderColor: 'border-cyan-200/60 dark:border-cyan-800/60',
      exercises: ['Sıralı Hafıza', 'Çalışma Belleği', 'Dikkat Kontrolü'],
      available: true,
      onStart: onNumberSequenceStart,
      currentProgress: 'Sonsuz Seviye - 3 Rakamla Başlar',
      highlights: ['Sonsuz İlerleme', 'Gerçek Zamanlı Skor', 'Adaptatif Zorluk']
    },
    {
      title: 'Renk Dizisi Takibi',
      description: 'Renk dizilerini hatırlayın ve tekrar edin',
      icon: Palette,
      iconColor: 'text-pink-600 dark:text-pink-400',
      bgGradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-100 dark:from-pink-950/40 dark:via-rose-900/30 dark:to-red-900/40',
      borderColor: 'border-pink-200/60 dark:border-pink-800/60',
      exercises: ['Görsel Sıralama', 'Renk Hafızası', 'Tekrar Becerileri'],
      available: true,
      onStart: onColorSequenceStart,
      currentProgress: 'Sonsuz Seviye - 2 Renkle Başlar',
      highlights: ['Simon Benzeri', 'Görsel Takip', 'Hafıza Geliştirme']
    },
    {
      title: 'Kelime Çemberi Bulmacası',
      description: 'Harfleri birleştirerek kelimeleri bulun',
      icon: BookOpen,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgGradient: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 dark:from-indigo-950/40 dark:via-blue-900/30 dark:to-purple-900/40',
      borderColor: 'border-indigo-200/60 dark:border-indigo-800/60',
      exercises: ['Kelime Oluşturma', 'Dil Becerileri', 'Örüntü Tanıma'],
      available: true,
      onStart: onWordCirclePuzzleStart,
      currentProgress: 'Çoklu Seviye - Bonus Kelimeler',
      highlights: ['WOW Tarzı Oyun', 'Bonus Sistem', 'Akıcı Animasyonlar']
    },
    {
      title: 'Mantık Dizileri',
      description: 'Sayısal örüntüleri bulun ve dizileri tamamlayın',
      icon: Calculator,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-amber-950/40 dark:via-orange-900/30 dark:to-yellow-900/40',
      borderColor: 'border-amber-200/60 dark:border-amber-800/60',
      exercises: ['Aritmetik Diziler', 'Geometrik Diziler', 'Fibonacci'],
      available: true,
      onStart: onLogicSequencesStart,
      currentProgress: 'Sonsuz Soru - 15 Farklı Örüntü',
      highlights: ['Sayısal Akıl Yürütme', 'Örüntü Tanıma', 'Problem Çözme']
    }
  ]

  return (
    <div className="container mx-auto section-padding pb-28 max-w-7xl">
      {/* Hero Section */}
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
            <span>8 Aktif Egzersiz</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-warning" />
            <span>Tablet Uyumlu</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-primary" />
            <span>Seviye Sistemi</span>
          </div>
        </div>
      </div>

      {/* Egzersiz Kartları Grid */}
      <div className="grid gap-6 lg:grid-cols-2 content-spacing mb-12">
        {exerciseCategories.map((category, index) => {
          const IconComponent = category.icon;
          
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
                <Badge className="bg-success/15 text-success border-success/30 font-semibold px-3 py-1.5 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Aktif
                </Badge>
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
                
                {/* Progress Section for Memory Game */}
                {category.stats && (
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

                {/* Progress Section for Other Exercises */}
                {!category.stats && (
                  <div className="bg-background/70 backdrop-blur-sm rounded-xl p-5 border border-border/30 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Egzersiz Bilgileri
                      </span>
                      <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                        {category.title === 'Mantık Dizileri' ? 'Yeni!' :
                         category.title === 'Kelime Çemberi Bulmacası' ? 'Güncel!' : 
                         ['Sayı Dizisi Takibi', 'Renk Dizisi Takibi'].includes(category.title) ? 'Güncel' : 
                         category.title === 'Londra Kulesi Testi' ? 'Güncel!' : 'Aktif'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">
                        {category.currentProgress}
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
                    <Target className="w-4 h-4" />
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
                  className="w-full font-semibold text-base py-6 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02]"
                  onClick={category.onStart}
                  aria-label={`${category.title} egzersizine başla`}
                >
                  <Play className="w-5 h-5 mr-3" />
                  Egzersize Başla
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

      {/* Feature Highlight - Yeni Mantık Dizileri */}
      <Card className="card-enhanced bg-gradient-to-r from-amber-5 via-amber/8 to-orange/5 border-amber/20 mb-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber/5 to-transparent opacity-50" />
        
        <CardHeader className="relative">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl shadow-sm">
              <Calculator className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-amber-600 mb-2 flex items-center gap-3">
                🧮 Yeni Mantık Dizileri Egzersizi
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-sm px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Yeni!
                </Badge>
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Sayısal akıl yürütme ve örüntü tanıma becerilerinizi geliştiren yeni egzersiz! 
                15 farklı dizi türüyle mantıksal düşünme gücünüzü test edin.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-4 text-amber-600 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Dizi Türleri
              </h4>
              <div className="space-y-3">
                {[
                  'Aritmetik diziler (2, 4, 6, 8...)',
                  'Geometrik diziler (2, 4, 8, 16...)',
                  'Fibonacci dizileri (1, 1, 2, 3, 5...)',
                  'Kare ve küp sayılar (1, 4, 9, 16...)'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-orange-600 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Özellikler
              </h4>
              <div className="space-y-3">
                {[
                  'Sonsuz soru havuzu',
                  '3 zorluk seviyesi (Kolay, Orta, Zor)',
                  'Gerçek zamanlı puan sistemi',
                  'Anlık açıklama ve geri bildirim'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <Star className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Notice */}
      <Card className="card-enhanced bg-muted/30 border-border/50 text-center">
        <CardContent className="py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted/50 rounded-2xl mb-6">
            <Brain className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-3">8 Aktif Egzersiz Hazır!</h3>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
            Bilişsel egzersiz platformumuz artık 8 farklı egzersiz türüyle komplet hale geldi.
            Her egzersiz, farklı bilişsel becerileri hedefleyecek şekilde özenle tasarlanmıştır.
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>8 Aktif Egzersiz</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Bilimsel Temelli</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>İlerleme Takibi</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EgzersizlerSayfasi
