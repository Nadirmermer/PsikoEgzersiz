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
import { useOrientation, getOptimalGridForDevice } from '@/hooks/useOrientation'
import { LocalStorageManager, MEMORY_GAME_LEVELS, MemoryGameLevel } from '@/utils/localStorage'
import { Card as MemoryCard } from '@/utils/memoryGameUtils'
import { GameResult } from '@/components/GameEngine/types'
import { toast } from '@/components/ui/sonner'
import { touchTargetClasses, cn, gameTimings, uiStyles } from '@/lib/utils'

interface HafizaOyunuSayfasiProps {
  onBack: () => void
}

const HafizaOyunuSayfasi: React.FC<HafizaOyunuSayfasiProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState<MemoryGameLevel>(MEMORY_GAME_LEVELS[0])
  const [autoProgressionHandled, setAutoProgressionHandled] = useState(false)
  const { playSound } = useAudio()
  
  // 🚀 YENİ: Orientation-aware layout
  const orientationState = useOrientation()
  const optimalGrid = getOptimalGridForDevice(currentLevel.gridSize, orientationState)

  // Universal game hook'u kullan
  const universalGame = useUniversalGame({
    exerciseName: 'Hafıza Oyunu',
    onComplete: (result: GameResult) => {
      console.log('Memory game completed:', result)
    }
  })

  // Memory game specific logic'i kullan - optimal grid ile
  const memoryGame = useMemoryGame({ 
    level: { 
      ...currentLevel, 
      gridSize: optimalGrid // 🚀 Orientation-aware grid kullan
    } 
  })

  // Level'ı localStorage'dan al ve memory game'i initialize et
  useEffect(() => {
    const levelIndex = LocalStorageManager.getCurrentMemoryGameLevel() - 1
    const level = MEMORY_GAME_LEVELS[levelIndex] || MEMORY_GAME_LEVELS[0]
    setCurrentLevel(level)
  }, [])
  
  // Memory game'i initialize et - orientation değişikliklerinde de
  useEffect(() => {
    memoryGame.initializeGame()
    setAutoProgressionHandled(false)
  }, [currentLevel, optimalGrid.rows, optimalGrid.cols])

  // Memory game ile universal game'i senkronize et
  useEffect(() => {
    if (memoryGame.gameStarted && !universalGame.gameState.isPlaying) {
      // Memory game başladığında universal game'i de başlat
      universalGame.gameActions.onStart()
    }
  }, [memoryGame.gameStarted])

  // 🔧 FIX: Manual level progression handler
  const handleNextLevel = () => {
    if (autoProgressionHandled) return
    setAutoProgressionHandled(true)
    
    const nextLevelIndex = LocalStorageManager.getCurrentMemoryGameLevel() - 1
    const nextLevel = MEMORY_GAME_LEVELS[nextLevelIndex]
    
    if (nextLevel && nextLevelIndex < MEMORY_GAME_LEVELS.length) {
      // Seviye geçiş sesi ve mesajı
      playSound('level-up')
      toast.success(`🎉 Seviye ${nextLevel.id}: ${nextLevel.name}`)
      
      setCurrentLevel(nextLevel)
      universalGame.gameActions.onRestart()
    } else {
      // Tüm seviyeler tamamlandı
      toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
    }
  }

  useEffect(() => {
    if (memoryGame.gameCompleted && !universalGame.gameState.isCompleted && !autoProgressionHandled) {
      // Memory game tamamlandığında universal game'i de tamamla
      const result: GameResult = {
        exerciseName: 'Hafıza Oyunu',
        score: memoryGame.moves > 0 ? Math.round(((memoryGame.moves - memoryGame.incorrectMoves) / memoryGame.moves) * 100) : 0,
        duration: memoryGame.duration,
        completed: true,
        accuracy: memoryGame.moves > 0 ? ((memoryGame.moves - memoryGame.incorrectMoves) / memoryGame.moves) * 100 : 0,
        level: currentLevel.id,
        details: {
          level_identifier: `${currentLevel.name} (${optimalGrid.rows}x${optimalGrid.cols})`, // Optimal grid kullan
          grid_size: `${optimalGrid.rows}x${optimalGrid.cols}`, // Optimal grid kullan
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
      
      // 🔧 FIX: Removed automatic progression - now handled by UniversalGameEngine buttons
      // Level progression will be handled by "Next Level" button in UniversalGameEngine
    }
  }, [memoryGame.gameCompleted, autoProgressionHandled, optimalGrid])

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
        setAutoProgressionHandled(false)
      },
      onNextLevel: handleNextLevel
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

  // Memory card display helpers for UI
  const getCardDisplayContent = (card: MemoryCard) => {
    if (memoryGame.showingPreview || card.isFlipped || card.isMatched) {
      return card.emoji
    }
    return '?'
  }

  const getCardStyle = (card: MemoryCard) => {
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
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.error}`}>
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
        <Card className={`mb-4 sm:mb-6 ${uiStyles.statusCard.loading}`}>
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

      {/* Oyun İçeriği - Tam responsive, scroll gerektirmeyen */}
      {!memoryGame.error && !memoryGame.isLoading && memoryGame.cards.length > 0 && (
        <div className={`w-full h-full flex items-center justify-center ${
          // 🚀 MOBILE-OPTIMIZED PADDING - Köşe boşluklarını azalt
          (() => {
            const { isMobile, isTablet, isDesktop } = orientationState
            
            if (isMobile) {
              return 'p-1 sm:p-2' // Mobile: Çok az padding
            } else if (isTablet) {
              return 'p-3 md:p-4' // Tablet: Orta padding
            } else {
              return 'p-4 lg:p-6' // Desktop: Normal padding
            }
          })()
        }`}>
          {/* Oyun Tahtası - Merkezi, responsive, tam ekran optimized */}
          <Card className={`${uiStyles.gameCard.primary} w-full max-w-fit shadow-xl`}>
            <CardContent className={`flex items-center justify-center ${
              // 🚀 MOBILE-OPTIMIZED CARD PADDING - İç boşlukları azalt
              (() => {
                const { isMobile, isTablet, isDesktop } = orientationState
                
                if (isMobile) {
                  return 'p-2' // Mobile: Minimal card padding
                } else if (isTablet) {
                  return 'p-4' // Tablet: Normal card padding
                } else {
                  return 'p-6' // Desktop: Generous card padding
                }
              })()
            }`}>
              <div 
                className={`grid w-full mx-auto ${
                  // 🚀 YENİ: Tablet-friendly responsive grid - SCROLL YOK
                  (() => {
                    const totalCards = optimalGrid.rows * optimalGrid.cols
                    const { isMobile, isTablet, isDesktop, orientation } = orientationState
                    
                    // 🎯 TABLET-FIRST SYSTEM - Yaşlılar ve çocuklar için optimize
                    
                    // Tablet - optimal experience (Ana hedef)
                    if (isTablet) {
                      if (totalCards <= 8) {
                        return 'gap-4 md:gap-6 lg:gap-8 max-w-[340px] md:max-w-[420px] lg:max-w-[500px]' // Büyük kartlar
                      } else if (totalCards <= 16) {
                        return 'gap-3 md:gap-4 lg:gap-6 max-w-[380px] md:max-w-[460px] lg:max-w-[560px]' // Orta kartlar
                      } else if (totalCards <= 24) {
                        return 'gap-2 md:gap-3 lg:gap-4 max-w-[420px] md:max-w-[520px] lg:max-w-[640px]' // Küçük kartlar
                      } else {
                        return 'gap-1.5 md:gap-2 lg:gap-3 max-w-[460px] md:max-w-[580px] lg:max-w-[720px]' // Mini kartlar
                      }
                    }
                    
                    // Desktop - secondary optimization
                    if (isDesktop) {
                      if (totalCards <= 8) {
                        return 'gap-6 lg:gap-8 xl:gap-10 max-w-[420px] lg:max-w-[520px] xl:max-w-[620px]' // Ekstra büyük
                      } else if (totalCards <= 16) {
                        return 'gap-4 lg:gap-6 xl:gap-8 max-w-[480px] lg:max-w-[600px] xl:max-w-[720px]' // Büyük
                      } else if (totalCards <= 24) {
                        return 'gap-3 lg:gap-4 xl:gap-6 max-w-[540px] lg:max-w-[680px] xl:max-w-[820px]' // Orta
                      } else {
                        return 'gap-2 lg:gap-3 xl:gap-4 max-w-[600px] lg:max-w-[760px] xl:max-w-[920px]' // Küçük
                      }
                    }
                    
                    // Mobile - fallback optimization  
                    if (isMobile && orientation === 'portrait') {
                      if (totalCards <= 8) {
                        return 'gap-2 sm:gap-3 max-w-[95vw] sm:max-w-[90vw]' // Mobile: Ekran genişliğini kullan
                      } else if (totalCards <= 16) {
                        return 'gap-1.5 sm:gap-2 max-w-[95vw] sm:max-w-[90vw]' // Mobile: Daha kompakt
                      } else {
                        return 'gap-1 sm:gap-1.5 max-w-[95vw] sm:max-w-[90vw]' // Mobile: En kompakt
                      }
                    }
                    
                    // Mobile landscape - köşeleri maksimum kullan
                    if (isMobile && orientation === 'landscape') {
                      return 'gap-1 sm:gap-1.5 max-w-[95vw] sm:max-w-[90vw]'
                    }
                    
                    // Fallback
                    return 'gap-3 md:gap-4 lg:gap-5 max-w-[360px] md:max-w-[420px] lg:max-w-[480px]'
                  })()
                }`}
                style={{ 
                  gridTemplateColumns: `repeat(${optimalGrid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${optimalGrid.rows}, 1fr)`
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
                      "rounded-md sm:rounded-lg md:rounded-xl font-bold transition-all duration-300 border-2 shadow-lg hover:shadow-xl",
                      "min-h-0 min-w-0", // 🔧 FIX: Minimum boyut sıfırla
                      "flex items-center justify-center", // 🔧 FIX: Content merkezle 
                      "shrink-0", // 🔧 FIX: Flexbox shrinking önle
                      touchTargetClasses.gameCard,
                      // 🚀 YENİ: Tablet-friendly büyük emoji sistem - SABİT BOYUT
                      (() => {
                        const totalCards = optimalGrid.rows * optimalGrid.cols
                        const { isMobile, isTablet, isDesktop, orientation } = orientationState
                        
                        // 🎯 TABLET - Ana hedef platform (Yaşlılar ve çocuklar)
                        if (isTablet) {
                          if (totalCards <= 8) {
                            return 'text-6xl md:text-7xl lg:text-8xl w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28' // Ekstra büyük emojiler + sabit boyut
                          } else if (totalCards <= 16) {
                            return 'text-5xl md:text-6xl lg:text-7xl w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24' // Büyük emojiler + sabit boyut
                          } else if (totalCards <= 24) {
                            return 'text-4xl md:text-5xl lg:text-6xl w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20' // Orta büyüklük emojiler + sabit boyut
                          } else {
                            return 'text-3xl md:text-4xl lg:text-5xl w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16' // Küçük ama okunabilir emojiler + sabit boyut
                          }
                        }
                        
                        // 🖥️ DESKTOP - İkincil platform
                        if (isDesktop) {
                          if (totalCards <= 8) {
                            return 'text-7xl lg:text-8xl xl:text-9xl w-24 h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32' // Çok büyük emojiler + sabit boyut
                          } else if (totalCards <= 16) {
                            return 'text-6xl lg:text-7xl xl:text-8xl w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28' // Büyük emojiler + sabit boyut
                          } else if (totalCards <= 24) {
                            return 'text-5xl lg:text-6xl xl:text-7xl w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24' // Orta emojiler + sabit boyut
                          } else {
                            return 'text-4xl lg:text-5xl xl:text-6xl w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24' // Küçük emojiler + sabit boyut
                          }
                        }
                        
                        // 📱 MOBILE - Fallback platform
                        if (isMobile && orientation === 'portrait') {
                          if (totalCards <= 8) {
                            return 'text-4xl sm:text-5xl w-20 h-20 sm:w-24 sm:h-24' // Mobile: Büyük kartlar
                          } else if (totalCards <= 16) {
                            return 'text-3xl sm:text-4xl w-16 h-16 sm:w-20 sm:h-20' // Mobile: Orta kartlar
                          } else {
                            return 'text-2xl sm:text-3xl w-14 h-14 sm:w-16 sm:h-16' // Mobile: Küçük kartlar
                          }
                        }
                        
                        // Mobile landscape - kompakt ama büyük
                        if (isMobile && orientation === 'landscape') {
                          return totalCards <= 16 ? 'text-2xl sm:text-3xl w-14 h-14 sm:w-16 sm:h-16' : 'text-xl sm:text-2xl w-12 h-12 sm:w-14 sm:h-14'
                        }
                        
                        // Fallback
                        return 'text-4xl md:text-5xl lg:text-6xl w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24'
                      })(),
                      getCardStyle(card),
                      (memoryGame.showingPreview || card.isFlipped || card.isMatched || memoryGame.flippedCards >= 2 || universalGame.gameState.isPaused || universalGame.gameState.phase === 'ready') 
                        ? 'cursor-default' 
                        : 'cursor-pointer hover:cursor-pointer'
                    )}
                  >
                    <span className="select-none pointer-events-none">
                      {getCardDisplayContent(card)}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </UniversalGameEngine>
  )
}

export default HafizaOyunuSayfasi