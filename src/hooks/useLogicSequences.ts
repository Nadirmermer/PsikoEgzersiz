import { useState, useCallback, useRef, useEffect } from 'react'
import { useAudio } from './useAudio'

interface UseLogicSequencesProps {
  totalQuestions: number
}

interface LogicSequence {
  sequence: number[]
  answer: number
  level: number
  pattern: string
}

interface LogicSequencesState {
  currentQuestion: LogicSequence | null
  currentAnswerOptions: number[]  // Fixed answer options for current question
  questionNumber: number
  score: number
  correctCount: number
  incorrectCount: number
  questionStartTime: number
  showFeedback: boolean
  lastAnswerCorrect: boolean
  userAnswer: number | null
  gameQuestions: LogicSequence[]
  userAnswers: number[]
  responseTimes: number[]
  isAnswering: boolean
  isGameCompleted: boolean
}

// Error handling için
interface LogicSequencesError {
  type: 'initialization' | 'gameplay' | 'question_generation'
  message: string
}

const generateSequence = (level: number): LogicSequence => {
  const patterns = [
    // Level 1: Basic Arithmetic (+, -, constant differences)
    () => {
      const start = Math.floor(Math.random() * 20) + 1
      const diff = Math.floor(Math.random() * 8) + 1
      const sequence = [start, start + diff, start + 2*diff, start + 3*diff]
      return { 
        sequence, 
        answer: start + 4*diff, 
        pattern: `Aritmetik (+${diff})`
      }
    },
    () => {
      const start = Math.floor(Math.random() * 30) + 10
      const diff = Math.floor(Math.random() * 8) + 2
      const sequence = [start, start - diff, start - 2*diff, start - 3*diff]
      return { 
        sequence, 
        answer: start - 4*diff, 
        pattern: `Azalan Aritmetik (-${diff})`
      }
    },
    
    // Level 2: Geometric sequences (×, ÷)
    () => {
      const start = Math.floor(Math.random() * 4) + 2
      const ratio = Math.floor(Math.random() * 2) + 2 // 2 or 3
      const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio]
      return { 
        sequence, 
        answer: start * Math.pow(ratio, 4), 
        pattern: `Geometrik (×${ratio})`
      }
    },
    () => {
      const start = Math.floor(Math.random() * 64) + 32
      const ratio = 2
      const sequence = [start, start / ratio, start / (ratio * ratio), start / (ratio * ratio * ratio)]
      return { 
        sequence, 
        answer: start / Math.pow(ratio, 4), 
        pattern: `Azalan Geometrik (÷${ratio})`
      }
    },
    
    // Level 3: Fibonacci-like and additive patterns
    () => {
      const a = Math.floor(Math.random() * 4) + 1
      const b = Math.floor(Math.random() * 4) + 1
      const sequence = [a, b, a + b, a + 2*b]
      return { 
        sequence, 
        answer: 2*a + 3*b, 
        pattern: 'Fibonacci Benzeri'
      }
    },
    () => {
      const start = Math.floor(Math.random() * 5) + 1
      const sequence = [start, start + 1, start + start + 1, start + start + 1 + start + 1]
      return { 
        sequence, 
        answer: start + start + 1 + start + 1 + start + start + 1,
        pattern: 'Toplama Zinciri'
      }
    },
    
    // Level 4: Polynomial and advanced patterns
    () => {
      const start = Math.floor(Math.random() * 4) + 1
      const sequence = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)]
      return { 
        sequence, 
        answer: (start+4)*(start+4), 
        pattern: 'Kare Sayılar'
      }
    },
    () => {
      const start = Math.floor(Math.random() * 3) + 1
      const sequence = [start*start*start, (start+1)*(start+1)*(start+1), (start+2)*(start+2)*(start+2), (start+3)*(start+3)*(start+3)]
      return { 
        sequence, 
        answer: (start+4)*(start+4)*(start+4), 
        pattern: 'Küp Sayılar'
      }
    },
    
    // Level 5: Mixed operations
    () => {
      const base = Math.floor(Math.random() * 5) + 2
      const sequence = [base, base * 2 + 1, (base * 2 + 1) * 2 + 1, ((base * 2 + 1) * 2 + 1) * 2 + 1]
      return { 
        sequence, 
        answer: (((base * 2 + 1) * 2 + 1) * 2 + 1) * 2 + 1, 
        pattern: 'Çift+1 Zinciri'
      }
    },
    () => {
      const start = Math.floor(Math.random() * 8) + 2
      const sequence = [start, start + 2, start + 2 + 4, start + 2 + 4 + 6]
      return { 
        sequence, 
        answer: start + 2 + 4 + 6 + 8, 
        pattern: 'Artan Çift Sayılar'
      }
    },
    
    // Level 6: Prime and special sequences
    () => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
      const startIndex = Math.floor(Math.random() * 6)
      const sequence = [primes[startIndex], primes[startIndex + 1], primes[startIndex + 2], primes[startIndex + 3]]
      return { 
        sequence, 
        answer: primes[startIndex + 4], 
        pattern: 'Asal Sayılar'
      }
    },
    () => {
      const triangular = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55]
      const startIndex = Math.floor(Math.random() * 6)
      const sequence = [triangular[startIndex], triangular[startIndex + 1], triangular[startIndex + 2], triangular[startIndex + 3]]
      return { 
        sequence, 
        answer: triangular[startIndex + 4], 
        pattern: 'Üçgensel Sayılar'
      }
    }
  ]

  // Adjust level-based pattern selection for more variety
  let availablePatterns = []
  
  if (level <= 2) {
    // Levels 1-2: Basic arithmetic and geometric
    availablePatterns = patterns.slice(0, 4)
  } else if (level <= 4) {
    // Levels 3-4: Add fibonacci and polynomial
    availablePatterns = patterns.slice(0, 8)
  } else if (level <= 6) {
    // Levels 5-6: Add mixed operations
    availablePatterns = patterns.slice(0, 10)
  } else {
    // Level 7+: All patterns including primes and special sequences
    availablePatterns = patterns
  }
  
  const patternIndex = Math.floor(Math.random() * availablePatterns.length)
  const result = availablePatterns[patternIndex]()
  
  return {
    ...result,
    level: Math.min(level, 8) // Cap at level 8 for better progression
  }
}

export const useLogicSequences = ({ totalQuestions }: UseLogicSequencesProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<LogicSequencesError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])
  
  const [state, setState] = useState<LogicSequencesState>({
    currentQuestion: null,
    currentAnswerOptions: [],  // Initialize empty answer options
    questionNumber: 1,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    questionStartTime: 0,
    showFeedback: false,
    lastAnswerCorrect: false,
    userAnswer: null,
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
        currentAnswerOptions: [],
        questionNumber: 1,
        score: 0,
        correctCount: 0,
        incorrectCount: 0,
        questionStartTime: 0,
        showFeedback: false,
        lastAnswerCorrect: false,
        userAnswer: null,
        gameQuestions: [],
        userAnswers: [],
        responseTimes: [],
        isAnswering: true,
        isGameCompleted: false
      })
      
      setIsLoading(false)
    } catch (err) {
      console.error('Logic sequences initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [])

  // Generate answer options for a specific question (called once per question)
  const generateAnswerOptionsForQuestion = useCallback((question: LogicSequence): number[] => {
    const correct = question.answer
    const options = [correct]
    
    // Smarter wrong answer generation based on pattern type
    const pattern = question.pattern
    const sequence = question.sequence
    
    // Pattern-specific wrong answer generation
    if (pattern.includes('Aritmetik')) {
      const diff = sequence[1] - sequence[0]
      // Add answers with different arithmetic progressions
      options.push(correct + diff, correct - diff, correct + 2 * diff)
    } else if (pattern.includes('Geometrik')) {
      const ratio = Math.round(sequence[1] / sequence[0])
      options.push(Math.round(correct * ratio), Math.round(correct / ratio), Math.round(correct * 1.5))
    } else if (pattern.includes('Fibonacci')) {
      // Add nearby Fibonacci-like numbers
      options.push(correct + sequence[sequence.length - 1], correct - sequence[sequence.length - 2])
    } else if (pattern.includes('Kare') || pattern.includes('Küp')) {
      // Add nearby square/cube numbers
      const base = Math.round(Math.pow(correct, 1 / (pattern.includes('Küp') ? 3 : 2)))
      options.push(Math.pow(base + 1, pattern.includes('Küp') ? 3 : 2), Math.pow(base - 1, pattern.includes('Küp') ? 3 : 2))
    }
    
    // Fill remaining slots with random variations if needed
    while (options.length < 4) {
      const variation = Math.floor(Math.random() * Math.max(20, correct * 0.3)) - Math.max(10, correct * 0.15)
      const option = correct + variation
      if (option > 0 && !options.includes(option)) {
        options.push(option)
      }
    }
    
    // Remove duplicates and ensure we have exactly 4 options
    const uniqueOptions = [...new Set(options)].slice(0, 4)
    
    // If we have less than 4, add more random options
    while (uniqueOptions.length < 4) {
      const variation = Math.floor(Math.random() * 30) - 15
      const option = correct + variation
      if (option > 0 && !uniqueOptions.includes(option)) {
        uniqueOptions.push(option)
      }
    }
    
    // Return shuffled options (but this will be FIXED for this question)
    return uniqueOptions.sort(() => Math.random() - 0.5)
  }, [])

  const generateNewQuestion = useCallback(() => {
    try {
      if (error || isLoading) return
      
      // Better level progression: Every 3-4 questions, increase level
      const level = Math.min(Math.floor((state.questionNumber - 1) / 3) + 1, 8)
      const question = generateSequence(level)
      
      if (!question) {
        throw new Error('Question generation failed')
      }
      
      // Generate FIXED answer options for this question
      const answerOptions = generateAnswerOptionsForQuestion(question)
      
      setState(prev => ({
        ...prev,
        currentQuestion: question,
        currentAnswerOptions: answerOptions,  // Set fixed options
        questionStartTime: Date.now(),
        showFeedback: false,
        userAnswer: null,
        isAnswering: true
      }))
    } catch (err) {
      console.error('Question generation error:', err)
      setError({
        type: 'question_generation',
        message: 'Yeni soru oluşturulamadı. Lütfen tekrar deneyin.'
      })
    }
  }, [state.questionNumber, error, isLoading, generateAnswerOptionsForQuestion])

  const handleAnswerSelect = useCallback((answer: number) => {
    try {
      if (!state.currentQuestion || state.showFeedback || !state.isAnswering || error || isLoading) return

      const isCorrect = answer === state.currentQuestion.answer
      const responseTime = Date.now() - state.questionStartTime
      const points = isCorrect ? state.currentQuestion.level * 10 : 0

      // Ses efekti
      playSound(isCorrect ? 'correct-answer' : 'wrong-answer')

      setState(prev => ({
        ...prev,
        userAnswer: answer,
        lastAnswerCorrect: isCorrect,
        showFeedback: true,
        score: isCorrect ? prev.score + points : prev.score,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        incorrectCount: isCorrect ? prev.incorrectCount : prev.incorrectCount + 1,
        gameQuestions: [...prev.gameQuestions, prev.currentQuestion!],
        userAnswers: [...prev.userAnswers, answer],
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
      userAnswer: null,
      isAnswering: true,
      currentAnswerOptions: []  // Clear options, new question will generate new ones
    }))
  }, [state.questionNumber, totalQuestions])

  // Simple getter for current answer options (no regeneration)
  const getAnswerOptions = useCallback(() => {
    return state.currentAnswerOptions || []
  }, [state.currentAnswerOptions])

  const getFinalStats = useCallback(() => {
    const accuracy = state.correctCount > 0 ? (state.correctCount / state.questionNumber) * 100 : 0
    return {
      score: state.score,
      correctCount: state.correctCount,
      incorrectCount: state.incorrectCount,
      accuracy,
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
    
    // State
    currentQuestion: state.currentQuestion,
    questionNumber: state.questionNumber,
    score: state.score,
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    showFeedback: state.showFeedback,
    lastAnswerCorrect: state.lastAnswerCorrect,
    userAnswer: state.userAnswer,
    isAnswering: state.isAnswering,
    isGameCompleted: state.isGameCompleted,
    
    // Actions
    initializeGame,
    generateNewQuestion,
    handleAnswerSelect,
    nextQuestion,
    getAnswerOptions,  // Renamed from generateAnswerOptions
    getFinalStats
  }
} 