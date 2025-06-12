import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMemoryGame } from '../hooks/useMemoryGame'
import { LocalStorageManager, MEMORY_GAME_LEVELS, MemoryGameLevel } from '../utils/localStorage'
import { ArrowLeft, RotateCcw, Play, Trophy, Star, Clock, Target, Brain, Lightbulb, CheckCircle, Pause, PlayCircle } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import ExerciseHeader from '../components/ExerciseHeader'

interface HafizaOyunuSayfasiProps {
  onBack: () => void
}

const HafizaOyunuSayfasi: React.FC<HafizaOyunuSayfasiProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState<MemoryGameLevel>(MEMORY_GAME_LEVELS[0])
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'paused' | 'completed'>('ready')
  const [isPaused, setIsPaused] = useState(false)
  
  useEffect(() => {
    const levelIndex = LocalStorageManager.getCurrentMemoryGameLevel() - 1
    const level = MEMORY_GAME_LEVELS[levelIndex] || MEMORY_GAME_LEVELS[0]
    setCurrentLevel(level)
  }, [])
  
  const {
    cards,
    gameStarted,
    gameCompleted,
    isPaused: hookIsPaused,
    duration,
    moves,
    incorrectMoves,
    pairsFound,
    totalPairs,
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    flipCard,
    flippedCards,
    showingPreview,
    levelCompleted,
    nextLevelUnlocked
  } = useMemoryGame({ level: currentLevel })

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  useEffect(() => {
    if (gameCompleted) {
      setGamePhase('completed')
    } else if (gameStarted && !showingPreview) {
      setGamePhase('playing')
    }
  }, [gameCompleted, gameStarted, showingPreview])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartGame = useCallback(() => {
    setGamePhase('playing')
    startGame()
  }, [startGame])

  const handlePauseGame = useCallback(() => {
    pauseGame()
    setIsPaused(true)
    setGamePhase('paused')
    toast.info('Oyun duraklatıldı')
  }, [pauseGame])

  const handleResumeGame = useCallback(() => {
    resumeGame()
    setIsPaused(false)
    setGamePhase('playing')
    toast.info('Oyun devam ediyor')
  }, [resumeGame])

  const handleResetGame = useCallback(() => {
    setGamePhase('ready')
    setIsPaused(false)
    initializeGame()
  }, [initializeGame])

  const handleBackWithProgress = useCallback(() => {
    if (gamePhase === 'playing' && !gameCompleted) {
      // Save partial progress
      const currentProgress = {
        level: currentLevel.id,
        moves,
        incorrectMoves,
        pairsFound,
        totalPairs,
        duration
      }
      LocalStorageManager.savePartialProgress('Hafıza Oyunu', currentProgress, duration)
    }
    onBack()
  }, [gamePhase, gameCompleted, currentLevel.id, moves, incorrectMoves, pairsFound, totalPairs, duration, onBack])

  const handleCardClick = (cardId: string) => {
    if (isPaused || gamePhase !== 'playing') return
    
    if (!gameStarted && !showingPreview) {
      handleStartGame()
    }
    flipCard(cardId)
  }

  const handleNextLevel = () => {
    const nextLevelIndex = currentLevel.id
    if (nextLevelIndex < MEMORY_GAME_LEVELS.length) {
      const nextLevel = MEMORY_GAME_LEVELS[nextLevelIndex]
      setCurrentLevel(nextLevel)
      handleResetGame()
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
    return 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-105'
  }

  // Ready state
  if (gamePhase === 'ready') {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Hafıza Oyunu"
          onBack={handleBackWithProgress}
          showExitConfirmation={false}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Seviye</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{currentLevel.id}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Kartlar</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{currentLevel.gridSize.rows * currentLevel.gridSize.cols}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Çiftler</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{(currentLevel.gridSize.rows * currentLevel.gridSize.cols) / 2}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Zorluk</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{currentLevel.name}</div>
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl mb-8">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-800 dark:text-gray-200">Nasıl Oynanır?</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Kartları eşleştirerek hafızanızı test edin
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Kartları İnceleyin</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Oyun başında kartların konumlarını hatırlamaya çalışın</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Çiftleri Bulun</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Kartları tıklayarak aynı emojileri eşleştirin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Seviyeyi Tamamlayın</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tüm çiftleri bularak bir sonraki seviyeye geçin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Preview */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-center text-gray-800 dark:text-gray-200">Oyun Önizlemesi</CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              {currentLevel.name} - {currentLevel.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div 
                  className="grid gap-3 max-w-lg"
                  style={{ 
                    gridTemplateColumns: `repeat(${currentLevel.gridSize.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${currentLevel.gridSize.rows}, 1fr)`
                  }}
                >
                  {Array.from({ length: currentLevel.gridSize.rows * currentLevel.gridSize.cols }).map((_, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-2xl"
                    >
                      ?
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button 
              onClick={handleStartGame}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <Play className="w-6 h-6 mr-3" />
              Oyunu Başlat
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Playing/Paused state
  if (gamePhase === 'playing' || gamePhase === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Hafıza Oyunu"
          onBack={handleBackWithProgress}
          onPause={handlePauseGame}
          onRestart={handleResetGame}
          onResume={handleResumeGame}
          isPaused={gamePhase === 'paused'}
          isPlaying={gamePhase === 'playing'}
          stats={{
            time: formatTime(duration),
            level: currentLevel.id,
            progress: `${pairsFound}/${totalPairs} çift`
          }}
          showExitConfirmation={true}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Çiftler</div>
              <div className="text-xl font-bold text-green-600">{pairsFound}/{totalPairs}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Hamle</div>
              <div className="text-xl font-bold text-blue-600">{moves}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Yanlış</div>
              <div className="text-xl font-bold text-red-600">{incorrectMoves}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Süre</div>
              <div className="text-xl font-bold text-purple-600">{formatTime(duration)}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">İlerleme</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {pairsFound}/{totalPairs} çift
              </span>
            </div>
            <Progress 
              value={(pairsFound / totalPairs) * 100} 
              className="h-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
            />
          </div>

          {/* Pause Overlay */}
          {gamePhase === 'paused' && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl max-w-md mx-4">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oyun Duraklatıldı</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">Header'daki butonları kullanarak devam edebilirsiniz</p>
                </CardContent>
              </Card>
            </div>
          )}

      {/* Preview Timer */}
      {showingPreview && (
            <Card className="mb-6 bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <div className="text-2xl mb-2">👀</div>
            <p className="text-yellow-800 dark:text-yellow-200">
              Kartları inceleyip konumlarını hatırlamaya çalışın...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Game Board */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl mb-6">
            <CardContent className="p-8">
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
                    disabled={showingPreview || card.isFlipped || card.isMatched || flippedCards >= 2 || isPaused}
                className={`
                      aspect-square rounded-lg text-3xl font-bold transition-all duration-300 border-2 shadow-lg
                  ${getCardStyle(card)}
                      ${(showingPreview || card.isFlipped || card.isMatched || flippedCards >= 2 || isPaused) ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {getCardDisplayContent(card)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>


        </div>
      </div>
    )
  }

  // Completed state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <ExerciseHeader
        title="Hafıza Oyunu"
        onBack={onBack}
        showExitConfirmation={false}
        stats={{
          time: formatTime(duration),
          level: currentLevel.id,
          progress: `Tamamlandı`
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Tebrikler!
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              {currentLevel.name} seviyesini tamamladınız
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Çiftler Bulundu</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{pairsFound}/{totalPairs}</p>
              </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Toplam Hamle</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{moves}</p>
              </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatTime(duration)}</p>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 dark:border-gray-700/20">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Başarı Oranı</h3>
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(((moves - incorrectMoves) / moves) * 100)}%
              </div>
              <Progress 
                value={((moves - incorrectMoves) / moves) * 100} 
                className="h-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={handleResetGame}
                variant="outline"
                size="lg"
                className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Oyna
              </Button>
              {nextLevelUnlocked && (
                <Button 
                  onClick={handleNextLevel}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Sonraki Seviye
                </Button>
              )}
              <Button 
                onClick={onBack}
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Menüye Dön
                </Button>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HafizaOyunuSayfasi
