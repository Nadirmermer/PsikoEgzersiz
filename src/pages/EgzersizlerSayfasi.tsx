import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LocalStorageManager, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { Brain, Target, Play, Clock, Trophy, CheckCircle, Star, ArrowRightLeft, Eye, Layers, Hash, Palette, BookOpen, Calculator, Sparkles } from 'lucide-react'
import logo from '/public/logo.png';

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
      id: 'memory-game',
      title: 'Hafıza Oyunu',
      description: 'Kısa süreli hafızanızı güçlendirin',
      motto: 'Eşleştir ve hatırla',
      icon: Brain,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-900/30 dark:to-purple-900/40',
      bgPattern: 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
      borderColor: 'border-blue-200/60 dark:border-blue-800/60',
      accentColor: 'bg-blue-500',
      available: true,
      onStart: onMemoryGameStart,
      currentProgress: `Seviye ${currentLevel}`,
      stats: {
        completed: currentLevel - 1,
        total: MEMORY_GAME_LEVELS.length,
        percentage: progressPercentage
      },
      highlights: ['Seviyeli İlerleme', 'Görsel Hafıza']
    },
    {
      id: 'image-word-matching',
      title: 'Resim-Kelime',
      description: 'Görseli doğru kelimeyle eşleştirin',
      motto: 'Gör ve tanı',
      icon: Eye,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-900/30 dark:to-teal-900/40',
      bgPattern: 'radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, transparent 70%)',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/60',
      accentColor: 'bg-emerald-500',
      available: true,
      onStart: onImageWordMatchingStart,
      currentProgress: '15 Çeşitli Soru',
      highlights: ['Görsel Tanıma', 'Hızlı Düşünme']
    },
    {
      id: 'word-image-matching',
      title: 'Kelime-Resim',
      description: 'Kelimeyi doğru görselle eşleştirin',
      motto: 'Düşün ve eşleştir',
      icon: ArrowRightLeft,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      bgGradient: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/40 dark:via-sky-900/30 dark:to-blue-900/40',
      bgPattern: 'radial-gradient(circle at 70% 30%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), linear-gradient(45deg, rgba(14, 165, 233, 0.1) 0%, transparent 60%)',
      borderColor: 'border-cyan-200/60 dark:border-cyan-800/60',
      accentColor: 'bg-cyan-500',
      available: true,
      onStart: onWordImageMatchingStart,
      currentProgress: '15 Çeşitli Soru',
      highlights: ['Kelime Anlama', 'Görsel İlişki']
    },
    {
      id: 'tower-of-london',
      title: 'Londra Kulesi',
      description: 'Planlama ve strateji geliştirin',
      motto: 'Planla ve çöz',
      icon: Layers,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/40 dark:via-violet-900/30 dark:to-indigo-900/40',
      bgPattern: 'radial-gradient(circle at 60% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
      borderColor: 'border-purple-200/60 dark:border-purple-800/60',
      accentColor: 'bg-purple-500',
      available: true,
      onStart: onTowerOfLondonStart,
      currentProgress: '15 Artan Seviye',
      highlights: ['Strateji', 'Problem Çözme']
    },
    {
      id: 'number-sequence',
      title: 'Sayı Dizisi',
      description: 'Sayı dizilerini hatırlayın',
      motto: 'Sırayla hatırla',
      icon: Hash,
      iconColor: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/40 dark:via-amber-900/30 dark:to-yellow-900/40',
      bgPattern: 'radial-gradient(circle at 40% 60%, rgba(251, 146, 60, 0.15) 0%, transparent 50%), linear-gradient(225deg, rgba(245, 158, 11, 0.1) 0%, transparent 65%)',
      borderColor: 'border-orange-200/60 dark:border-orange-800/60',
      accentColor: 'bg-orange-500',
      available: true,
      onStart: onNumberSequenceStart,
      currentProgress: 'Sonsuz Seviye',
      highlights: ['Sıralı Hafıza', 'Dikkat']
    },
    {
      id: 'color-sequence',
      title: 'Renk Dizisi',
      description: 'Renk sıralarını takip edin',
      motto: 'Renkleri hatırla',
      icon: Palette,
      iconColor: 'text-pink-600 dark:text-pink-400',
      bgGradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 dark:from-pink-950/40 dark:via-rose-900/30 dark:to-red-900/40',
      bgPattern: 'radial-gradient(circle at 80% 40%, rgba(236, 72, 153, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 70%, rgba(244, 63, 94, 0.15) 0%, transparent 50%)',
      borderColor: 'border-pink-200/60 dark:border-pink-800/60',
      accentColor: 'bg-pink-500',
      available: true,
      onStart: onColorSequenceStart,
      currentProgress: 'Sonsuz Seviye',
      highlights: ['Görsel Hafıza', 'Simon Oyunu']
    },
    {
      id: 'word-circle-puzzle',
      title: 'Kelime Çemberi',
      description: 'Harfleri birleştirerek kelime bulun',
      motto: 'Çember kuralları',
      icon: BookOpen,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgGradient: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 dark:from-indigo-950/40 dark:via-blue-900/30 dark:to-slate-900/40',
      bgPattern: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), linear-gradient(165deg, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
      borderColor: 'border-indigo-200/60 dark:border-indigo-800/60',
      accentColor: 'bg-indigo-500',
      available: true,
      onStart: onWordCirclePuzzleStart,
      currentProgress: '7 Seviye',
      highlights: ['Kelime Oyunu', 'Bonus Sistem']
    },
    {
      id: 'logic-sequences',
      title: 'Mantık Dizileri',
      description: 'Sayısal örüntüleri keşfedin',
      motto: 'Mantık kuralları',
      icon: Calculator,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgGradient: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-lime-50 dark:from-amber-950/40 dark:via-yellow-900/30 dark:to-lime-900/40',
      bgPattern: 'radial-gradient(circle at 30% 70%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(163, 163, 163, 0.1) 0%, transparent 50%)',
      borderColor: 'border-amber-200/60 dark:border-amber-800/60',
      accentColor: 'bg-amber-500',
      available: true,
      onStart: onLogicSequencesStart,
      currentProgress: 'Sonsuz Soru',
      highlights: ['Matematik', 'Örüntü Tanıma']
    }
  ]

  return (
    <div className="container mx-auto section-padding pb-28 max-w-7xl">
      {/* Hero Section - Modern ve kompakt */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150 animate-pulse" />
          <div className="relative w-20 h-20 flex items-center justify-center shadow-lg rounded-full bg-white border-4 border-primary/30">
            <img src={logo} alt="Maskot Beyin" className="w-16 h-16 object-contain" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg font-semibold text-primary">Merhaba! Ben sizin bilişsel maskotunuzum 🧠🌱</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
          Bilişsel Egzersizler
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
          Zihin sağlığınızı destekleyen bilimsel egzersizlerle beyin gücünüzü artırın
        </p>

        {/* Kompakt istatistikler */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>8 Egzersiz</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Bilimsel</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="w-4 h-4 text-warning" />
            <span>İlerleme Takibi</span>
          </div>
        </div>
      </div>

      {/* Modern Grid Layout - Egzersiz Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
        {exerciseCategories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <Card 
              key={category.id} 
              className={`card-enhanced interactive-lift relative overflow-hidden ${category.bgGradient} ${category.borderColor} group transition-all duration-500 hover:shadow-xl border-2 h-full`}
              style={{ backgroundImage: category.bgPattern }}
              role="article"
              aria-labelledby={`exercise-${category.id}-title`}
            >
              {/* Status Badge - Küçük ve zarif */}
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-success/15 text-success border-success/30 font-medium text-xs px-2 py-1 shadow-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aktif
                </Badge>
              </div>

              {/* Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${category.accentColor}`} />

              <CardHeader className="pb-3 pt-4">
                {/* Icon and Title */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl bg-background/80 backdrop-blur-sm shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${category.iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle 
                      id={`exercise-${category.id}-title`}
                      className="text-lg mb-1 group-hover:text-primary transition-colors duration-300 leading-tight truncate"
                    >
                      {category.title}
                    </CardTitle>
                    <p className="text-xs text-primary/70 font-medium mb-1">{category.motto}</p>
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground/90 line-clamp-2">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                
                {/* Progress Section - Sadece hafıza oyunu için detaylı */}
                {category.stats ? (
                  <div className="bg-background/70 backdrop-blur-sm rounded-lg p-3 border border-border/30 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        İlerleme
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {category.stats.completed}/{category.stats.total}
                      </span>
                    </div>
                    
                    <Progress 
                      value={category.stats.percentage} 
                      className="h-1.5 mb-2"
                      aria-label={`İlerleme: ${category.stats.percentage.toFixed(0)}%`}
                    />
                    
                    <span className="text-xs text-muted-foreground">
                      {category.currentProgress}
                    </span>
                  </div>
                ) : (
                  <div className="bg-background/70 backdrop-blur-sm rounded-lg p-3 border border-border/30 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Hazır
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.currentProgress}
                    </span>
                  </div>
                )}

                {/* Highlights - kompakt */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {category.highlights.map((highlight, highlightIndex) => (
                    <Badge 
                      key={highlightIndex}
                      variant="outline"
                      className="text-xs bg-background/60 hover:bg-background/80 transition-colors duration-200 px-2 py-0.5 h-6"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                {/* Action Button - kompakt */}
                <Button 
                  className="w-full font-semibold text-sm py-2 h-9 transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-[1.02] focus:scale-[1.02]"
                  onClick={category.onStart}
                  aria-label={`${category.title} egzersizine başla`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Başla
                </Button>
              </CardContent>

              {/* Hover efekti */}
              <div className="absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bilgi kartı - çok kompakt */}
      <Card className="card-enhanced bg-muted/30 border-border/50 text-center py-6">
        <CardContent className="py-0">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted/50 rounded-xl mb-3">
            <Brain className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">8 Aktif Egzersiz Hazır!</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            Bilişsel performansınızı artırmak için tasarlanmış 8 farklı egzersiz türü.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default EgzersizlerSayfasi
