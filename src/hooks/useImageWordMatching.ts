import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  generateMatchingQuestion, 
  MatchingQuestion, 
  exerciseCategories,
  initializeBalancedGeneration,
  resetQuestionGeneration,
  getQuestionGenerationStats
} from '@/utils/matchingExerciseUtils'
import { useAudio } from './useAudio'

interface UseImageWordMatchingProps {
  totalQuestions: number
}

// 🧠 Clinical Data Structure - Multi-dimensional Assessment
export interface ClinicalImageWordData {
  // Core performance metrics
  semanticAccuracy: number        // Category-based accuracy score (0-100)
  processingSpeed: number         // Response time efficiency score (0-100)
  patternRecognition: number      // Cross-category consistency score (0-100)
  cognitiveFlexibility: number    // Category-switching adaptation score (0-100)
  overallCognition: number        // Weighted composite score (0-100)
  
  // Category-specific performance analysis
  categoryPerformance: {
    [categoryName: string]: {
      questionsAsked: number
      correctAnswers: number
      accuracy: number
      averageResponseTime: number
      fastestResponse: number
      slowestResponse: number
      errorTypes: string[]
    }
  }
  
  // Response pattern analysis
  responsePatterns: {
    totalQuestions: number
    averageResponseTime: number
    responseTimeConsistency: number  // Lower variance = better consistency
    accuracyProgression: number[]    // Accuracy over time
    speedProgression: number[]       // Speed over time
  }
  
  // Clinical insights and profiling
  cognitiveProfile: {
    dominantStrengths: string[]      // Best performing categories
    identifiedWeaknesses: string[]  // Problematic categories
    processingStyle: 'fast-accurate' | 'slow-accurate' | 'fast-error-prone' | 'inconsistent'
    recommendedInterventions: string[]
    clinicalNotes: string[]
  }
  
  // Raw data for detailed analysis
  rawSessionData: {
    questions: MatchingQuestion[]
    responses: Array<{
      questionIndex: number
      category: string
      userAnswer: string
      correctAnswer: string
      isCorrect: boolean
      responseTime: number
      timestamp: string
    }>
  }
}

export interface ImageWordMatchingState {
  currentQuestion: MatchingQuestion | null
  questionNumber: number
  score: number
  isAnswering: boolean
  showFeedback: boolean
  lastAnswerCorrect: boolean
  selectedAnswer: string
  questionStartTime: number
  
  // Enhanced tracking for clinical assessment
  currentCategory: string
  categoryQuestionCounts: { [categoryName: string]: number }
  
  // Stats for final results
  gameQuestions: MatchingQuestion[]
  userAnswers: boolean[]
  responseTimes: number[]
  
  // Clinical data
  clinicalData: ClinicalImageWordData
}

// Error handling için
interface ImageWordMatchingError {
  type: 'initialization' | 'gameplay' | 'question_generation' | 'clinical_analysis'
  message: string
}

export const useImageWordMatching = ({ totalQuestions }: UseImageWordMatchingProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<ImageWordMatchingError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize clinical data structure
  const initializeClinicalData = (): ClinicalImageWordData => ({
    semanticAccuracy: 0,
    processingSpeed: 0,
    patternRecognition: 0,
    cognitiveFlexibility: 0,
    overallCognition: 0,
    categoryPerformance: {},
    responsePatterns: {
      totalQuestions: 0,
      averageResponseTime: 0,
      responseTimeConsistency: 0,
      accuracyProgression: [],
      speedProgression: []
    },
    cognitiveProfile: {
      dominantStrengths: [],
      identifiedWeaknesses: [],
      processingStyle: 'inconsistent',
      recommendedInterventions: [],
      clinicalNotes: []
    },
    rawSessionData: {
      questions: [],
      responses: []
    }
  })

  // Initialize category question counts
  const initializeCategoryQuestionCounts = () => {
    const counts: { [categoryName: string]: number } = {}
    exerciseCategories.forEach(category => {
      counts[category.name] = 0
    })
    return counts
  }

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const [state, setState] = useState<ImageWordMatchingState>({
    currentQuestion: null,
    questionNumber: 1,
    score: 0,
    isAnswering: false,
    showFeedback: false,
    lastAnswerCorrect: false,
    selectedAnswer: '',
    questionStartTime: 0,
    currentCategory: '',
    categoryQuestionCounts: initializeCategoryQuestionCounts(),
    gameQuestions: [],
    userAnswers: [],
    responseTimes: [],
    clinicalData: initializeClinicalData()
  })

  // 🧠 Clinical Analysis Functions

  // Calculate semantic accuracy based on category performance
  const calculateSemanticAccuracy = (categoryPerf: ClinicalImageWordData['categoryPerformance']): number => {
    const categories = Object.keys(categoryPerf)
    if (categories.length === 0) return 0
    
    const avgAccuracy = categories.reduce((sum, cat) => sum + categoryPerf[cat].accuracy, 0) / categories.length
    return Math.round(avgAccuracy)
  }

  // Calculate processing speed score (faster responses = higher score)
  const calculateProcessingSpeed = (responses: ClinicalImageWordData['rawSessionData']['responses']): number => {
    if (responses.length === 0) return 0
    
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    
    // Optimal response time range: 1-3 seconds
    // Score decreases for very fast (<1s) or very slow (>5s) responses
    if (avgResponseTime < 1000) return Math.max(60, 100 - (1000 - avgResponseTime) / 10) // Too fast = less thoughtful
    if (avgResponseTime <= 3000) return 100 // Optimal range
    if (avgResponseTime <= 5000) return Math.max(40, 100 - (avgResponseTime - 3000) / 20) // Slower but acceptable
    return Math.max(20, 100 - (avgResponseTime - 5000) / 50) // Very slow
  }

  // Calculate pattern recognition (consistency across categories)
  const calculatePatternRecognition = (categoryPerf: ClinicalImageWordData['categoryPerformance']): number => {
    const accuracies = Object.values(categoryPerf).map(perf => perf.accuracy)
    if (accuracies.length === 0) return 0
    
    // Lower variance in accuracy across categories = better pattern recognition
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length
    
    // Convert variance to consistency score (lower variance = higher score)
    const consistencyScore = Math.max(0, 100 - variance)
    return Math.round(consistencyScore)
  }

  // Calculate cognitive flexibility (adaptation to category changes)
  const calculateCognitiveFlexibility = (responses: ClinicalImageWordData['rawSessionData']['responses']): number => {
    if (responses.length < 2) return 50 // Default for insufficient data
    
    let categoryChanges = 0
    let accuracyAfterChange = 0
    
    for (let i = 1; i < responses.length; i++) {
      if (responses[i].category !== responses[i-1].category) {
        categoryChanges++
        if (responses[i].isCorrect) accuracyAfterChange++
      }
    }
    
    if (categoryChanges === 0) return 75 // No category changes to evaluate
    
    const flexibilityRatio = accuracyAfterChange / categoryChanges
    return Math.round(flexibilityRatio * 100)
  }

  // Generate cognitive profile and recommendations
  const generateCognitiveProfile = (
    categoryPerf: ClinicalImageWordData['categoryPerformance'],
    overallMetrics: { semantic: number, speed: number, pattern: number, flexibility: number }
  ): ClinicalImageWordData['cognitiveProfile'] => {
    const profile: ClinicalImageWordData['cognitiveProfile'] = {
      dominantStrengths: [],
      identifiedWeaknesses: [],
      processingStyle: 'inconsistent',
      recommendedInterventions: [],
      clinicalNotes: []
    }

    // Identify strongest and weakest categories
    const sortedCategories = Object.entries(categoryPerf)
      .filter(([_, perf]) => perf.questionsAsked > 0)
      .sort((a, b) => b[1].accuracy - a[1].accuracy)
    
    if (sortedCategories.length > 0) {
      profile.dominantStrengths = sortedCategories.slice(0, 2).map(([cat, _]) => cat)
      profile.identifiedWeaknesses = sortedCategories.slice(-2).map(([cat, _]) => cat)
    }

    // Determine processing style
    if (overallMetrics.speed >= 80 && overallMetrics.semantic >= 80) {
      profile.processingStyle = 'fast-accurate'
    } else if (overallMetrics.speed < 60 && overallMetrics.semantic >= 80) {
      profile.processingStyle = 'slow-accurate'  
    } else if (overallMetrics.speed >= 80 && overallMetrics.semantic < 60) {
      profile.processingStyle = 'fast-error-prone'
    } else {
      profile.processingStyle = 'inconsistent'
    }

    // Generate recommendations based on performance patterns
    if (overallMetrics.semantic < 60) {
      profile.recommendedInterventions.push('Semantic memory strengthening exercises')
      profile.recommendedInterventions.push('Category-specific vocabulary building')
    }
    
    if (overallMetrics.speed < 60) {
      profile.recommendedInterventions.push('Processing speed enhancement activities')
      profile.recommendedInterventions.push('Timed cognitive exercises')
    }
    
    if (overallMetrics.pattern < 60) {
      profile.recommendedInterventions.push('Pattern recognition training')
      profile.recommendedInterventions.push('Cross-modal association exercises')
    }
    
    if (overallMetrics.flexibility < 60) {
      profile.recommendedInterventions.push('Cognitive flexibility training')
      profile.recommendedInterventions.push('Task-switching exercises')
    }

    // Generate clinical notes
    profile.clinicalNotes.push(`Semantic accuracy: ${overallMetrics.semantic}%`)
    profile.clinicalNotes.push(`Processing efficiency: ${overallMetrics.speed}%`)
    profile.clinicalNotes.push(`Pattern consistency: ${overallMetrics.pattern}%`)
    profile.clinicalNotes.push(`Cognitive flexibility: ${overallMetrics.flexibility}%`)

    return profile
  }

  // Comprehensive clinical analysis
  const generateClinicalAssessment = (finalState: ImageWordMatchingState): ClinicalImageWordData => {
    const clinicalData = { ...finalState.clinicalData }
    
    // Update category performance
    const categoryPerf: ClinicalImageWordData['categoryPerformance'] = {}
    
    finalState.gameQuestions.forEach((question, index) => {
      const category = question.correctAnswer.emoji // We'll need to map this to category name
      const categoryName = exerciseCategories.find(cat => 
        cat.items.some(item => item.emoji === question.correctAnswer.emoji)
      )?.name || 'Unknown'
      
      if (!categoryPerf[categoryName]) {
        categoryPerf[categoryName] = {
          questionsAsked: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageResponseTime: 0,
          fastestResponse: Infinity,
          slowestResponse: 0,
          errorTypes: []
        }
      }
      
      const perf = categoryPerf[categoryName]
      const isCorrect = finalState.userAnswers[index]
      const responseTime = finalState.responseTimes[index]
      
      perf.questionsAsked++
      if (isCorrect) perf.correctAnswers++
      perf.accuracy = (perf.correctAnswers / perf.questionsAsked) * 100
      perf.fastestResponse = Math.min(perf.fastestResponse, responseTime)
      perf.slowestResponse = Math.max(perf.slowestResponse, responseTime)
      
      if (!isCorrect) {
        perf.errorTypes.push(`${question.correctAnswer.word} -> ${finalState.clinicalData.rawSessionData.responses[index]?.userAnswer || 'No answer'}`)
      }
    })
    
    // Calculate average response times per category
    Object.keys(categoryPerf).forEach(categoryName => {
      const categoryResponses = finalState.clinicalData.rawSessionData.responses.filter(r => r.category === categoryName)
      if (categoryResponses.length > 0) {
        categoryPerf[categoryName].averageResponseTime = 
          categoryResponses.reduce((sum, r) => sum + r.responseTime, 0) / categoryResponses.length
      }
    })
    
    clinicalData.categoryPerformance = categoryPerf
    
    // Calculate multi-dimensional scores
    clinicalData.semanticAccuracy = calculateSemanticAccuracy(categoryPerf)
    clinicalData.processingSpeed = calculateProcessingSpeed(finalState.clinicalData.rawSessionData.responses)
    clinicalData.patternRecognition = calculatePatternRecognition(categoryPerf)
    clinicalData.cognitiveFlexibility = calculateCognitiveFlexibility(finalState.clinicalData.rawSessionData.responses)
    
    // Calculate weighted overall cognition score
    clinicalData.overallCognition = Math.round(
      (clinicalData.semanticAccuracy * 0.4) +
      (clinicalData.processingSpeed * 0.25) +
      (clinicalData.patternRecognition * 0.2) +
      (clinicalData.cognitiveFlexibility * 0.15)
    )
    
    // Generate response patterns
    clinicalData.responsePatterns = {
      totalQuestions: finalState.gameQuestions.length,
      averageResponseTime: finalState.responseTimes.length > 0 
        ? finalState.responseTimes.reduce((sum, time) => sum + time, 0) / finalState.responseTimes.length 
        : 0,
      responseTimeConsistency: finalState.responseTimes.length > 1 
        ? 100 - (Math.sqrt(finalState.responseTimes.reduce((sum, time, _, arr) => {
            const mean = arr.reduce((s, t) => s + t, 0) / arr.length
            return sum + Math.pow(time - mean, 2)
          }, 0) / finalState.responseTimes.length) / 100)
        : 100,
      accuracyProgression: finalState.userAnswers.map((_, index) => {
        const correctSoFar = finalState.userAnswers.slice(0, index + 1).filter(Boolean).length
        return (correctSoFar / (index + 1)) * 100
      }),
      speedProgression: finalState.responseTimes.map((time, index) => {
        const avgSoFar = finalState.responseTimes.slice(0, index + 1).reduce((sum, t) => sum + t, 0) / (index + 1)
        return Math.max(0, 100 - (avgSoFar / 1000) * 10) // Convert to score
      })
    }
    
    // Generate cognitive profile
    clinicalData.cognitiveProfile = generateCognitiveProfile(categoryPerf, {
      semantic: clinicalData.semanticAccuracy,
      speed: clinicalData.processingSpeed,
      pattern: clinicalData.patternRecognition,
      flexibility: clinicalData.cognitiveFlexibility
    })
    
    return clinicalData
  }

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  // Initialize/reset game
  const initializeGame = useCallback(() => {
    try {
      setError(null)
      setIsLoading(true)
      
      // 🎯 Initialize balanced question generation for clinical assessment
      resetQuestionGeneration()
      initializeBalancedGeneration(totalQuestions)
      
      setState({
        currentQuestion: null,
        questionNumber: 1,
        score: 0,
        isAnswering: false,
        showFeedback: false,
        lastAnswerCorrect: false,
        selectedAnswer: '',
        questionStartTime: 0,
        currentCategory: '',
        categoryQuestionCounts: initializeCategoryQuestionCounts(),
        gameQuestions: [],
        userAnswers: [],
        responseTimes: [],
        clinicalData: initializeClinicalData()
      })
      
      console.log('🎯 Image-Word Matching Initialized with Balanced Generation:', {
        totalQuestions,
        categoriesCount: exerciseCategories.length,
        balanceStats: getQuestionGenerationStats()
      })
      
      setIsLoading(false)
    } catch (err) {
      console.error('Image-word matching initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [totalQuestions])

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    try {
      if (error || isLoading) return
      
      const question = generateMatchingQuestion('emoji-to-word')
      if (!question) {
        throw new Error('Question generation failed')
      }
      
      // Determine category of the question
      const categoryName = exerciseCategories.find(cat => 
        cat.items.some(item => item.emoji === question.correctAnswer.emoji)
      )?.name || 'Unknown'
      
      setState(prev => ({
        ...prev,
        currentQuestion: question,
        currentCategory: categoryName,
        questionStartTime: Date.now(),
        showFeedback: false,
        selectedAnswer: '',
        isAnswering: true,
        categoryQuestionCounts: {
          ...prev.categoryQuestionCounts,
          [categoryName]: prev.categoryQuestionCounts[categoryName] + 1
        }
      }))
    } catch (err) {
      console.error('Question generation error:', err)
      setError({
        type: 'question_generation',
        message: 'Yeni soru oluşturulamadı. Lütfen tekrar deneyin.'
      })
    }
  }, [error, isLoading])

  // Handle answer selection with clinical data collection
  const handleAnswerSelect = useCallback((answer: string) => {
    try {
      if (state.showFeedback || !state.currentQuestion || !state.isAnswering || error || isLoading) return

      const isCorrect = answer === state.currentQuestion.correctAnswer.word
      const responseTime = Date.now() - state.questionStartTime

      // Play sound effect
      playSound(isCorrect ? 'correct-answer' : 'wrong-answer')

      // Create response record for clinical analysis
      const responseRecord = {
        questionIndex: state.questionNumber - 1,
        category: state.currentCategory,
        userAnswer: answer,
        correctAnswer: state.currentQuestion.correctAnswer.word,
        isCorrect,
        responseTime,
        timestamp: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        selectedAnswer: answer,
        lastAnswerCorrect: isCorrect,
        showFeedback: true,
        isAnswering: false,
        score: isCorrect ? prev.score + 1 : prev.score,
        // Update stats
        gameQuestions: [...prev.gameQuestions, prev.currentQuestion!],
        userAnswers: [...prev.userAnswers, isCorrect],
        responseTimes: [...prev.responseTimes, responseTime],
        // Update clinical data
        clinicalData: {
          ...prev.clinicalData,
          rawSessionData: {
            ...prev.clinicalData.rawSessionData,
            questions: [...prev.clinicalData.rawSessionData.questions, prev.currentQuestion!],
            responses: [...prev.clinicalData.rawSessionData.responses, responseRecord]
          }
        }
      }))

      return isCorrect
    } catch (err) {
      console.error('Answer selection error:', err)
      setError({
        type: 'gameplay',
        message: 'Cevap işlenirken hata oluştu.'
      })
      return false
    }
  }, [state.showFeedback, state.currentQuestion, state.isAnswering, state.questionStartTime, state.questionNumber, state.currentCategory, playSound, error, isLoading])

  // Move to next question
  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      questionNumber: prev.questionNumber + 1,
      showFeedback: false,
      selectedAnswer: '',
      isAnswering: false
    }))
  }, [])

  // Check if game is completed
  const isGameCompleted = state.questionNumber > totalQuestions

  // Calculate progress
  const progress = Math.round(((state.questionNumber - 1) / totalQuestions) * 100)

  // Get final statistics with clinical assessment
  const getFinalStats = useCallback(() => {
    const accuracy = state.gameQuestions.length > 0 
      ? (state.score / state.gameQuestions.length) * 100 
      : 0
    
    const averageResponseTime = state.responseTimes.length > 0
      ? state.responseTimes.reduce((sum, time) => sum + time, 0) / state.responseTimes.length
      : 0

    // Generate comprehensive clinical assessment
    const clinicalAssessment = generateClinicalAssessment(state)

    return {
      score: state.score,
      totalQuestions: state.gameQuestions.length,
      accuracy,
      averageResponseTime,
      gameQuestions: state.gameQuestions,
      userAnswers: state.userAnswers,
      responseTimes: state.responseTimes,
      
      // 🧠 Enhanced clinical data
      clinicalData: clinicalAssessment,
      categoryPerformance: state.categoryQuestionCounts
    }
  }, [state])

  return {
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // Game state
    currentQuestion: state.currentQuestion,
    questionNumber: state.questionNumber,
    score: state.score,
    isAnswering: state.isAnswering,
    showFeedback: state.showFeedback,
    lastAnswerCorrect: state.lastAnswerCorrect,
    selectedAnswer: state.selectedAnswer,
    progress,
    isGameCompleted,
    
    // 🧠 Enhanced state for clinical assessment
    currentCategory: state.currentCategory,
    categoryQuestionCounts: state.categoryQuestionCounts,
    clinicalData: state.clinicalData,
    
    // Actions
    initializeGame,
    generateNewQuestion,
    handleAnswerSelect,
    nextQuestion,
    getFinalStats
  }
} 