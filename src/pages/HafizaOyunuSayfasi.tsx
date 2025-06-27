import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'
import UniversalGameEngine from '@/components/GameEngine/UniversalGameEngine'
import { MEMORY_GAME_CONFIG } from '@/components/GameEngine/gameConfigs'
import { useUniversalGame } from '@/hooks/useUniversalGame'
import { useMemoryGame } from '@/hooks/useMemoryGame'
import { useAudio } from '@/hooks/useAudio'
import { LocalStorageManager, MEMORY_GAME_LEVELS, MemoryGameLevel } from '@/utils/localStorage'
import { GameResult } from '@/components/GameEngine/types'
import { toast } from '@/components/ui/sonner'
import { touchTargetClasses, cn, gameTimings } from '@/lib/utils'

interface HafizaOyunuSayfasiProps {
  onBack: () => void
}

const HafizaOyunuSayfasi: React.FC<HafizaOyunuSayfasiProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState<MemoryGameLevel>(MEMORY_GAME_LEVELS[0])
  const { playSound } = useAudio()

  // Universal game hook'u kullan
  const universalGame = useUniversalGame({
    exerciseName: 'Hafıza Oyunu',
    onComplete: (result: GameResult) => {
      console.log('Memory game completed:', result)
    }
  })

  // Memory game specific logic'i kullan
  const memoryGame = useMemoryGame({ level: currentLevel })

  // Level'ı localStorage'dan al ve memory game'i initialize et
  useEffect(() => {
    const levelIndex = LocalStorageManager.getCurrentMemoryGameLevel() - 1
    const level = MEMORY_GAME_LEVELS[levelIndex] || MEMORY_GAME_LEVELS[0]
    setCurrentLevel(level)
  }, [])
  
  // Memory game'i initialize et
  useEffect(() => {
    memoryGame.initializeGame()
  }, [currentLevel])

  // Memory game ile universal game'i senkronize et
  useEffect(() => {
    if (memoryGame.gameStarted && !universalGame.gameState.isPlaying) {
      // Memory game başladığında universal game'i de başlat
      universalGame.gameActions.onStart()
    }
  }, [memoryGame.gameStarted])

  useEffect(() => {
    if (memoryGame.gameCompleted && !universalGame.gameState.isCompleted) {
      // Memory game tamamlandığında universal game'i de tamamla
      const result: GameResult = {
        exerciseName: 'Hafıza Oyunu',
        score: memoryGame.moves > 0 ? Math.round(((memoryGame.moves - memoryGame.incorrectMoves) / memoryGame.moves) * 100) : 0,
        duration: memoryGame.duration,
        completed: true,
        accuracy: memoryGame.moves > 0 ? ((memoryGame.moves - memoryGame.incorrectMoves) / memoryGame.moves) * 100 : 0,
        level: currentLevel.id,
        details: {
          level_identifier: `${currentLevel.name} (${currentLevel.gridSize.rows}x${currentLevel.gridSize.cols})`,
          grid_size: `${currentLevel.gridSize.rows}x${currentLevel.gridSize.cols}`,
          duration_seconds: memoryGame.duration,
          moves_count: memoryGame.moves,
          incorrect_moves_count: memoryGame.incorrectMoves,
          pairs_found: memoryGame.pairsFound,
          total_pairs: memoryGame.totalPairs,
          exercise_name: 'Hafıza Oyunu',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
      universalGame.gameActions.onComplete(result)
      
      // 🔧 FIX: Use unified auto-progression timing for consistency
      setTimeout(() => {
        const nextLevelIndex = LocalStorageManager.getCurrentMemoryGameLevel() - 1
        const nextLevel = MEMORY_GAME_LEVELS[nextLevelIndex]
        if (nextLevel && nextLevelIndex < MEMORY_GAME_LEVELS.length) {
          // Seviye geçiş sesi ve mesajı
          playSound('level-up')
          toast.success(`🎉 Seviye ${nextLevel.id}: ${nextLevel.name}`)
          
          setCurrentLevel(nextLevel)
          memoryGame.initializeGame()
          universalGame.gameActions.onRestart()
        } else {
          // Tüm seviyeler tamamlandı
          toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
        }
      }, gameTimings.memoryGame.autoProgressDelay)
    }
  }, [memoryGame.gameCompleted])

  // Stats'ları güncelle
  useEffect(() => {
    universalGame.updateGameStats({
      score: memoryGame.moves > 0 ? Math.round(((memoryGame.moves - memoryGame.incorrectMoves) / memoryGame.moves) * 100) : 0,
      level: currentLevel.id,
      progress: `${memoryGame.pairsFound}/${memoryGame.totalPairs} çift`,
      accuracy: memoryGame.moves > 0 ? ((memoryGame.moves - memoryGame.incorrectMoves) / memoryGame.moves) * 100 : 0
    })
  }, [memoryGame.moves, memoryGame.incorrectMoves, memoryGame.pairsFound, memoryGame.totalPairs, currentLevel.id])

  // Custom game hook'u oluştur
  const gameHook = () => ({
    ...universalGame,
    gameActions: {
      ...universalGame.gameActions,
      onStart: () => {
        // Memory game'de start özel bir işlem değil, sadece phase değiştir
        universalGame.gameActions.onStart()
      },
      onPause: () => {
        universalGame.gameActions.onPause()
        memoryGame.pauseGame()
      },
      onResume: () => {
        universalGame.gameActions.onResume()
        memoryGame.resumeGame()
      },
      onRestart: () => {
        // Memory game'i yeniden başlat (ready state'e geç)
        memoryGame.initializeGame()
        universalGame.gameActions.onRestart()
      }
    }
  })

  // Kart click handler
  const handleCardClick = (cardId: string) => {
    if (universalGame.gameState.isPaused) return
    
    // 🔧 FIX: Add card flip sound
    playSound('button-click')
    
    // Memory game başlamadıysa ve preview de gösterilmiyorsa başlat
    if (!memoryGame.gameStarted && !memoryGame.showingPreview && universalGame.gameState.isPlaying) {
      memoryGame.startGame()
      // Start'tan sonra bir tick bekle ki state güncellensin
      setTimeout(() => {
        memoryGame.flipCard(cardId)
      }, 10)
      return
    }
    
    // Normal kart tıklama
    memoryGame.flipCard(cardId)
  }

  // Kart görünümü
  const getCardDisplayContent = (card: any) => {
    if (memoryGame.showingPreview || card.isFlipped || card.isMatched) {
      return card.emoji
    }
    return '?'
  }

  const getCardStyle = (card: any) => {
    if (card.isMatched) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
    }
    if (memoryGame.showingPreview || card.isFlipped) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
    }
    return 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105'
  }

  return (
    <UniversalGameEngine
      gameConfig={MEMORY_GAME_CONFIG}
      gameHook={gameHook}
      onBack={onBack}
    >
      {/* Error State */}
      {memoryGame.error && (
        <Card className="mb-4 sm:mb-6 bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              <p className="text-sm sm:text-base text-red-800 dark:text-red-200 font-medium">
                {memoryGame.error.message}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={memoryGame.recoverFromError}
                className="bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {memoryGame.isLoading && (
        <Card className="mb-4 sm:mb-6 bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6 text-center px-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-sm sm:text-base text-blue-800 dark:text-blue-200">
                Oyun hazırlanıyor...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Oyun İçeriği - Her zaman göster */}
      {!memoryGame.error && !memoryGame.isLoading && memoryGame.cards.length > 0 && (
        <>

          {/* Önizleme Uyarısı */}
          {memoryGame.showingPreview && (
            <Card className="mb-4 sm:mb-6 bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 backdrop-blur-sm">
              <CardContent className="pt-4 sm:pt-6 text-center px-4">
                <div className="text-xl sm:text-2xl mb-2">👀</div>
                <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200">
              Kartları inceleyip konumlarını hatırlamaya çalışın...
            </p>
          </CardContent>
        </Card>
      )}

          {/* Oyun Tahtası */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardContent className="p-2 sm:p-4 md:p-6">
              <div 
                className={`grid w-full mx-auto ${
                  // Dinamik boyutlama: kart sayısına göre
                  currentLevel.gridSize.rows * currentLevel.gridSize.cols <= 12 
                    ? 'gap-2 sm:gap-3 max-w-[300px] sm:max-w-md' 
                    : currentLevel.gridSize.rows * currentLevel.gridSize.cols <= 16
                    ? 'gap-1 sm:gap-2 max-w-[280px] sm:max-w-lg'
                    : 'gap-1 max-w-[260px] sm:max-w-md' // 20 kart için daha kompakt
                }`}
            style={{ 
              gridTemplateColumns: `repeat(${currentLevel.gridSize.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${currentLevel.gridSize.rows}, 1fr)`,
                  aspectRatio: `${currentLevel.gridSize.cols} / ${currentLevel.gridSize.rows}`
            }}
          >
                {memoryGame.cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                onTouchStart={(e) => e.preventDefault()} // Prevent double-tap zoom
                    disabled={
                      memoryGame.showingPreview || 
                      card.isFlipped || 
                      card.isMatched || 
                      memoryGame.flippedCards >= 2 || 
                      universalGame.gameState.isPaused ||
                      universalGame.gameState.phase === 'ready'
                    }
                className={cn(
                  "aspect-square rounded-md sm:rounded-lg font-bold transition-all duration-300 border-2 shadow-lg hover:shadow-xl",
                  touchTargetClasses.gameCard,
                  // Text sizing based on grid complexity
                  currentLevel.gridSize.rows * currentLevel.gridSize.cols <= 12
                    ? 'text-lg sm:text-2xl md:text-3xl'
                    : currentLevel.gridSize.rows * currentLevel.gridSize.cols <= 16  
                    ? 'text-base sm:text-xl md:text-2xl'
                    : 'text-sm sm:text-base md:text-lg',
                  getCardStyle(card),
                  (memoryGame.showingPreview || card.isFlipped || card.isMatched || memoryGame.flippedCards >= 2 || universalGame.gameState.isPaused || universalGame.gameState.phase === 'ready') 
                    ? 'cursor-default' 
                    : 'cursor-pointer hover:cursor-pointer'
                )}
              >
                {getCardDisplayContent(card)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </UniversalGameEngine>
  )
}

export default HafizaOyunuSayfasi