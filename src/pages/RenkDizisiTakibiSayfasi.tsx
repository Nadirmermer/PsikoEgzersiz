import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Palette, Eye, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import UniversalGameEngine from '@/components/GameEngine/UniversalGameEngine'
import { COLOR_SEQUENCE_CONFIG } from '@/components/GameEngine/gameConfigs'
import { useUniversalGame } from '@/hooks/useUniversalGame'
import { useColorSequence, colors } from '@/hooks/useColorSequence'
import { GameResult } from '@/components/GameEngine/types'
import { toast } from '@/components/ui/sonner'
import { useAudio } from '@/hooks/useAudio'
import { touchTargetClasses, cn, gameTimings, uiStyles } from '@/lib/utils'

interface RenkDizisiTakibiSayfasiProps {
  onBack: () => void
}

const RenkDizisiTakibiSayfasi: React.FC<RenkDizisiTakibiSayfasiProps> = ({ onBack }) => {
  const { playSound } = useAudio()
  // 🔧 FIX: Use unified feedback duration for consistency
  const FEEDBACK_DURATION = gameTimings.colorSequence.feedbackDuration

  // Universal game hook
  const universalGame = useUniversalGame({
    exerciseName: 'Renk Dizisi Takibi',
    onComplete: (result: GameResult) => {
      console.log('Color sequence completed:', result)
    }
  })

  // Color sequence specific logic
  const sequenceGame = useColorSequence()

  // Initialize game on mount
  useEffect(() => {
    sequenceGame.initializeGame()
  }, [])

  // Handle game completion with visual-spatial clinical assessment
  useEffect(() => {
    if (sequenceGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = sequenceGame.getFinalStats()
      
      // 🧠 Enhanced result with visual-spatial memory clinical assessment data
      const result: GameResult = {
        exerciseName: 'Renk Dizisi Takibi',
        score: finalStats.score,
        duration: universalGame.gameState.duration,
        completed: true,
        accuracy: finalStats.correctCount > 0 ? (finalStats.correctCount / (finalStats.correctCount + finalStats.incorrectCount)) * 100 : 0,
        details: {
          exercise_name: 'Renk Dizisi Takibi',
          max_level_reached: finalStats.maxLevelReached,
          total_correct_sequences: finalStats.correctCount,
          total_incorrect_sequences: finalStats.incorrectCount,
          session_duration_seconds: universalGame.gameState.duration,
          score: finalStats.score,
          timestamp: new Date().toISOString(),
          
          // 🧠 Visual-Spatial Memory Clinical Assessment Data
          clinicalData: finalStats.clinicalData ? {
            visualSpanCapacity: finalStats.clinicalData.visualSpanCapacity,
            visualMemoryScore: finalStats.clinicalData.visualMemoryScore,
            spatialProcessingSpeed: finalStats.clinicalData.spatialProcessingSpeed,
            colorRecognitionAccuracy: finalStats.clinicalData.colorRecognitionAccuracy,
            visualAttentionSpan: finalStats.clinicalData.visualAttentionSpan,
            overallVisualSpatialMemory: finalStats.clinicalData.overallVisualSpatialMemory,
            visualPatternCompliance: finalStats.clinicalData.visualPatternCompliance,
            visualSpatialCognitiveProfile: finalStats.clinicalData.visualSpatialCognitiveProfile,
            rawVisualSessionData: finalStats.clinicalData.rawVisualSessionData
          } : undefined
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('🧠 Visual-Spatial Memory Clinical Assessment Results:', {
        visualSpanCapacity: finalStats.clinicalData?.visualSpanCapacity,
        visualMemoryScore: finalStats.clinicalData?.visualMemoryScore,
        spatialProcessingSpeed: finalStats.clinicalData?.spatialProcessingSpeed,
        colorRecognitionAccuracy: finalStats.clinicalData?.colorRecognitionAccuracy,
        visualAttentionSpan: finalStats.clinicalData?.visualAttentionSpan,
        overallVisualSpatialMemory: finalStats.clinicalData?.overallVisualSpatialMemory,
        visualComplexity: finalStats.clinicalData?.visualPatternCompliance.visualComplexity,
        patternRecognitionCategory: finalStats.clinicalData?.visualPatternCompliance.patternRecognitionCategory
      })
      
      universalGame.gameActions.onComplete(result)
    }
  }, [sequenceGame.isGameCompleted, universalGame.gameState.isCompleted])

  // Update game stats
  useEffect(() => {
    universalGame.updateGameStats({
      score: sequenceGame.score,
      level: sequenceGame.currentLevel,
      accuracy: sequenceGame.correctCount > 0 ? (sequenceGame.correctCount / (sequenceGame.correctCount + sequenceGame.incorrectCount)) * 100 : 0
    })
  }, [sequenceGame.score, sequenceGame.currentLevel, sequenceGame.correctCount, sequenceGame.incorrectCount])

  // Handle feedback progression
  useEffect(() => {
    if (sequenceGame.phase === 'feedback') {
      const timer = setTimeout(() => {
        // 🧠 If game is completed, don't progress to next level
        if (sequenceGame.isGameCompleted) {
          // Game will be handled by completion logic above
          return
        }
        
        // Check if it was correct or incorrect
        if (sequenceGame.userInput.length === sequenceGame.sequence.length && 
            sequenceGame.userInput.every((input, index) => input === sequenceGame.sequence[index])) {
          // Level completed successfully - move to next level
          sequenceGame.nextLevel()
    } else {
          // Mistake made - retry same level
          sequenceGame.retryLevel()
        }
      }, FEEDBACK_DURATION)
      
      return () => clearTimeout(timer)
    }
  }, [sequenceGame.phase, sequenceGame.isGameCompleted])

  // Custom game hook
  const gameHook = () => ({
    ...universalGame,
    gameActions: {
      ...universalGame.gameActions,
      onStart: () => {
        universalGame.gameActions.onStart()
        sequenceGame.startNextLevel()
      },
      onRestart: () => {
        sequenceGame.initializeGame()
        universalGame.gameActions.onRestart()
      },
      // 🚨 Color Sequence specific early exit handler
      onExitEarly: () => {
        // Call universal early exit first
        if (universalGame.gameActions.onExitEarly) {
          universalGame.gameActions.onExitEarly()
        }
        
        // 🧠 Color Sequence specific: Add visual-spatial memory context to early exit
        toast.warning('⚠️ Görsel-Uzamsal Bellek Assessment yarıda kesildi! Klinik analiz için test tamamlanmalı.')
      }
    }
  })

  // Handle color input
  const handleColorInput = (colorId: number) => {
    if (!universalGame.gameState.isPlaying || universalGame.gameState.isPaused) return
    
    playSound('button-click')
    const result = sequenceGame.handleColorInput(colorId)
    
    // 🔧 FIX: Add audio feedback for correct/wrong answers
    if (result === 'incorrect') {
      playSound('wrong-answer')
      toast.error('Yanlış! Aynı seviyeyi tekrar deneyin.')
    } else if (result === 'level_complete') {
      playSound('correct-answer')
      toast.success(`Harika! Seviye ${sequenceGame.currentLevel - 1} tamamlandı!`)
    }
  }

    return (
    <UniversalGameEngine
      gameConfig={COLOR_SEQUENCE_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      {/* Error State */}
      {sequenceGame.error && (
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.error}`}>
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <p className="text-sm sm:text-base text-red-800 dark:text-red-200 font-medium">
                {sequenceGame.error.message}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={sequenceGame.recoverFromError}
                className="bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {sequenceGame.isLoading && (
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.loading}`}>
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                Oyun hazırlanıyor...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Content - Only show when playing and no errors */}
      {!sequenceGame.error && !sequenceGame.isLoading && universalGame.gameState.phase === 'playing' && (
        <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto px-4 space-y-4 md:space-y-6">

          {/* Showing Phase */}
          {sequenceGame.phase === 'showing' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center py-6 md:py-8`}>
                
                {/* Level Badge */}
                <div className="mb-4 md:mb-6">
                  <Badge variant="secondary" className="text-sm md:text-base px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Palette className="w-4 h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel}
                  </Badge>
                  
                  {/* 🧠 Visual-Spatial Memory Capacity Indicator */}
                  {sequenceGame.currentLevel >= 2 && (
                    <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs md:text-sm px-2 py-1 ${
                          sequenceGame.currentLevel <= 4 
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                            : sequenceGame.currentLevel <= 7
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                              : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                        }`}
                      >
                        <span className="md:hidden">
                          {sequenceGame.currentLevel}R
                          {sequenceGame.currentLevel <= 4 ? ' Base' : sequenceGame.currentLevel <= 7 ? ' ✓' : ' ⭐'}
                        </span>
                        <span className="hidden md:inline">
                          {sequenceGame.currentLevel} Renk Pattern 
                          {sequenceGame.currentLevel <= 4 
                            ? ' (Baseline)' 
                            : sequenceGame.currentLevel <= 7 
                              ? ' (Normal Visual Range) ✓' 
                              : ' (Exceptional) ⭐'
                          }
                        </span>
                      </Badge>
                    </div>
                  )}
              </div>

                <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 md:mb-8 text-gray-700 dark:text-gray-300">
                  Renkleri Hatırlayın
                </h3>
                
                {/* Color Display - Tablet Optimized Grid */}
                <div className="flex justify-center mb-6 md:mb-8">
                  <div className="grid grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        className={`
                          w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 
                          rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg
                          ${sequenceGame.highlightedColor === color.id 
                            ? `${color.bg} scale-110 ring-4 ring-white shadow-2xl` 
                            : `${color.bg} opacity-30`
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>

                <Progress 
                  value={(sequenceGame.showingIndex + 1) / sequenceGame.sequence.length * 100} 
                  className="h-3 md:h-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm max-w-sm md:max-w-md mx-auto"
                />
                
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-4">
                  {sequenceGame.showingIndex + 1} / {sequenceGame.sequence.length}
                </p>
            </CardContent>
          </Card>
          )}

          {/* Input Phase */}
          {sequenceGame.phase === 'input' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center py-6 md:py-8`}>
                
                {/* Level Badge */}
                <div className="mb-4 md:mb-6">
                  <Badge variant="secondary" className="text-sm md:text-base px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Eye className="w-4 h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel} - Seçim
                  </Badge>
      </div>

                <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-3 text-gray-700 dark:text-gray-300">
                  Renkleri Seçin
                </h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
                  Gördüğünüz sırayla renkleri tıklayın ({sequenceGame.userInput.length}/{sequenceGame.sequence.length})
                </p>
                
                {/* User Input Progress */}
                <div className="flex justify-center items-center gap-2 md:gap-3 mb-6 md:mb-8 flex-wrap">
                  {sequenceGame.sequence.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all duration-300
                        ${index < sequenceGame.userInput.length
                          ? `${colors[sequenceGame.userInput[index]].bg}`
                          : index === sequenceGame.userInput.length
                            ? 'bg-primary/20 border-2 border-primary border-dashed animate-pulse'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }
                      `}
                    />
                  ))}
                </div>

                {/* Color Buttons - Tablet Optimized */}
                <div className="flex justify-center mb-6">
                  <div className="grid grid-cols-2 gap-6 md:gap-8 lg:gap-10 max-w-xs md:max-w-md lg:max-w-lg">
                    {colors.map((color) => (
                      <Button
                        key={color.id}
                        onClick={() => handleColorInput(color.id)}
                        className={cn(
                          `w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 ${color.bg} ${color.hover}`,
                          'rounded-xl md:rounded-2xl shadow-lg border-2 border-white/20 transition-all duration-200',
                          'hover:scale-105 hover:shadow-xl active:scale-95',
                          'focus:ring-4 focus:ring-white/30 focus:outline-none',
                          touchTargetClasses
                        )}
                        disabled={!universalGame.gameState.isPlaying || universalGame.gameState.isPaused}
                      >
                        <span className="text-white font-medium text-sm md:text-base lg:text-lg drop-shadow-lg">
                          {color.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color Names - Hidden on small screens, shown on tablet+ */}
                <div className="hidden md:grid grid-cols-2 gap-4 max-w-sm mx-auto text-center">
                  {colors.map((color) => (
                    <p key={color.id} className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                      {color.name}
                    </p>
                  ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Feedback Phase */}
          {sequenceGame.phase === 'feedback' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center py-6 md:py-8`}>
                
                {/* Success/Failure Display */}
                <div className="mb-6 md:mb-8">
                  {sequenceGame.userInput.length === sequenceGame.sequence.length && 
                   sequenceGame.userInput.every((input, index) => input === sequenceGame.sequence[index]) ? (
                    <div className="text-green-600 dark:text-green-400">
                      <CheckCircle className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4" />
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">Mükemmel!</h3>
                      <p className="text-lg md:text-xl">Seviye {sequenceGame.currentLevel - 1} tamamlandı!</p>
                      <p className="text-sm md:text-base mt-2">+{(sequenceGame.currentLevel - 1) * 10} puan</p>
                      
                      {/* Visual-Spatial Progress Indicator */}
                      {sequenceGame.currentLevel > 2 && (
                        <div className="mt-4">
                          <Badge 
                            variant="outline" 
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 text-xs md:text-sm"
                          >
                            🧠 Görsel-Uzamsal Bellek: {sequenceGame.currentLevel} renk pattern
                          </Badge>
                        </div>
                      )}
              </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      <XCircle className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4" />
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">Üzgünüm!</h3>
                      <p className="text-lg md:text-xl">
                        {sequenceGame.isGameCompleted 
                          ? `Assessment tamamlandı! ${sequenceGame.incorrectCount}/3 hata`
                          : 'Tekrar deneyin'
                        }
                      </p>
                      
                      {/* Clinical completion indicator */}
                      {sequenceGame.isGameCompleted && (
                        <div className="mt-4">
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-xs md:text-sm"
                          >
                            🏁 Görsel-Uzamsal Bellek Assessment Tamamlandı
                          </Badge>
                        </div>
                      )}
              </div>
                  )}
        </div>

                {/* Sequence Comparison - Tablet Optimized */}
                <div className="space-y-4 md:space-y-6">
                  <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Doğru Dizi:</div>
                  <div className="flex justify-center items-center gap-2 md:gap-3 mb-4 flex-wrap">
                    {sequenceGame.sequence.map((colorId, index) => (
                      <div 
                        key={index} 
                        className={`
                          w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 ${colors[colorId].bg} 
                          border border-green-300 dark:border-green-700 
                          rounded-lg shadow-lg
                        `} 
                      />
                    ))}
                  </div>
                  
                  <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">Sizin Seçiminiz:</div>
                  <div className="flex justify-center items-center gap-2 md:gap-3 flex-wrap">
                    {sequenceGame.userInput.map((colorId, index) => {
                      const isCorrect = colorId === sequenceGame.sequence[index]
                      return (
                        <div 
                          key={index} 
                          className={`
                            w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 ${colors[colorId].bg} 
                            border rounded-lg shadow-lg ${
                          isCorrect 
                            ? 'border-green-300 dark:border-green-700'
                            : 'border-red-300 dark:border-red-700'
                            }
                          `} 
                        />
                      )
                    })}
                  </div>
              </div>
            </CardContent>
          </Card>
          )}



      </div>
      )}
    </UniversalGameEngine>
    )
}

export default RenkDizisiTakibiSayfasi
