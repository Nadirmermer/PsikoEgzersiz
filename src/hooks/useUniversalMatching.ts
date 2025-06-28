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

interface UseUniversalMatchingProps {
  totalQuestions: number
  direction: 'emoji-to-word' | 'word-to-emoji'
}

// 🧠 Universal Clinical Data Structure
export interface UniversalClinicalData {
  // Core performance metrics (adaptable to both directions)
  primaryAccuracy: number          // Main matching accuracy (0-100)
  processingSpeed: number          // Response time efficiency (0-100)
  patternRecognition: number       // Cross-category consistency (0-100)
  cognitiveFlexibility: number     // Category-switching adaptation (0-100)
  overallCognition: number         // Weighted composite score (0-100)
  
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
    responseTimeConsistency: number
    accuracyProgression: number[]
    speedProgression: number[]
  }
  
  // Clinical insights and profiling
  cognitiveProfile: {
    dominantStrengths: string[]
    identifiedWeaknesses: string[]
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

export interface UniversalMatchingState {
  currentQuestion: MatchingQuestion | null
  questionNumber: number
  score: number
  isAnswering: boolean
  showFeedback: boolean
  lastAnswerCorrect: boolean
  selectedAnswer: string
  questionStartTime: number
  currentCategory: string
  categoryQuestionCounts: { [categoryName: string]: number }
  gameQuestions: MatchingQuestion[]
  userAnswers: boolean[]
  responseTimes: number[]
  clinicalData: UniversalClinicalData
}

interface UniversalMatchingError {
  type: 'initialization' | 'gameplay' | 'question_generation' | 'clinical_analysis'
  message: string
}

export const useUniversalMatching = ({ totalQuestions, direction }: UseUniversalMatchingProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  const [error, setError] = useState<UniversalMatchingError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize clinical data structure
  const initializeClinicalData = (): UniversalClinicalData => ({
    primaryAccuracy: 0,
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

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const [state, setState] = useState<UniversalMatchingState>({
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

  // 🧠 Universal Clinical Analysis Functions

  const calculatePrimaryAccuracy = (categoryPerf: UniversalClinicalData['categoryPerformance']): number => {
    const categories = Object.keys(categoryPerf)
    if (categories.length === 0) return 0
    
    const avgAccuracy = categories.reduce((sum, cat) => sum + categoryPerf[cat].accuracy, 0) / categories.length
    return Math.round(avgAccuracy)
  }

  const calculateProcessingSpeed = (responses: UniversalClinicalData['rawSessionData']['responses']): number => {
    if (responses.length === 0) return 0
    
    const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length
    
    // Optimal response time range based on direction
    const optimalMin = direction === 'emoji-to-word' ? 1000 : 1500
    const optimalMax = direction === 'emoji-to-word' ? 3000 : 3500
    const slowMax = direction === 'emoji-to-word' ? 5000 : 6000
    
    if (avgResponseTime < optimalMin) return Math.max(60, 100 - (optimalMin - avgResponseTime) / 10)
    if (avgResponseTime <= optimalMax) return 100
    if (avgResponseTime <= slowMax) return Math.max(40, 100 - (avgResponseTime - optimalMax) / 20)
    return Math.max(20, 100 - (avgResponseTime - slowMax) / 50)
  }

  const calculatePatternRecognition = (categoryPerf: UniversalClinicalData['categoryPerformance']): number => {
    const accuracies = Object.values(categoryPerf).map(perf => perf.accuracy)
    if (accuracies.length === 0) return 0
    
    const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length
    
    const consistencyScore = Math.max(0, 100 - variance)
    return Math.round(consistencyScore)
  }

  const calculateCognitiveFlexibility = (responses: UniversalClinicalData['rawSessionData']['responses']): number => {
    if (responses.length < 2) return 50
    
    let categoryChanges = 0
    let accuracyAfterChange = 0
    
    for (let i = 1; i < responses.length; i++) {
      if (responses[i].category !== responses[i-1].category) {
        categoryChanges++
        if (responses[i].isCorrect) accuracyAfterChange++
      }
    }
    
    if (categoryChanges === 0) return 75
    
    const flexibilityRatio = accuracyAfterChange / categoryChanges
    return Math.round(flexibilityRatio * 100)
  }

  const generateCognitiveProfile = (
    categoryPerf: UniversalClinicalData['categoryPerformance'],
    overallMetrics: { primary: number, speed: number, pattern: number, flexibility: number }
  ): UniversalClinicalData['cognitiveProfile'] => {
    const profile: UniversalClinicalData['cognitiveProfile'] = {
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
    if (overallMetrics.speed >= 80 && overallMetrics.primary >= 80) {
      profile.processingStyle = 'fast-accurate'
    } else if (overallMetrics.speed < 60 && overallMetrics.primary >= 80) {
      profile.processingStyle = 'slow-accurate'  
    } else if (overallMetrics.speed >= 80 && overallMetrics.primary < 60) {
      profile.processingStyle = 'fast-error-prone'
    } else {
      profile.processingStyle = 'inconsistent'
    }

    // Generate recommendations
    const directionLabel = direction === 'emoji-to-word' ? 'semantic' : 'visual-semantic'
    
    if (overallMetrics.primary < 60) {
      profile.recommendedInterventions.push(`${directionLabel} memory strengthening exercises`)
      profile.recommendedInterventions.push('Category-specific training')
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
    profile.clinicalNotes.push(`${directionLabel} accuracy: ${overallMetrics.primary}%`)
    profile.clinicalNotes.push(`Processing efficiency: ${overallMetrics.speed}%`)
    profile.clinicalNotes.push(`Pattern consistency: ${overallMetrics.pattern}%`)
    profile.clinicalNotes.push(`Cognitive flexibility: ${overallMetrics.flexibility}%`)

    return profile
  }

  const getFinalStats = useCallback(() => {
    const accuracy = state.gameQuestions.length > 0 ? (state.score / state.gameQuestions.length) * 100 : 0
    const avgResponseTime = state.responseTimes.length > 0 
      ? state.responseTimes.reduce((sum, time) => sum + time, 0) / state.responseTimes.length 
      : 0

    return {
      score: state.score,
      totalQuestions: state.gameQuestions.length,
      accuracy: Math.round(accuracy),
      averageResponseTime: Math.round(avgResponseTime),
      clinicalData: state.clinicalData,
      // Legacy support
      details: {
        exercise_name: direction === 'emoji-to-word' ? 'Resim-Kelime Eşleştirme' : 'Kelime-Resim Eşleştirme',
        total_questions: state.gameQuestions.length,
        correct_answers: state.score,
        accuracy: Math.round(accuracy),
        average_response_time: Math.round(avgResponseTime),
        questions: state.gameQuestions,
        user_answers: state.userAnswers,
        response_times: state.responseTimes,
        clinicalData: state.clinicalData
      }
    }
  }, [state, direction])

  return {
    // State
    currentQuestion: state.currentQuestion,
    questionNumber: state.questionNumber,
    score: state.score,
    isAnswering: state.isAnswering,
    showFeedback: state.showFeedback,
    lastAnswerCorrect: state.lastAnswerCorrect,
    selectedAnswer: state.selectedAnswer,
    isGameCompleted: state.questionNumber > totalQuestions,
    
    // Actions
    getFinalStats,
    
    // Status
    error,
    isLoading,
    
    // Clinical insights
    clinicalData: state.clinicalData,
    categoryProgress: state.categoryQuestionCounts
  }
} 