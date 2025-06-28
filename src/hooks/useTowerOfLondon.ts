import { useState, useCallback, useRef, useEffect } from 'react'
import { useAudio } from './useAudio'
import { GameState, GameStats, GameActions, GameHookReturn, GameResult } from '../components/GameEngine/types'
import { LocalStorageManager } from '../utils/localStorage'

interface UseTowerOfLondonProps {
  maxLevel?: number
}

interface TowerOfLondonState {
  currentLevel: number
  towers: number[][]
  selectedTower: number | null
  moves: number
  minMoves: number
  score: number
  levelsCompleted: number
  isGameCompleted: boolean
  diskCount: number
}

// Error handling için
interface TowerOfLondonError {
  type: 'initialization' | 'gameplay' | 'level_loading'
  message: string
}

// Disk renkleri - size'a göre
export const getDiskStyle = (size: number, maxSize: number, isSelected: boolean = false) => {
  const diskStyles = [
    { bg: 'bg-red-500', border: 'border-red-600', shadow: 'shadow-red-500/50' },
    { bg: 'bg-orange-500', border: 'border-orange-600', shadow: 'shadow-orange-500/50' },
    { bg: 'bg-yellow-500', border: 'border-yellow-600', shadow: 'shadow-yellow-500/50' },
    { bg: 'bg-green-500', border: 'border-green-600', shadow: 'shadow-green-500/50' },
    { bg: 'bg-blue-500', border: 'border-blue-600', shadow: 'shadow-blue-500/50' },
    { bg: 'bg-purple-500', border: 'border-purple-600', shadow: 'shadow-purple-500/50' }
  ]

  const style = diskStyles[maxSize - size] || diskStyles[0]
  const width = `${3 + size * 1.5}rem` // Büyük disk daha geniş

  return {
    ...style,
    width,
    className: `${style.bg} ${style.border} border-2 rounded-lg transition-all duration-300 ${
      isSelected ? `scale-110 ${style.shadow} shadow-lg animate-pulse` : 'hover:scale-105'
    }`
  }
}

export const useTowerOfLondon = ({ maxLevel = 10 }: UseTowerOfLondonProps = {}) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<TowerOfLondonError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])
  
  const [state, setState] = useState<TowerOfLondonState>({
    currentLevel: 1,
    towers: [[], [], []],
    selectedTower: null,
    moves: 0,
    minMoves: 0,
    score: 0,
    levelsCompleted: 0,
    isGameCompleted: false,
    diskCount: 3
  })

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const calculateMinMoves = useCallback((diskCount: number) => {
    return Math.pow(2, diskCount) - 1
  }, [])

  const initializeGame = useCallback(() => {
    try {
      setError(null)
      setIsLoading(true)
      
    setState({
      currentLevel: 1,
      towers: [[], [], []],
      selectedTower: null,
      moves: 0,
      minMoves: 0,
      score: 0,
      levelsCompleted: 0,
      isGameCompleted: false,
      diskCount: 3
    })
      
      setIsLoading(false)
    } catch (err) {
      console.error('Tower of London initialization error:', err)
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
      
    const diskCount = Math.min(2 + level, 6) // Seviye 1: 3 disk, Seviye 4: 6 disk
    const initialTower = Array.from({ length: diskCount }, (_, i) => diskCount - i) // En büyük disk altta
    const minMoves = calculateMinMoves(diskCount)

    setState(prev => ({
      ...prev,
      currentLevel: level,
      towers: [initialTower, [], []],
      selectedTower: null,
      moves: 0,
      minMoves,
      diskCount
    }))
    } catch (err) {
      console.error('Level initialization error:', err)
      setError({
        type: 'level_loading',
        message: 'Seviye yüklenemedi. Lütfen tekrar deneyin.'
      })
    }
  }, [calculateMinMoves, error, isLoading])

  const canMoveDisk = useCallback((fromTower: number, toTower: number): boolean => {
    try {
    if (fromTower === toTower) return false
    
    const from = state.towers[fromTower]
    const to = state.towers[toTower]
    
    if (from.length === 0) return false
    if (to.length === 0) return true
    
    // Küçük disk büyük diskin üstüne gidebilir (küçük sayı > büyük sayı)
    return from[from.length - 1] < to[to.length - 1]
    } catch (err) {
      console.error('Move validation error:', err)
      setError({
        type: 'gameplay',
        message: 'Hamle kontrolü sırasında hata oluştu.'
      })
      return false
    }
  }, [state.towers])

  const handleTowerClick = useCallback((towerIndex: number) => {
    try {
      if (error || isLoading) return
      
    if (state.selectedTower === null) {
      // Kule seçimi - sadece disk varsa seçilebilir
      if (state.towers[towerIndex].length > 0) {
        playSound('button-click')
        setState(prev => ({ ...prev, selectedTower: towerIndex }))
      }
    } else {
      // Disk hareketi
      if (state.selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        setState(prev => ({ ...prev, selectedTower: null }))
      } else {
        // Farklı kuleye tıklandı, disk taşımaya çalış
        if (canMoveDisk(state.selectedTower, towerIndex)) {
          moveDisk(state.selectedTower, towerIndex)
        } else {
          // Geçersiz hamle
          playSound('wrong-answer')
          setState(prev => ({ ...prev, selectedTower: null }))
        }
      }
    }
    } catch (err) {
      console.error('Tower click error:', err)
      setError({
        type: 'gameplay',
        message: 'Kule tıklama sırasında hata oluştu.'
      })
    }
  }, [state.selectedTower, state.towers, canMoveDisk, playSound, error, isLoading])

  const moveDisk = useCallback((fromTower: number, toTower: number) => {
    const newTowers = state.towers.map(tower => [...tower])
    const disk = newTowers[fromTower].pop()!
    newTowers[toTower].push(disk)

    const newMoves = state.moves + 1

    setState(prev => ({
      ...prev,
      towers: newTowers,
      moves: newMoves,
      selectedTower: null
    }))

    // Seviye tamamlanma kontrolü - tüm diskler sağ kulede mi?
    if (newTowers[2].length === state.diskCount) {
      return 'level_complete'
    }

    return 'continue'
  }, [state.towers, state.moves, state.diskCount])

  const calculateLevelScore = useCallback(() => {
    // Verimlilik skoru: optimal hamlede %100, fazla hamlede azalıyor
    const efficiency = Math.max(0, Math.min(100, Math.round((state.minMoves / state.moves) * 100)))
    
    // Bonus puanlar
    const perfectBonus = state.moves === state.minMoves ? 50 : 0
    const levelBonus = state.currentLevel * 10
    
    return efficiency + perfectBonus + levelBonus
  }, [state.moves, state.minMoves, state.currentLevel])

  const completeLevel = useCallback(() => {
    const levelScore = calculateLevelScore()
    
    playSound('correct-answer')
    
    setState(prev => ({
      ...prev,
      score: prev.score + levelScore,
      levelsCompleted: prev.levelsCompleted + 1
    }))

    return {
      levelScore,
      efficiency: Math.round((state.minMoves / state.moves) * 100),
      isPerfect: state.moves === state.minMoves
    }
  }, [calculateLevelScore, playSound, state.minMoves, state.moves])

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
      levelsCompleted: state.levelsCompleted,
      totalMoves: state.moves,
      finalScore: state.score,
      maxLevelReached: state.currentLevel,
      averageEfficiency: state.levelsCompleted > 0 ? Math.round(state.score / state.levelsCompleted) : 0
    }
  }, [state])

  // İlk seviyeyi başlat
  const startGame = useCallback(() => {
    initializeLevel(1)
  }, [initializeLevel])

  return {
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // State
    currentLevel: state.currentLevel,
    towers: state.towers,
    selectedTower: state.selectedTower,
    moves: state.moves,
    minMoves: state.minMoves,
    score: state.score,
    levelsCompleted: state.levelsCompleted,
    isGameCompleted: state.isGameCompleted,
    diskCount: state.diskCount,
    
    // Computed
    efficiency: state.moves > 0 ? Math.round((state.minMoves / state.moves) * 100) : 100,
    
    // Actions
    initializeGame,
    initializeLevel,
    handleTowerClick,
    canMoveDisk,
    moveDisk,
    completeLevel,
    nextLevel,
    startGame,
    getFinalStats
  }
}

// Universal Game Engine uyumlu hook
export const useTowerOfLondonGame = ({ maxLevel = 10 }: UseTowerOfLondonProps = {}): GameHookReturn => {
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

  const [towerState, setTowerState] = useState<TowerOfLondonState>({
    currentLevel: 1,
    towers: [[], [], []],
    selectedTower: null,
    moves: 0,
    minMoves: 0,
    score: 0,
    levelsCompleted: 0,
    isGameCompleted: false,
    diskCount: 3
  })

  // Game actions
  const gameActions: GameActions = {
    onStart: () => {
      playSound('exercise-start')
      const diskCount = Math.min(2 + 1, 6) // Level 1: 3 disks
      const initialTower = Array.from({ length: diskCount }, (_, i) => diskCount - i)
      const minMoves = Math.pow(2, diskCount) - 1

      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        startTime: Date.now(),
        currentTime: Date.now()
      }))

      setTowerState(prev => ({
        ...prev,
        currentLevel: 1,
        towers: [initialTower, [], []],
        moves: 0,
        minMoves,
        diskCount
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
      setTowerState({
        currentLevel: 1,
        towers: [[], [], []],
        selectedTower: null,
        moves: 0,
        minMoves: 0,
        score: 0,
        levelsCompleted: 0,
        isGameCompleted: false,
        diskCount: 3
      })
    },

    onComplete: (result: GameResult) => {
      LocalStorageManager.saveExerciseResult({
        exerciseName: result.exerciseName,
        score: result.score,
        duration: result.duration,
        date: result.timestamp,
        details: result.details,
        completed: true,
        exitedEarly: false
      })
    },

    onBack: () => {
      // This will be handled by the parent component
    }
  }

  // Game stats
  const gameStats: GameStats = {
    score: towerState.score,
    level: `${towerState.currentLevel}/10`,
    progress: `${towerState.moves}/${towerState.minMoves} hamle`,
    accuracy: towerState.moves > 0 ? Math.round((towerState.minMoves / towerState.moves) * 100) : 100
  }

  // Helper methods
  const updateGameStats = useCallback((newStats: Partial<GameStats>) => {
    // Tower of London specific stat updates
  }, [])

  const updateGameData = useCallback((newData: any) => {
    setTowerState(prev => ({ ...prev, ...newData }))
  }, [])

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }))
  }, [])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    gameState,
    gameStats,
    gameActions,
    gameData: towerState,
    updateGameStats,
    updateGameData,
    updateGameState,
    formatTime
  }
} 