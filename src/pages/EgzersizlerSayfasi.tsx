import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LocalStorageManager, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { Brain, Target, Play, Clock, Trophy, CheckCircle, Star, ArrowRightLeft, Eye, Layers, Hash, Palette, BookOpen, Calculator, Sparkles } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'

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
  const { playSound } = useAudio()
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
      onStart: () => {
        playSound('button-click')
        onMemoryGameStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onImageWordMatchingStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onWordImageMatchingStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onTowerOfLondonStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onNumberSequenceStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onColorSequenceStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onWordCirclePuzzleStart()
      },
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
      onStart: () => {
        playSound('button-click')
        onLogicSequencesStart()
      },
      currentProgress: 'Sonsuz Soru',
      highlights: ['Matematik', 'Örüntü Tanıma']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Mobile-First Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="relative px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          {/* Compact Mobile Header */}
          <div className="text-center space-y-4 animate-fade-in">
            {/* Compact Mobile Mascot */}
            <div className="relative inline-flex items-center justify-center mb-1">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Bilişsel Asistan" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain" 
                />
              </div>
            </div>

            {/* Main Title - Mobile Optimized */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight px-4">
                Bilişsel Egzersizler
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-6 leading-relaxed">
                Beyin gücünüzü artıran <span className="font-medium text-primary">8 bilimsel egzersiz</span>
              </p>
            </div>

            {/* Mobile Stats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 px-4">
              <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                <span>8 Egzersiz</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Bilimsel</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium">
                <Trophy className="w-3 h-3" />
                <span>İlerleme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Exercise Grid */}
      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {exerciseCategories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <Card 
                key={category.id} 
                className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                onMouseEnter={() => playSound('button-hover')}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  backgroundImage: `linear-gradient(135deg, ${category.bgGradient.includes('blue') ? 'rgba(59, 130, 246, 0.03)' : 
                    category.bgGradient.includes('emerald') ? 'rgba(16, 185, 129, 0.03)' :
                    category.bgGradient.includes('cyan') ? 'rgba(6, 182, 212, 0.03)' :
                    category.bgGradient.includes('purple') ? 'rgba(147, 51, 234, 0.03)' :
                    category.bgGradient.includes('orange') ? 'rgba(251, 146, 60, 0.03)' :
                    category.bgGradient.includes('pink') ? 'rgba(236, 72, 153, 0.03)' :
                    category.bgGradient.includes('indigo') ? 'rgba(99, 102, 241, 0.03)' :
                    'rgba(245, 158, 11, 0.03)'} 0%, transparent 100%)`
                }}
                role="button"
                tabIndex={0}
                onClick={category.onStart}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    category.onStart();
                  }
                }}
                aria-label={`${category.title} egzersizine başla`}
              >
                {/* Mobile Status Indicator */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                </div>

                {/* Color Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${category.accentColor} opacity-60`} />

                <CardContent className="p-4 sm:p-5">
                  {/* Mobile-Optimized Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${category.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {category.title}
                      </h3>
                      <p className="text-xs text-primary/70 font-medium mb-1">{category.motto}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Mobile Progress Display */}
                  {category.stats ? (
                    <div className="bg-background/40 backdrop-blur-sm rounded-xl p-3 mb-4 border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Seviye {category.stats.completed + 1}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {category.stats.completed}/{category.stats.total}
                        </span>
                      </div>
                      <Progress 
                        value={category.stats.percentage} 
                        className="h-1.5"
                        aria-label={`İlerleme: ${category.stats.percentage.toFixed(0)}%`}
                      />
                    </div>
                  ) : (
                    <div className="bg-background/40 backdrop-blur-sm rounded-xl p-3 mb-4 border border-border/30">
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{category.currentProgress}</span>
                      </div>
                    </div>
                  )}

                  {/* Mobile Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {category.highlights.slice(0, 2).map((highlight, highlightIndex) => (
                      <Badge 
                        key={highlightIndex}
                        variant="outline"
                        className="text-xs bg-background/50 border-border/50 px-2 py-0.5 h-5"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>

                  {/* Mobile CTA Button */}
                  <Button 
                    className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound('button-click');
                      category.onStart();
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Başla
                  </Button>
                </CardContent>

                {/* Mobile Hover Effect */}
                <div className="absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-4 translate-x-4" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Assistant Message Card */}
        <div className="mt-6 mb-4">
          <Card className="bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 backdrop-blur-sm border border-primary/20 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full border border-primary/30 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="Asistan" 
                    className="w-6 h-6 object-contain" 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👋</span>
                    <span className="text-base font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      Merhaba!
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ben sizin <span className="font-semibold text-primary">bilişsel asistanınızım</span>. 
                    Size 8 farklı egzersiz türü ile beyin gücünüzü geliştirmenizde yardımcı olacağım! 🧠✨
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 text-center">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-success">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="font-medium">8 Aktif Egzersiz</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1.5 text-primary">
                  <Brain className="w-3 h-3" />
                  <span className="font-medium">Bilimsel Temelli</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EgzersizlerSayfasi
