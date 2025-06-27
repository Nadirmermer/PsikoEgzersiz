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

  // Handle game completion (when user makes a mistake or chooses to end)
  useEffect(() => {
    if (sequenceGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = sequenceGame.getFinalStats()
      
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
        <div className="w-full max-w-4xl mx-auto space-y-6">

          {/* Showing Phase */}
          {sequenceGame.phase === 'showing' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
                
                {/* Level Badge */}
                <div className="mb-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Palette className="w-4 h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel}
                  </Badge>
              </div>

                <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
                  Renkleri Hatırlayın
                </h3>
                
                {/* Color Display */}
                <div className="flex justify-center mb-8">
                  <div className="grid grid-cols-2 gap-6 w-fit">
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        className={`
                          w-24 h-24 sm:w-28 sm:h-28 rounded-xl transition-all duration-300 shadow-lg
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
                  className="h-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm max-w-md mx-auto"
                />
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  {sequenceGame.showingIndex + 1} / {sequenceGame.sequence.length}
                </p>
            </CardContent>
          </Card>
          )}

          {/* Input Phase */}
          {sequenceGame.phase === 'input' && (
            <Card className={uiStyles.gameCard.primary}>
              <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
                
                {/* Level Badge */}
                <div className="mb-4">
                  <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                    <Eye className="w-4 h-4 mr-1" />
                    Seviye {sequenceGame.currentLevel} - Seçim
                  </Badge>
      </div>

                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Renkleri Seçin
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  Gördüğünüz sırayla renkleri tıklayın ({sequenceGame.userInput.length}/{sequenceGame.sequence.length})
                </p>
                
                {/* User Input Progress */}
                <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
                  {sequenceGame.sequence.map((_, index) => (
                    <div
                      key={index}
                      className={`
                        w-8 h-8 rounded-lg transition-all duration-300
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

                {/* Color Buttons */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-4 w-fit">
                    {colors.map((color) => (
                      <Button
                        key={color.id}
                        variant="outline"
                        onClick={() => handleColorInput(color.id)}
                        onTouchStart={(e) => e.preventDefault()}
                        className={cn(
                          `w-24 h-24 sm:w-28 sm:h-28 tablet:w-32 tablet:h-32 ${color.bg} ${color.hover}`,
                          "border-2 border-white/30 hover:border-white/60 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 rounded-xl",
                          touchTargetClasses.gameColorTarget
                        )}
                        aria-label={color.name}
                        style={{ touchAction: 'manipulation' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Color Names */}
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mt-4">
                  {colors.map((color) => (
                    <p key={color.id} className="text-sm text-gray-600 dark:text-gray-400 text-center">
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
                    {sequenceGame.sequence.map((colorId, index) => (
                      <div key={index} className={`w-12 h-12 ${colors[colorId].bg} border border-green-300 dark:border-green-700 rounded-lg shadow-lg`} />
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sizin Seçiminiz:</div>
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    {sequenceGame.userInput.map((colorId, index) => {
                      const isCorrect = colorId === sequenceGame.sequence[index]
                      return (
                        <div key={index} className={`w-12 h-12 ${colors[colorId].bg} border rounded-lg shadow-lg ${
                          isCorrect 
                            ? 'border-green-300 dark:border-green-700'
                            : 'border-red-300 dark:border-red-700'
                        }`} />
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
