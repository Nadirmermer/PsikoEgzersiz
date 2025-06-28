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
import { uiStyles } from '@/lib/utils'

interface MantikDizileriSayfasiProps {
  onBack: () => void
}

// Clinical Assessment Interface for Analytical Thinking
interface LogicSequencesClinicalData {
  analyticalThinking: number
  patternRecognition: number
  mathematicalReasoning: number
  sequentialLogic: number
  abstractReasoning: number
  cognitiveFlexibility: number
  overallCognitive: number
  // Pattern-level performance
  patternPerformance: {
    [key: string]: {
      attempts: number
      correctAnswers: number
      averageResponseTime: number
      accuracy: number
      difficultyLevel: number
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

interface LogicSequence {
  sequence: number[]
  answer: number
  level: number
  pattern: string
}

interface FinalStats {
  score: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  gameQuestions: LogicSequence[]
  userAnswers: number[]
  responseTimes: number[]
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

  // Clinical assessment calculation
  const calculateClinicalAssessment = React.useCallback((
    finalStats: FinalStats
  ): LogicSequencesClinicalData => {
    const { gameQuestions, userAnswers, responseTimes, correctCount } = finalStats
    const questionNumber = logicGame.questionNumber // Get from logicGame state
    
    // Calculate pattern-based performance
    const patternPerformance: LogicSequencesClinicalData['patternPerformance'] = {}
    
    gameQuestions.forEach((question, index) => {
      const pattern = question.pattern
      const isCorrect = userAnswers[index] === question.answer
      const responseTime = responseTimes[index] || 0
      
      if (!patternPerformance[pattern]) {
        patternPerformance[pattern] = {
          attempts: 0,
          correctAnswers: 0,
          averageResponseTime: 0,
          accuracy: 0,
          difficultyLevel: question.level
        }
      }
      
      patternPerformance[pattern].attempts++
      if (isCorrect) patternPerformance[pattern].correctAnswers++
      patternPerformance[pattern].averageResponseTime += responseTime
    })
    
    // Finalize pattern performance calculations
    Object.keys(patternPerformance).forEach(pattern => {
      const perf = patternPerformance[pattern]
      perf.accuracy = perf.attempts > 0 ? (perf.correctAnswers / perf.attempts) * 100 : 0
      perf.averageResponseTime = perf.attempts > 0 ? perf.averageResponseTime / perf.attempts : 0
    })
    
    // Calculate cognitive metrics
    const overallAccuracy = questionNumber > 0 ? (correctCount / questionNumber) * 100 : 0
    const averageResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length : 0
    
    // Analytical Thinking - based on accuracy across different pattern types
    const analyticalThinking = Math.min(100, 
      overallAccuracy + 
      (Object.keys(patternPerformance).length * 5) + // Bonus for handling different patterns
      (averageResponseTime < 5000 ? 10 : 0) // Bonus for quick thinking
    )
    
    // Pattern Recognition - how well they handle recurring patterns
    const patternAccuracies = Object.values(patternPerformance).map(p => p.accuracy)
    const patternRecognition = patternAccuracies.length > 0 ? 
      Math.round(patternAccuracies.reduce((a, b) => a + b, 0) / patternAccuracies.length) : 0
    
    // Mathematical Reasoning - performance on arithmetic and geometric patterns
    const mathPatterns = ['Aritmetik', 'Geometrik', 'Kare Sayılar']
    const mathPerformances = Object.entries(patternPerformance)
      .filter(([pattern]) => mathPatterns.some(mp => pattern.includes(mp)))
      .map(([, perf]) => perf.accuracy)
    const mathematicalReasoning = mathPerformances.length > 0 ?
      Math.round(mathPerformances.reduce((a, b) => a + b, 0) / mathPerformances.length) : 0
    
    // Sequential Logic - ability to understand step-by-step patterns
    const sequentialLogic = Math.min(100,
      overallAccuracy + 
      (averageResponseTime < 8000 ? 15 : averageResponseTime < 15000 ? 5 : -5)
    )
    
    // Abstract Reasoning - performance on complex patterns like Fibonacci
    const abstractPatterns = ['Fibonacci', 'Kare Sayılar']
    const abstractPerformances = Object.entries(patternPerformance)
      .filter(([pattern]) => abstractPatterns.some(ap => pattern.includes(ap)))
      .map(([, perf]) => perf.accuracy)
    const abstractReasoning = abstractPerformances.length > 0 ?
      Math.round(abstractPerformances.reduce((a, b) => a + b, 0) / abstractPerformances.length) : 
      Math.max(50, overallAccuracy)
    
    // Cognitive Flexibility - how well they adapt to different pattern types
    const patternTypeCount = Object.keys(patternPerformance).length
    const cognitiveFlexibility = Math.min(100,
      (patternTypeCount * 20) + // More patterns = better flexibility
      (overallAccuracy * 0.5) +
      (averageResponseTime < 10000 ? 20 : 0)
    )
    
    // Overall Cognitive Score (weighted)
    const overallCognitive = Math.round(
      (analyticalThinking * 0.25) +
      (patternRecognition * 0.25) +
      (mathematicalReasoning * 0.2) +
      (sequentialLogic * 0.15) +
      (abstractReasoning * 0.1) +
      (cognitiveFlexibility * 0.05)
    )
    
    // Generate clinical insights
    const insights: string[] = []
    if (analyticalThinking >= 85) insights.push("Excellent analytical and logical thinking abilities")
    if (patternRecognition >= 80) insights.push("Strong pattern recognition and identification skills")
    if (mathematicalReasoning >= 85) insights.push("Superior mathematical reasoning capabilities")
    if (sequentialLogic >= 80) insights.push("Effective sequential and step-by-step thinking")
    if (abstractReasoning >= 75) insights.push("Good abstract reasoning and conceptual thinking")
    if (cognitiveFlexibility >= 80) insights.push("Excellent cognitive flexibility and adaptability")
    if (overallAccuracy >= 90) insights.push("Demonstrates exceptional logical problem-solving")
    if (averageResponseTime < 5000) insights.push("Quick analytical processing and decision making")
    
    return {
      analyticalThinking,
      patternRecognition,
      mathematicalReasoning,
      sequentialLogic,
      abstractReasoning,
      cognitiveFlexibility,
      overallCognitive,
      patternPerformance,
      clinicalInsights: insights,
      cognitiveProfile: {
        recommendations: generateRecommendations(overallCognitive, analyticalThinking),
        strengths: generateStrengths(patternRecognition, mathematicalReasoning, abstractReasoning),
        improvementAreas: generateImprovementAreas(sequentialLogic, cognitiveFlexibility, analyticalThinking)
      }
    }
  }, [logicGame.questionNumber])

  // Helper functions for clinical assessment
  const generateRecommendations = (cognitive: number, analytical: number): string[] => {
    const recommendations: string[] = []
    if (cognitive < 70) recommendations.push("Practice with simpler logical reasoning exercises")
    if (analytical < 80) recommendations.push("Focus on step-by-step problem analysis")
    if (cognitive >= 90) recommendations.push("Challenge with advanced mathematical sequences")
    return recommendations
  }

  const generateStrengths = (pattern: number, math: number, abstract: number): string[] => {
    const strengths: string[] = []
    if (pattern >= 80) strengths.push("Pattern recognition")
    if (math >= 80) strengths.push("Mathematical reasoning")
    if (abstract >= 80) strengths.push("Abstract thinking")
    return strengths
  }

  const generateImprovementAreas = (sequential: number, flexibility: number, analytical: number): string[] => {
    const areas: string[] = []
    if (sequential < 70) areas.push("Sequential logic")
    if (flexibility < 70) areas.push("Cognitive flexibility")
    if (analytical < 70) areas.push("Analytical thinking")
    return areas
  }

  // Handle game completion with clinical assessment
  useEffect(() => {
    if (logicGame.isGameCompleted && !universalGame.gameState.isCompleted) {
      const finalStats = logicGame.getFinalStats()
      
      // Calculate clinical assessment
      const clinicalAssessment = calculateClinicalAssessment(finalStats)
      
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
          },
          // Clinical data
          clinicalData: clinicalAssessment
        },
        timestamp: new Date().toISOString()
      }
      
      console.log('🧠 Logic Sequences Clinical Assessment:', {
        analyticalThinking: clinicalAssessment.analyticalThinking,
        patternRecognition: clinicalAssessment.patternRecognition,
        mathematicalReasoning: clinicalAssessment.mathematicalReasoning,
        overallCognitive: clinicalAssessment.overallCognitive,
        clinicalInsights: clinicalAssessment.clinicalInsights
      })
      
      universalGame.gameActions.onComplete(result)
    }
  }, [logicGame.isGameCompleted, universalGame.gameState.isCompleted, calculateClinicalAssessment])

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

  const answerOptions = logicGame.getAnswerOptions()
    
    return (
    <UniversalGameEngine
      gameConfig={LOGIC_SEQUENCES_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      {/* Error Display */}
      {logicGame.error && (
        <div className="w-full max-w-3xl mx-auto">
          <Card className={uiStyles.statusCard.error}>
            <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
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
          <Card className={uiStyles.statusCard.loading}>
            <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
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
          <Card className={uiStyles.gameCard.primary}>
            <CardContent className={`${uiStyles.cardContent.standard} text-center`}>
              
              {/* Level Badge - Enhanced for tablet */}
              <div className="mb-6">
                <Badge variant="secondary" className="text-sm sm:text-base lg:text-lg px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/60 rounded-xl shadow-sm">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2" />
                  <span className="font-semibold">
                    Level {logicGame.currentQuestion.level} • {logicGame.currentQuestion.pattern}
                  </span>
                </Badge>
          </div>

              {/* Sequence Display - Tablet Optimized */}
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  Bu dizideki eksik sayıyı bulun:
                </h3>
                
                <div className="flex justify-center items-center gap-2 sm:gap-3 lg:gap-4 mb-4 flex-wrap max-w-4xl mx-auto">
                  {logicGame.currentQuestion.sequence.map((num, index) => (
                    <div key={index} className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-white/40 dark:border-gray-700/40 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200">
                      <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 dark:text-gray-200">
                        {num}
                      </span>
                    </div>
                  ))}
                  
                  {/* Question mark - Enhanced tablet design */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-br from-amber-500/90 to-orange-500 backdrop-blur-sm border-2 border-amber-400/60 rounded-xl flex items-center justify-center animate-pulse shadow-lg">
                    <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white drop-shadow-sm">
                    ?
                    </span>
                  </div>
                </div>

                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-center">
                  Pattern'i analiz edin ve doğru sayıyı bulun
                </p>
              </div>

              {/* Answer Options - Tablet Optimized Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-2xl lg:max-w-4xl mx-auto">
                {answerOptions.map((option, index) => (
                    <Button
                    key={index}
                    variant="outline"
                      size="lg"
                    onClick={() => handleAnswerSelect(option)}
                    onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
                    disabled={logicGame.showFeedback || !logicGame.isAnswering}
                    className={`
                      h-14 sm:h-16 lg:h-20 xl:h-24 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold border-2 transition-all duration-300 relative
                      touch-manipulation select-none focus:outline-none focus:ring-4 focus:ring-amber-500/50
                      active:scale-95 tablet:hover:scale-105 min-h-[44px] min-w-[44px]
                      tablet:min-h-[64px] tablet:min-w-[64px] lg:min-h-[80px] lg:min-w-[80px]
                      rounded-xl shadow-sm hover:shadow-lg
                      ${getButtonStyle(option)}
                      ${logicGame.showFeedback || !logicGame.isAnswering ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                    `}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="font-extrabold">{option}</span>
                    {getButtonIcon(option) && (
                      <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3">
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