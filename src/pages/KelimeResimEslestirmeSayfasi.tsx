import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import UniversalGameEngine from '@/components/GameEngine/UniversalGameEngine'
import { WORD_IMAGE_MATCHING_CONFIG } from '@/components/GameEngine/gameConfigs'
import { useUniversalGame } from '@/hooks/useUniversalGame'
import { useWordImageMatching } from '@/hooks/useWordImageMatching'
import { GameResult } from '@/components/GameEngine/types'
import { ExerciseItem } from '@/utils/matchingExerciseUtils'

interface KelimeResimEslestirmeSayfasiProps {
  onBack: () => void
}

const KelimeResimEslestirmeSayfasi: React.FC<KelimeResimEslestirmeSayfasiProps> = ({ onBack }) => {
  const TOTAL_QUESTIONS = 30
  const FEEDBACK_DURATION = 1500

  // Universal game hook
  const universalGame = useUniversalGame({
    exerciseName: 'Kelime-Resim Eşleştirme',
    onComplete: (result: GameResult) => {
      console.log('Word-Image matching completed:', result)
    }
  })

  // Word-Image matching specific logic
  const matchingGame = useWordImageMatching({
    totalQuestions: TOTAL_QUESTIONS
  })

  // Initialize game on mount
  useEffect(() => {
    matchingGame.initializeGame()
  }, [])

  // Handle game completion
  useEffect(() => {
    if (matchingGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = matchingGame.getFinalStats()
      
      const result: GameResult = {
        exerciseName: 'Kelime-Resim Eşleştirme',
        score: Math.round((finalStats.score / TOTAL_QUESTIONS) * 100),
        duration: universalGame.gameState.duration,
        completed: true,
        accuracy: finalStats.accuracy,
        details: {
          exercise_name: 'Kelime-Resim Eşleştirme',
          category_played: 'Karışık',
          questions_total: TOTAL_QUESTIONS,
          correct_answers: finalStats.score,
          incorrect_answers: TOTAL_QUESTIONS - finalStats.score,
          duration_seconds: universalGame.gameState.duration,
          score: Math.round((finalStats.score / TOTAL_QUESTIONS) * 100),
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
  }, [matchingGame.isGameCompleted, universalGame.gameState.isCompleted])

  // Update game stats
  useEffect(() => {
    universalGame.updateGameStats({
      score: Math.round((matchingGame.score / TOTAL_QUESTIONS) * 100),
      progress: `${matchingGame.questionNumber}/${TOTAL_QUESTIONS}`,
      accuracy: matchingGame.score > 0 ? (matchingGame.score / matchingGame.questionNumber) * 100 : 0
    })
  }, [matchingGame.score, matchingGame.questionNumber])

  // Handle question progression
  useEffect(() => {
    if (matchingGame.showFeedback) {
      const timer = setTimeout(() => {
        if (matchingGame.questionNumber >= TOTAL_QUESTIONS) {
          // Game will complete, let useEffect handle it
          return
        } else {
          matchingGame.nextQuestion()
          matchingGame.generateNewQuestion()
        }
      }, FEEDBACK_DURATION)
      
      return () => clearTimeout(timer)
    }
  }, [matchingGame.showFeedback, matchingGame.questionNumber])

  // Custom game hook
  const gameHook = () => ({
    ...universalGame,
    gameActions: {
      ...universalGame.gameActions,
      onStart: () => {
        universalGame.gameActions.onStart()
        matchingGame.generateNewQuestion()
      },
      onRestart: () => {
        matchingGame.initializeGame()
        universalGame.gameActions.onRestart()
      }
    }
  })

  // Handle answer selection
  const handleAnswerSelect = (emoji: string) => {
    if (!universalGame.gameState.isPlaying || universalGame.gameState.isPaused) return
    
    matchingGame.handleAnswerSelect(emoji)
  }

  // Get button style based on feedback
  const getButtonStyle = (option: ExerciseItem) => {
    if (!matchingGame.showFeedback) {
      return 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-[1.02] transition-all duration-200'
    }

    const isCorrect = matchingGame.currentQuestion?.correctAnswer.emoji === option.emoji
    const isSelected = matchingGame.selectedAnswer === option.emoji

    if (isSelected && matchingGame.lastAnswerCorrect) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
    }
    
    if (isSelected && !matchingGame.lastAnswerCorrect) {
      return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
    }
    
    if (isCorrect && !isSelected) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
    }

    return 'bg-gray-100 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200 dark:border-gray-700 opacity-60'
  }

  // Get icon for button
  const getButtonIcon = (option: ExerciseItem) => {
    if (!matchingGame.showFeedback) return null

    const isCorrect = matchingGame.currentQuestion?.correctAnswer.emoji === option.emoji
    const isSelected = matchingGame.selectedAnswer === option.emoji

    if (isSelected && matchingGame.lastAnswerCorrect) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
    }
    
    if (isSelected && !matchingGame.lastAnswerCorrect) {
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
    }
    
    if (isCorrect && !isSelected) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
    }

    return null
  }

  return (
    <UniversalGameEngine
      gameConfig={WORD_IMAGE_MATCHING_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      {/* Game Content - Only show when playing */}
      {universalGame.gameState.phase === 'playing' && matchingGame.currentQuestion && (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          
          {/* Question Card - Super Clean & Obvious */}
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
            <CardContent className="p-6 sm:p-8 text-center">
              
              {/* Large Word Display */}
          <div className="mb-6">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-4 font-bold text-gray-800 dark:text-gray-200 p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20">
                  {matchingGame.currentQuestion.correctAnswer.word}
            </div>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                  Bu kelimeye uygun emojiyi seçin
                </p>
              </div>

              {/* Emoji Options - Super Responsive Grid */}
              <div className="grid grid-cols-2 gap-4">
                {matchingGame.currentQuestion.options.map((option, index) => {
                  const optionItem = option as ExerciseItem
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      onClick={() => handleAnswerSelect(optionItem.emoji)}
                      disabled={matchingGame.showFeedback || !matchingGame.isAnswering}
                      className={`
                        h-20 sm:h-24 text-4xl sm:text-5xl border-2 transition-all duration-300 relative
                        ${getButtonStyle(optionItem)}
                        ${matchingGame.showFeedback || !matchingGame.isAnswering ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                      `}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span role="img" aria-label={optionItem.word} className="select-none">
                          {optionItem.emoji}
                        </span>
                        {getButtonIcon(optionItem) && (
                          <div className="absolute -top-2 -right-2">
                            {getButtonIcon(optionItem)}
                          </div>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>

              {/* Feedback Message - Clear & Encouraging */}
              {matchingGame.showFeedback && (
                <div className="mt-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold ${
                    matchingGame.lastAnswerCorrect 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {matchingGame.lastAnswerCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        🎉 Harika! Doğru cevap!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        💭 Doğru cevap: <strong>{matchingGame.currentQuestion.correctAnswer.emoji}</strong>
                      </>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Progress Indicator - Simple & Clear */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Soru {matchingGame.questionNumber} / {TOTAL_QUESTIONS}
                </span>
                <span className="font-semibold text-primary">
                  Skor: {matchingGame.score} / {TOTAL_QUESTIONS}
                </span>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </UniversalGameEngine>
    )
}

export default KelimeResimEslestirmeSayfasi