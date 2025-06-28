import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { TOWER_OF_LONDON_CONFIG } from '../components/GameEngine/gameConfigs'
import { useUniversalGame } from '../hooks/useUniversalGame'
import { useAudio } from '../hooks/useAudio'
import { Target, Move, Building, Timer, MapPin } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { Badge } from '@/components/ui/badge'
import { uiStyles, touchTargetClasses, cn } from '@/lib/utils'
import { GameResult } from '../components/GameEngine/types'

interface LondraKulesiSayfasiProps {
  onBack: () => void
}

// Gerçek Londra Kulesi Test Problemleri - Bilimsel Temelli Progresif Tasarım
// Kapasiteler: Sol Kule[3], Orta Kule[2], Sağ Kule[1] - LONDON TOWER TEST STANDARD
const TOWER_PROBLEMS = [
  // 🟢 BAŞLANGIÇ SEVİYESİ (Seviye 1-5): Temel motor skills ve kuralları öğrenme
  { 
    id: 1,
    initial: [['K'], [], []], 
    target: [[], ['K'], []], 
    minMoves: 1,
    difficulty: 'Çok Kolay'
  },
  { 
    id: 2,
    initial: [['K'], ['Y'], []], 
    target: [[], ['Y'], ['K']], 
    minMoves: 2,
    difficulty: 'Kolay'
  },
  { 
    id: 3,
    initial: [['K'], [], ['Y']], 
    target: [['Y'], [], ['K']], 
    minMoves: 2,
    difficulty: 'Kolay'
  },
  { 
    id: 4,
    initial: [['K', 'Y'], [], []], 
    target: [[], ['K'], ['Y']], 
    minMoves: 2,
    difficulty: 'Kolay-Orta'
  },
  { 
    id: 5,
    initial: [['K'], ['Y'], []], 
    target: [['K', 'Y'], [], []], 
    minMoves: 2,
    difficulty: 'Orta'
  },

  // 🟡 GELİŞİM SEVİYESİ (Seviye 6-10): İki top koordinasyonu ve ara adım planlama
  { 
    id: 6,
    initial: [['K', 'Y'], [], []], 
    target: [['Y'], [], ['K']], 
    minMoves: 3,
    difficulty: 'Orta'
  },
  { 
    id: 7,
    initial: [['K'], ['Y'], ['M']], 
    target: [[], ['Y'], ['K']], 
    minMoves: 3,
    difficulty: 'Orta'
  },
  { 
    id: 8,
    initial: [['K', 'Y'], [], ['M']], 
    target: [['M'], ['Y'], ['K']], 
    minMoves: 4,
    difficulty: 'Orta-Zor'
  },
  { 
    id: 9,
    initial: [['K'], ['Y', 'M'], []], 
    target: [['Y'], [], ['K']], 
    minMoves: 4,
    difficulty: 'Zor'
  },
  { 
    id: 10,
    initial: [['K', 'Y'], ['M'], []], 
    target: [[], ['K'], ['Y']], 
    minMoves: 4,
    difficulty: 'Zor'
  },

  // 🔵 ORTA SEVİYE (Seviye 11-15): Üç top ve kompleks planlama
  { 
    id: 11,
    initial: [['K', 'Y', 'M'], [], []], 
    target: [[], [], ['K']], 
    minMoves: 5,
    difficulty: 'Zor'
  },
  { 
    id: 12,
    initial: [['K'], ['Y'], ['M']], 
    target: [['M', 'Y', 'K'], [], []], 
    minMoves: 5,
    difficulty: 'Çok Zor'
  },
  { 
    id: 13,
    initial: [[], ['K', 'Y'], ['M']], 
    target: [['K'], [], ['Y']], 
    minMoves: 5,
    difficulty: 'Çok Zor'
  },
  { 
    id: 14,
    initial: [['K', 'Y'], ['M'], []], 
    target: [[], ['Y'], ['M']], 
    minMoves: 6,
    difficulty: 'Uzman'
  },
  { 
    id: 15,
    initial: [['K'], ['Y', 'M'], []], 
    target: [['M'], ['K'], ['Y']], 
    minMoves: 6,
    difficulty: 'Uzman'
  },

  // 🟣 İLERİ SEVİYE (Seviye 16-20): Çok adımlı planlama ve inhibition
  { 
    id: 16,
    initial: [['K', 'Y'], [], ['M']], 
    target: [[], ['K', 'Y'], ['M']], 
    minMoves: 6,
    difficulty: 'Profesyonel'
  },
  { 
    id: 17,
    initial: [['K', 'Y', 'M'], [], []], 
    target: [[], ['M'], ['Y']], 
    minMoves: 7,
    difficulty: 'Profesyonel'
  },
  { 
    id: 18,
    initial: [[], ['K', 'Y'], ['M']], 
    target: [['Y', 'M'], [], ['K']], 
    minMoves: 7,
    difficulty: 'Master'
  },
  { 
    id: 19,
    initial: [['K'], ['Y'], ['M']], 
    target: [[], ['M', 'Y'], ['K']], 
    minMoves: 8,
    difficulty: 'Master'
  },
  { 
    id: 20,
    initial: [['K', 'Y'], ['M'], []], 
    target: [['M'], [], ['K']], 
    minMoves: 8,
    difficulty: 'Grandmaster'
  },

  // 🔴 UZMAN SEVİYE (Seviye 21-25): Tower of London mastery
  { 
    id: 21,
    initial: [['K', 'Y', 'M'], [], []], 
    target: [[], ['K'], ['M']], 
    minMoves: 9,
    difficulty: 'Legendary'
  },
  { 
    id: 22,
    initial: [[], ['K', 'Y'], ['M']], 
    target: [['M', 'K'], [], ['Y']], 
    minMoves: 9,
    difficulty: 'Legendary'
  },
  { 
    id: 23,
    initial: [['K'], ['Y', 'M'], []], 
    target: [[], [], ['Y']], 
    minMoves: 10,
    difficulty: 'Legendary'
  },
  { 
    id: 24,
    initial: [['K', 'Y'], [], ['M']], 
    target: [[], ['M', 'K'], ['Y']], 
    minMoves: 10,
    difficulty: 'Son Derece Zor'
  },
  { 
    id: 25,
    initial: [['K'], ['Y'], ['M']], 
    target: [['Y', 'M'], ['K'], []], 
    minMoves: 11,
    difficulty: 'Son Derece Zor'
  },

  // ⚫ MASTER SEVİYE (Seviye 26-30): Bilişsel zirve performansı
  { 
    id: 26,
    initial: [['K', 'Y'], ['M'], []], 
    target: [[], [], ['K']], 
    minMoves: 11,
    difficulty: 'İmkansız'
  },
  { 
    id: 27,
    initial: [['K'], ['Y', 'M'], []], 
    target: [['M'], [], ['Y']], 
    minMoves: 12,
    difficulty: 'İmkansız'
  },
  { 
    id: 28,
    initial: [['K', 'Y', 'M'], [], []], 
    target: [[], ['Y'], ['K']], 
    minMoves: 12,
    difficulty: 'Efsanevi'
  },
  { 
    id: 29,
    initial: [[], ['K', 'Y'], ['M']], 
    target: [['K'], ['M'], ['Y']], 
    minMoves: 13,
    difficulty: 'Efsanevi'
  },
  { 
    id: 30,
    initial: [['K'], ['Y', 'M'], []], 
    target: [[], ['K', 'M'], ['Y']], 
    minMoves: 15,
    difficulty: 'İlahi'
  }
]

// Tower Komponenti - Tabanları Eşitlenmiş Responsive Tasarım
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

  // Kapasiteye göre boyutlama - Kule direkleri farklı, tabanlar aynı hizada
  const getTowerSizes = (capacity: number) => {
    switch(capacity) {
      case 3: // 3 top kapasiteli - uzun direk
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[120px] sm:h-[144px] md:h-[168px]', // 3 × top boyutu
          towerWidth: 'w-3 sm:w-4 md:w-5',
          baseWidth: 'w-20 sm:w-24 md:w-28'
        }
      case 2: // 2 top kapasiteli - orta direk
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[80px] sm:h-[96px] md:h-[112px]', // 2 × top boyutu
          towerWidth: 'w-2.5 sm:w-3 md:w-4',
          baseWidth: 'w-20 sm:w-24 md:w-28' // Aynı taban genişliği
        }
      case 1: // 1 top kapasiteli - kısa direk
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[40px] sm:h-[48px] md:h-[56px]', // 1 × top boyutu
          towerWidth: 'w-2 sm:w-2.5 md:w-3',
          baseWidth: 'w-20 sm:w-24 md:w-28' // Aynı taban genişliği
        }
      default:
        return {
          ballSize: 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14',
          towerHeight: 'h-[80px] sm:h-[96px] md:h-[112px]',
          towerWidth: 'w-2.5 sm:w-3 md:w-4',
          baseWidth: 'w-20 sm:w-24 md:w-28'
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

      {/* Kule Yapısı - FIXED: Tüm kulelerin tabanları aynı hizada */}
      <div 
        className={`
          relative transition-all duration-300 cursor-pointer flex flex-col items-center justify-end
          touch-manipulation select-none focus:outline-none focus:ring-4 focus:ring-primary/50
          active:scale-95 tablet:hover:scale-102 min-h-[44px] min-w-[44px]
          tablet:min-h-[64px] tablet:min-w-[64px]
          h-[180px] sm:h-[220px] md:h-[260px]
          ${isSelected ? 'scale-105' : 'hover:scale-102'}
        `}
        onClick={onClick}
        onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
        style={{ touchAction: 'manipulation' }}
      >
        {/* Ana Çubuk - Kapasiteye göre boyutlanan, alt hizalı */}
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
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
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

        {/* Base Platform - FIXED: Tüm tabanlar aynı genişlik ve alt hizada */}
        <div className={`
          ${baseWidth} h-3 sm:h-4 rounded-lg transition-all duration-300 z-5
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

// Ana Oyun Komponenti - UniversalGameEngine ile entegre
const TowerOfLondonGame: React.FC<{ 
  onBack: () => void
  universalGame: ReturnType<typeof useUniversalGame>
  gameControlRef: React.MutableRefObject<{
    handleNextLevel: () => void
    handleRestart: () => void
  } | null>
}> = ({ onBack, universalGame, gameControlRef }) => {
  // Error handling states
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [autoProgressionHandled, setAutoProgressionHandled] = React.useState(false)
  
  const [currentLevel, setCurrentLevel] = React.useState(1)
  const [towers, setTowers] = React.useState<string[][]>([[], [], []])
  const [selectedTower, setSelectedTower] = React.useState<number | null>(null)
  const [moves, setMoves] = React.useState(0)
  const [startTime, setStartTime] = React.useState<number | null>(null)
  const [planningTime, setPlanningTime] = React.useState(0)
  const { playSound } = useAudio()
  
  const currentProblem = TOWER_PROBLEMS[currentLevel - 1] || TOWER_PROBLEMS[0]
  const maxTowerHeights = [3, 2, 1] // Sol: 3 top, Orta: 2 top, Sağ: 1 top

  // Level'ı başlat
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
      setStartTime(null)
      setPlanningTime(0)
      setAutoProgressionHandled(false)
      
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
  const recordFirstMove = React.useCallback(() => {
    if (startTime === null) {
      const now = Date.now()
      setStartTime(now)
      universalGame.gameActions.onStart()
    }
  }, [startTime, universalGame.gameActions])

  // Seviye tamamlama kontrolü - MEMOIZED
  const checkCompletion = React.useCallback(() => {
    const target = currentProblem.target
    const isComplete = towers.every((tower, index) => 
      tower.length === target[index].length && 
      tower.every((ball, ballIndex) => ball === target[index][ballIndex])
    )
    return isComplete
  }, [towers, currentProblem.target])

  // Next level handler - MEMOIZED
  const handleNextLevel = React.useCallback(() => {
    if (autoProgressionHandled) return
    setAutoProgressionHandled(true)
    
    if (currentLevel >= 30) {
      toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
      return
    }
    
    const nextLevel = currentLevel + 1
    playSound('level-up')
    toast.success(`🚀 Seviye ${nextLevel} başlıyor!`)
    
    // 🔧 FIX: Initialize level directly, don't call onRestart which causes race condition
    initializeLevel(nextLevel)
  }, [autoProgressionHandled, currentLevel, playSound, initializeLevel])

  // Restart handler - MEMOIZED
  const handleRestart = React.useCallback(() => {
    initializeLevel(currentLevel)
    setAutoProgressionHandled(false)
  }, [initializeLevel, currentLevel])

  // Expose control functions to parent - MEMOIZED
  React.useEffect(() => {
    gameControlRef.current = {
      handleNextLevel,
      handleRestart
    }
  }, [handleNextLevel, handleRestart])

  // Seviye tamamlama - UniversalGameEngine ile entegre - FIXED
  React.useEffect(() => {
    const isCompleted = checkCompletion()
    
    if (isCompleted && !universalGame.gameState.isCompleted && !autoProgressionHandled && moves > 0) {
      // Planlama süresini hesapla
      const finalPlanningTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
      setPlanningTime(finalPlanningTime)
      
      // 🔧 FIX: Prevent Infinity score calculation
      const safeScore = moves > 0 ? Math.round(((currentProblem.minMoves / moves) * 100)) : 0
      const clampedScore = Math.min(Math.max(safeScore, 0), 100)
      
      // Clinical data hazırlama - Tower of London Assessment
      const result: GameResult = {
        exerciseName: 'Londra Kulesi',
        score: clampedScore,
        duration: finalPlanningTime,
        completed: true,
        accuracy: clampedScore,
        level: currentLevel,
        details: {
          level_identifier: `Seviye ${currentLevel} - ${currentProblem.difficulty}`,
          total_moves: moves,
          min_moves_required: currentProblem.minMoves,
          planning_time_seconds: finalPlanningTime,
          efficiency_percentage: clampedScore,
          is_optimal_solution: moves === currentProblem.minMoves,
          exercise_name: 'Londra Kulesi',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
      
      universalGame.gameActions.onComplete(result)
      playSound('exercise-complete')
    }
  }, [checkCompletion, autoProgressionHandled, startTime, currentProblem.minMoves, currentProblem.difficulty, moves, currentLevel, universalGame.gameState.isCompleted, universalGame.gameActions, playSound])

  // Stats'ları güncelle - FIXED
  React.useEffect(() => {
    const safeScore = moves > 0 ? Math.round(((currentProblem.minMoves / moves) * 100)) : 100
    const clampedScore = Math.min(Math.max(safeScore, 0), 100)
    
    universalGame.updateGameStats({
      score: clampedScore,
      level: currentLevel,
      progress: `${moves}/${currentProblem.minMoves} hamle`,
      accuracy: clampedScore
    })
  }, [moves, currentProblem.minMoves, currentLevel, universalGame.updateGameStats])

  // Error recovery
  const recoverFromError = React.useCallback(() => {
    playSound('button-click')
    setError(null)
    setIsLoading(false)
    const recoveryLevel = currentLevel || 1
    initializeLevel(recoveryLevel)
  }, [currentLevel, initializeLevel, playSound])

  // Top taşıma mantığı - MEMOIZED
  const moveBall = React.useCallback((fromTower: number, toTower: number) => {
    recordFirstMove() // İlk hamle zamanını kaydet
    
    const newTowers = [...towers]
    const ball = newTowers[fromTower].pop()
    
    if (ball && newTowers[toTower].length < maxTowerHeights[toTower]) {
      newTowers[toTower].push(ball)
      setTowers(newTowers)
      setMoves(prevMoves => prevMoves + 1)
      playSound('button-click')
    }
  }, [towers, maxTowerHeights, playSound, recordFirstMove])

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
              <Button 
                variant="outline" 
                size="sm"
                onClick={recoverFromError}
                className="bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
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
          {/* Seviye Badge'ı - Diğer oyunlarla uyumlu minimal stil */}
          <div className="text-center mb-6">
            <Badge variant="secondary" className="text-sm sm:text-base px-3 py-2 sm:px-4 bg-primary/10 text-primary border-primary/20">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Seviye {currentLevel}
            </Badge>
          </div>

          {/* Oyun Alanı - Minimal tasarım */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Sol: Mevcut Durum */}
            <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-900/40 border-2 border-blue-200/60 dark:border-blue-800/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center justify-center gap-2">
                  <Building className="w-5 h-5 sm:w-6 sm:h-6" />
                  Mevcut Durum
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Tower Container */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 bg-white/50 dark:bg-gray-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                  {towers.map((tower, index) => (
                    <div key={index} className="flex justify-center">
                      <Tower
                        index={index}
                        balls={tower}
                        isSelected={selectedTower === index}
                        onClick={() => {
                          if (universalGame.gameState.isCompleted || error || isLoading || universalGame.gameState.isPaused) return
                          recordFirstMove()
                          
                          if (selectedTower === null) {
                            if (towers[index].length > 0) {
                              setSelectedTower(index)
                              playSound('button-click')
                            }
                          } else {
                            if (selectedTower === index) {
                              setSelectedTower(null)
                              playSound('button-click')
                            } else {
                              moveBall(selectedTower, index)
                              setSelectedTower(null)
                            }
                          }
                        }}
                        label={towerLabels[index]}
                        maxHeight={maxTowerHeights[index]}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sağ: Hedef Durum */}
            <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/40 dark:to-green-900/40 border-2 border-emerald-200/60 dark:border-emerald-800/60 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                  Hedef Durum
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Target Tower Container */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 bg-white/50 dark:bg-gray-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm">
                  {currentProblem.target.map((tower, index) => (
                    <div key={index} className="flex justify-center">
                      <Tower
                        index={index}
                        balls={tower}
                        isSelected={false}
                        onClick={() => {}}
                        label={towerLabels[index]}
                        isTarget={true}
                        maxHeight={maxTowerHeights[index]}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Basit Progress Info */}
          <Card className="bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {moves} hamle yapıldı
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Optimal: {currentProblem.minMoves} hamle
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

const LondraKulesiSayfasi: React.FC<LondraKulesiSayfasiProps> = ({ onBack }) => {
  // Game control refs
  const gameControlRef = React.useRef<{
    handleNextLevel: () => void
    handleRestart: () => void
  } | null>(null)

  // Universal game hook'u kullan
  const universalGame = useUniversalGame({
    exerciseName: 'Londra Kulesi',
    onComplete: (result: GameResult) => {
      console.log('Tower of London completed:', result)
    }
  })

  // Custom game hook'u oluştur
  const gameHook = () => ({
    ...universalGame,
    gameActions: {
      ...universalGame.gameActions,
      onRestart: () => {
        if (gameControlRef.current) {
          gameControlRef.current.handleRestart()
        }
        universalGame.gameActions.onRestart()
      },
      onNextLevel: () => {
        if (gameControlRef.current) {
          gameControlRef.current.handleNextLevel()
        }
      }
    }
  })

      return (
      <UniversalGameEngine
        gameConfig={TOWER_OF_LONDON_CONFIG}
        gameHook={gameHook}
        onBack={onBack}
      >
        <TowerOfLondonGame onBack={onBack} universalGame={universalGame} gameControlRef={gameControlRef} />
      </UniversalGameEngine>
    )
}

export default LondraKulesiSayfasi