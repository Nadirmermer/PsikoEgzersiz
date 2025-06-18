import { useState, useCallback, useEffect } from 'react'
import { useAudio } from './useAudio'

interface UseNumberSequenceProps {
  initialLevel?: number
}

interface NumberSequenceState {
  currentLevel: number
  sequence: number[]
  userInput: number[]
  phase: 'ready' | 'showing' | 'input' | 'feedback'
  showingIndex: number
  score: number
  correctCount: number
  incorrectCount: number
  questionStartTime: number
  isGameCompleted: boolean
  maxLevelReached: number
}

export const useNumberSequence = ({ initialLevel = 1 }: UseNumberSequenceProps = {}) => {
  const { playSound } = useAudio()
  
  const [state, setState] = useState<NumberSequenceState>({
    currentLevel: initialLevel,
    sequence: [],
    userInput: [],
    phase: 'ready',
    showingIndex: 0,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    questionStartTime: 0,
    isGameCompleted: false,
    maxLevelReached: initialLevel
  })

  const generateSequence = useCallback((length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10))
  }, [])

  const initializeGame = useCallback(() => {
    setState({
      currentLevel: initialLevel,
      sequence: [],
      userInput: [],
      phase: 'ready',
      showingIndex: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      questionStartTime: 0,
      isGameCompleted: false,
      maxLevelReached: initialLevel
    })
  }, [initialLevel])

  const startNextLevel = useCallback(() => {
    const sequenceLength = 2 + state.currentLevel
    const newSequence = generateSequence(sequenceLength)
    
    setState(prev => ({
      ...prev,
      sequence: newSequence,
      userInput: [],
      phase: 'showing',
      showingIndex: 0,
      questionStartTime: Date.now()
    }))
  }, [state.currentLevel, generateSequence])

  // Dizi gösterimi otomatik ilerlemesi
  useEffect(() => {
    if (state.phase !== 'showing') return

    const timer = setTimeout(() => {
      if (state.showingIndex < state.sequence.length - 1) {
        setState(prev => ({
          ...prev,
          showingIndex: prev.showingIndex + 1
        }))
      } else {
        setState(prev => ({
          ...prev,
          phase: 'input',
          showingIndex: 0
        }))
      }
    }, 1000) // Her sayı 1 saniye gösterilir

    return () => clearTimeout(timer)
  }, [state.phase, state.showingIndex, state.sequence.length])

  const handleNumberInput = useCallback((number: number) => {
    if (state.phase !== 'input') return

    const newUserInput = [...state.userInput, number]
    const isCorrect = newUserInput[newUserInput.length - 1] === state.sequence[newUserInput.length - 1]

    if (!isCorrect) {
      // Hatalı giriş - seviye başarısız
      playSound('wrong-answer')
      setState(prev => ({
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
        incorrectCount: prev.incorrectCount + 1
      }))
      return 'incorrect'
    }

    if (newUserInput.length === state.sequence.length) {
      // Seviye tamamlandı - doğru
      playSound('correct-answer')
      const newScore = state.score + (state.currentLevel * 10)
      const newLevel = state.currentLevel + 1
      
      setState(prev => ({
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
        score: newScore,
        correctCount: prev.correctCount + 1,
        currentLevel: newLevel,
        maxLevelReached: Math.max(prev.maxLevelReached, newLevel)
      }))
      return 'level_complete'
    } else {
      // Doğru sayı girildi, devam et
      setState(prev => ({
        ...prev,
        userInput: newUserInput
      }))
      return 'continue'
    }
  }, [state.phase, state.userInput, state.sequence, state.score, state.currentLevel, playSound])

  const nextLevel = useCallback(() => {
    startNextLevel()
  }, [startNextLevel])

  const retryLevel = useCallback(() => {
    startNextLevel()
  }, [startNextLevel])

  const endGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGameCompleted: true
    }))
  }, [])

  const getSequenceLength = useCallback(() => {
    return 2 + state.currentLevel
  }, [state.currentLevel])

  const getFinalStats = useCallback(() => {
    return {
      maxLevelReached: state.maxLevelReached,
      score: state.score,
      correctCount: state.correctCount,
      incorrectCount: state.incorrectCount,
      finalLevel: state.currentLevel
    }
  }, [state])

  return {
    // State
    currentLevel: state.currentLevel,
    sequence: state.sequence,
    userInput: state.userInput,
    phase: state.phase,
    showingIndex: state.showingIndex,
    score: state.score,
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    isGameCompleted: state.isGameCompleted,
    maxLevelReached: state.maxLevelReached,
    
    // Computed
    sequenceLength: getSequenceLength(),
    
    // Actions
    initializeGame,
    startNextLevel,
    handleNumberInput,
    nextLevel,
    retryLevel,
    endGame,
    getFinalStats
  }
} 