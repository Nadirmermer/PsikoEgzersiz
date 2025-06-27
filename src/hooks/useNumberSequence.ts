import { useState, useCallback, useEffect, useRef } from 'react'
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

// Error handling için
interface NumberSequenceError {
  type: 'initialization' | 'gameplay' | 'timer'
  message: string
}

export const useNumberSequence = ({ initialLevel = 1 }: UseNumberSequenceProps = {}) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)
  const sequenceTimerRef = useRef<NodeJS.Timeout>()
  
  // Error states
  const [error, setError] = useState<NumberSequenceError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
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

  // Cleanup effect - memory leaks önlenir
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
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
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
      
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
      
      setIsLoading(false)
    } catch (err) {
      console.error('Number sequence initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [initialLevel])

  const startNextLevel = useCallback(() => {
    try {
      if (error || isLoading) return
      
      const sequenceLength = 2 + state.currentLevel
      const newSequence = generateSequence(sequenceLength)
      
      // Clear any existing timers
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
      
      setState(prev => ({
        ...prev,
        sequence: newSequence,
        userInput: [],
        phase: 'showing',
        showingIndex: 0,
        questionStartTime: Date.now()
      }))
    } catch (err) {
      console.error('Start next level error:', err)
      setError({
        type: 'gameplay',
        message: 'Yeni seviye başlatılamadı.'
      })
    }
  }, [state.currentLevel, generateSequence, error, isLoading])

  // Dizi gösterimi otomatik ilerlemesi - Safe timer with error handling
  useEffect(() => {
    if (state.phase !== 'showing') return

    try {
      sequenceTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return

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
    } catch (err) {
      console.error('Sequence timer error:', err)
      setError({
        type: 'timer',
        message: 'Dizi gösterimi sırasında hata oluştu.'
      })
    }

    return () => {
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
    }
  }, [state.phase, state.showingIndex, state.sequence.length])

  const handleNumberInput = useCallback((number: number) => {
    try {
      if (state.phase !== 'input' || error || isLoading) return

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
    } catch (err) {
      console.error('Number input error:', err)
      setError({
        type: 'gameplay',
        message: 'Sayı girişi işlenirken hata oluştu.'
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