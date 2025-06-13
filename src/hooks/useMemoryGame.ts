
import { useState, useEffect, useCallback } from 'react'
import { Card, GameStats, generateCards, calculateScore } from '../utils/memoryGameUtils'
import { LocalStorageManager, MemoryGameLevel, MEMORY_GAME_LEVELS } from '../utils/localStorage'
import { useAudio } from './useAudio'

interface UseMemoryGameProps {
  level: MemoryGameLevel
}

export const useMemoryGame = ({ level }: UseMemoryGameProps) => {
  const { playSound } = useAudio()
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

  // Kartları başlat
  const initializeGame = useCallback(() => {
    const newCards = generateCards(level.gridSize)
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
        playSound('countdown')
      }, level.previewTime - 3000)
    }
    
    setTimeout(() => {
      setShowingPreview(false)
    }, level.previewTime)
  }, [level.gridSize, level.previewTime])

  // Oyunu başlat
  const startGame = useCallback(() => {
    if (!showingPreview) {
      setGameStarted(true)
      setStartTime(Date.now())
    }
  }, [showingPreview])

  // Oyunu duraklat
  const pauseGame = useCallback(() => {
    if (gameStarted && !gameCompleted && !isPaused) {
      setIsPaused(true)
      setPausedTime(Date.now())
    }
  }, [gameStarted, gameCompleted, isPaused])

  // Oyunu devam ettir
  const resumeGame = useCallback(() => {
    if (gameStarted && !gameCompleted && isPaused && startTime) {
      const pauseDuration = Date.now() - pausedTime
      setStartTime(startTime + pauseDuration)
      setIsPaused(false)
      setPausedTime(0)
    }
  }, [gameStarted, gameCompleted, isPaused, startTime, pausedTime])

  // Kart tıklama
  const flipCard = useCallback((cardId: string) => {
    if (!gameStarted || gameCompleted || showingPreview || isPaused) return
    
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
  }, [gameStarted, gameCompleted, showingPreview])

  // Süre sayacı
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (gameStarted && !gameCompleted && !isPaused && startTime) {
      interval = setInterval(() => {
        const newDuration = Math.floor((Date.now() - startTime) / 1000)
        setDuration(newDuration)
        
        // Her 10 saniyede bir timer-tick sesi çal
        if (newDuration > 0 && newDuration % 10 === 0) {
          playSound('timer-tick')
        }
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameStarted, gameCompleted, isPaused, startTime, playSound])

  // Eşleşme kontrolü
  useEffect(() => {
    if (flippedCards.length === 2) {
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
        
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card => {
              if (card.id === card1.id || card.id === card2.id) {
                return { ...card, isFlipped: false }
              }
              return card
            })
          )
          setFlippedCards([])
        }, 1500)
      }
    }
  }, [flippedCards.length, firstMatchTime, startTime, playSound])

  // Oyun tamamlanma kontrolü
  useEffect(() => {
    if (cards.length === 0) return
    
    const matchedCards = cards.filter(card => card.isMatched)
    const totalPairs = cards.length / 2
    
    if (matchedCards.length === cards.length && !gameCompleted) {
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
          playSound('achievement')
        }, 1000)
      }
      
      // Local storage'a kaydet
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
    }
  }, [cards, gameCompleted, moves, incorrectMoves, duration, startTime, firstMatchTime, cardFlips, level, playSound])

  return {
    cards,
    gameStarted,
    gameCompleted,
    isPaused,
    duration,
    moves,
    incorrectMoves,
    pairsFound: cards.filter(card => card.isMatched).length / 2,
    totalPairs: cards.length / 2,
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    flipCard,
    flippedCards: flippedCards.length,
    showingPreview,
    levelCompleted,
    nextLevelUnlocked,
    currentLevel: level
  }
}
