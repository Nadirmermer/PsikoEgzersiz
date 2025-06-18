import { useState, useCallback } from 'react'
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

const generateSequence = (level: number): LogicSequence => {
  const patterns = [
    // Aritmetik diziler (Level 1)
    () => {
      const start = Math.floor(Math.random() * 10) + 1
      const diff = Math.floor(Math.random() * 5) + 1
      const sequence = [start, start + diff, start + 2*diff, start + 3*diff]
      return { 
        sequence, 
        answer: start + 4*diff, 
        pattern: `Aritmetik (+${diff})`
      }
    },
    // Geometrik diziler (Level 2)
    () => {
      const start = Math.floor(Math.random() * 3) + 2
      const ratio = 2
      const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio]
      return { 
        sequence, 
        answer: start * Math.pow(ratio, 4), 
        pattern: `Geometrik (×${ratio})`
      }
    },
    // Fibonacci benzeri (Level 3)
    () => {
      const a = Math.floor(Math.random() * 3) + 1
      const b = Math.floor(Math.random() * 3) + 1
      const sequence = [a, b, a + b, a + 2*b]
      return { 
        sequence, 
        answer: 2*a + 3*b, 
        pattern: 'Fibonacci Benzeri'
      }
    },
    // Kare sayılar (Level 4)
    () => {
      const start = Math.floor(Math.random() * 3) + 1
      const sequence = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)]
      return { 
        sequence, 
        answer: (start+4)*(start+4), 
        pattern: 'Kare Sayılar'
      }
    }
  ]

  const patternIndex = Math.min(level - 1, patterns.length - 1)
  const result = patterns[patternIndex]()
  
  return {
    ...result,
    level
  }
}

export const useLogicSequences = ({ totalQuestions }: UseLogicSequencesProps) => {
  const { playSound } = useAudio()
  
  const [state, setState] = useState<LogicSequencesState>({
    currentQuestion: null,
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

  const initializeGame = useCallback(() => {
    setState({
      currentQuestion: null,
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
  }, [])

  const generateNewQuestion = useCallback(() => {
    // Her 3 soruda bir seviye artar (1-4 arası)
    const level = Math.min(Math.floor((state.questionNumber - 1) / 3) + 1, 4)
    const question = generateSequence(level)
    
    setState(prev => ({
      ...prev,
      currentQuestion: question,
      questionStartTime: Date.now(),
      showFeedback: false,
      userAnswer: null,
      isAnswering: true
    }))
  }, [state.questionNumber])

  const handleAnswerSelect = useCallback((answer: number) => {
    if (!state.currentQuestion || state.showFeedback || !state.isAnswering) return

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
  }, [state.currentQuestion, state.showFeedback, state.isAnswering, state.questionStartTime, playSound])

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
      isAnswering: true
    }))
  }, [state.questionNumber, totalQuestions])

  const generateAnswerOptions = useCallback(() => {
    if (!state.currentQuestion) return []
    
    const correct = state.currentQuestion.answer
    const options = [correct]
    
    // Yanlış seçenekler oluştur
    while (options.length < 4) {
      const variation = Math.floor(Math.random() * 20) - 10
      const option = correct + variation
      if (option > 0 && !options.includes(option)) {
        options.push(option)
      }
    }
    
    // Karıştır
    return options.sort(() => Math.random() - 0.5)
  }, [state.currentQuestion])

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
    generateAnswerOptions,
    getFinalStats
  }
} 