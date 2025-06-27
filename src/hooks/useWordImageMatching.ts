import { useState, useCallback, useRef, useEffect } from 'react'
import { generateMatchingQuestion, MatchingQuestion, ExerciseItem } from '@/utils/matchingExerciseUtils'
import { useAudio } from './useAudio'

interface UseWordImageMatchingProps {
  totalQuestions: number
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
}

// Error handling için
interface WordImageMatchingError {
  type: 'initialization' | 'gameplay' | 'question_generation'
  message: string
}

export const useWordImageMatching = ({ totalQuestions }: UseWordImageMatchingProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<WordImageMatchingError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    isGameCompleted: false
  })

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const initializeGame = useCallback(() => {
    try {
      setError(null)
      setIsLoading(true)
      
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
        isGameCompleted: false
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
  }, [])

  const generateNewQuestion = useCallback(() => {
    try {
      if (error || isLoading) return
      
      // Kelime-resim eşleştirme: kelime gösterilir, emoji seçilir
      const question = generateMatchingQuestion('word-to-emoji')
      if (!question) {
        throw new Error('Question generation failed')
      }
      
      setState(prev => ({
        ...prev,
        currentQuestion: question,
        questionStartTime: Date.now(),
        showFeedback: false,
        selectedAnswer: null,
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

  const handleAnswerSelect = useCallback((selectedEmoji: string) => {
    try {
      if (!state.currentQuestion || state.showFeedback || !state.isAnswering || error || isLoading) return

      const isCorrect = selectedEmoji === state.currentQuestion.correctAnswer.emoji
      const responseTime = Date.now() - state.questionStartTime

      // Ses efekti
      playSound(isCorrect ? 'correct-answer' : 'wrong-answer')

      setState(prev => ({
        ...prev,
        selectedAnswer: selectedEmoji,
        lastAnswerCorrect: isCorrect,
        showFeedback: true,
        score: isCorrect ? prev.score + 1 : prev.score,
        gameQuestions: [...prev.gameQuestions, prev.currentQuestion!],
        userAnswers: [...prev.userAnswers, isCorrect],
        responseTimes: [...prev.responseTimes, responseTime],
        isAnswering: false
      }))
    } catch (err) {
      console.error('Answer selection error:', err)
      setError({
        type: 'gameplay',
        message: 'Cevap işlenirken hata oluştu.'
      })
    }
  }, [state.currentQuestion, state.showFeedback, state.isAnswering, state.questionStartTime, playSound, error, isLoading])

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
    return {
      score: state.score,
      accuracy: state.score > 0 ? (state.score / state.questionNumber) * 100 : 0,
      gameQuestions: state.gameQuestions,
      userAnswers: state.userAnswers,
      responseTimes: state.responseTimes
    }
  }, [state.score, state.questionNumber, state.gameQuestions, state.userAnswers, state.responseTimes])

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
    
    // Actions
    initializeGame,
    generateNewQuestion,
    handleAnswerSelect,
    nextQuestion,
    getFinalStats
  }
} 