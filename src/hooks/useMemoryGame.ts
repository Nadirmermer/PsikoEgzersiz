import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, GameStats, generateCards, calculateScore } from '../utils/memoryGameUtils'
import { LocalStorageManager, MemoryGameLevel, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { useAudio } from './useAudio'

interface UseMemoryGameProps {
  level: MemoryGameLevel
}

// Error boundary için error state ekledik
interface MemoryGameError {
  type: 'initialization' | 'gameplay' | 'storage'
  message: string
}

export const useMemoryGame = ({ level }: UseMemoryGameProps) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)
  const previewTimerRef = useRef<NodeJS.Timeout>()
  const flipTimerRef = useRef<NodeJS.Timeout>()
  const durationTimerRef = useRef<NodeJS.Timeout>()

  // Error state eklendi
  const [error, setError] = useState<MemoryGameError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<Card[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [pausedTime, setPausedTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [moves, setMoves] = useState(0)
  const [incorrectMoves, setIncorrectMoves] = useState(0)
  const [cardFlips, setCardFlips] = useState(0)
  const [firstMatchTime, setFirstMatchTime] = useState<number | null>(null)
  const [showingPreview, setShowingPreview] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [nextLevelUnlocked, setNextLevelUnlocked] = useState(false)

  // Cleanup function - memory leaks önlenir
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    }
  }, [])

  // Safe state update function - race condition önlenir
  const safeSetState = useCallback((setState: React.SetStateAction<any>) => {
    if (mountedRef.current) {
      return setState
    }
    return () => {} // No-op if component unmounted
  }, [])

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(true)
    try {
      const newCards = generateCards(level.gridSize)
      setCards(newCards)
      setIsLoading(false)
    } catch (err) {
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen sayfayı yenileyin.'
      })
      setIsLoading(false)
    }
  }, [level.gridSize])

  // Kartları başlat - Error handling eklendi
  const initializeGame = useCallback(() => {
    try {
      setIsLoading(true)
      setError(null)
      
      const newCards = generateCards(level.gridSize)
      
      // Clear all timers
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
      
      setCards(newCards)
      setFlippedCards([])
      setGameStarted(false)
      setGameCompleted(false)
      setIsPaused(false)
      setStartTime(null)
      setPausedTime(0)
      setDuration(0)
      setMoves(0)
      setIncorrectMoves(0)
      setCardFlips(0)
      setFirstMatchTime(null)
      setLevelCompleted(false)
      setNextLevelUnlocked(false)
      
      // Kart önizlemesini başlat
      setShowingPreview(true)
      
      // Önizleme bitiminden 3 saniye önce countdown sesi çal
      if (level.previewTime > 3000) {
        setTimeout(() => {
          if (mountedRef.current) {
            playSound('countdown')
          }
        }, level.previewTime - 3000)
      }
      
      // Safe preview timer
      previewTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setShowingPreview(false)
          setIsLoading(false)
        }
      }, level.previewTime)
      
    } catch (err) {
      console.error('Memory game initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [level.gridSize, level.previewTime, playSound])

  // Oyunu başlat - Error handling eklendi
  const startGame = useCallback(() => {
    try {
      if (!showingPreview && !gameStarted) {
        setGameStarted(true)
        setStartTime(Date.now())
      }
    } catch (err) {
      console.error('Game start error:', err)
      setError({
        type: 'gameplay',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
    }
  }, [showingPreview, gameStarted])

  // Oyunu duraklat - Improved pause handling
  const pauseGame = useCallback(() => {
    try {
      if (gameStarted && !gameCompleted && !isPaused) {
        setIsPaused(true)
        setPausedTime(Date.now())
        
        // Pause all timers
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current)
        }
      }
    } catch (err) {
      console.error('Pause error:', err)
    }
  }, [gameStarted, gameCompleted, isPaused])

  // Oyunu devam ettir - Improved resume handling
  const resumeGame = useCallback(() => {
    try {
      if (gameStarted && !gameCompleted && isPaused && startTime) {
        const pauseDuration = Date.now() - pausedTime
        setStartTime(startTime + pauseDuration)
        setIsPaused(false)
        setPausedTime(0)
      }
    } catch (err) {
      console.error('Resume error:', err)
    }
  }, [gameStarted, gameCompleted, isPaused, startTime, pausedTime])

  // Kart tıklama - Touch-friendly ve error handling
  const flipCard = useCallback((cardId: string) => {
    try {
      if (!gameStarted || gameCompleted || showingPreview || isPaused || isLoading) return
      
      setCardFlips(prev => prev + 1)
      
      setCards(prevCards => {
        const newCards = prevCards.map(card => {
          if (card.id === cardId && !card.isFlipped && !card.isMatched) {
            return { ...card, isFlipped: true }
          }
          return card
        })
        
        const newFlippedCard = newCards.find(card => card.id === cardId)
        if (newFlippedCard && !newFlippedCard.isMatched) {
          setFlippedCards(prev => [...prev, newFlippedCard])
        }
        
        return newCards
      })
    } catch (err) {
      console.error('Card flip error:', err)
      setError({
        type: 'gameplay',
        message: 'Kart çevrilemedi. Lütfen tekrar deneyin.'
      })
    }
  }, [gameStarted, gameCompleted, showingPreview, isPaused, isLoading])

  // Süre sayacı - Memory leak önlendi
  useEffect(() => {
    if (gameStarted && !gameCompleted && !isPaused && startTime) {
      durationTimerRef.current = setInterval(() => {
        if (mountedRef.current) {
          const newDuration = Math.floor((Date.now() - startTime) / 1000)
          setDuration(newDuration)
        }
      }, 1000)
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
    
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [gameStarted, gameCompleted, isPaused, startTime])

  // Eşleşme kontrolü - Error handling eklendi
  useEffect(() => {
    if (flippedCards.length === 2) {
      try {
        setMoves(prev => prev + 1)
        
        const [card1, card2] = flippedCards
        
        if (card1.emoji === card2.emoji) {
          // Eşleşme bulundu
          playSound('correct-answer')
          if (firstMatchTime === null && startTime) {
            setFirstMatchTime(Math.floor((Date.now() - startTime) / 1000))
          }
          
          setCards(prevCards =>
            prevCards.map(card => {
              if (card.id === card1.id || card.id === card2.id) {
                return { ...card, isMatched: true }
              }
              return card
            })
          )
          setFlippedCards([])
        } else {
          // Eşleşme yok
          playSound('wrong-answer')
          setIncorrectMoves(prev => prev + 1)
          
          flipTimerRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setCards(prevCards =>
                prevCards.map(card => {
                  if (card.id === card1.id || card.id === card2.id) {
                    return { ...card, isFlipped: false }
                  }
                  return card
                })
              )
              setFlippedCards([])
            }
          }, 1500)
        }
      } catch (err) {
        console.error('Match checking error:', err)
        setError({
          type: 'gameplay',
          message: 'Eşleşme kontrolü yapılamadı.'
        })
      }
    }
  }, [flippedCards.length, firstMatchTime, startTime, playSound])

  // Oyun tamamlanma kontrolü - Error handling eklendi
  useEffect(() => {
    if (cards.length === 0) return
    
    const matchedCards = cards.filter(card => card.isMatched)
    const totalPairs = cards.length / 2
    
    if (matchedCards.length === cards.length && !gameCompleted) {
      try {
        setGameCompleted(true)
        setLevelCompleted(true)
        
        // İstatistikleri kaydet
        const finalDuration = startTime ? Math.floor((Date.now() - startTime) / 1000) : duration
        
        const stats: Omit<GameStats, 'score' | 'timestamp' | 'exercise_name'> = {
          level_identifier: `${level.name} (${level.gridSize.rows}x${level.gridSize.cols})`,
          grid_size: `${level.gridSize.rows}x${level.gridSize.cols}`,
          duration_seconds: finalDuration,
          moves_count: moves,
          incorrect_moves_count: incorrectMoves,
          pairs_found: totalPairs,
          total_pairs: totalPairs,
          first_match_time_seconds: firstMatchTime || undefined,
          card_flips_total: cardFlips
        }
        
        const finalStats: GameStats = {
          ...stats,
          exercise_name: 'Hafıza Oyunu',
          score: calculateScore(stats),
          timestamp: new Date().toISOString()
        }

        // Mükemmel skor kontrolü (hiç yanlış hamle yoksa)
        if (incorrectMoves === 0) {
          playSound('perfect-score')
        } else {
          playSound('exercise-complete')
        }

        // İlk defa tamamlama kontrolü
        const previousResults = LocalStorageManager.getExerciseResults()
        const memoryGameResults = previousResults.filter(r => r.exerciseName === 'Hafıza Oyunu')
        if (memoryGameResults.length === 0) {
          setTimeout(() => {
            if (mountedRef.current) {
              playSound('achievement')
            }
          }, 1000)
        }
        
        // Local storage'a kaydet - Error handling
        try {
          LocalStorageManager.saveExerciseResult({
            exerciseName: finalStats.exercise_name,
            score: finalStats.score,
            duration: finalStats.duration_seconds,
            date: finalStats.timestamp,
            details: finalStats,
            completed: true,
            exitedEarly: false
          })

          // Seviye ilerlemesini kontrol et
          const levelUp = LocalStorageManager.completeMemoryGameLevel(level.id)
          if (levelUp) {
            setNextLevelUnlocked(true)
          }
        } catch (storageErr) {
          console.error('Storage error:', storageErr)
          setError({
            type: 'storage',
            message: 'Sonuçlar kaydedilemedi, ancak oyun tamamlandı.'
          })
        }
        
      } catch (err) {
        console.error('Game completion error:', err)
        setError({
          type: 'gameplay',
          message: 'Oyun tamamlanırken bir hata oluştu.'
        })
      }
    }
  }, [cards, gameCompleted, moves, incorrectMoves, duration, startTime, firstMatchTime, cardFlips, level, playSound])

  return {
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // Game states
    cards,
    gameStarted,
    gameCompleted,
    isPaused,
    duration,
    moves,
    incorrectMoves,
    pairsFound: cards.filter(card => card.isMatched).length / 2,
    totalPairs: cards.length / 2,
    flippedCards: flippedCards.length,
    showingPreview,
    levelCompleted,
    nextLevelUnlocked,
    currentLevel: level,
    
    // Actions
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    flipCard
  }
}
