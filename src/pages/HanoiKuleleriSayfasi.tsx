import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { HANOI_TOWERS_CONFIG } from '../components/GameEngine/gameConfigs'
import { useUniversalGame } from '../hooks/useUniversalGame'
import { useAudio } from '../hooks/useAudio'
import { Building2, Target, Timer, Trophy, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'
import { uiStyles, touchTargetClasses, cn } from '@/lib/utils'
import { GameResult } from '../components/GameEngine/types'
import { 
  HanoiConfiguration, 
  HanoiLevel, 
  HANOI_LEVELS, 
  isValidMove, 
  makeMove, 
  isConfigEqual,
  calculateScore,
  getDiskStyle
} from '../utils/hanoiTowersUtils'

interface HanoiKuleleriSayfasiProps {
  onBack: () => void
}

// Clinical Assessment Interface for Mathematical Thinking
interface HanoiClinicalData {
  mathematicalThinking: number
  recursiveProblemSolving: number
  spatialReasoning: number
  sequentialPlanning: number
  algorithmicThinking: number
  logicalDeduction: number
  overallCognitive: number
  // Level-based performance
  levelPerformance: {
    [key: number]: {
      attempts: number
      optimalSolutions: number
      efficiency: number
      planningTime: number
    }
  }
  // Clinical insights
  clinicalInsights: string[]
  cognitiveProfile: {
    recommendations: string[]
    strengths: string[]
    improvementAreas: string[]
  }
}

// Disk renklerini Londra Kulesi topları gibi tasarlama
const getDiskColor = (size: number, maxSize: number, isSelected: boolean = false) => {
  const colors = [
    'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/30', // En küçük - Mavi
    'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/30', // Yeşil
    'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/30', // Sarı
    'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/30', // Turuncu
    'bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-red-500/30', // Kırmızı
    'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 shadow-purple-500/30', // Mor
    'bg-gradient-to-br from-pink-400 to-pink-600 border-pink-300 shadow-pink-500/30', // Pembe
    'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300 shadow-indigo-500/30', // İndigo
  ]
  
  const colorIndex = size - 1
  const baseColor = colors[colorIndex] || colors[0]
  
  return isSelected 
    ? `${baseColor} scale-110 ring-4 ring-primary/50 ring-offset-2`
    : baseColor
}

// Tower Component
const Tower: React.FC<{
  index: number
  disks: number[]
  isSelected: boolean
  onClick: () => void
  label: string
  isTarget?: boolean
}> = ({ index, disks, isSelected, onClick, label, isTarget = false }) => {
  const kubeHeight = disks.length <= 3 ? 'h-40' : disks.length <= 5 ? 'h-48' : 'h-56'
  const kubeWidth = disks.length <= 3 ? 'w-4' : disks.length <= 5 ? 'w-5' : 'w-6'
  const platformWidth = disks.length <= 3 ? 'w-20' : disks.length <= 5 ? 'w-24' : 'w-28'

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
        {label}
      </div>
      
      <div 
        className={cn(
          `relative ${kubeHeight} ${platformWidth} cursor-pointer transition-all duration-300`,
          touchTargetClasses.gameCard,
          isSelected ? 'scale-105' : 'hover:scale-102'
        )}
        onClick={onClick}
        onTouchStart={(e) => e.preventDefault()}
        style={{ touchAction: 'manipulation' }}
        title={`${label} - ${disks.length} disk`}
      >
        {/* Platform */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${platformWidth} h-3 bg-gradient-to-t from-amber-600 to-amber-500 rounded-lg shadow-lg border border-amber-700`} />
        
        {/* Kule direği */}
        <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 ${kubeWidth} ${kubeHeight} bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg shadow-inner`} />

        {/* Diskler */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
          {disks.map((diskSize, diskIndex) => {
            const isTopDisk = diskIndex === disks.length - 1
            const isSelectedDisk = isSelected && isTopDisk
            const diskWidth = 24 + diskSize * 14
            
            return (
              <div
                key={`${index}-${diskIndex}`}
                className={`
                  h-6 sm:h-7 md:h-8 rounded-full mb-1 border-2 border-white/50 transition-all duration-300 
                  flex items-center justify-center shadow-lg
                  ${getDiskColor(diskSize, 8, isSelectedDisk)}
                `}
                style={{ width: `${diskWidth}px` }}
                title={`Disk ${diskSize}`}
              >
                <span className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">
                  {diskSize}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

Tower.displayName = 'Tower'

// Ana Oyun Komponenti - UniversalGameEngine ile entegre
const HanoiTowersGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Error handling states
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [autoProgressionHandled, setAutoProgressionHandled] = React.useState(false)
  
  const [currentLevel, setCurrentLevel] = React.useState(1)
  const [currentConfig, setCurrentConfig] = React.useState<HanoiConfiguration>({ towers: [[], [], []] })
  const [targetConfig, setTargetConfig] = React.useState<HanoiConfiguration>({ towers: [[], [], []] })
  const [selectedTower, setSelectedTower] = React.useState<number | null>(null)
  const [moves, setMoves] = React.useState(0)
  const [startTime, setStartTime] = React.useState<number | null>(null)
  const [showingPreview, setShowingPreview] = React.useState(true)
  const [clinicalData, setClinicalData] = React.useState<HanoiClinicalData>({
    mathematicalThinking: 0,
    recursiveProblemSolving: 0,
    spatialReasoning: 0,
    sequentialPlanning: 0,
    algorithmicThinking: 0,
    logicalDeduction: 0,
    overallCognitive: 0,
    levelPerformance: {},
    clinicalInsights: [],
    cognitiveProfile: {
      recommendations: [],
      strengths: [],
      improvementAreas: []
    }
  })
  
  const { playSound } = useAudio()

  const currentProblem = HANOI_LEVELS[currentLevel - 1] || HANOI_LEVELS[0]
  const towerLabels = ['Kule A', 'Kule B', 'Kule C']

  // Universal game hook'u kullan
  const universalGame = useUniversalGame({
    exerciseName: 'Hanoi Kuleleri',
    onComplete: (result: GameResult) => {
      console.log('Hanoi Towers completed:', result)
    }
  })

  // Level'ı başlat
  const initializeLevel = React.useCallback((level: number) => {
    try {
      setError(null)
      setIsLoading(true)
      
      const levelData = HANOI_LEVELS[level - 1] || HANOI_LEVELS[0]
      
      if (!levelData) {
        throw new Error(`Seviye ${level} bulunamadı`)
      }
    
      setCurrentLevel(level)
      setCurrentConfig({ towers: levelData.initialConfig.towers.map(tower => [...tower]) })
      setTargetConfig({ towers: levelData.targetConfig.towers.map(tower => [...tower]) })
      setSelectedTower(null)
      setMoves(0)
      setStartTime(null)
      setShowingPreview(true)
      setAutoProgressionHandled(false)
      
      // 3 saniye önizleme göster
      setTimeout(() => {
        setShowingPreview(false)
        setIsLoading(false)
      }, 3000)
      
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

  // İlk hamle zamanını kaydet
  const recordFirstMove = () => {
    if (startTime === null) {
      const now = Date.now()
      setStartTime(now)
      universalGame.gameActions.onStart()
    }
  }

  // Seviye tamamlama kontrolü
  const checkCompletion = React.useCallback(() => {
    return isConfigEqual(currentConfig, targetConfig)
  }, [currentConfig, targetConfig])

  // Clinical assessment calculation
  const calculateClinicalAssessment = React.useCallback((
    userMoves: number, 
    minMoves: number, 
    planningTime: number,
    levelId: number
  ): HanoiClinicalData => {
    const efficiency = Math.round((minMoves / userMoves) * 100)
    const isOptimal = userMoves === minMoves
    
    // Mathematical Thinking (recursive understanding)
    const mathematicalThinking = Math.min(100, 
      (isOptimal ? 90 : Math.max(50, 100 - (userMoves - minMoves) * 5)) + 
      (levelId >= 15 ? 10 : 0) // Bonus for high levels
    )
    
    // Recursive Problem Solving
    const recursiveProblemSolving = Math.min(100,
      efficiency * 0.8 + (levelId * 2) + (isOptimal ? 20 : 0)
    )
    
    // Spatial Reasoning
    const spatialReasoning = Math.min(100,
      80 + (efficiency * 0.2) + (currentProblem.diskCount * 3)
    )
    
    // Sequential Planning
    const planningTimeScore = Math.max(20, 100 - planningTime)
    const sequentialPlanning = Math.round((efficiency + planningTimeScore) / 2)
    
    // Algorithmic Thinking
    const algorithmicThinking = Math.min(100,
      (isOptimal ? 95 : Math.max(40, efficiency)) + (levelId >= 10 ? 10 : 0)
    )
    
    // Logical Deduction
    const logicalDeduction = Math.min(100,
      efficiency + (currentProblem.diskCount * 5) + (isOptimal ? 15 : 0)
    )
    
    // Overall Cognitive Score
    const overallCognitive = Math.round(
      (mathematicalThinking * 0.25) +
      (recursiveProblemSolving * 0.2) +
      (spatialReasoning * 0.15) +
      (sequentialPlanning * 0.15) +
      (algorithmicThinking * 0.15) +
      (logicalDeduction * 0.1)
    )
    
    // Generate clinical insights
    const insights: string[] = []
    if (mathematicalThinking >= 85) insights.push("Excellent mathematical and recursive thinking abilities")
    if (recursiveProblemSolving >= 80) insights.push("Strong recursive problem-solving skills")
    if (spatialReasoning >= 85) insights.push("Superior spatial reasoning and visualization")
    if (sequentialPlanning >= 80) insights.push("Effective sequential planning capabilities")
    if (algorithmicThinking >= 85) insights.push("Advanced algorithmic thinking patterns")
    if (isOptimal) insights.push("Demonstrates optimal solution finding")
    if (efficiency >= 90) insights.push("Highly efficient problem-solving approach")
    
    // Level performance tracking
    const levelPerf = { ...clinicalData.levelPerformance }
    if (!levelPerf[levelId]) {
      levelPerf[levelId] = {
        attempts: 0,
        optimalSolutions: 0,
        efficiency: 0,
        planningTime: 0
      }
    }
    
    levelPerf[levelId].attempts++
    if (isOptimal) levelPerf[levelId].optimalSolutions++
    levelPerf[levelId].efficiency = efficiency
    levelPerf[levelId].planningTime = planningTime
    
    return {
      mathematicalThinking,
      recursiveProblemSolving,
      spatialReasoning,
      sequentialPlanning,
      algorithmicThinking,
      logicalDeduction,
      overallCognitive,
      levelPerformance: levelPerf,
      clinicalInsights: insights,
      cognitiveProfile: {
        recommendations: generateRecommendations(overallCognitive, efficiency),
        strengths: generateStrengths(mathematicalThinking, recursiveProblemSolving, spatialReasoning),
        improvementAreas: generateImprovementAreas(sequentialPlanning, algorithmicThinking, logicalDeduction)
      }
    }
  }, [clinicalData.levelPerformance, currentProblem])

  // Helper functions for clinical assessment
  const generateRecommendations = (cognitive: number, efficiency: number): string[] => {
    const recommendations: string[] = []
    if (cognitive < 70) recommendations.push("Practice with simpler recursive problems")
    if (efficiency < 80) recommendations.push("Focus on planning before executing moves")
    if (cognitive >= 90) recommendations.push("Challenge with advanced mathematical puzzles")
    return recommendations
  }

  const generateStrengths = (math: number, recursive: number, spatial: number): string[] => {
    const strengths: string[] = []
    if (math >= 80) strengths.push("Mathematical reasoning")
    if (recursive >= 80) strengths.push("Recursive problem solving")
    if (spatial >= 80) strengths.push("Spatial visualization")
    return strengths
  }

  const generateImprovementAreas = (planning: number, algorithmic: number, logical: number): string[] => {
    const areas: string[] = []
    if (planning < 70) areas.push("Sequential planning")
    if (algorithmic < 70) areas.push("Algorithmic thinking")
    if (logical < 70) areas.push("Logical deduction")
    return areas
  }

  // Next level handler
  const handleNextLevel = React.useCallback(() => {
    if (autoProgressionHandled) return
    setAutoProgressionHandled(true)
    
    if (currentLevel >= 18) {
      toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
      return
    }
    
    const nextLevel = currentLevel + 1
    playSound('level-up')
    toast.success(`🚀 Seviye ${nextLevel} başlıyor!`)
    
    initializeLevel(nextLevel)
    universalGame.gameActions.onRestart()
  }, [autoProgressionHandled, currentLevel, playSound, initializeLevel, universalGame.gameActions])

  // Seviye tamamlama - UniversalGameEngine ile entegre
  React.useEffect(() => {
    if (checkCompletion() && !universalGame.gameState.isCompleted && !autoProgressionHandled && !showingPreview) {
      // Planlama süresini hesapla
      const finalPlanningTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
      
      // Clinical assessment
      const assessment = calculateClinicalAssessment(moves, currentProblem.minMoves, finalPlanningTime, currentLevel)
      setClinicalData(assessment)
      
      // GameResult hazırlama
      const result: GameResult = {
        exerciseName: 'Hanoi Kuleleri',
        score: Math.round(((currentProblem.minMoves / moves) * 100)),
        duration: finalPlanningTime,
        completed: true,
        accuracy: Math.round((currentProblem.minMoves / moves) * 100),
        level: currentLevel,
        details: {
          level_identifier: `${currentProblem.name} (Seviye ${currentLevel})`,
          level_number: currentLevel,
          initial_config: currentProblem.initialConfig,
          target_config: currentProblem.targetConfig,
          min_moves_required: currentProblem.minMoves,
          user_moves_taken: moves,
          time_seconds: finalPlanningTime,
          score: Math.round(((currentProblem.minMoves / moves) * 100)),
          completed_optimally: moves === currentProblem.minMoves,
          efficiency_percentage: Math.round((currentProblem.minMoves / moves) * 100),
          disk_count: currentProblem.diskCount,
          exercise_name: 'Hanoi Kuleleri',
          timestamp: new Date().toISOString(),
          // Clinical data
          clinicalData: assessment
        },
        timestamp: new Date().toISOString()
      }
      
      universalGame.gameActions.onComplete(result)
      playSound('exercise-complete')
    }
  }, [checkCompletion, autoProgressionHandled, showingPreview, startTime, currentProblem, moves, currentLevel, universalGame, playSound, calculateClinicalAssessment])

  // Stats'ları güncelle
  React.useEffect(() => {
    universalGame.updateGameStats({
      score: Math.round(((currentProblem.minMoves / Math.max(moves, 1)) * 100)),
      level: `${currentProblem.name}`,
      progress: `${moves}/${currentProblem.minMoves} hamle`,
      accuracy: Math.round((currentProblem.minMoves / Math.max(moves, 1)) * 100)
    })
  }, [moves, currentProblem, universalGame])

  // Custom game hook'u oluştur
  const gameHook = () => ({
    ...universalGame,
    gameActions: {
      ...universalGame.gameActions,
      onStart: () => {
        universalGame.gameActions.onStart()
      },
      onPause: () => {
        universalGame.gameActions.onPause()
      },
      onResume: () => {
        universalGame.gameActions.onResume()
      },
      onRestart: () => {
        initializeLevel(currentLevel)
        universalGame.gameActions.onRestart()
        setAutoProgressionHandled(false)
      },
      onNextLevel: handleNextLevel
    }
  })

  // Error recovery
  const recoverFromError = React.useCallback(() => {
    playSound('button-click')
    setError(null)
    setIsLoading(false)
    const recoveryLevel = currentLevel || 1
    initializeLevel(recoveryLevel)
  }, [currentLevel, initializeLevel, playSound])

  // Tower click handler
  const handleTowerClick = React.useCallback((towerIndex: number) => {
    if (showingPreview || universalGame.gameState.isPaused || universalGame.gameState.isCompleted) return

    recordFirstMove() // İlk hamle zamanını kaydet

    if (selectedTower === null) {
      // Kule seçimi - sadece disk varsa seçilebilir
      if (currentConfig.towers[towerIndex].length > 0) {
        playSound('button-click')
        setSelectedTower(towerIndex)
      } else {
        // Boş kuleye tıklandı
        playSound('button-hover')
      }
    } else {
      // Disk hareketi
      if (selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        playSound('button-hover')
        setSelectedTower(null)
      } else {
        // Farklı kuleye tıklandı, disk taşımaya çalış
        if (isValidMove(currentConfig, selectedTower, towerIndex)) {
          // Geçerli hamle
          const newConfig = makeMove(currentConfig, selectedTower, towerIndex)
          const newMoves = moves + 1
          
          playSound('correct-answer')
          
          setCurrentConfig(newConfig)
          setMoves(newMoves)
          setSelectedTower(null)
        } else {
          // Geçersiz hamle
          playSound('wrong-answer')
          setSelectedTower(null)
        }
      }
    }
  }, [selectedTower, currentConfig, targetConfig, moves, showingPreview, universalGame.gameState, playSound, recordFirstMove])

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

      {/* Loading/Preview Display */}
      {(isLoading || showingPreview) && (
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.loading}`}>
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <Timer className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                {showingPreview ? 'Hedef düzenlemeyi inceleyin...' : 'Seviye yükleniyor...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Game Content */}
      {!error && !isLoading && (
        <>
          {/* Seviye Badge'ı - Minimal */}
          <div className="text-center mb-6">
        <Badge variant="secondary" className="text-sm sm:text-base px-3 py-2 sm:px-4 bg-primary/10 text-primary border-primary/20">
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Seviye {currentLevel}
        </Badge>
      </div>

          {/* Oyun Alanı */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            
            {/* Sol: Mevcut Durum */}
      <Card className={uiStyles.gameCard.primary}>
        <CardContent className={uiStyles.cardContent.compact}>
          <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700 dark:text-gray-300">
            Mevcut Durum
          </h4>
          <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
                  {currentConfig.towers.map((tower, index) => (
              <Tower
                key={index}
                index={index}
                disks={tower}
                      isSelected={selectedTower === index}
                      onClick={() => handleTowerClick(index)}
                label={towerLabels[index]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

            {/* Sağ: Hedef Durum */}
      <Card className="bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm border-green-200/20 dark:border-green-800/20">
        <CardContent className="p-4 sm:p-6">
          <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-700 dark:text-green-300">
            🎯 Hedef
          </h4>
          <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
                  {targetConfig.towers.map((tower, index) => (
              <Tower
                key={index}
                index={index}
                disks={tower}
                isSelected={false}
                onClick={() => {}}
                label={towerLabels[index]}
                isTarget={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>
          </div>

          {/* Yardım İpuçları */}
          {selectedTower !== null && (
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm border-blue-200/20 dark:border-blue-800/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-700 dark:text-blue-300">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium">
                    <strong>{towerLabels[selectedTower]}</strong> seçildi - Hedef kuleye tıklayın
              </span>
            </div>
          </CardContent>
        </Card>
          )}

          {/* Progress Info */}
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

const HanoiKuleleriSayfasi: React.FC<HanoiKuleleriSayfasiProps> = ({ onBack }) => {
  // Universal game hook'u kullan
  const universalGame = useUniversalGame({
    exerciseName: 'Hanoi Kuleleri',
    onComplete: (result: GameResult) => {
      console.log('Hanoi Towers completed:', result)
    }
  })

  // Custom game hook'u oluştur
  const gameHook = () => universalGame

  return (
    <UniversalGameEngine
      gameConfig={HANOI_TOWERS_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      <HanoiTowersGame onBack={onBack} />
    </UniversalGameEngine>
  )
}

export default HanoiKuleleriSayfasi