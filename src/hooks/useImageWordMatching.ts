import { useState, useCallback, useRef, useEffect } from 'react'
import { generateMatchingQuestion, MatchingQuestion } from '@/utils/matchingExerciseUtils'
import { useAudio } from './useAudio'

interface UseImageWordMatchingProps {
  totalQuestions: number
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
  // Stats for final results
  gameQuestions: MatchingQuestion[]
  userAnswers: boolean[]
  responseTimes: number[]
}

// Error handling için
interface ImageWordMatchingError {
  type: 'initialization' | 'gameplay' | 'question_generation'
  message: string
}

export const useImageWordMatching = ({ totalQuestions }: UseImageWordMatchingProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<ImageWordMatchingError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    gameQuestions: [],
    userAnswers: [],
    responseTimes: []
  })

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
      
      setState({
        currentQuestion: null,
        questionNumber: 1,
        score: 0,
        isAnswering: false,
        showFeedback: false,
        lastAnswerCorrect: false,
        selectedAnswer: '',
        questionStartTime: 0,
        gameQuestions: [],
        userAnswers: [],
        responseTimes: []
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
  }, [])

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    try {
      if (error || isLoading) return
      
      const question = generateMatchingQuestion('emoji-to-word')
      if (!question) {
        throw new Error('Question generation failed')
      }
      
      setState(prev => ({
        ...prev,
        currentQuestion: question,
        questionStartTime: Date.now(),
        showFeedback: false,
        selectedAnswer: '',
        isAnswering: true
      }))
    } catch (err) {
      console.error('Question generation error:', err)
      setError({
        type: 'question_generation',
        message: 'Yeni soru oluşturulamadı. Lütfen tekrar deneyin.'
      })
    }
  }, [error, isLoading])

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: string) => {
    try {
      if (state.showFeedback || !state.currentQuestion || !state.isAnswering || error || isLoading) return

      const isCorrect = answer === state.currentQuestion.correctAnswer.word
      const responseTime = Date.now() - state.questionStartTime

      // Play sound effect
      playSound(isCorrect ? 'correct-answer' : 'wrong-answer')

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
        responseTimes: [...prev.responseTimes, responseTime]
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
  }, [state.showFeedback, state.currentQuestion, state.isAnswering, state.questionStartTime, playSound, error, isLoading])

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

  // Get final statistics
  const getFinalStats = useCallback(() => {
    const accuracy = state.gameQuestions.length > 0 
      ? (state.score / state.gameQuestions.length) * 100 
      : 0
    
    const averageResponseTime = state.responseTimes.length > 0
      ? state.responseTimes.reduce((sum, time) => sum + time, 0) / state.responseTimes.length
      : 0

    return {
      score: state.score,
      totalQuestions: state.gameQuestions.length,
      accuracy,
      averageResponseTime,
      gameQuestions: state.gameQuestions,
      userAnswers: state.userAnswers,
      responseTimes: state.responseTimes
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
    
    // Actions
    initializeGame,
    generateNewQuestion,
    handleAnswerSelect,
    nextQuestion,
    getFinalStats
  }
} 