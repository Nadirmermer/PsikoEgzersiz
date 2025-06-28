import { useState, useEffect, useCallback } from 'react'
import { GameState, GameStats, GameActions, GameResult, GameHookReturn, GamePhase } from '@/components/GameEngine/types'
import { LocalStorageManager } from '@/utils/localStorage'
import { useAudio } from './useAudio'
import { toast } from '@/components/ui/sonner'

interface UseUniversalGameProps {
  exerciseName: string
  onComplete?: (result: GameResult) => void
}

// Generic game data type for flexibility
type GameData = Record<string, unknown>

export const useUniversalGame = ({ exerciseName, onComplete }: UseUniversalGameProps): GameHookReturn => {
  const { playSound } = useAudio()
  
  // Game State - Complete GameState interface'e uygun
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    isPlaying: false,
    isPaused: false,
    isCompleted: false,
    startTime: 0,
    currentTime: 0,
    pausedTime: 0,
    duration: 0,
    // Additional required properties
    isActive: false,
    currentLevel: 1,
    score: 0,
    timeElapsed: 0,
    data: {}
  })

  // Game Stats
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    progress: '0%',
    time: '00:00',
    accuracy: 0
  })

  // Game Data (oyuna özel veriler için)
  const [gameData, setGameData] = useState<GameData>({})

  // Timer effect
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return

    const interval = setInterval(() => {
      const now = Date.now()
      const duration = Math.floor((now - gameState.startTime) / 1000)
      
      setGameState(prev => ({
        ...prev,
        currentTime: now,
        duration,
        timeElapsed: duration
      }))
      
      setGameStats(prev => ({
        ...prev,
        time: formatTime(duration)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.isPlaying, gameState.isPaused, gameState.startTime])

  // Format time utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Game Actions - Complete GameActions interface'e uygun
  const gameActions: GameActions = {
    // Primary actions
    onStart: useCallback(() => {
      playSound('exercise-start')
      const now = Date.now()
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isPaused: false,
        isActive: true,
        startTime: now,
        currentTime: now
      }))
      toast.success('Oyun başladı!')
    }, [playSound]),

    onPause: useCallback(() => {
      playSound('button-click')
      setGameState(prev => ({
        ...prev,
        phase: 'paused',
        isPlaying: false,
        isPaused: true,
        pausedTime: Date.now()
      }))
      toast.info('Oyun duraklatıldı')
    }, [playSound]),

    onResume: useCallback(() => {
      playSound('button-click')
      const pauseDuration = Date.now() - gameState.pausedTime
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isPaused: false,
        startTime: prev.startTime + pauseDuration,
        pausedTime: 0
      }))
      toast.info('Oyun devam ediyor')
    }, [playSound, gameState.pausedTime]),

    onRestart: useCallback(() => {
      playSound('button-click')
      setGameState({
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
      setGameStats({
        score: 0,
        level: 1,
        progress: '0%',
        time: '00:00',
        accuracy: 0
      })
      setGameData({})
      toast.info('Oyun yeniden başlatıldı')
    }, [playSound]),

    onComplete: useCallback(async (result: GameResult) => {
      playSound('exercise-complete')
      
      setGameState(prev => ({
        ...prev,
        phase: 'completed',
        isPlaying: false,
        isCompleted: true,
        isActive: false,
        score: result.score
      }))

      // Save result to localStorage
      try {
        await LocalStorageManager.saveExerciseResult({
          exerciseName: result.exerciseName,
          score: result.score,
          duration: result.duration,
          date: result.timestamp,
          completed: result.completed,
          exitedEarly: false,
          accuracy: result.accuracy,
          details: result.details
        })
        
        toast.success('🎉 Oyun tamamlandı!')
        
        if (onComplete) {
          onComplete(result)
        }
      } catch (error) {
        console.error('Failed to save game result:', error)
        toast.error('Sonuç kaydedilemedi')
      }
    }, [playSound, onComplete]),

    onExitEarly: useCallback(async () => {
      playSound('button-click')
      
      const partialResult = {
        exerciseName,
        currentProgress: gameData,
        duration: gameState.duration
      }
      
      LocalStorageManager.savePartialProgress(
        partialResult.exerciseName,
        partialResult.currentProgress,
        partialResult.duration
      )
      
      setGameState(prev => ({
        ...prev,
        phase: 'completed',
        isPlaying: false,
        isActive: false
      }))
      
      toast.info('Oyun erken sonlandırıldı')
    }, [playSound, exerciseName, gameData, gameState.duration]),

    onBack: useCallback(() => {
      playSound('button-click')
      // Bu default implementation, oyun specific logic için override edilebilir
    }, [playSound]),

    // Additional required actions
    start: useCallback(() => {
      playSound('exercise-start')
      const now = Date.now()
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isActive: true,
        startTime: now,
        currentTime: now
      }))
    }, [playSound]),

    pause: useCallback(() => {
      playSound('button-click')
      setGameState(prev => ({
        ...prev,
        phase: 'paused',
        isPlaying: false,
        isPaused: true
      }))
    }, [playSound]),

    resume: useCallback(() => {
      playSound('button-click')
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isPaused: false
      }))
    }, [playSound]),

    stop: useCallback(() => {
      playSound('button-click')
      setGameState(prev => ({
        ...prev,
        phase: 'completed',
        isPlaying: false,
        isActive: false
      }))
    }, [playSound]),

    reset: useCallback(() => {
      setGameState({
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
      setGameStats({
        score: 0,
        level: 1,
        progress: '0%',
        time: '00:00',
        accuracy: 0
      })
      setGameData({})
    }, []),

    updateScore: useCallback((score: number) => {
      setGameState(prev => ({ ...prev, score }))
      setGameStats(prev => ({ ...prev, score }))
    }, []),

    updateLevel: useCallback((level: number) => {
      setGameState(prev => ({ ...prev, currentLevel: level }))
      setGameStats(prev => ({ ...prev, level }))
    }, []),

    setData: useCallback((data: Record<string, unknown>) => {
      setGameState(prev => ({ ...prev, data }))
      setGameData(data)
    }, [])
  }

  // Public API
  const updateGameStats = useCallback((newStats: Partial<GameStats>) => {
    setGameStats(prev => ({ ...prev, ...newStats }))
  }, [])

  const updateGameData = useCallback((newData: GameData) => {
    setGameData(prev => ({ ...prev, ...newData }))
  }, [])

  const updateGameState = useCallback((newState: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...newState }))
  }, [])

  return {
    gameState,
    gameStats,
    gameActions,
    gameData,
    // Helper methods
    updateGameStats,
    updateGameData,
    updateGameState,
    formatTime
  }
} 