import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  generateMatchingQuestion, 
  MatchingQuestion, 
  ExerciseItem,
  exerciseCategories,
  initializeBalancedGeneration,
  resetQuestionGeneration,
  getQuestionGenerationStats
} from '@/utils/matchingExerciseUtils'
import { useAudio } from './useAudio'

interface UseWordImageMatchingProps {
  totalQuestions: number
}

// 🧠 Clinical Data Structure - Reverse Processing Assessment (Kelime→Resim)
export interface ClinicalWordImageData {
  // Core reverse processing metrics
  visualSemanticMapping: number     // Kelime→resim accuracy score (0-100)
  reverseProcessingSpeed: number    // Semantic→visual efficiency score (0-100)
  visualRecognition: number         // Pattern recognition ability score (0-100)
  crossModalIntegration: number     // Semantic-visual pathway score (0-100)
  overallReverseProcessing: number  // Weighted composite score (0-100)
  
  // Category-specific reverse processing analysis
  categoryVisualPerformance: {
    [categoryName: string]: {
      semanticToVisualAccuracy: number
      visualRecognitionSpeed: number
      questionsAsked: number
      correctAnswers: number
      averageResponseTime: number
      fastestResponse: number
      slowestResponse: number
      reverseProcessingErrors: string[]
    }
  }
  
  // Reverse processing pattern analysis
  reverseProcessingPatterns: {
    totalQuestions: number
    averageResponseTime: number
    responseTimeConsistency: number  // Lower variance = better consistency
    accuracyProgression: number[]    // Accuracy over time
    speedProgression: number[]       // Speed over time
    semanticToVisualEfficiency: number // Overall semantic→visual pathway efficiency
  }
  
  // Clinical insights and reverse processing profiling
  reverseCognitiveProfile: {
    semanticStrengths: string[]       // Strong semantic categories
    visualWeaknesses: string[]        // Problematic visual recognition areas
    processingDirection: 'semantic-dominant' | 'visual-dominant' | 'balanced' | 'inconsistent'
    crossModalRecommendations: string[]
    reverseProcessingNotes: string[]
  }
  
  // Raw data for detailed reverse processing analysis
  rawReverseSessionData: {
    questions: MatchingQuestion[]
    responses: Array<{
      questionIndex: number
      category: string
      userSelectedEmoji: string
      correctEmoji: string
      presentedWord: string
      isCorrect: boolean
      responseTime: number
      semanticToVisualPathway: string // Which semantic→visual pathway was used
      timestamp: string
    }>
  }
}

interface WordImageMatchingState {
  currentQuestion: MatchingQuestion | null
  questionNumber: number
  score: number
  questionStartTime: number
  showFeedback: boolean
  lastAnswerCorrect: boolean
  selectedAnswer: string | null
  gameQuestions: MatchingQuestion[]
  userAnswers: boolean[]
  responseTimes: number[]
  isAnswering: boolean
  isGameCompleted: boolean
  
  // Enhanced tracking for reverse processing clinical assessment
  currentCategory: string
  categoryQuestionCounts: { [categoryName: string]: number }
  
  // Clinical data
  clinicalData: ClinicalWordImageData
}

// Error handling için
interface WordImageMatchingError {
  type: 'initialization' | 'gameplay' | 'question_generation' | 'reverse_processing_analysis'
  message: string
}

export const useWordImageMatching = ({ totalQuestions }: UseWordImageMatchingProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<WordImageMatchingError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize clinical data structure for reverse processing
  const initializeClinicalData = (): ClinicalWordImageData => ({
    visualSemanticMapping: 0,
    reverseProcessingSpeed: 0,
    visualRecognition: 0,
    crossModalIntegration: 0,
    overallReverseProcessing: 0,
    categoryVisualPerformance: {},
    reverseProcessingPatterns: {
      totalQuestions: 0,
      averageResponseTime: 0,
      responseTimeConsistency: 0,
      accuracyProgression: [],
      speedProgression: [],
      semanticToVisualEfficiency: 0
    },
    reverseCognitiveProfile: {
      semanticStrengths: [],
      visualWeaknesses: [],
      processingDirection: 'inconsistent',
      crossModalRecommendations: [],
      reverseProcessingNotes: []
    },
    rawReverseSessionData: {
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
  
  const [state, setState] = useState<WordImageMatchingState>({
    currentQuestion: null,
    questionNumber: 1,
    score: 0,
    questionStartTime: 0,
    showFeedback: false,
    lastAnswerCorrect: false,
    selectedAnswer: null,
    gameQuestions: [],
    userAnswers: [],
    responseTimes: [],
    isAnswering: true,
    isGameCompleted: false,
    currentCategory: '',
    categoryQuestionCounts: initializeCategoryQuestionCounts(),
    clinicalData: initializeClinicalData()
  })

  // 🧠 Clinical Analysis Functions for Reverse Processing

  // Calculate visual-semantic mapping based on category performance
  const calculateVisualSemanticMapping = (categoryPerf: ClinicalWordImageData['categoryVisualPerformance']): number => {
    const categories = Object.keys(categoryPerf)
    if (categories.length === 0) return 0
    
    const avgAccuracy = categories.reduce((sum, cat) => sum + categoryPerf[cat].semanticToVisualAccuracy, 0) / categories.length
    return Math.round(avgAccuracy)
  }

  // Calculate reverse processing speed (semantic→visual efficiency)
  const calculateReverseProcessingSpeed = (responses: ClinicalWordImageData['rawReverseSessionData']['responses']): number => {
    if (responses.length === 0) return 0
    
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    
    // Optimal reverse processing time range: 1.5-3.5 seconds (slightly longer than forward processing)
    // Score decreases for very fast (<1.5s) or very slow (>6s) responses
    if (avgResponseTime < 1500) return Math.max(50, 100 - (1500 - avgResponseTime) / 15) // Too fast = less thoughtful semantic processing
    if (avgResponseTime <= 3500) return 100 // Optimal semantic→visual range
    if (avgResponseTime <= 6000) return Math.max(30, 100 - (avgResponseTime - 3500) / 25) // Slower but acceptable
    return Math.max(10, 100 - (avgResponseTime - 6000) / 60) // Very slow reverse processing
  }

  // Calculate visual recognition (consistency in visual pattern identification)
  const calculateVisualRecognition = (categoryPerf: ClinicalWordImageData['categoryVisualPerformance']): number => {
    const accuracies = Object.values(categoryPerf).map(perf => perf.semanticToVisualAccuracy)
    if (accuracies.length === 0) return 0
    
    // Lower variance in visual recognition across categories = better visual pattern recognition
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length
    
    // Convert variance to visual recognition score (lower variance = higher score)
    const visualConsistencyScore = Math.max(0, 100 - variance)
    return Math.round(visualConsistencyScore)
  }

  // Calculate cross-modal integration (semantic→visual pathway efficiency)
  const calculateCrossModalIntegration = (responses: ClinicalWordImageData['rawReverseSessionData']['responses']): number => {
    if (responses.length < 2) return 50 // Default for insufficient data
    
    let categoryChanges = 0
    let accuracyAfterChange = 0
    
    for (let i = 1; i < responses.length; i++) {
      if (responses[i].category !== responses[i-1].category) {
        categoryChanges++
        if (responses[i].isCorrect) accuracyAfterChange++
      }
    }
    
    if (categoryChanges === 0) return 75 // No category changes to evaluate cross-modal flexibility
    
    const crossModalFlexibilityRatio = accuracyAfterChange / categoryChanges
    return Math.round(crossModalFlexibilityRatio * 100)
  }

  // Generate reverse cognitive profile and recommendations
  const generateReverseCognitiveProfile = (
    categoryPerf: ClinicalWordImageData['categoryVisualPerformance'],
    overallMetrics: { mapping: number, speed: number, recognition: number, integration: number }
  ): ClinicalWordImageData['reverseCognitiveProfile'] => {
    const profile: ClinicalWordImageData['reverseCognitiveProfile'] = {
      semanticStrengths: [],
      visualWeaknesses: [],
      processingDirection: 'inconsistent',
      crossModalRecommendations: [],
      reverseProcessingNotes: []
    }

    // Identify strongest semantic categories and weakest visual recognition areas
    const sortedCategories = Object.entries(categoryPerf)
      .filter(([_, perf]) => perf.questionsAsked > 0)
      .sort((a, b) => b[1].semanticToVisualAccuracy - a[1].semanticToVisualAccuracy)
    
    if (sortedCategories.length > 0) {
      profile.semanticStrengths = sortedCategories.slice(0, 2).map(([cat, _]) => cat)
      profile.visualWeaknesses = sortedCategories.slice(-2).map(([cat, _]) => cat)
    }

    // Determine processing direction preference
    if (overallMetrics.speed >= 80 && overallMetrics.mapping >= 80) {
      profile.processingDirection = 'semantic-dominant'
    } else if (overallMetrics.recognition >= 80 && overallMetrics.mapping >= 70) {
      profile.processingDirection = 'visual-dominant'  
    } else if (overallMetrics.integration >= 75 && overallMetrics.mapping >= 70) {
      profile.processingDirection = 'balanced'
    } else {
      profile.processingDirection = 'inconsistent'
    }

    // Generate cross-modal recommendations based on reverse processing patterns
    if (overallMetrics.mapping < 60) {
      profile.crossModalRecommendations.push('Semantic-visual mapping strengthening exercises')
      profile.crossModalRecommendations.push('Word-image association training')
    }
    
    if (overallMetrics.speed < 60) {
      profile.crossModalRecommendations.push('Reverse processing speed enhancement activities')
      profile.crossModalRecommendations.push('Semantic-to-visual pathway exercises')
    }
    
    if (overallMetrics.recognition < 60) {
      profile.crossModalRecommendations.push('Visual pattern recognition training')
      profile.crossModalRecommendations.push('Visual discrimination exercises')
    }
    
    if (overallMetrics.integration < 60) {
      profile.crossModalRecommendations.push('Cross-modal integration training')
      profile.crossModalRecommendations.push('Semantic-visual pathway coordination exercises')
    }

    // Generate reverse processing clinical notes
    profile.reverseProcessingNotes.push(`Görsel-semantik haritalama: ${overallMetrics.mapping}%`)
    profile.reverseProcessingNotes.push(`Ters işlem hızı: ${overallMetrics.speed}%`)
    profile.reverseProcessingNotes.push(`Görsel tanıma: ${overallMetrics.recognition}%`)
    profile.reverseProcessingNotes.push(`Çapraz modal entegrasyon: ${overallMetrics.integration}%`)

    return profile
  }

  // Comprehensive reverse processing clinical analysis
  const generateReverseProcessingAssessment = (finalState: WordImageMatchingState): ClinicalWordImageData => {
    const clinicalData = { ...finalState.clinicalData }
    
    // Update category visual performance
    const categoryPerf: ClinicalWordImageData['categoryVisualPerformance'] = {}
    
    finalState.gameQuestions.forEach((question, index) => {
      const categoryName = exerciseCategories.find(cat => 
        cat.items.some(item => item.emoji === question.correctAnswer.emoji)
      )?.name || 'Unknown'
      
      if (!categoryPerf[categoryName]) {
        categoryPerf[categoryName] = {
          semanticToVisualAccuracy: 0,
          visualRecognitionSpeed: 0,
          questionsAsked: 0,
          correctAnswers: 0,
          averageResponseTime: 0,
          fastestResponse: Infinity,
          slowestResponse: 0,
          reverseProcessingErrors: []
        }
      }
      
      const perf = categoryPerf[categoryName]
      const isCorrect = finalState.userAnswers[index]
      const responseTime = finalState.responseTimes[index]
      
      perf.questionsAsked++
      if (isCorrect) perf.correctAnswers++
      perf.semanticToVisualAccuracy = (perf.correctAnswers / perf.questionsAsked) * 100
      perf.fastestResponse = Math.min(perf.fastestResponse, responseTime)
      perf.slowestResponse = Math.max(perf.slowestResponse, responseTime)
      
      if (!isCorrect) {
        perf.reverseProcessingErrors.push(`${question.correctAnswer.word} -> ${finalState.clinicalData.rawReverseSessionData.responses[index]?.userSelectedEmoji || 'No selection'}`)
      }
    })
    
    // Calculate average response times per category
    Object.keys(categoryPerf).forEach(categoryName => {
      const categoryResponses = finalState.clinicalData.rawReverseSessionData.responses.filter(r => r.category === categoryName)
      if (categoryResponses.length > 0) {
        categoryPerf[categoryName].averageResponseTime = 
          categoryResponses.reduce((sum, r) => sum + r.responseTime, 0) / categoryResponses.length
        categoryPerf[categoryName].visualRecognitionSpeed = 
          Math.max(0, 100 - (categoryPerf[categoryName].averageResponseTime / 1000) * 15) // Convert to speed score
      }
    })
    
    clinicalData.categoryVisualPerformance = categoryPerf
    
    // Calculate multi-dimensional reverse processing scores
    clinicalData.visualSemanticMapping = calculateVisualSemanticMapping(categoryPerf)
    clinicalData.reverseProcessingSpeed = calculateReverseProcessingSpeed(finalState.clinicalData.rawReverseSessionData.responses)
    clinicalData.visualRecognition = calculateVisualRecognition(categoryPerf)
    clinicalData.crossModalIntegration = calculateCrossModalIntegration(finalState.clinicalData.rawReverseSessionData.responses)
    
    // Calculate weighted overall reverse processing score
    clinicalData.overallReverseProcessing = Math.round(
      (clinicalData.visualSemanticMapping * 0.4) +
      (clinicalData.reverseProcessingSpeed * 0.25) +
      (clinicalData.visualRecognition * 0.2) +
      (clinicalData.crossModalIntegration * 0.15)
    )
    
    // Generate reverse processing patterns
    clinicalData.reverseProcessingPatterns = {
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
        return Math.max(0, 100 - (avgSoFar / 1000) * 12) // Convert to speed score for reverse processing
      }),
      semanticToVisualEfficiency: clinicalData.overallReverseProcessing
    }
    
    // Generate reverse cognitive profile
    clinicalData.reverseCognitiveProfile = generateReverseCognitiveProfile(categoryPerf, {
      mapping: clinicalData.visualSemanticMapping,
      speed: clinicalData.reverseProcessingSpeed,
      recognition: clinicalData.visualRecognition,
      integration: clinicalData.crossModalIntegration
    })
    
    return clinicalData
  }

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const initializeGame = useCallback(() => {
    try {
      setError(null)
      setIsLoading(true)
      
      // 🎯 Initialize balanced question generation for reverse processing clinical assessment
      resetQuestionGeneration()
      initializeBalancedGeneration(totalQuestions)
      
    setState({
      currentQuestion: null,
      questionNumber: 1,
      score: 0,
      questionStartTime: 0,
      showFeedback: false,
      lastAnswerCorrect: false,
      selectedAnswer: null,
      gameQuestions: [],
      userAnswers: [],
      responseTimes: [],
      isAnswering: true,
        isGameCompleted: false,
        currentCategory: '',
        categoryQuestionCounts: initializeCategoryQuestionCounts(),
        clinicalData: initializeClinicalData()
      })
      
      console.log('🎯 Word-Image Matching Initialized with Balanced Reverse Processing Generation:', {
        totalQuestions,
        categoriesCount: exerciseCategories.length,
        balanceStats: getQuestionGenerationStats()
      })
      
      setIsLoading(false)
    } catch (err) {
      console.error('Word-image matching initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [totalQuestions])

  const generateNewQuestion = useCallback(() => {
    try {
      if (error || isLoading) return
      
      // Kelime-resim eşleştirme: kelime gösterilir, emoji seçilir (reverse processing)
    const question = generateMatchingQuestion('word-to-emoji')
      if (!question) {
        throw new Error('Question generation failed')
      }
      
      // Determine category of the question for reverse processing analysis
      const categoryName = exerciseCategories.find(cat => 
        cat.items.some(item => item.emoji === question.correctAnswer.emoji)
      )?.name || 'Unknown'
      
    setState(prev => ({
      ...prev,
      currentQuestion: question,
        currentCategory: categoryName,
      questionStartTime: Date.now(),
      showFeedback: false,
      selectedAnswer: null,
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

  const handleAnswerSelect = useCallback((selectedEmoji: string) => {
    try {
      if (!state.currentQuestion || state.showFeedback || !state.isAnswering || error || isLoading) return

    const isCorrect = selectedEmoji === state.currentQuestion.correctAnswer.emoji
    const responseTime = Date.now() - state.questionStartTime

    // Ses efekti
    playSound(isCorrect ? 'correct-answer' : 'wrong-answer')

      // Create response record for reverse processing clinical analysis
      const responseRecord = {
        questionIndex: state.questionNumber - 1,
        category: state.currentCategory,
        userSelectedEmoji: selectedEmoji,
        correctEmoji: state.currentQuestion.correctAnswer.emoji,
        presentedWord: state.currentQuestion.correctAnswer.word,
        isCorrect,
        responseTime,
        semanticToVisualPathway: `${state.currentCategory} semantic→visual`,
        timestamp: new Date().toISOString()
      }

    setState(prev => ({
      ...prev,
      selectedAnswer: selectedEmoji,
      lastAnswerCorrect: isCorrect,
      showFeedback: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      gameQuestions: [...prev.gameQuestions, prev.currentQuestion!],
      userAnswers: [...prev.userAnswers, isCorrect],
      responseTimes: [...prev.responseTimes, responseTime],
        isAnswering: false,
        // Update reverse processing clinical data
        clinicalData: {
          ...prev.clinicalData,
          rawReverseSessionData: {
            ...prev.clinicalData.rawReverseSessionData,
            questions: [...prev.clinicalData.rawReverseSessionData.questions, prev.currentQuestion!],
            responses: [...prev.clinicalData.rawReverseSessionData.responses, responseRecord]
          }
        }
      }))
    } catch (err) {
      console.error('Answer selection error:', err)
      setError({
        type: 'gameplay',
        message: 'Cevap işlenirken hata oluştu.'
      })
    }
  }, [state.currentQuestion, state.showFeedback, state.isAnswering, state.questionStartTime, state.questionNumber, state.currentCategory, playSound, error, isLoading])

  const nextQuestion = useCallback(() => {
    if (state.questionNumber >= totalQuestions) {
      setState(prev => ({ ...prev, isGameCompleted: true }))
      return
    }

    setState(prev => ({
      ...prev,
      questionNumber: prev.questionNumber + 1,
      showFeedback: false,
      selectedAnswer: null,
      isAnswering: true
    }))
  }, [state.questionNumber, totalQuestions])

  const getFinalStats = useCallback(() => {
    const accuracy = state.score > 0 ? (state.score / state.questionNumber) * 100 : 0

    const averageResponseTime = state.responseTimes.length > 0
      ? state.responseTimes.reduce((sum, time) => sum + time, 0) / state.responseTimes.length
      : 0

    // Generate comprehensive reverse processing clinical assessment
    const reverseProcessingAssessment = generateReverseProcessingAssessment(state)

    return {
      score: state.score,
      accuracy,
      gameQuestions: state.gameQuestions,
      userAnswers: state.userAnswers,
      responseTimes: state.responseTimes,
      
      // 🧠 Enhanced reverse processing clinical data
      clinicalData: reverseProcessingAssessment,
      categoryPerformance: state.categoryQuestionCounts
    }
  }, [state])

  return {
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // State
    currentQuestion: state.currentQuestion,
    questionNumber: state.questionNumber,
    score: state.score,
    showFeedback: state.showFeedback,
    lastAnswerCorrect: state.lastAnswerCorrect,
    selectedAnswer: state.selectedAnswer,
    isAnswering: state.isAnswering,
    isGameCompleted: state.isGameCompleted,
    
    // 🧠 Enhanced state for reverse processing clinical assessment
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