
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useMemoryGame } from '../hooks/useMemoryGame'
import { LocalStorageManager, MEMORY_GAME_LEVELS, MemoryGameLevel } from '../utils/localStorage'
import { ArrowLeft, RotateCcw, Play, ChevronDown, Trophy, ArrowRight } from 'lucide-react'

interface HafizaOyunuSayfasiProps {
  onBack: () => void
}

const HafizaOyunuSayfasi: React.FC<HafizaOyunuSayfasiProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState<MemoryGameLevel>(MEMORY_GAME_LEVELS[0])
  
  useEffect(() => {
    const levelIndex = LocalStorageManager.getCurrentMemoryGameLevel() - 1
    const level = MEMORY_GAME_LEVELS[levelIndex] || MEMORY_GAME_LEVELS[0]
    setCurrentLevel(level)
  }, [])
  
  const {
    cards,
    gameStarted,
    gameCompleted,
    duration,
    moves,
    incorrectMoves,
    pairsFound,
    totalPairs,
    initializeGame,
    startGame,
    flipCard,
    flippedCards,
    showingPreview,
    levelCompleted,
    nextLevelUnlocked
  } = useMemoryGame({ level: currentLevel })

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCardClick = (cardId: string) => {
    if (!gameStarted && !showingPreview) {
      startGame()
    }
    flipCard(cardId)
  }

  const handleNextLevel = () => {
    const nextLevelIndex = currentLevel.id // currentLevel.id 1-based, array 0-based
    if (nextLevelIndex < MEMORY_GAME_LEVELS.length) {
      const nextLevel = MEMORY_GAME_LEVELS[nextLevelIndex]
      setCurrentLevel(nextLevel)
    }
  }

  const getCardDisplayContent = (card: any) => {
    if (showingPreview || card.isFlipped || card.isMatched) {
      return card.emoji
    }
    return '?'
  }

  const getCardStyle = (card: any) => {
    if (card.isMatched) {
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
    }
    if (showingPreview || card.isFlipped) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
    }
    return 'bg-muted hover:bg-muted/80 border-border hover:border-primary/50 active:scale-95'
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              Hafıza Oyunu
            </h1>
            <p className="text-muted-foreground">
              {currentLevel.name} - {currentLevel.description}
            </p>
          </div>
          <Button variant="outline" onClick={initializeGame} className="ml-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Yeniden Başla
          </Button>
        </div>
      </div>

      {/* Preview Timer */}
      {showingPreview && (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl mb-2">👀</div>
            <p className="text-yellow-800 dark:text-yellow-200">
              Kartları inceleyip konumlarını hatırlamaya çalışın...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Game Instructions - Collapsible */}
      {!gameStarted && !showingPreview && (
        <Collapsible className="mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between mb-4">
              <span className="flex items-center gap-2">
                🎯 Nasıl Oynanır?
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <ul className="space-y-2 text-sm">
                  <li>• Önce kartları inceleme süreniz var, konumlarını hatırlayın</li>
                  <li>• Kartları tıklayarak çevirin ve aynı emojileri eşleştirin</li>
                  <li>• Tüm çiftleri bularak seviyeyi tamamlayın</li>
                  <li>• En az hamle ve sürede bitirmeye çalışın</li>
                  <li>• Her seviyeyi tamamladığınızda bir sonrakine geçersiniz</li>
                </ul>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Game Board */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div 
            className="grid gap-3 max-w-lg mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${currentLevel.gridSize.cols}, 1fr)`,
              gridTemplateRows: `repeat(${currentLevel.gridSize.rows}, 1fr)`
            }}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={showingPreview || card.isFlipped || card.isMatched || flippedCards >= 2}
                className={`
                  aspect-square rounded-lg text-3xl font-bold transition-all duration-300 border-2
                  ${getCardStyle(card)}
                  ${(showingPreview || card.isFlipped || card.isMatched || flippedCards >= 2) ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {getCardDisplayContent(card)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Start Button */}
      {!gameStarted && !showingPreview && (
        <div className="text-center mb-6">
          <Button onClick={startGame} size="lg" className="px-8">
            <Play className="mr-2 h-5 w-5" />
            Oyunu Başlat
          </Button>
        </div>
      )}

      {/* Game Completed - Show Statistics */}
      {gameCompleted && (
        <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
              {nextLevelUnlocked ? <Trophy className="h-5 w-5" /> : '🎉'} 
              {nextLevelUnlocked ? 'Seviye Tamamlandı!' : 'Tebrikler!'}
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              {nextLevelUnlocked 
                ? `${currentLevel.name} başarıyla tamamlandı! Yeni seviye açıldı.`
                : 'Hafıza oyununu başarıyla tamamladınız!'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="font-medium">Süre:</span> {formatTime(duration)}
              </div>
              <div>
                <span className="font-medium">Hamle:</span> {moves}
              </div>
              <div>
                <span className="font-medium">Doğru Çift:</span> {pairsFound}
              </div>
              <div>
                <span className="font-medium">Hata:</span> {incorrectMoves}
              </div>
            </div>
            
            {nextLevelUnlocked && currentLevel.id < MEMORY_GAME_LEVELS.length && (
              <div className="flex gap-2">
                <Button onClick={handleNextLevel} className="flex-1">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Sonraki Seviye
                </Button>
                <Button variant="outline" onClick={initializeGame}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Tekrar Oyna
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default HafizaOyunuSayfasi
