import { useState, useEffect, useCallback } from 'react'
import { GameState, GameStats, GameActions, GameResult, GameHookReturn, GamePhase } from '@/components/GameEngine/types'
import { LocalStorageManager } from '@/utils/localStorage'
import { useAudio } from './useAudio'
import { toast } from '@/components/ui/sonner'

interface UseUniversalGameProps {
  exerciseName: string
  onComplete?: (result: GameResult) => void
}

export const useUniversalGame = ({ exerciseName, onComplete }: UseUniversalGameProps): GameHookReturn => {
  const { playSound } = useAudio()
  
  // Game State
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

  // Game Stats
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    progress: '0%',
    time: '00:00',
    accuracy: 0
  })

  // Game Data (oyuna özel veriler için)
  const [gameData, setGameData] = useState<any>({})

  // Timer effect
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused) return

    const interval = setInterval(() => {
      const now = Date.now()
      const duration = Math.floor((now - gameState.startTime) / 1000)
      
      setGameState(prev => ({
        ...prev,
        currentTime: now,
        duration
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

  // Game Actions
  const gameActions: GameActions = {
    onStart: useCallback(() => {
      playSound('exercise-start')
      const now = Date.now()
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        isPlaying: true,
        isPaused: false,
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
        duration: 0
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
      // Mükemmel skor kontrolü
      if (result.accuracy === 100) {
        playSound('perfect-score')
        toast.success(`🏆 MÜKEMMEL! %100 başarı oranı!`)
      } else {
        playSound('exercise-complete')
      }

      // İlk defa tamamlama kontrolü
      const previousResults = LocalStorageManager.getExerciseResults()
      const exerciseResults = previousResults.filter(r => r.exerciseName === exerciseName)
      if (exerciseResults.length === 0) {
        setTimeout(() => {
          playSound('achievement')
          toast.success(`🎖️ BAŞARI: İlk ${exerciseName} tamamlandı!`)
        }, 1000)
      }

      // Sonucu kaydet
      try {
        await LocalStorageManager.saveExerciseResult({
          exerciseName: result.exerciseName,
          score: result.score,
          duration: result.duration,
          date: result.timestamp,
          details: result.details,
          completed: result.completed,
          exitedEarly: false
        })
        
        toast.success(`Tebrikler! Skor: ${result.score}`)
      } catch (error) {
        console.error('Sonuç kaydedilirken hata:', error)
        toast.error('Sonuç kaydedilirken hata oluştu')
      }

      setGameState(prev => ({
        ...prev,
        phase: 'completed',
        isPlaying: false,
        isCompleted: true
      }))

      // Custom completion handler
      if (onComplete) {
        onComplete(result)
      }
    }, [exerciseName, playSound, onComplete]),

    // 🚨 NEW: Handle early exit with partial results saving
    onExitEarly: useCallback(async () => {
      playSound('button-click')
      
      if (gameState.phase === 'playing' || gameState.phase === 'paused') {
        // 🚨 EARLY EXIT: Save partial results with exitedEarly flag
        try {
          const partialResult: GameResult = {
            exerciseName,
            score: gameStats.score,
            duration: gameState.duration,
            completed: false, // Not fully completed
            accuracy: gameStats.accuracy || 0,
            details: {
              exercise_name: exerciseName,
              session_duration_seconds: gameState.duration,
              score: gameStats.score,
              level_reached: gameStats.level,
              progress: gameStats.progress,
              timestamp: new Date().toISOString(),
              early_exit_reason: 'User navigated back during active session'
            },
            timestamp: new Date().toISOString()
          }
          
          await LocalStorageManager.saveExerciseResult({
            exerciseName: partialResult.exerciseName,
            score: partialResult.score,
            duration: partialResult.duration,
            date: partialResult.timestamp,
            details: partialResult.details,
            completed: false,
            exitedEarly: true // 🚨 CRITICAL FLAG
          })
          
          toast.warning(`⚠️ Egzersiz yarıda kesildi. Kısmi ilerleme kaydedildi (${gameStats.score} puan, ${formatTime(gameState.duration)})`)
          
          console.log('🚨 Early exit - Partial results saved:', partialResult)
        } catch (error) {
          console.error('Early exit result save error:', error)
          toast.error('Kısmi sonuç kaydedilirken hata oluştu')
        }
      }
    }, [exerciseName, gameState, gameStats, playSound]),

    onBack: useCallback(() => {
      playSound('button-click')
      // Bu default implementation, oyun specific logic için override edilebilir
    }, [playSound])
  }

  // Public API
  const updateGameStats = useCallback((newStats: Partial<GameStats>) => {
    setGameStats(prev => ({ ...prev, ...newStats }))
  }, [])

  const updateGameData = useCallback((newData: any) => {
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