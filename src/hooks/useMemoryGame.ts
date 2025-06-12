
import { useState, useEffect, useCallback } from 'react'
import { Card, GameStats, generateCards, calculateScore } from '../utils/memoryGameUtils'
import { LocalStorageManager } from '../utils/localStorage'

interface UseMemoryGameProps {
  gridSize: { rows: number; cols: number }
  levelName: string
}

export const useMemoryGame = ({ gridSize, levelName }: UseMemoryGameProps) => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<Card[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [duration, setDuration] = useState(0)
  const [moves, setMoves] = useState(0)
  const [incorrectMoves, setIncorrectMoves] = useState(0)
  const [cardFlips, setCardFlips] = useState(0)
  const [firstMatchTime, setFirstMatchTime] = useState<number | null>(null)

  // Kartları başlat - useCallback ile sarmalayarak bağımlılık sorununu çözüyoruz
  const initializeGame = useCallback(() => {
    const newCards = generateCards(gridSize)
    setCards(newCards)
    setFlippedCards([])
    setGameStarted(false)
    setGameCompleted(false)
    setStartTime(null)
    setDuration(0)
    setMoves(0)
    setIncorrectMoves(0)
    setCardFlips(0)
    setFirstMatchTime(null)
  }, [gridSize.rows, gridSize.cols]) // Sadece grid boyutu değiştiğinde yeniden oluştur

  // Oyunu başlat
  const startGame = useCallback(() => {
    setGameStarted(true)
    setStartTime(Date.now())
  }, [])

  // Kart tıklama
  const flipCard = useCallback((cardId: string) => {
    if (!gameStarted || gameCompleted) return
    
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
  }, [gameStarted, gameCompleted])

  // Süre sayacı - bağımlılıkları optimize ettik
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (gameStarted && !gameCompleted && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameStarted, gameCompleted, startTime])

  // Eşleşme kontrolü - flippedCards.length kontrolü eklendi
  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(prev => prev + 1)
      
      const [card1, card2] = flippedCards
      
      if (card1.emoji === card2.emoji) {
        // Eşleşme bulundu
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
  }, [flippedCards.length, firstMatchTime, startTime]) // Sadece gerekli bağımlılıklar

  // Oyun tamamlanma kontrolü - cards.length kontrolü eklendi ve bağımlılıklar optimize edildi
  useEffect(() => {
    if (cards.length === 0) return // Kartlar henüz yüklenmemişse çıkış yap
    
    const matchedCards = cards.filter(card => card.isMatched)
    const totalPairs = cards.length / 2
    
    if (matchedCards.length === cards.length && !gameCompleted) {
      setGameCompleted(true)
      
      // İstatistikleri kaydet
      const finalDuration = startTime ? Math.floor((Date.now() - startTime) / 1000) : duration
      
      const stats: Omit<GameStats, 'score' | 'timestamp' | 'exercise_name'> = {
        level_identifier: levelName,
        grid_size: `${gridSize.rows}x${gridSize.cols}`,
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
      
      // Local storage'a kaydet
      LocalStorageManager.saveExerciseResult({
        exerciseName: finalStats.exercise_name,
        score: finalStats.score,
        duration: finalStats.duration_seconds,
        date: finalStats.timestamp,
        details: finalStats
      })
    }
  }, [cards, gameCompleted, moves, incorrectMoves, duration, startTime, firstMatchTime, cardFlips, levelName, gridSize.rows, gridSize.cols])

  return {
    cards,
    gameStarted,
    gameCompleted,
    duration,
    moves,
    incorrectMoves,
    pairsFound: cards.filter(card => card.isMatched).length / 2,
    totalPairs: cards.length / 2,
    initializeGame,
    startGame,
    flipCard,
    flippedCards: flippedCards.length
  }
}
