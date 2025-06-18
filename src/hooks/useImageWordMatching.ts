import { useState, useCallback } from 'react'
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

export const useImageWordMatching = ({ totalQuestions }: UseImageWordMatchingProps) => {
  const { playSound } = useAudio()

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

  // Initialize/reset game
  const initializeGame = useCallback(() => {
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
  }, [])

  // Generate new question
  const generateNewQuestion = useCallback(() => {
    const question = generateMatchingQuestion('emoji-to-word')
    setState(prev => ({
      ...prev,
      currentQuestion: question,
      questionStartTime: Date.now(),
      showFeedback: false,
      selectedAnswer: '',
      isAnswering: true
    }))
  }, [])

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: string) => {
    if (state.showFeedback || !state.currentQuestion || !state.isAnswering) return

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
  }, [state.showFeedback, state.currentQuestion, state.isAnswering, state.questionStartTime, playSound])

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
    // State
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