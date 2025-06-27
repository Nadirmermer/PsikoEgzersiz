import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Brain } from 'lucide-react'
import UniversalGameEngine from '@/components/GameEngine/UniversalGameEngine'
import { LOGIC_SEQUENCES_CONFIG } from '@/components/GameEngine/gameConfigs'
import { useUniversalGame } from '@/hooks/useUniversalGame'
import { useLogicSequences } from '@/hooks/useLogicSequences'
import { GameResult } from '@/components/GameEngine/types'

interface MantikDizileriSayfasiProps {
  onBack: () => void
}

const MantikDizileriSayfasi: React.FC<MantikDizileriSayfasiProps> = ({ onBack }) => {
  const TOTAL_QUESTIONS = 25
  const FEEDBACK_DURATION = 2000

  // Universal game hook
  const universalGame = useUniversalGame({
    exerciseName: 'Mantık Dizileri',
    onComplete: (result: GameResult) => {
      console.log('Logic sequences completed:', result)
    }
  })

  // Logic sequences specific logic
  const logicGame = useLogicSequences({
    totalQuestions: TOTAL_QUESTIONS
  })

  // Initialize game on mount
  useEffect(() => {
    logicGame.initializeGame()
  }, [])

  // Handle game completion
  useEffect(() => {
    if (logicGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = logicGame.getFinalStats()
      
      const result: GameResult = {
        exerciseName: 'Mantık Dizileri',
        score: finalStats.score,
        duration: universalGame.gameState.duration,
        completed: true,
        accuracy: finalStats.accuracy,
        details: {
          exercise_name: 'Mantık Dizileri',
          questions_answered: TOTAL_QUESTIONS,
          correct_answers: finalStats.correctCount,
          incorrect_answers: finalStats.incorrectCount,
          accuracy_percentage: finalStats.accuracy,
          session_duration_seconds: universalGame.gameState.duration,
          final_score: finalStats.score,
          timestamp: new Date().toISOString(),
          details: {
            questions: finalStats.gameQuestions,
            user_answers: finalStats.userAnswers,
            response_times: finalStats.responseTimes
          }
        },
        timestamp: new Date().toISOString()
      }
      
      universalGame.gameActions.onComplete(result)
    }
  }, [logicGame.isGameCompleted, universalGame.gameState.isCompleted])

  // Update game stats
  useEffect(() => {
    universalGame.updateGameStats({
      score: logicGame.score,
      progress: `${logicGame.questionNumber}/${TOTAL_QUESTIONS}`,
      accuracy: logicGame.correctCount > 0 ? (logicGame.correctCount / logicGame.questionNumber) * 100 : 0,
      level: logicGame.currentQuestion?.level || 1
    })
  }, [logicGame.score, logicGame.questionNumber, logicGame.correctCount, logicGame.currentQuestion])

  // Handle question progression
  useEffect(() => {
    if (logicGame.showFeedback) {
      const timer = setTimeout(() => {
        if (logicGame.questionNumber >= TOTAL_QUESTIONS) {
          // Game will complete, let useEffect handle it
          return
        } else {
          logicGame.nextQuestion()
          logicGame.generateNewQuestion()
        }
      }, FEEDBACK_DURATION)
      
      return () => clearTimeout(timer)
    }
  }, [logicGame.showFeedback, logicGame.questionNumber])

  // Custom game hook
  const gameHook = () => ({
    ...universalGame,
    gameActions: {
      ...universalGame.gameActions,
      onStart: () => {
        universalGame.gameActions.onStart()
        logicGame.generateNewQuestion()
      },
      onRestart: () => {
        logicGame.initializeGame()
        universalGame.gameActions.onRestart()
      }
    }
  })

  // Handle answer selection
  const handleAnswerSelect = (answer: number) => {
    if (!universalGame.gameState.isPlaying || universalGame.gameState.isPaused) return
    
    logicGame.handleAnswerSelect(answer)
  }

  // Get button style based on feedback
  const getButtonStyle = (option: number) => {
    if (!logicGame.showFeedback) {
      return 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-[1.02] transition-all duration-200'
    }

    const isCorrect = logicGame.currentQuestion?.answer === option
    const isSelected = logicGame.userAnswer === option

    if (isSelected && logicGame.lastAnswerCorrect) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
    }
    
    if (isSelected && !logicGame.lastAnswerCorrect) {
      return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
    }
    
    if (isCorrect && !isSelected) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
    }

    return 'bg-gray-100 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 opacity-60'
  }

  // Get icon for button
  const getButtonIcon = (option: number) => {
    if (!logicGame.showFeedback) return null

    const isCorrect = logicGame.currentQuestion?.answer === option
    const isSelected = logicGame.userAnswer === option

    if (isSelected && logicGame.lastAnswerCorrect) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
    }
    
    if (isSelected && !logicGame.lastAnswerCorrect) {
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
    }
    
    if (isCorrect && !isSelected) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
    }

    return null
  }

  const answerOptions = logicGame.generateAnswerOptions()
    
    return (
    <UniversalGameEngine
      gameConfig={LOGIC_SEQUENCES_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      {/* Error Display */}
      {logicGame.error && (
        <div className="w-full max-w-3xl mx-auto">
          <Card className="bg-red-50/80 dark:bg-red-950/20 backdrop-blur-sm border-red-200/20 dark:border-red-800/20">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Bir Hata Oluştu
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">
                {logicGame.error.message}
              </p>
              <Button 
                onClick={logicGame.recoverFromError}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Tekrar Dene
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading Display */}
      {logicGame.isLoading && (
        <div className="w-full max-w-3xl mx-auto">
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Oyun yükleniyor...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Content - Only show when playing and no errors */}
      {!logicGame.error && !logicGame.isLoading && universalGame.gameState.phase === 'playing' && logicGame.currentQuestion && (
        <div className="w-full max-w-3xl mx-auto space-y-6">
          
          {/* Question Card */}
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
            <CardContent className="p-6 sm:p-8 text-center">
              
              {/* Level Badge */}
              <div className="mb-4">
                <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                  <Brain className="w-4 h-4 mr-1" />
                  Seviye {logicGame.currentQuestion.level} - {logicGame.currentQuestion.pattern}
                </Badge>
          </div>

              {/* Sequence Display */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Bu dizideki eksik sayıyı bulun:
                </h3>
                
                <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4 flex-wrap">
                  {logicGame.currentQuestion.sequence.map((num, index) => (
                    <div key={index} className="w-16 h-16 sm:w-20 sm:h-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-white/30 dark:border-gray-700/30 rounded-xl flex items-center justify-center">
                      <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {num}
                      </span>
                    </div>
                  ))}
                  
                  {/* Question mark */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/80 to-primary backdrop-blur-sm border-2 border-primary/50 rounded-xl flex items-center justify-center animate-pulse">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                    ?
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Dizideki mantığı bulun ve eksik sayıyı seçin
                </p>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                {answerOptions.map((option, index) => (
                    <Button
                    key={index}
                    variant="outline"
                    size="lg"
                    onClick={() => handleAnswerSelect(option)}
                    onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
                    disabled={logicGame.showFeedback || !logicGame.isAnswering}
                    className={`
                      h-14 sm:h-16 text-lg sm:text-xl font-bold border-2 transition-all duration-300 relative
                      touch-manipulation select-none focus:outline-none focus:ring-4 focus:ring-primary/50
                      active:scale-95 tablet:hover:scale-105 min-h-[44px] min-w-[44px]
                      tablet:min-h-[64px] tablet:min-w-[64px]
                      ${getButtonStyle(option)}
                      ${logicGame.showFeedback || !logicGame.isAnswering ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span>{option}</span>
                    {getButtonIcon(option) && (
                      <div className="absolute -top-2 -right-2">
                        {getButtonIcon(option)}
                      </div>
                    )}
                    </Button>
                ))}
                  </div>
                  
              {/* Feedback Message */}
              {logicGame.showFeedback && (
                <div className="mt-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold ${
                    logicGame.lastAnswerCorrect 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {logicGame.lastAnswerCorrect ? (
                      <>
                          <CheckCircle className="w-5 h-5" />
                        🎉 Mükemmel! +{logicGame.currentQuestion.level * 10} puan
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        💭 Doğru cevap: <strong>{logicGame.currentQuestion.answer}</strong>
                      </>
                      )}
                    </div>
                </div>
              )}

            </CardContent>
          </Card>



    </div>
      )}
    </UniversalGameEngine>
  )
}

export default MantikDizileriSayfasi