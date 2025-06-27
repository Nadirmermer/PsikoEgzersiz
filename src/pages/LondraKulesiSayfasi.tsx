import React from 'react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { TOWER_OF_LONDON_CONFIG } from '../components/GameEngine/gameConfigs'
import { useTowerOfLondonGame } from '../hooks/useTowerOfLondon'
import { Target, Move, Building, Timer, MapPin, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { useAudio } from '@/hooks/useAudio'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { uiStyles } from '@/lib/utils'

interface LondraKulesiSayfasiProps {
  onBack: () => void
}

// Gerçek Londra Kulesi Test Problemleri - Kule kapasitelerine uygun düzenlenmiş
const TOWER_PROBLEMS = [
  // Seviye 1-5: Temel Seviyeler (1-3 hamle) - KAPASİTE KURALI: [3,2,1]
  { 
    id: 1,
    initial: [['K'], ['Y'], []], 
    target: [['K'], [], ['Y']], 
    minMoves: 1,
    difficulty: 'Çok Kolay',
    description: "Yeşil topu sağ kuleye taşıyın"
  },
  { 
    id: 2,
    initial: [['K'], ['Y'], []], 
    target: [['K', 'Y'], [], []], 
    minMoves: 1,
    difficulty: 'Kolay',
    description: "Yeşili kırmızının üzerine taşıyın"
  },
  { 
    id: 3,
    initial: [['K'], [], ['M']], 
    target: [[], ['K'], ['M']], 
    minMoves: 1,
    difficulty: 'Kolay',
    description: "Kırmızıyı orta kuleye taşıyın"
  },
  { 
    id: 4,
    initial: [['K', 'Y'], [], []], 
    target: [[], ['K'], ['Y']], 
    minMoves: 2,
    difficulty: 'Kolay-Orta',
    description: "İki topu ayrı kulelere yerleştirin"
  },
  { 
    id: 5,
    initial: [['K'], ['Y'], []], 
    target: [[], ['Y'], ['K']], 
    minMoves: 2,
    difficulty: 'Orta',
    description: "Topları yer değiştirin"
  },

  // Seviye 6-10: Orta Seviyeler (3-4 hamle)
  { 
    id: 6,
    initial: [['K', 'Y'], [], ['M']], 
    target: [['M'], ['K'], ['Y']], 
    minMoves: 3,
    difficulty: 'Orta',
    description: "Topları yeniden düzenleyin"
  },
  { 
    id: 7,
    initial: [[], ['K', 'Y'], []], 
    target: [['Y'], [], ['K']], 
    minMoves: 2,
    difficulty: 'Orta',
    description: "Döngüsel değiştirme"
  },
  { 
    id: 8,
    initial: [['K'], ['Y'], ['M']], 
    target: [[], ['M'], ['K']], 
    minMoves: 3,
    difficulty: 'Orta-Zor',
    description: "Karmaşık yeniden düzenleme"
  },
  { 
    id: 9,
    initial: [['K', 'Y'], [], []], 
    target: [['Y'], [], ['K']], 
    minMoves: 2,
    difficulty: 'Zor',
    description: "Ters sıralama hamlesi"
  },
  { 
    id: 10,
    initial: [[], ['K'], ['Y']], 
    target: [['K'], [], ['Y']], 
    minMoves: 1,
    difficulty: 'Zor',
    description: "Strateji planlama"
  },

  // Seviye 11-15: İleri Seviyeler (4-5 hamle)
  { 
    id: 11,
    initial: [['K'], ['Y'], ['M']], 
    target: [['M'], ['K'], ['Y']], 
    minMoves: 3,
    difficulty: 'Zor',
    description: "Tam döngüsel değişim"
  },
  { 
    id: 12,
    initial: [['K', 'Y', 'M'], [], []], 
    target: [[], ['K'], ['M']], 
    minMoves: 3,
    difficulty: 'Çok Zor',
    description: "Üçlü yığını dağıtma"
  },
  { 
    id: 13,
    initial: [[], ['K', 'Y'], []], 
    target: [['M'], [], ['K']], 
    minMoves: 2,
    difficulty: 'Çok Zor',
    description: "Karmaşık kombinasyon"
  },
  { 
    id: 14,
    initial: [['K'], ['Y'], []], 
    target: [['Y'], ['K'], []], 
    minMoves: 2,
    difficulty: 'Uzman',
    description: "Uzman seviye strateji"
  },
  { 
    id: 15,
    initial: [['K', 'Y'], [], ['M']], 
    target: [[], ['Y'], ['K']], 
    minMoves: 2,
    difficulty: 'Uzman',
    description: "Çok boyutlu planlama"
  },

  // Seviye 16-20: Uzman Seviyeler (5-6 hamle)
  { 
    id: 16,
    initial: [[], ['K', 'Y'], ['M']], 
    target: [['M'], ['Y'], ['K']], 
    minMoves: 3,
    difficulty: 'Profesyonel',
    description: "Üçlü ayrıştırma"
  },
  { 
    id: 17,
    initial: [['K'], ['Y'], ['M']], 
    target: [['Y'], [], ['K']], 
    minMoves: 3,
    difficulty: 'Profesyonel',
    description: "Çapraz geçiş uzman"
  },
  { 
    id: 18,
    initial: [['K', 'Y'], [], ['M']], 
    target: [[], ['K'], ['M']], 
    minMoves: 2,
    difficulty: 'Master',
    description: "Master seviye problem"
  },
  { 
    id: 19,
    initial: [[], ['K'], ['Y']], 
    target: [['M'], ['Y'], []], 
    minMoves: 2,
    difficulty: 'Master',
    description: "Karmaşık master çözümü"
  },
  { 
    id: 20,
    initial: [['K', 'Y'], [], ['M']], 
    target: [['M'], ['K'], []], 
    minMoves: 3,
    difficulty: 'Grandmaster',
    description: "🏆 GRANDMASTER 🏆"
  },

  // Seviye 21-30: Legendary Seviyeler (6+ hamle)
  { 
    id: 21,
    initial: [[], ['K', 'Y'], []], 
    target: [['K'], [], ['Y']], 
    minMoves: 2,
    difficulty: 'Legendary',
    description: "Legendary seviye başlangıç"
  },
  { 
    id: 22,
    initial: [['K'], ['Y'], ['M']], 
    target: [[], ['K'], ['M']], 
    minMoves: 2,
    difficulty: 'Legendary',
    description: "7-hamle legendary"
  },
  { 
    id: 23,
    initial: [['K', 'Y'], [], ['M']], 
    target: [['M'], ['K'], []], 
    minMoves: 3,
    difficulty: 'Legendary',
    description: "Maksimum karmaşıklık"
  },
  { 
    id: 24,
    initial: [[], ['K'], ['Y']], 
    target: [['Y'], ['K'], []], 
    minMoves: 2,
    difficulty: 'Ultimate',
    description: "Ultimate challenge"
  },
  { 
    id: 25,
    initial: [['K', 'Y'], [], ['M']], 
    target: [['M'], [], ['K']], 
    minMoves: 2,
    difficulty: 'Ultimate',
    description: "🎯 ULTIMATE MASTER 🎯"
  },

  // Seviye 26-30: Mythical Levels - Kapasiteye uygun
  { 
    id: 26,
    initial: [[], ['K', 'Y'], []], 
    target: [['M'], [], ['Y']], 
    minMoves: 2,
    difficulty: 'Impossible',
    description: "Impossible Level 1"
  },
  { 
    id: 27,
    initial: [['K'], [], ['Y']], 
    target: [['Y'], ['K'], []], 
    minMoves: 2,
    difficulty: 'Impossible',
    description: "Impossible Level 2"
  },
  { 
    id: 28,
    initial: [['K', 'Y'], [], ['M']], 
    target: [[], ['Y'], ['K']], 
    minMoves: 2,
    difficulty: 'Mythical',
    description: "Mythical Level 1"
  },
  { 
    id: 29,
    initial: [[], ['K', 'Y'], []], 
    target: [['K'], [], ['Y']], 
    minMoves: 2,
    difficulty: 'Mythical',
    description: "Mythical Level 2"
  },
  { 
    id: 30,
    initial: [['K'], ['Y'], ['M']], 
    target: [['M'], [], ['K']], 
    minMoves: 3,
    difficulty: 'Divine',
    description: "💎 DIVINE MASTER 💎"
  }
]

// Tower Komponenti - Kapasiteye Göre Boyutlanan Responsive Tasarım - Optimizasyonlu
const Tower: React.FC<{
  index: number
  balls: string[]
  isSelected: boolean
  onClick: () => void
  label: string
  isTarget?: boolean
  maxHeight: number
}> = React.memo(({ index, balls, isSelected, onClick, label, isTarget = false, maxHeight }) => {
  
  const getBallColor = (color: string) => {
    switch(color) {
      case 'K': return 'bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-red-500/30'
      case 'Y': return 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/30'
      case 'M': return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/30'
      default: return 'bg-gray-400'
    }
  }

  const getBallName = (color: string) => {
    switch(color) {
      case 'K': return 'Kırmızı'
      case 'Y': return 'Yeşil'
      case 'M': return 'Mavi'
      default: return color
    }
  }

  // Kapasiteye göre boyutlama - Kule yüksekliği = top kapasitesi × top yüksekliği
  const ballBaseHeight = 10 // Her topun temel yüksekliği (w-10 h-10 için)
  
  const getTowerSizes = (capacity: number) => {
    // Kule yüksekliği tam olarak kaç top alabileceği kadar olacak
    const towerHeightInBalls = capacity
    
    switch(capacity) {
      case 3: // 3 top kapasiteli - 3 top yüksekliğinde çubuk
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[120px] sm:h-[144px] md:h-[168px]', // 3 × top boyutu
          towerWidth: 'w-3 sm:w-4 md:w-5',
          baseWidth: 'w-20 sm:w-24 md:w-28'
        }
      case 2: // 2 top kapasiteli - 2 top yüksekliğinde çubuk
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[80px] sm:h-[96px] md:h-[112px]', // 2 × top boyutu
          towerWidth: 'w-2.5 sm:w-3 md:w-4',
          baseWidth: 'w-16 sm:w-20 md:w-24'
        }
      case 1: // 1 top kapasiteli - 1 top yüksekliğinde çubuk
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[40px] sm:h-[48px] md:h-[56px]', // 1 × top boyutu
          towerWidth: 'w-2 sm:w-2.5 md:w-3',
          baseWidth: 'w-12 sm:w-16 md:w-20'
        }
      default:
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[80px] sm:h-[96px] md:h-[112px]',
          towerWidth: 'w-2.5 sm:w-3 md:w-4',
          baseWidth: 'w-16 sm:w-20 md:w-24'
        }
    }
  }

  const { ballSize, towerHeight, towerWidth, baseWidth } = getTowerSizes(maxHeight)

  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-3">
      {/* Kule Etiketi - Responsive */}
      <div className={`font-medium px-2 py-1 sm:px-3 sm:py-2 rounded-full transition-all duration-300 text-xs sm:text-sm ${
        isTarget 
          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold shadow-lg shadow-green-500/30'
          : isSelected
          ? 'bg-primary text-white'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }`}>
        {label}
      </div>

      {/* Maksimum kapasite göstergesi - Kapasiteye göre renkli */}
      <div className={`text-xs font-semibold ${
        maxHeight === 3 
          ? 'text-blue-600' 
          : maxHeight === 2 
          ? 'text-orange-600' 
          : 'text-red-600'
      }`}>
        Max: {maxHeight} top
      </div>

      {/* Kule Yapısı - Kapasiteye göre boyutlanan */}
      <div 
        className={`
          relative transition-all duration-300 cursor-pointer flex flex-col items-center
          touch-manipulation select-none focus:outline-none focus:ring-4 focus:ring-primary/50
          active:scale-95 tablet:hover:scale-102 min-h-[44px] min-w-[44px]
          tablet:min-h-[64px] tablet:min-w-[64px]
          ${isSelected ? 'scale-105' : 'hover:scale-102'}
        `}
        onClick={onClick}
        onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
        style={{ touchAction: 'manipulation' }}
      >
        {/* Ana Çubuk - Kapasiteye göre boyutlanan */}
        <div className={`
          ${towerWidth} ${towerHeight} rounded-t-lg transition-all duration-300 shadow-lg z-10
          ${isSelected 
            ? 'bg-gradient-to-t from-primary to-primary/80 shadow-primary/50' 
            : isTarget
            ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-green-500/50'
            : maxHeight === 3
            ? 'bg-gradient-to-t from-blue-500 to-blue-400 shadow-blue-500/30 hover:from-blue-600 hover:to-blue-500'
            : maxHeight === 2
            ? 'bg-gradient-to-t from-orange-500 to-orange-400 shadow-orange-500/30 hover:from-orange-600 hover:to-orange-500'
            : 'bg-gradient-to-t from-red-500 to-red-400 shadow-red-500/30 hover:from-red-600 hover:to-red-500'
          }
        `} />

        {/* Toplar - Kapasiteye göre boyutlanan */}
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
          {balls.map((ballColor, ballIndex) => (
            <div
              key={ballIndex}
              className={`
                ${ballSize} rounded-full mb-0.5 sm:mb-1 border-2 border-white/50 transition-all duration-300 
                flex items-center justify-center shadow-lg
                ${getBallColor(ballColor)}
                ${isSelected && ballIndex === balls.length - 1 ? 'scale-110' : ''}
              `}
              title={getBallName(ballColor)}
            >
              <span className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">
                {ballColor}
              </span>
            </div>
          ))}
        </div>

        {/* Base Platform - Kapasiteye göre boyutlanan */}
        <div className={`
          ${baseWidth} h-2 sm:h-3 rounded-lg transition-all duration-300 -mt-1 z-5
          ${isSelected 
            ? 'bg-primary/20 shadow-lg shadow-primary/30' 
            : isTarget
            ? 'bg-green-400/30 shadow-lg shadow-green-400/30'
            : maxHeight === 3
            ? 'bg-blue-400/30 shadow-lg shadow-blue-400/30'
            : maxHeight === 2
            ? 'bg-orange-400/30 shadow-lg shadow-orange-400/30'
            : 'bg-red-400/30 shadow-lg shadow-red-400/30'
          }
        `} />
      </div>
    </div>
  )
})

// Performans için displayName ekliyoruz
Tower.displayName = 'Tower'

// Ana Oyun Komponenti
const TowerOfLondonGame: React.FC = () => {
  // Error handling states
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  
  const [currentLevel, setCurrentLevel] = React.useState(1)
  const [towers, setTowers] = React.useState<string[][]>([[], [], []])
  const [selectedTower, setSelectedTower] = React.useState<number | null>(null)
  const [moves, setMoves] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [startTime, setStartTime] = React.useState<number | null>(null)
  const [planningTime, setPlanningTime] = React.useState(0)
  const { playSound } = useAudio()
  
  // Error recovery function
  const recoverFromError = React.useCallback(() => {
    setError(null)
    setIsLoading(false)
    initializeLevel(1) // Restart from level 1
  }, [])
  
  const currentProblem = TOWER_PROBLEMS[currentLevel - 1] || TOWER_PROBLEMS[0]
  const maxTowerHeights = [3, 2, 1] // Sol: 3 top, Orta: 2 top, Sağ: 1 top (Gerçek Londra Kulesi kuralı)

  // Seviye başlatma
  const initializeLevel = React.useCallback((level: number) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const problem = TOWER_PROBLEMS[level - 1] || TOWER_PROBLEMS[0]
      
      if (!problem) {
        throw new Error(`Seviye ${level} bulunamadı`)
      }
      
      setCurrentLevel(level)
      setTowers(problem.initial.map(tower => [...tower]))
      setSelectedTower(null)
      setMoves(0)
      setIsCompleted(false)
      setStartTime(null)
      setPlanningTime(0)
      
      setIsLoading(false)
    } catch (err) {
      console.error('Level initialization error:', err)
      setError(`Seviye ${level} yüklenirken hata oluştu. Lütfen tekrar deneyin.`)
      setIsLoading(false)
    }
  }, [])

  // İlk seviyeyi başlat
  React.useEffect(() => {
    initializeLevel(1)
  }, [initializeLevel])

  // İlk hamle zamanını kaydet (planlama süresi ölçümü - önemli!)
  const recordFirstMove = () => {
    if (startTime === null) {
      const now = Date.now()
      setStartTime(now)
    }
  }

  // Seviye tamamlama kontrolü
  const checkCompletion = React.useCallback(() => {
    const target = currentProblem.target
    const isComplete = towers.every((tower, index) => 
      tower.length === target[index].length && 
      tower.every((ball, ballIndex) => ball === target[index][ballIndex])
    )
    return isComplete
  }, [towers, currentProblem.target])

  // Seviye tamamlama - otomatik geçiş
  React.useEffect(() => {
    if (checkCompletion() && !isCompleted) {
      setIsCompleted(true)
      
      // Planlama süresini hesapla (Londra Kulesi testinde önemli metrik)
      const finalPlanningTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
      setPlanningTime(finalPlanningTime)
      
      // Tamamlama sesi ve değerlendirme
      playSound('level-up')
      
      // Performans değerlendirmesi (bilimsel temelli)
      if (moves === currentProblem.minMoves) {
        toast.success('🏆 Mükemmel! Optimal çözüm!')
      } else if (moves <= currentProblem.minMoves + 2) {
        toast.success('👍 Harika! Çok iyi bir çözüm!')
      } else if (moves <= currentProblem.minMoves + 4) {
        toast.success('💪 İyi! Gelişmeye devam!')
      } else {
        toast.success('🎉 Tebrikler! Seviye tamamlandı!')
      }
      
      // 3 saniye sonra otomatik seviye geçişi
      setTimeout(() => {
        if (currentLevel >= 30) {
          toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
        } else {
          const nextLevelNum = currentLevel + 1
          toast.success(`🚀 Seviye ${nextLevelNum} başlıyor!`)
          initializeLevel(nextLevelNum)
        }
      }, 3000)
    }
  }, [towers, isCompleted, moves, currentProblem.minMoves, currentLevel, playSound, initializeLevel, checkCompletion, startTime])

  // Seviyeyi sıfırla
  const restartLevel = () => {
    initializeLevel(currentLevel)
  }

  // Kule tıklama mantığı - Gerçek Londra Kulesi kuralları - Optimizasyonlu
  const handleTowerClick = React.useCallback((towerIndex: number) => {
    try {
      if (isCompleted || error || isLoading) return

      recordFirstMove()

      if (selectedTower === null) {
        // Kule seçimi - sadece top varsa seçilebilir
        if (towers[towerIndex].length > 0) {
          setSelectedTower(towerIndex)
          playSound('button-click')
        }
      } else {
        // Top hareketi
        if (selectedTower === towerIndex) {
          // Aynı kuleye tıklandı, seçimi iptal et
          setSelectedTower(null)
          playSound('button-click')
        } else {
          // Farklı kuleye tıklandı, top taşımaya çalış
          const from = towers[selectedTower]
          const to = towers[towerIndex]
          const maxHeight = maxTowerHeights[towerIndex]
          
          // Gerçek Londra Kulesi kuralı: Her kule farklı maksimum yüksekliğe sahip
          if (from.length > 0 && to.length < maxHeight) {
            // Geçerli hamle
            const newTowers = towers.map(tower => [...tower])
            const ball = newTowers[selectedTower].pop()!
            newTowers[towerIndex].push(ball)
            
            setTowers(newTowers)
            setMoves(prev => prev + 1)
            setSelectedTower(null)
            playSound('correct-answer')
          } else {
            // Geçersiz hamle
            setSelectedTower(null)
            playSound('wrong-answer')
            if (to.length >= maxHeight) {
              toast.error(`Bu kuleye en fazla ${maxHeight} top konabilir!`)
            }
          }
        }
      }
    } catch (err) {
      console.error('Tower click error:', err)
      setError('Hamle sırasında hata oluştu. Lütfen tekrar deneyin.')
    }
  }, [isCompleted, selectedTower, towers, maxTowerHeights, playSound, error, isLoading])

  const towerLabels = ['Büyük Kule', 'Orta Kule', 'Küçük Kule']

    return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4">
      
      {/* Error Display */}
      {error && (
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.error}`}>
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <p className="text-sm sm:text-base text-red-800 dark:text-red-200 font-medium">
                {error}
              </p>
              <button 
                onClick={recoverFromError}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tekrar Dene
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Display */}
      {isLoading && (
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.loading}`}>
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                Seviye yükleniyor...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Game Content - Only show when no error or loading */}
      {!error && !isLoading && (
        <>
          {/* Sadece Seviye Badge'ı - Temiz tasarım */}
          <div className="text-center mb-4">
            <Badge variant="secondary" className="text-sm sm:text-base px-3 py-2 sm:px-4 bg-primary/10 text-primary border-primary/20">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Seviye {currentLevel} - {currentProblem.difficulty}
            </Badge>
          </div>

      {/* Mevcut Durum - Mobile Optimized */}
      <Card className={uiStyles.gameCard.primary}>
        <CardContent className={uiStyles.cardContent.compact}>
          <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700 dark:text-gray-300">
            Mevcut Durum
                </h4>
          <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
            {towers.map((tower, index) => (
              <Tower
                key={index}
                index={index}
                balls={tower}
                isSelected={selectedTower === index}
                onClick={() => handleTowerClick(index)}
                label={towerLabels[index]}
                maxHeight={maxTowerHeights[index]}
              />
            ))}
            </div>
            </CardContent>
          </Card>

      {/* Hedef Durum - Mobile Optimized */}
      <Card className="bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm border-green-200/20 dark:border-green-800/20">
        <CardContent className="p-4 sm:p-6">
          <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-700 dark:text-green-300">
            🎯 Hedef
          </h4>
          <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
            {currentProblem.target.map((tower, index) => (
              <Tower
                key={index}
                index={index}
                balls={tower}
                isSelected={false}
                onClick={() => {}}
                label={towerLabels[index]}
                isTarget={true}
                maxHeight={maxTowerHeights[index]}
                          />
                        ))}
              </div>
            </CardContent>
          </Card>

      {/* Yardım İpuçları */}
      {selectedTower !== null && (
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm border-blue-200/20 dark:border-blue-800/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-700 dark:text-blue-300">
              <Move className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
                <strong>{towerLabels[selectedTower]}</strong> seçili. Topu başka kuleye taşıyın.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tamamlanma mesajı */}
      {isCompleted && (
        <Card className="bg-gradient-to-r from-yellow-100/80 to-orange-100/80 dark:from-yellow-900/40 dark:to-orange-900/40 backdrop-blur-sm border-2 border-yellow-400 dark:border-yellow-600">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="text-3xl sm:text-4xl mb-2">🎉</div>
              <h3 className="text-lg sm:text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                Seviye {currentLevel} Tamamlandı!
              </h3>
              <p className="text-sm sm:text-base text-yellow-700 dark:text-yellow-300 mb-4">
                {moves} hamle ile tamamladınız (Optimal: {currentProblem.minMoves} hamle)
                <br />
                Planlama süresi: {planningTime} saniye
              </p>
              
              {/* Verimlilik gösterici */}
              <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-semibold ${
                  moves === currentProblem.minMoves 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : moves <= currentProblem.minMoves + 2
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {moves === currentProblem.minMoves ? '🏆 Mükemmel!' : moves <= currentProblem.minMoves + 2 ? '👍 İyi!' : '💪 Gelişiyor!'}
                </div>
                </div>

              {/* Seviye geçiş bilgisi */}
              <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                {currentLevel < 30 ? (
                  <p>3 saniye sonra Seviye {currentLevel + 1} başlayacak...</p>
                ) : (
                  <p>🏆 Tüm seviyeler tamamlandı!</p>
                )}
        </div>

              {/* Yeniden oynama butonu */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={restartLevel}
                  className="px-3 py-2 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm"
                >
                  🔄 Bu Seviyeyi Tekrar Oyna
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  )
}

const LondraKulesiSayfasi: React.FC<LondraKulesiSayfasiProps> = ({ onBack }) => {
  return (
    <UniversalGameEngine
      gameConfig={TOWER_OF_LONDON_CONFIG}
      gameHook={useTowerOfLondonGame}
      onBack={onBack}
    >
      <TowerOfLondonGame />
    </UniversalGameEngine>
  )
}

export default LondraKulesiSayfasi