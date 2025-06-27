import { useState, useCallback, useRef, useEffect } from 'react'
import { useAudio } from './useAudio'
import { WORD_CIRCLE_LEVELS, WordCircleLevel } from '../data/wordCircleLevels'
import { GameState } from '../components/GameEngine/types'

interface UseWordCircleProps {
  maxLevel?: number
}

interface WordCircleState {
  currentLevel: number
  selectedLetters: number[]
  currentWord: string
  foundWords: string[]
  bonusWords: string[]
  score: number
  isGameCompleted: boolean
  levelData: WordCircleLevel | null
}

// Error handling için
interface WordCircleError {
  type: 'initialization' | 'gameplay' | 'level_loading'
  message: string
}

export const useWordCircle = ({ maxLevel = 7 }: UseWordCircleProps = {}) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<WordCircleError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])
  
  const [state, setState] = useState<WordCircleState>({
    currentLevel: 1,
    selectedLetters: [],
    currentWord: '',
    foundWords: [],
    bonusWords: [],
    score: 0,
    isGameCompleted: false,
    levelData: null
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
        currentLevel: 1,
        selectedLetters: [],
        currentWord: '',
        foundWords: [],
        bonusWords: [],
        score: 0,
        isGameCompleted: false,
        levelData: null
      })
      
      setIsLoading(false)
    } catch (err) {
      console.error('Word circle initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [])

  const initializeLevel = useCallback((level: number) => {
    try {
      if (error || isLoading) return
      
      const levelData = WORD_CIRCLE_LEVELS.find(l => l.levelNumber === level)
      if (!levelData) {
        throw new Error(`Level ${level} data not found`)
      }

      setState(prev => ({
        ...prev,
        currentLevel: level,
        selectedLetters: [],
        currentWord: '',
        foundWords: [],
        bonusWords: [],
        levelData
      }))
    } catch (err) {
      console.error('Level initialization error:', err)
      setError({
        type: 'level_loading',
        message: 'Seviye yüklenemedi. Lütfen tekrar deneyin.'
      })
    }
  }, [error, isLoading])

  const startGame = useCallback(() => {
    initializeLevel(1)
  }, [initializeLevel])

  const handleLetterClick = useCallback((letterIndex: number) => {
    try {
      if (!state.levelData || error || isLoading) return

      setState(prev => {
        // Harf zaten seçiliyse, kaldır (toggle)
        if (prev.selectedLetters.includes(letterIndex)) {
          const newSelected = prev.selectedLetters.filter(i => i !== letterIndex)
          const newWord = newSelected.map(i => prev.levelData!.circleLetters[i]).join('')
          return {
            ...prev,
            selectedLetters: newSelected,
            currentWord: newWord
          }
        }

        // Yeni harfi ekle
        const newSelected = [...prev.selectedLetters, letterIndex]
        const newWord = newSelected.map(i => prev.levelData!.circleLetters[i]).join('')
        
        return {
          ...prev,
          selectedLetters: newSelected,
          currentWord: newWord
        }
      })
    } catch (err) {
      console.error('Letter click error:', err)
      setError({
        type: 'gameplay',
        message: 'Harf seçimi sırasında hata oluştu.'
      })
    }
  }, [state.levelData, error, isLoading])

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedLetters: [],
      currentWord: ''
    }))
  }, [])

  const shuffleLetters = useCallback(() => {
    try {
      if (!state.levelData || error || isLoading) return

      playSound('button-click')
      
      // Harfleri karıştır
      const shuffled = [...state.levelData.circleLetters].sort(() => Math.random() - 0.5)
      
      setState(prev => ({
        ...prev,
        levelData: prev.levelData ? { ...prev.levelData, circleLetters: shuffled } : null,
        selectedLetters: [],
        currentWord: ''
      }))
    } catch (err) {
      console.error('Shuffle letters error:', err)
      setError({
        type: 'gameplay',
        message: 'Harfler karıştırılırken hata oluştu.'
      })
    }
  }, [state.levelData, playSound, error, isLoading])

  const submitWord = useCallback(() => {
    try {
      if (!state.levelData || state.currentWord.length < 2 || error || isLoading) return

      const word = state.currentWord
      
      // Ana hedef kelimeler kontrolü
      const targetWord = state.levelData.targetWords.find(tw => tw.word === word)
      if (targetWord && !state.foundWords.includes(word)) {
        playSound('correct-answer')
        
        const wordScore = word.length * 10
        setState(prev => ({
          ...prev,
          foundWords: [...prev.foundWords, word],
          score: prev.score + wordScore,
          selectedLetters: [],
          currentWord: ''
        }))

        return {
          type: 'target_word',
          word,
          score: wordScore,
          isComplete: state.foundWords.length + 1 >= state.levelData.targetWords.length
        }
      }

      // Bonus kelimeler kontrolü
      if (state.levelData.bonusWords?.includes(word) && !state.bonusWords.includes(word)) {
        playSound('correct-answer')
        
        const bonusScore = word.length * 5
        setState(prev => ({
          ...prev,
          bonusWords: [...prev.bonusWords, word],
          score: prev.score + bonusScore,
          selectedLetters: [],
          currentWord: ''
        }))

        return {
          type: 'bonus_word',
          word,
          score: bonusScore,
          isComplete: false
        }
      }

      // Geçersiz kelime
      playSound('wrong-answer')
      setState(prev => ({
        ...prev,
        selectedLetters: [],
        currentWord: ''
      }))

      return {
        type: 'invalid',
        word,
        score: 0,
        isComplete: false
      }
    } catch (err) {
      console.error('Submit word error:', err)
      setError({
        type: 'gameplay',
        message: 'Kelime kontrol edilirken hata oluştu.'
      })
      return null
    }
  }, [state.levelData, state.currentWord, state.foundWords, state.bonusWords, playSound, error, isLoading])

  const nextLevel = useCallback(() => {
    if (state.currentLevel >= maxLevel) {
      setState(prev => ({ ...prev, isGameCompleted: true }))
      return
    }

    const newLevel = state.currentLevel + 1
    initializeLevel(newLevel)
    playSound('level-up')
  }, [state.currentLevel, maxLevel, initializeLevel, playSound])

  const getFinalStats = useCallback(() => {
    return {
      levelsCompleted: state.currentLevel,
      wordsFound: state.foundWords.length,
      bonusWordsFound: state.bonusWords.length,
      finalScore: state.score,
      averageWordsPerLevel: state.currentLevel > 0 ? Math.round(state.foundWords.length / state.currentLevel) : 0
    }
  }, [state])

  // Progress hesaplama
  const progress = state.levelData ? 
    Math.round((state.foundWords.length / state.levelData.targetWords.length) * 100) : 0

  return {
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // State
    currentLevel: state.currentLevel,
    selectedLetters: state.selectedLetters,
    currentWord: state.currentWord,
    foundWords: state.foundWords,
    bonusWords: state.bonusWords,
    score: state.score,
    isGameCompleted: state.isGameCompleted,
    levelData: state.levelData,
    
    // Computed
    progress,
    remainingWords: state.levelData ? 
      state.levelData.targetWords.filter(tw => !state.foundWords.includes(tw.word)) : [],
    
    // Actions
    initializeGame,
    initializeLevel,
    startGame,
    handleLetterClick,
    clearSelection,
    shuffleLetters,
    submitWord,
    nextLevel,
    getFinalStats
  }
}

// Universal Game Engine uyumlu hook
export const useWordCircleGame = ({ maxLevel = 7 }: UseWordCircleProps = {}) => {
  const { playSound } = useAudio()
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    startTime: 0,
    currentTime: 0,
    pausedTime: 0,
    duration: 0
  })

  const [wordState, setWordState] = useState<WordCircleState>({
    currentLevel: 1,
    selectedLetters: [],
    currentWord: '',
    foundWords: [],
    bonusWords: [],
    score: 0,
    isGameCompleted: false,
    levelData: null
  })

  // Game actions
  const gameActions = {
    onStart: () => {
      playSound('exercise-start')
      const levelData = WORD_CIRCLE_LEVELS.find(l => l.levelNumber === 1)
      
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        startTime: Date.now(),
        currentTime: Date.now()
      }))

      setWordState(prev => ({
        ...prev,
        currentLevel: 1,
        selectedLetters: [],
        currentWord: '',
        foundWords: [],
        bonusWords: [],
        levelData
      }))
    },

    onPause: () => {
      playSound('button-click')
      setGameState(prev => ({
        ...prev,
        phase: 'paused',
        isPaused: true,
        isPlaying: false,
        pausedTime: Date.now()
      }))
    },

    onResume: () => {
      playSound('button-click')
      const pauseDuration = Date.now() - gameState.pausedTime
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPaused: false,
        isPlaying: true,
        startTime: prev.startTime + pauseDuration
      }))
    },

    onRestart: () => {
      playSound('button-click')
      setGameState({
        phase: 'ready',
        isPlaying: false,
        isPaused: false,
        isCompleted: false,
        startTime: 0,
        currentTime: 0,
        pausedTime: 0,
        duration: 0
      })
      setWordState({
        currentLevel: 1,
        selectedLetters: [],
        currentWord: '',
        foundWords: [],
        bonusWords: [],
        score: 0,
        isGameCompleted: false,
        levelData: null
      })
    },

    onComplete: (result: any) => {
      // LocalStorage save will be handled by parent
    },

    onBack: () => {
      // This will be handled by the parent component
    }
  }

  // Game stats
  const gameStats = {
    score: wordState.score,
    level: `${wordState.currentLevel}/7`,
    progress: wordState.levelData ? 
      `${wordState.foundWords.length}/${wordState.levelData.targetWords.length} kelime` : '0/0 kelime',
    accuracy: wordState.levelData ? 
      Math.round((wordState.foundWords.length / wordState.levelData.targetWords.length) * 100) : 0
  }

  return {
    gameState,
    gameStats,
    gameActions,
    gameData: wordState,
    updateGameStats: () => {},
    updateGameData: (newData: any) => setWordState(prev => ({ ...prev, ...newData })),
    updateGameState: (newState: any) => setGameState(prev => ({ ...prev, ...newState })),
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  }
} 