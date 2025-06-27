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

interface SayiDizisiTakibiSayfasiProps {
  onBack: () => void
}

const SayiDizisiTakibiSayfasi: React.FC<SayiDizisiTakibiSayfasiProps> = ({ onBack }) => {
  const { playSound } = useAudio()
  const FEEDBACK_DURATION = 2000

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

  // Handle game completion (when user makes a mistake or chooses to end)
  useEffect(() => {
    if (sequenceGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = sequenceGame.getFinalStats()
      
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
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
      
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
  }, [sequenceGame.phase])

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
      }
    }
  })

  // Handle number input
  const handleNumberInput = (number: number) => {
    if (!universalGame.gameState.isPlaying || universalGame.gameState.isPaused) return
    
    playSound('button-click')
    const result = sequenceGame.handleNumberInput(number)
    
    if (result === 'incorrect') {
      toast.error('Yanlış! Aynı seviyeyi tekrar deneyin.')
    } else if (result === 'level_complete') {
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
        <Card className="mb-4 sm:mb-6 bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 backdrop-blur-sm">
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
        <Card className="mb-4 sm:mb-6 bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
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
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                
                {/* Level Badge */}
                <div className="mb-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Brain className="w-4 h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel}
                  </Badge>
              </div>
              
                <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
                  Sayıları Hatırlayın
                </h3>
                
                {/* Sequence Display */}
                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6 flex-wrap">
                  {sequenceGame.sequence.map((number, index) => (
                    <div
                      key={index}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300
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
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                
                {/* Level Badge */}
                <div className="mb-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Eye className="w-4 h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel} - Giriş
                  </Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Sayıları Girin
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  Gördüğünüz sırayla sayıları seçin ({sequenceGame.userInput.length}/{sequenceGame.sequence.length})
                </p>
                
                {/* User Input Display */}
                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-8 flex-wrap">
                  {sequenceGame.sequence.map((_, index) => (
                      <div
                        key={index}
                      className={`
                        w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300
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

                {/* Number Buttons */}
                <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <Button
                        key={number}
                        variant="outline"
                        size="lg"
                      onClick={() => handleNumberInput(number)}
                        onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
                        className="h-16 text-xl font-bold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105 transition-all duration-200 touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 min-h-[44px] min-w-[44px]"
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
            <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                
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