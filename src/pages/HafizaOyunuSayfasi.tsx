
import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMemoryGame } from '../hooks/useMemoryGame'
import { ArrowLeft, RotateCcw, Play } from 'lucide-react'

interface HafizaOyunuSayfasiProps {
  onBack: () => void
}

const HafizaOyunuSayfasi: React.FC<HafizaOyunuSayfasiProps> = ({ onBack }) => {
  const gridSize = { rows: 2, cols: 4 } // 4x2 grid (8 kart, 4 çift)
  const levelName = "Başlangıç Seviyesi"
  
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
    flippedCards
  } = useMemoryGame({ gridSize, levelName })

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCardClick = (cardId: string) => {
    if (!gameStarted) {
      startGame()
    }
    flipCard(cardId)
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hafıza Oyunu
            </h1>
            <p className="text-muted-foreground">
              {levelName} - {gridSize.rows}x{gridSize.cols} Grid
            </p>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">
              {formatTime(duration)}
            </div>
            <div className="text-sm text-muted-foreground">Süre</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">
              {moves}
            </div>
            <div className="text-sm text-muted-foreground">Hamle</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">
              {pairsFound}/{totalPairs}
            </div>
            <div className="text-sm text-muted-foreground">Çiftler</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">
              {incorrectMoves}
            </div>
            <div className="text-sm text-muted-foreground">Hata</div>
          </CardContent>
        </Card>
      </div>

      {/* Game Instructions */}
      {!gameStarted && (
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              🎯 Nasıl Oynanır?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Kartları tıklayarak çevirin ve aynı emojileri eşleştirin</li>
              <li>• Tüm çiftleri bularak oyunu tamamlayın</li>
              <li>• En az hamle ve sürede bitirmeye çalışın</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Game Board */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div 
            className="grid gap-3 max-w-md mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
            }}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || flippedCards >= 2}
                className={`
                  aspect-square rounded-lg text-3xl font-bold transition-all duration-300 border-2
                  ${card.isFlipped || card.isMatched
                    ? card.isMatched 
                      ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                    : 'bg-muted hover:bg-muted/80 border-border hover:border-primary/50 active:scale-95'
                  }
                  ${(card.isFlipped || card.isMatched || flippedCards >= 2) ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '?'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Start Button */}
      {!gameStarted && (
        <div className="text-center mb-6">
          <Button onClick={startGame} size="lg" className="px-8">
            <Play className="mr-2 h-5 w-5" />
            Oyunu Başlat
          </Button>
        </div>
      )}

      {/* Game Completed */}
      {gameCompleted && (
        <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
              🎉 Tebrikler!
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Hafıza oyununu başarıyla tamamladınız!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={initializeGame}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Yeniden Başla
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Egzersizlere Dön
        </Button>
      </div>
    </div>
  )
}

export default HafizaOyunuSayfasi
