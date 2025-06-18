import { useState, useCallback } from 'react'
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

export const useWordImageMatching = ({ totalQuestions }: UseWordImageMatchingProps) => {
  const { playSound } = useAudio()
  
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

  const initializeGame = useCallback(() => {
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
  }, [])

  const generateNewQuestion = useCallback(() => {
    // Kelime-resim eşleştirme: kelime gösterilir, emoji seçilir
    const question = generateMatchingQuestion('word-to-emoji')
    setState(prev => ({
      ...prev,
      currentQuestion: question,
      questionStartTime: Date.now(),
      showFeedback: false,
      selectedAnswer: null,
      isAnswering: true
    }))
  }, [])

  const handleAnswerSelect = useCallback((selectedEmoji: string) => {
    if (!state.currentQuestion || state.showFeedback || !state.isAnswering) return

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