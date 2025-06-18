import { useState, useCallback, useEffect } from 'react'
import { useAudio } from './useAudio'

interface UseColorSequenceProps {
  initialLevel?: number
}

interface ColorSequenceState {
  currentLevel: number
  sequence: number[]
  userInput: number[]
  phase: 'ready' | 'showing' | 'input' | 'feedback'
  showingIndex: number
  highlightedColor: number | null
  score: number
  correctCount: number
  incorrectCount: number
  questionStartTime: number
  isGameCompleted: boolean
  maxLevelReached: number
}

// Renk tanımları
export const colors = [
  { id: 0, name: 'Kırmızı', bg: 'bg-red-500', hover: 'hover:bg-red-600', active: 'bg-red-600' },
  { id: 1, name: 'Yeşil', bg: 'bg-green-500', hover: 'hover:bg-green-600', active: 'bg-green-600' },
  { id: 2, name: 'Mavi', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', active: 'bg-blue-600' },
  { id: 3, name: 'Sarı', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', active: 'bg-yellow-600' }
]

export const useColorSequence = ({ initialLevel = 1 }: UseColorSequenceProps = {}) => {
  const { playSound } = useAudio()
  
  const [state, setState] = useState<ColorSequenceState>({
    currentLevel: initialLevel,
    sequence: [],
    userInput: [],
    phase: 'ready',
    showingIndex: 0,
    highlightedColor: null,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    questionStartTime: 0,
    isGameCompleted: false,
    maxLevelReached: initialLevel
  })

  const generateSequence = useCallback((length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 4))
  }, [])

  const initializeGame = useCallback(() => {
    setState({
      currentLevel: initialLevel,
      sequence: [],
      userInput: [],
      phase: 'ready',
      showingIndex: 0,
      highlightedColor: null,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      questionStartTime: 0,
      isGameCompleted: false,
      maxLevelReached: initialLevel
    })
  }, [initialLevel])

  const startNextLevel = useCallback(() => {
    const sequenceLength = 1 + state.currentLevel
    const newSequence = generateSequence(sequenceLength)
    
    setState(prev => ({
      ...prev,
      sequence: newSequence,
      userInput: [],
      phase: 'showing',
      showingIndex: 0,
      highlightedColor: null,
      questionStartTime: Date.now()
    }))
  }, [state.currentLevel, generateSequence])

  // Renk gösterimi otomatik ilerlemesi
  useEffect(() => {
    if (state.phase !== 'showing') return

    const showColor = () => {
      setState(prev => ({
        ...prev,
        highlightedColor: prev.sequence[prev.showingIndex]
      }))
    }

    const hideColor = () => {
      setState(prev => ({
        ...prev,
        highlightedColor: null
      }))
      
      setTimeout(() => {
        setState(prev => {
          if (prev.showingIndex < prev.sequence.length - 1) {
            return {
              ...prev,
              showingIndex: prev.showingIndex + 1
            }
          } else {
            return {
              ...prev,
              phase: 'input',
              showingIndex: 0
            }
          }
        })
      }, 250)
    }

    const showTimer = setTimeout(showColor, 500)
    const hideTimer = setTimeout(hideColor, 1250)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [state.phase, state.showingIndex, state.sequence.length])

  const handleColorInput = useCallback((colorId: number) => {
    if (state.phase !== 'input') return

    const newUserInput = [...state.userInput, colorId]
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
      // Doğru renk seçildi, devam et
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
    return 1 + state.currentLevel
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
    highlightedColor: state.highlightedColor,
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
    handleColorInput,
    nextLevel,
    retryLevel,
    endGame,
    getFinalStats
  }
} 