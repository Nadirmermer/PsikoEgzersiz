import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Brain, Eye, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import UniversalGameEngine from '@/components/GameEngine/UniversalGameEngine'
import { NUMBER_SEQUENCE_CONFIG } from '@/components/GameEngine/gameConfigs'
import { useUniversalGame } from '@/hooks/useUniversalGame'
import { useNumberSequence } from '@/hooks/useNumberSequence'
import { GameResult } from '@/components/GameEngine/types'
import { toast } from '@/components/ui/sonner'
import { useAudio } from '@/hooks/useAudio'
import { touchTargetClasses, cn, gameTimings, uiStyles } from '@/lib/utils'

interface SayiDizisiTakibiSayfasiProps {
  onBack: () => void
}

const SayiDizisiTakibiSayfasi: React.FC<SayiDizisiTakibiSayfasiProps> = ({ onBack }) => {
  const { playSound } = useAudio()
  // 🔧 FIX: Use unified feedback duration for consistency
  const FEEDBACK_DURATION = gameTimings.numberSequence.feedbackDuration

  // Universal game hook
  const universalGame = useUniversalGame({
    exerciseName: 'Sayı Dizisi Takibi',
    onComplete: (result: GameResult) => {
      console.log('Number sequence completed:', result)
    }
  })

  // Number sequence specific logic
  const sequenceGame = useNumberSequence()

  // Initialize game on mount
  useEffect(() => {
    sequenceGame.initializeGame()
  }, [])

  // Handle game completion with working memory clinical assessment
  useEffect(() => {
    if (sequenceGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = sequenceGame.getFinalStats()
      
      // 🧠 Enhanced result with working memory clinical assessment data
      const result: GameResult = {
        exerciseName: 'Sayı Dizisi Takibi',
        score: finalStats.score,
        duration: universalGame.gameState.duration,
        completed: true,
        accuracy: finalStats.correctCount > 0 ? (finalStats.correctCount / (finalStats.correctCount + finalStats.incorrectCount)) * 100 : 0,
        details: {
          exercise_name: 'Sayı Dizisi Takibi',
          max_level_reached: finalStats.maxLevelReached,
          total_correct_sequences: finalStats.correctCount,
          total_incorrect_sequences: finalStats.incorrectCount,
          session_duration_seconds: universalGame.gameState.duration,
          score: finalStats.score,
          timestamp: new Date().toISOString(),
          
          // 🧠 Working Memory Clinical Assessment Data
          clinicalData: finalStats.clinicalData,
          digitSpanCapacity: finalStats.digitSpanCapacity,
          workingMemoryScore: finalStats.workingMemoryScore
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('🧠 Working Memory Clinical Assessment Results:', {
        digitSpanCapacity: finalStats.clinicalData.digitSpanCapacity,
        workingMemoryScore: finalStats.clinicalData.workingMemoryScore,
        processingSpeed: finalStats.clinicalData.processingSpeed,
        cognitiveLoad: finalStats.clinicalData.cognitiveLoad,
        attentionControl: finalStats.clinicalData.attentionControl,
        millerCompliance: finalStats.clinicalData.millerCompliance,
        workingMemoryCognitiveProfile: finalStats.clinicalData.workingMemoryCognitiveProfile
      })
      
      universalGame.gameActions.onComplete(result)
    }
  }, [sequenceGame.isGameCompleted, universalGame.gameState.isCompleted])

  // Handle automatic game completion scenarios 
  useEffect(() => {
    if (sequenceGame.isGameCompleted && sequenceGame.phase === 'feedback') {
      // Show completion message based on why game ended
      if (sequenceGame.incorrectCount >= 3) {
        toast.info('🎯 İşleyen Bellek Değerlendirmesi tamamlandı! 3 hata ile test sona erdi.')
      } else if (sequenceGame.currentLevel > 10) {
        toast.success('🏆 Mükemmel! İstisnaî işleyen bellek kapasitesi (12+ rakam) ulaştınız!')
      }
    }
  }, [sequenceGame.isGameCompleted, sequenceGame.phase, sequenceGame.incorrectCount, sequenceGame.currentLevel])

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
      // 🚨 Number Sequence specific early exit handler
      onExitEarly: () => {
        // Call universal early exit first
        if (universalGame.gameActions.onExitEarly) {
          universalGame.gameActions.onExitEarly()
        }
        
        // 🧠 Number Sequence specific: Add working memory context to early exit
        toast.warning('⚠️ İşleyen Bellek Değerlendirmesi yarıda kesildi! Klinik analiz için test tamamlanmalı.')
        console.log('🧠 Number Sequence Early Exit - Working Memory assessment incomplete')
      }
    }
  })

  // Handle number input
  const handleNumberInput = (number: number) => {
    if (!universalGame.gameState.isPlaying || universalGame.gameState.isPaused) return
    
    playSound('button-click')
    const result = sequenceGame.handleNumberInput(number)
    
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
      gameConfig={NUMBER_SEQUENCE_CONFIG}
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

      {/* Game Content - Only show when playing */}
      {!sequenceGame.error && !sequenceGame.isLoading && universalGame.gameState.phase === 'playing' && (
        <div className="w-full max-w-4xl mx-auto space-y-6">

          {/* Showing Phase */}
          {sequenceGame.phase === 'showing' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
                
                {/* Level Badge & Working Memory Indicator - Mobile Responsive */}
                <div className="mb-4 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel}
                  </Badge>
                  
                  {/* 🧠 Miller's 7±2 Rule Working Memory Indicator */}
                  <Badge 
                    variant="outline" 
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-1 ${
                      sequenceGame.sequence.length >= 5 && sequenceGame.sequence.length <= 9
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                        : sequenceGame.sequence.length > 9
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                    }`}
                  >
                    <span className="hidden sm:inline">{sequenceGame.sequence.length} Digit</span>
                    <span className="sm:hidden">{sequenceGame.sequence.length}D</span>
                    {sequenceGame.sequence.length >= 5 && sequenceGame.sequence.length <= 9 && (
                      <span className="hidden sm:inline"> (Miller 7±2)</span>
                    )}
                    {sequenceGame.sequence.length >= 5 && sequenceGame.sequence.length <= 9 && (
                      <span className="sm:hidden"> ✓</span>
                    )}
                    {sequenceGame.sequence.length > 9 && (
                      <span className="hidden sm:inline"> (İstisnai)</span>
                    )}
                    {sequenceGame.sequence.length > 9 && (
                      <span className="sm:hidden"> ⭐</span>
                    )}
                  </Badge>
              </div>
              
                <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
                  Sayıları Hatırlayın
                </h3>
                
                {/* Sequence Display - Responsive & Mobile-Optimized */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-6 flex-wrap max-w-sm sm:max-w-lg md:max-w-2xl mx-auto">
                  {sequenceGame.sequence.map((number, index) => (
                    <div
                      key={index}
                      className={`
                        w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300
                        ${index === sequenceGame.showingIndex
                          ? 'bg-primary text-white scale-110 shadow-lg'
                          : index < sequenceGame.showingIndex
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                        }
                      `}
                    >
                      {index <= sequenceGame.showingIndex ? number : '?'}
                    </div>
                  ))}
                  </div>

                  <Progress 
                  value={(sequenceGame.showingIndex + 1) / sequenceGame.sequence.length * 100} 
                  className="h-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm max-w-md mx-auto"
                />
              </CardContent>
            </Card>
          )}

          {/* Input Phase */}
          {sequenceGame.phase === 'input' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
                
                {/* Level Badge & Working Memory Indicator - Mobile Responsive */}
                <div className="mb-4 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel} - Giriş
                  </Badge>
                  
                  {/* 🧠 Miller's 7±2 Rule Working Memory Indicator */}
                  <Badge 
                    variant="outline" 
                    className={`text-xs sm:text-sm px-2 sm:px-3 py-1 ${
                      sequenceGame.sequence.length >= 5 && sequenceGame.sequence.length <= 9
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                        : sequenceGame.sequence.length > 9
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                    }`}
                  >
                    {sequenceGame.sequence.length} Digit WM
                    {sequenceGame.sequence.length >= 5 && sequenceGame.sequence.length <= 9 && ' ✓'}
                    {sequenceGame.sequence.length > 9 && ' ⭐'}
                  </Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Sayıları Girin
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  Gördüğünüz sırayla sayıları seçin ({sequenceGame.userInput.length}/{sequenceGame.sequence.length})
                </p>
                
                {/* User Input Display - Mobile Responsive */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 flex-wrap max-w-sm sm:max-w-lg md:max-w-2xl mx-auto">
                  {sequenceGame.sequence.map((_, index) => (
                      <div
                        key={index}
                      className={`
                        w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300
                        ${index < sequenceGame.userInput.length
                          ? 'bg-primary text-white'
                          : index === sequenceGame.userInput.length
                            ? 'bg-primary/20 border-2 border-primary border-dashed animate-pulse'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                        }
                      `}
                      >
                      {index < sequenceGame.userInput.length ? sequenceGame.userInput[index] : '?'}
                      </div>
                    ))}
                  </div>

                {/* Number Buttons - Mobile Optimized Grid */}
                <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-xs sm:max-w-lg mx-auto px-4 sm:px-0">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <Button
                        key={number}
                        variant="outline"
                        size="lg"
                      onClick={() => handleNumberInput(number)}
                        onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
                        className={cn(
                          "h-12 sm:h-14 md:h-16 text-lg sm:text-xl font-bold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 transition-all duration-200 active:scale-95",
                          touchTargetClasses.gameButton
                        )}
                      >
                        {number}
                      </Button>
                    ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Feedback Phase */}
          {sequenceGame.phase === 'feedback' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
                
                {/* Success/Failure Display */}
                <div className="mb-6">
                  {sequenceGame.userInput.length === sequenceGame.sequence.length && 
                   sequenceGame.userInput.every((input, index) => input === sequenceGame.sequence[index]) ? (
                    <div className="text-green-600 dark:text-green-400">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Mükemmel!</h3>
                      <p className="text-lg">Seviye {sequenceGame.currentLevel - 1} tamamlandı!</p>
                      <p className="text-sm mt-2">+{(sequenceGame.currentLevel - 1) * 10} puan</p>
        </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400">
                      <XCircle className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Üzgünüm!</h3>
                      <p className="text-lg">Tekrar deneyin</p>
                    </div>
                  )}
      </div>

                {/* Sequence Comparison */}
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Doğru Dizi:</div>
                  <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
                    {sequenceGame.sequence.map((number, index) => (
                      <div key={index} className="w-12 h-12 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center justify-center text-lg font-bold text-green-800 dark:text-green-200">
                        {number}
              </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sizin Girişiniz:</div>
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    {sequenceGame.userInput.map((number, index) => {
                      const isCorrect = number === sequenceGame.sequence[index]
                      return (
                        <div key={index} className={`w-12 h-12 border rounded-lg flex items-center justify-center text-lg font-bold ${
                          isCorrect 
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
                        }`}>
                          {number}
                </div>
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

export default SayiDizisiTakibiSayfasi