import { useState, useCallback, useEffect, useRef } from 'react'
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

// Error handling için
interface ColorSequenceError {
  type: 'initialization' | 'gameplay' | 'timer'
  message: string
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
  const mountedRef = useRef(true)
  const showTimerRef = useRef<NodeJS.Timeout>()
  const hideTimerRef = useRef<NodeJS.Timeout>()
  
  // Error states
  const [error, setError] = useState<ColorSequenceError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
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

  // Cleanup effect - memory leaks önlenir
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (showTimerRef.current) clearTimeout(showTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const initializeGame = useCallback(() => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Clear any existing timers
      if (showTimerRef.current) clearTimeout(showTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      
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
      
      setIsLoading(false)
    } catch (err) {
      console.error('Color sequence initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
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

  // Renk gösterimi otomatik ilerlemesi - Safe timers with error handling
  useEffect(() => {
    if (state.phase !== 'showing') return

    try {
      const showColor = () => {
        if (!mountedRef.current) return
        setState(prev => ({
          ...prev,
          highlightedColor: prev.sequence[prev.showingIndex]
        }))
      }

      const hideColor = () => {
        if (!mountedRef.current) return
        setState(prev => ({
          ...prev,
          highlightedColor: null
        }))
        
        setTimeout(() => {
          if (!mountedRef.current) return
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

      showTimerRef.current = setTimeout(showColor, 500)
      hideTimerRef.current = setTimeout(hideColor, 1250)
    } catch (err) {
      console.error('Color showing timer error:', err)
      setError({
        type: 'timer',
        message: 'Renk gösterimi sırasında hata oluştu.'
      })
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [state.phase, state.showingIndex, state.sequence.length])

  const handleColorInput = useCallback((colorId: number) => {
    try {
      if (state.phase !== 'input' || error || isLoading) return

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
    } catch (err) {
      console.error('Color input error:', err)
      setError({
        type: 'gameplay',
        message: 'Renk seçimi işlenirken hata oluştu.'
      })
      return 'error'
    }
  }, [state.phase, state.userInput, state.sequence, state.score, state.currentLevel, playSound, error, isLoading])

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
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // Game state
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