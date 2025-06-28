import { useState, useCallback, useEffect, useRef } from 'react'
import { useAudio } from './useAudio'
import { GameState, GameStats, GameActions, GameHookReturn, GameResult } from '../components/GameEngine/types'
import { 
  HanoiConfiguration, 
  HanoiLevel, 
  HANOI_LEVELS, 
  isValidMove, 
  makeMove, 
  isConfigEqual,
  calculateScore,
  getDiskStyle
} from '../utils/hanoiTowersUtils'
import { LocalStorageManager } from '../utils/localStorage'

interface UseHanoiTowersProps {
  maxLevel?: number
}

// Error handling için
interface HanoiTowersError {
  type: 'initialization' | 'gameplay' | 'level_loading'
  message: string
}

interface HanoiTowersState {
  currentLevel: number
  currentConfig: HanoiConfiguration
  targetConfig: HanoiConfiguration
  selectedTower: number | null
  moves: number
  minMoves: number
  score: number
  levelsCompleted: number
  isGameCompleted: boolean
  diskCount: number
  timeStarted: number | null
  showingPreview: boolean
}

// Kule tıklama ses efektleri
const TOWER_CLICK_SOUNDS = ['button-click', 'button-hover'] as const

export const useHanoiTowers = ({ maxLevel = 18 }: UseHanoiTowersProps = {}) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)

  // Error states
  const [error, setError] = useState<HanoiTowersError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])
  
  const [state, setState] = useState<HanoiTowersState>({
    currentLevel: 1,
    currentConfig: { towers: [[], [], []] },
    targetConfig: { towers: [[], [], []] },
    selectedTower: null,
    moves: 0,
    minMoves: 0,
    score: 0,
    levelsCompleted: 0,
    isGameCompleted: false,
    diskCount: 3,
    timeStarted: null,
    showingPreview: true
  })

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const getCurrentLevelData = useCallback((): HanoiLevel => {
    return HANOI_LEVELS[state.currentLevel - 1] || HANOI_LEVELS[0]
  }, [state.currentLevel])

  const initializeGame = useCallback(() => {
    setState({
      currentLevel: 1,
      currentConfig: { towers: [[], [], []] },
      targetConfig: { towers: [[], [], []] },
      selectedTower: null,
      moves: 0,
      minMoves: 0,
      score: 0,
      levelsCompleted: 0,
      isGameCompleted: false,
      diskCount: 3,
      timeStarted: null,
      showingPreview: true
    })
  }, [])

  const initializeLevel = useCallback((level: number) => {
    const levelData = HANOI_LEVELS[level - 1] || HANOI_LEVELS[0]
    
    setState(prev => ({
      ...prev,
      currentLevel: level,
      currentConfig: { towers: levelData.initialConfig.towers.map(tower => [...tower]) },
      targetConfig: { towers: levelData.targetConfig.towers.map(tower => [...tower]) },
      selectedTower: null,
      moves: 0,
      minMoves: levelData.minMoves,
      diskCount: levelData.diskCount,
      timeStarted: null,
      showingPreview: true
    }))

    // 3 saniye önizleme göster
    setTimeout(() => {
      setState(prev => ({ ...prev, showingPreview: false }))
    }, 3000)
  }, [])

  const startGame = useCallback(() => {
    if (state.showingPreview) return
    
    setState(prev => ({
      ...prev,
      timeStarted: Date.now()
    }))
  }, [state.showingPreview])

  const handleTowerClick = useCallback((towerIndex: number) => {
    if (state.showingPreview || !state.timeStarted) return

    if (state.selectedTower === null) {
      // Kule seçimi - sadece disk varsa seçilebilir
      if (state.currentConfig.towers[towerIndex].length > 0) {
        playSound('button-click')
        setState(prev => ({ ...prev, selectedTower: towerIndex }))
      } else {
        // Boş kuleye tıklandı
        playSound('button-hover')
      }
    } else {
      // Disk hareketi
      if (state.selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        playSound('button-hover')
        setState(prev => ({ ...prev, selectedTower: null }))
      } else {
        // Farklı kuleye tıklandı, disk taşımaya çalış
        if (isValidMove(state.currentConfig, state.selectedTower, towerIndex)) {
          // Geçerli hamle
          const newConfig = makeMove(state.currentConfig, state.selectedTower, towerIndex)
          const newMoves = state.moves + 1
          
          playSound('correct-answer')
          
          setState(prev => ({
            ...prev,
            currentConfig: newConfig,
            moves: newMoves,
            selectedTower: null
          }))

          // Seviye tamamlanma kontrolü
          if (isConfigEqual(newConfig, state.targetConfig)) {
            setTimeout(() => completeLevel(), 500)
          }
        } else {
          // Geçersiz hamle
          playSound('wrong-answer')
          setState(prev => ({ ...prev, selectedTower: null }))
        }
      }
    }
  }, [state.selectedTower, state.currentConfig, state.targetConfig, state.moves, state.showingPreview, state.timeStarted, playSound])

  const calculateLevelScore = useCallback(() => {
    if (!state.timeStarted) return 0
    
    const timeSeconds = Math.floor((Date.now() - state.timeStarted) / 1000)
    const levelData = getCurrentLevelData()
    
    return calculateScore(levelData.minMoves, state.moves, timeSeconds)
  }, [state.moves, state.timeStarted, getCurrentLevelData])

  const completeLevel = useCallback(() => {
    if (!state.timeStarted) return

    const levelScore = calculateLevelScore()
    const timeSeconds = Math.floor((Date.now() - state.timeStarted) / 1000)
    const levelData = getCurrentLevelData()
    
    // Mükemmel skor kontrolü
    if (state.moves === levelData.minMoves) {
      playSound('perfect-score')
    } else {
      playSound('exercise-complete')
    }
    
    setState(prev => ({
      ...prev,
      score: prev.score + levelScore,
      levelsCompleted: prev.levelsCompleted + 1
    }))

    // İstatistikleri kaydet
    const result = {
      exerciseName: 'Hanoi Kuleleri',
      score: levelScore,
      duration: timeSeconds,
      date: new Date().toISOString(),
      completed: true,
      exitedEarly: false,
      details: {
        level_identifier: levelData.name,
        level_number: levelData.id,
        initial_config: levelData.initialConfig,
        target_config: levelData.targetConfig,
        min_moves_required: levelData.minMoves,
        user_moves_taken: state.moves,
        time_seconds: timeSeconds,
        score: levelScore,
        completed_optimally: state.moves === levelData.minMoves,
        efficiency_percentage: Math.round((levelData.minMoves / state.moves) * 100),
        disk_count: levelData.diskCount,
        exercise_name: 'Hanoi Kuleleri',
        timestamp: new Date().toISOString()
      }
    }

    LocalStorageManager.saveExerciseResult({
      id: Date.now().toString(),
      ...result
    })

    return {
      levelScore,
      efficiency: Math.round((levelData.minMoves / state.moves) * 100),
      isPerfect: state.moves === levelData.minMoves,
      timeSeconds
    }
  }, [calculateLevelScore, getCurrentLevelData, state.moves, state.timeStarted, playSound])

  const nextLevel = useCallback(() => {
    if (state.currentLevel >= maxLevel) {
      setState(prev => ({ ...prev, isGameCompleted: true }))
      playSound('achievement')
      return
    }

    const newLevel = state.currentLevel + 1
    initializeLevel(newLevel)
    playSound('level-up')
  }, [state.currentLevel, maxLevel, initializeLevel, playSound])

  const restartLevel = useCallback(() => {
    initializeLevel(state.currentLevel)
  }, [state.currentLevel, initializeLevel])

  const getFinalStats = useCallback(() => {
    return {
      levelsCompleted: state.levelsCompleted,
      totalMoves: state.moves,
      finalScore: state.score,
      maxLevelReached: state.currentLevel,
      averageEfficiency: state.levelsCompleted > 0 ? Math.round(state.score / state.levelsCompleted) : 0
    }
  }, [state])

  // Oyun başlangıcında ilk seviyeyi yükle
  useEffect(() => {
    initializeLevel(1)
  }, [initializeLevel])

  return {
    ...state,
    getCurrentLevelData,
    initializeGame,
    initializeLevel,
    startGame,
    handleTowerClick,
    completeLevel,
    nextLevel,
    restartLevel,
    getFinalStats,
    getDiskStyle,
    // Error handling
    error,
    isLoading,
    recoverFromError
  }
}

// Universal Game Engine ile uyumlu hook
export const useHanoiTowersGame = ({ maxLevel = 18 }: UseHanoiTowersProps = {}): GameHookReturn => {
  const hanoiGame = useHanoiTowers({ maxLevel })
  const { playSound } = useAudio()

  // Universal Game Engine ile uyumlu state
  const [universalState, setUniversalState] = useState<GameState>({
    phase: 'ready',
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    startTime: 0,
    currentTime: 0,
    pausedTime: 0,
    duration: 0,
    isActive: false,
    currentLevel: 1,
    score: 0,
    timeElapsed: 0,
    data: {}
  })

  const [universalStats, setUniversalStats] = useState<GameStats>({
    score: 0,
    level: 1,
    progress: '0%',
    time: '00:00',
    accuracy: 100
  })

  // Timer effect
  useEffect(() => {
    if (!universalState.isPlaying || universalState.isPaused) return

    const interval = setInterval(() => {
      const now = Date.now()
      const duration = Math.floor((now - universalState.startTime) / 1000)
      
      setUniversalState(prev => ({
        ...prev,
        currentTime: now,
        duration
      }))
      
      setUniversalStats(prev => ({
        ...prev,
        time: formatTime(duration)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [universalState.isPlaying, universalState.isPaused, universalState.startTime])

  // Hanoi game state değişikliklerini universal state'e yansıt
  useEffect(() => {
    const levelData = hanoiGame.getCurrentLevelData()
    const progress = hanoiGame.moves > 0 ? `${hanoiGame.moves}/${levelData.minMoves} hamle` : 'Hazır'
    const efficiency = hanoiGame.moves > 0 ? Math.round((levelData.minMoves / hanoiGame.moves) * 100) : 100
    
    setUniversalStats(prev => ({
      ...prev,
      score: hanoiGame.score,
      level: `${levelData.name}`,
      progress,
      accuracy: efficiency
    }))
  }, [hanoiGame.score, hanoiGame.moves, hanoiGame.currentLevel])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const gameActions: GameActions = {
    onStart: useCallback(() => {
      playSound('exercise-start')
      const now = Date.now()
      setUniversalState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isPaused: false,
        isActive: true,
        startTime: now,
        currentTime: now
      }))
      hanoiGame.startGame()
    }, [playSound, hanoiGame]),

    onPause: useCallback(() => {
      playSound('button-click')
      setUniversalState(prev => ({
        ...prev,
        phase: 'paused',
        isPlaying: false,
        isPaused: true,
        pausedTime: Date.now()
      }))
    }, [playSound]),

    onResume: useCallback(() => {
      playSound('button-click')
      const pauseDuration = Date.now() - universalState.pausedTime
      setUniversalState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isPaused: false,
        startTime: prev.startTime + pauseDuration,
        pausedTime: 0
      }))
    }, [playSound, universalState.pausedTime]),

    onRestart: useCallback(() => {
      playSound('button-click')
      setUniversalState({
        phase: 'ready',
        isPlaying: false,
        isPaused: false,
        isCompleted: false,
        startTime: 0,
        currentTime: 0,
        pausedTime: 0,
        duration: 0,
        isActive: false,
        currentLevel: 1,
        score: 0,
        timeElapsed: 0,
        data: {}
      })
      hanoiGame.restartLevel()
    }, [playSound, hanoiGame]),

    onComplete: useCallback(async (result: GameResult) => {
      playSound('exercise-complete')
      
      setUniversalState(prev => ({
        ...prev,
        phase: 'completed',
        isPlaying: false,
        isCompleted: true
      }))
    }, [playSound]),

    onBack: useCallback(() => {
      playSound('button-click')
    }, [playSound]),

    // Additional required methods
    start: useCallback(() => gameActions.onStart(), []),
    pause: useCallback(() => gameActions.onPause(), []),
    resume: useCallback(() => gameActions.onResume(), []),
    stop: useCallback(() => gameActions.onRestart(), []),
    reset: useCallback(() => gameActions.onRestart(), []),
    updateScore: useCallback((score: number) => {
      setUniversalState(prev => ({ ...prev, score }))
    }, []),
    updateLevel: useCallback((level: number) => {
      setUniversalState(prev => ({ ...prev, currentLevel: level }))
    }, []),
    setData: useCallback((data: Record<string, unknown>) => {
      setUniversalState(prev => ({ ...prev, data }))
    }, [])
  }

  return {
    gameState: universalState,
    gameStats: universalStats,
    gameActions,
    gameData: hanoiGame,
    updateGameStats: (newStats: Partial<GameStats>) => {
      setUniversalStats(prev => ({ ...prev, ...newStats }))
    },
    updateGameData: () => {}, // Hanoi game kendi state'ini yönetiyor
    updateGameState: (newState: Partial<GameState>) => {
      setUniversalState(prev => ({ ...prev, ...newState }))
    },
    formatTime
  }
}