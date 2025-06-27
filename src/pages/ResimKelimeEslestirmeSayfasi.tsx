import React, { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import UniversalGameEngine from '@/components/GameEngine/UniversalGameEngine'
import { IMAGE_WORD_MATCHING_CONFIG } from '@/components/GameEngine/gameConfigs'
import { useUniversalGame } from '@/hooks/useUniversalGame'
import { useImageWordMatching } from '@/hooks/useImageWordMatching'
import { GameResult } from '@/components/GameEngine/types'
import { toast } from '@/components/ui/sonner'
import { gameTimings, uiStyles } from '@/lib/utils'

interface ResimKelimeEslestirmeSayfasiProps {
  onBack: () => void
}

const ResimKelimeEslestirmeSayfasi: React.FC<ResimKelimeEslestirmeSayfasiProps> = ({ onBack }) => {
  // 🎯 Optimized question count for clinical assessment balance (10 categories × 2 questions each)
  const TOTAL_QUESTIONS = 20
  // 🔧 FIX: Use unified feedback duration for consistency
  const FEEDBACK_DURATION = gameTimings.matchingGames.feedbackDuration

  // Universal game hook
  const universalGame = useUniversalGame({
    exerciseName: 'Resim-Kelime Eşleştirme',
    onComplete: (result: GameResult) => {
      console.log('Image-Word matching completed:', result)
    }
  })

  // Image-Word matching specific logic
  const matchingGame = useImageWordMatching({
    totalQuestions: TOTAL_QUESTIONS
  })

  // Initialize game on mount
  useEffect(() => {
    matchingGame.initializeGame()
  }, [])

  // Handle game completion with clinical assessment
  useEffect(() => {
    if (matchingGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = matchingGame.getFinalStats()
      
      // 🧠 Enhanced result with clinical assessment data
      const result: GameResult = {
        exerciseName: 'Resim-Kelime Eşleştirme',
        score: Math.round((finalStats.score / TOTAL_QUESTIONS) * 100),
        duration: universalGame.gameState.duration,
        completed: true,
        accuracy: finalStats.accuracy,
        details: {
          exercise_name: 'Resim-Kelime Eşleştirme',
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
            response_times: finalStats.responseTimes,
            
            // 🧠 Clinical Assessment Data
            clinicalData: finalStats.clinicalData,
            categoryPerformance: finalStats.categoryPerformance
          }
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('🧠 Clinical Assessment Results:', {
        overallCognition: finalStats.clinicalData.overallCognition,
        semanticAccuracy: finalStats.clinicalData.semanticAccuracy,
        processingSpeed: finalStats.clinicalData.processingSpeed,
        patternRecognition: finalStats.clinicalData.patternRecognition,
        cognitiveFlexibility: finalStats.clinicalData.cognitiveFlexibility,
        categoryPerformance: finalStats.clinicalData.categoryPerformance,
        cognitiveProfile: finalStats.clinicalData.cognitiveProfile
      })
      
      universalGame.gameActions.onComplete(result)
    }
  }, [matchingGame.isGameCompleted, universalGame.gameState.isCompleted, TOTAL_QUESTIONS])

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
  const handleAnswerSelect = (answer: string) => {
    if (!universalGame.gameState.isPlaying || universalGame.gameState.isPaused) return
    
    matchingGame.handleAnswerSelect(answer)
  }

  // Get button style based on feedback
  const getButtonStyle = (option: string) => {
    if (!matchingGame.showFeedback) {
      return 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-[1.02] transition-all duration-200'
    }

    const isCorrect = matchingGame.currentQuestion?.correctAnswer.word === option
    const isSelected = matchingGame.selectedAnswer === option

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
  const getButtonIcon = (option: string) => {
    if (!matchingGame.showFeedback) return null

    const isCorrect = matchingGame.currentQuestion?.correctAnswer.word === option
    const isSelected = matchingGame.selectedAnswer === option

    if (isSelected && matchingGame.lastAnswerCorrect) {
      return <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
    }
    
    if (isSelected && !matchingGame.lastAnswerCorrect) {
      return <XCircle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
    }
    
    if (isCorrect && !isSelected) {
      return <CheckCircle className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
    }

    return null
  }

        return (
    <UniversalGameEngine
      gameConfig={IMAGE_WORD_MATCHING_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      {/* Error Display */}
      {matchingGame.error && (
        <div className="w-full max-w-2xl mx-auto">
          <Card className={uiStyles.statusCard.error}>
            <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
              <div className="flex flex-col items-center gap-3">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                  Bir Hata Oluştu
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  {matchingGame.error.message}
                </p>
                <Button 
                  onClick={matchingGame.recoverFromError}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tekrar Dene
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading Display */}
      {matchingGame.isLoading && (
        <div className="w-full max-w-2xl mx-auto">
          <Card className={uiStyles.statusCard.loading}>
            <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
              <Loader2 className="h-12 w-12 border-b-2 border-primary mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">Oyun yükleniyor...</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Content - Only show when playing and no errors */}
      {!matchingGame.error && !matchingGame.isLoading && universalGame.gameState.phase === 'playing' && matchingGame.currentQuestion && (
        <div className="w-full max-w-2xl mx-auto space-y-6">
          
          {/* Question Card - Super Clean & Obvious */}
          <Card className={uiStyles.gameCard.primary}>
            <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
              
              {/* 🏷️ Category Indicator for Clinical Tracking */}
              {matchingGame.currentCategory && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                    📂 {matchingGame.currentCategory}
                  </span>
                </div>
              )}
              
              {/* Large Emoji Display */}
              <div className="mb-6">
                <div className="text-7xl sm:text-8xl md:text-9xl mb-4 select-none">
                  {matchingGame.currentQuestion.correctAnswer.emoji}
                </div>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 font-medium">
                    Yukarıdakine en uygun kelimeyi seçin
                  </p>
                </div>

              {/* Answer Options - Super Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {matchingGame.currentQuestion.options.map((option, index) => {
                     const optionText = typeof option === 'string' ? option : option.word
                     return (
                       <Button
                         key={index}
                         variant="outline"
                         size="lg"
                         onClick={() => handleAnswerSelect(optionText)}
                         onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
                         disabled={matchingGame.showFeedback || !matchingGame.isAnswering}
                         className={`
                           h-14 sm:h-16 text-base sm:text-lg font-semibold border-2 transition-all duration-300
                           touch-manipulation select-none focus:outline-none focus:ring-4 focus:ring-primary/50
                           active:scale-95 tablet:hover:scale-[1.02] min-h-[44px] min-w-[44px]
                           tablet:min-h-[64px] tablet:min-w-[64px]
                           ${getButtonStyle(optionText)}
                           ${matchingGame.showFeedback || !matchingGame.isAnswering ? 'cursor-default' : 'cursor-pointer'}
                         `}
                         style={{ touchAction: 'manipulation' }}
                    >
                      {getButtonIcon(optionText)}
                      <span className="truncate">{optionText}</span>
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
                        💭 Doğru cevap: <strong>{matchingGame.currentQuestion.correctAnswer.word}</strong>
                        </>
                      )}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

          {/* Progress Indicator - Simple & Clear */}
          <Card className={uiStyles.gameCard.secondary}>
            <CardContent className={uiStyles.cardContent.compact}>
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

export default ResimKelimeEslestirmeSayfasi