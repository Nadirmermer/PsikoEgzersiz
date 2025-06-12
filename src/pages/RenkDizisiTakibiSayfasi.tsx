
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Play, RotateCcw, Palette, Clock, Target, Eye } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { toast } from '@/components/ui/sonner'

interface RenkDizisiTakibiProps {
  onBack: () => void
}

interface GameState {
  phase: 'ready' | 'showing' | 'input' | 'feedback' | 'completed'
  currentLevel: number
  sequence: number[]
  userInput: number[]
  showingIndex: number
  score: number
  correctCount: number
  incorrectCount: number
  startTime: number
  currentTime: number
}

const colors = [
  { id: 0, name: 'Kırmızı', bg: 'bg-red-500', hover: 'hover:bg-red-600', active: 'bg-red-600' },
  { id: 1, name: 'Yeşil', bg: 'bg-green-500', hover: 'hover:bg-green-600', active: 'bg-green-600' },
  { id: 2, name: 'Mavi', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', active: 'bg-blue-600' },
  { id: 3, name: 'Sarı', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', active: 'bg-yellow-600' }
]

const RenkDizisiTakibiSayfasi: React.FC<RenkDizisiTakibiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    currentLevel: 1,
    sequence: [],
    userInput: [],
    showingIndex: 0,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    startTime: 0,
    currentTime: 0
  })

  const [isGameActive, setIsGameActive] = useState(false)
  const [highlightedColor, setHighlightedColor] = useState<number | null>(null)

  // Zamanlayıcı
  useEffect(() => {
    if (!isGameActive) return

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        currentTime: Date.now() - prev.startTime
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isGameActive])

  const generateSequence = useCallback((length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 4))
  }, [])

  const startGame = useCallback(() => {
    const newSequence = generateSequence(1 + gameState.currentLevel)
    setGameState(prev => ({
      ...prev,
      phase: 'showing',
      sequence: newSequence,
      userInput: [],
      showingIndex: 0,
      startTime: prev.startTime || Date.now()
    }))
    setIsGameActive(true)
  }, [gameState.currentLevel, generateSequence])

  const resetGame = useCallback(() => {
    setGameState({
      phase: 'ready',
      currentLevel: 1,
      sequence: [],
      userInput: [],
      showingIndex: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      startTime: 0,
      currentTime: 0
    })
    setIsGameActive(false)
    setHighlightedColor(null)
  }, [])

  // Dizi gösterimi
  useEffect(() => {
    if (gameState.phase !== 'showing') return

    const showColor = () => {
      setHighlightedColor(gameState.sequence[gameState.showingIndex])
    }

    const hideColor = () => {
      setHighlightedColor(null)
      
      if (gameState.showingIndex < gameState.sequence.length - 1) {
        setGameState(prev => ({
          ...prev,
          showingIndex: prev.showingIndex + 1
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          phase: 'input',
          showingIndex: 0
        }))
      }
    }

    const showTimer = setTimeout(showColor, 500)
    const hideTimer = setTimeout(hideColor, 1250)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [gameState.phase, gameState.showingIndex, gameState.sequence])

  const handleColorInput = useCallback((colorId: number) => {
    if (gameState.phase !== 'input') return

    const newUserInput = [...gameState.userInput, colorId]
    const isCorrect = newUserInput[newUserInput.length - 1] === gameState.sequence[newUserInput.length - 1]

    if (!isCorrect) {
      // Hatalı giriş
      setGameState(prev => ({
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
        incorrectCount: prev.incorrectCount + 1
      }))
      
      toast.error('Yanlış! Aynı seviyeyi tekrar deneyin.')
      
      setTimeout(() => {
        const newSequence = generateSequence(1 + gameState.currentLevel)
        setGameState(prev => ({
          ...prev,
          phase: 'showing',
          sequence: newSequence,
          userInput: [],
          showingIndex: 0
        }))
        setHighlightedColor(null)
      }, 2000)
      return
    }

    if (newUserInput.length === gameState.sequence.length) {
      // Seviye tamamlandı
      const newScore = gameState.score + (gameState.currentLevel * 10)
      setGameState(prev => ({
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
        score: newScore,
        correctCount: prev.correctCount + 1,
        currentLevel: prev.currentLevel + 1
      }))

      toast.success(`Harika! Seviye ${gameState.currentLevel} tamamlandı!`)

      setTimeout(() => {
        const newSequence = generateSequence(2 + gameState.currentLevel)
        setGameState(prev => ({
          ...prev,
          phase: 'showing',
          sequence: newSequence,
          userInput: [],
          showingIndex: 0
        }))
        setHighlightedColor(null)
      }, 2000)
    } else {
      setGameState(prev => ({
        ...prev,
        userInput: newUserInput
      }))
    }
  }, [gameState, generateSequence])

  const handleGameEnd = useCallback(() => {
    const duration = Math.floor(gameState.currentTime / 1000)
    const maxLevel = gameState.currentLevel - 1

    const exerciseData = {
      exercise_name: 'Renk Dizisi Takibi',
      max_level_reached: maxLevel,
      total_correct_sequences: gameState.correctCount,
      total_incorrect_sequences: gameState.incorrectCount,
      session_duration_seconds: duration,
      score: gameState.score,
      timestamp: new Date().toISOString()
    }

    LocalStorageManager.saveExerciseResult({
      exerciseName: 'Renk Dizisi Takibi',
      score: gameState.score,
      duration,
      date: new Date().toISOString(),
      details: exerciseData
    })

    toast.success(`Oyun bitti! En yüksek seviye: ${maxLevel}`)
    setIsGameActive(false)
  }, [gameState])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Renk Dizisi Takibi</h1>
            <p className="text-sm text-muted-foreground">Renk dizilerini hatırlayın ve tekrar edin</p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Ana Oyun Kartı */}
        <Card className="card-enhanced mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Seviye {gameState.currentLevel} - Dizi Uzunluğu: {1 + gameState.currentLevel}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Skor: {gameState.score}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Süre: {formatTime(gameState.currentTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    Doğru: {gameState.correctCount}
                  </span>
                </CardDescription>
              </div>
              
              {gameState.phase !== 'ready' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGame}
                  className="ml-4"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Yeniden Başla
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Oyun Alanı */}
            <div className="text-center space-y-6">
              {gameState.phase === 'ready' && (
                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed border-border rounded-lg">
                    <Palette className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Başlamaya Hazır</h3>
                    <p className="text-muted-foreground mb-4">
                      Ekranda yanıp sönen renk dizisini hatırlayın ve aynı sırada tıklayın
                    </p>
                    <Button onClick={startGame} size="lg" className="font-semibold">
                      <Play className="w-5 h-5 mr-2" />
                      Oyunu Başlat
                    </Button>
                  </div>
                </div>
              )}

              {gameState.phase === 'showing' && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Diziyi İzleyin ({gameState.showingIndex + 1}/{gameState.sequence.length})
                  </Badge>
                  <Progress 
                    value={((gameState.showingIndex + 1) / gameState.sequence.length) * 100} 
                    className="w-64 mx-auto"
                  />
                </div>
              )}

              {gameState.phase === 'input' && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Diziyi Tekrarlayın ({gameState.userInput.length}/{gameState.sequence.length})
                  </Badge>
                  
                  {/* Kullanıcı girişi gösterimi */}
                  <div className="flex justify-center gap-2 mb-6">
                    {Array.from({ length: gameState.sequence.length }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center ${
                          index < gameState.userInput.length
                            ? `border-primary ${colors[gameState.userInput[index]].bg}`
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        {index >= gameState.userInput.length && (
                          <span className="text-muted-foreground">?</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gameState.phase === 'feedback' && (
                <div className="space-y-4">
                  <div className="p-6 border rounded-lg">
                    <div className="text-lg font-semibold">
                      {gameState.userInput.every((color, index) => color === gameState.sequence[index])
                        ? '✅ Doğru!' 
                        : '❌ Yanlış!'}
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      <div className="text-sm">
                        <div className="text-muted-foreground mb-2">Doğru dizi:</div>
                        <div className="flex gap-1">
                          {gameState.sequence.map((colorId, index) => (
                            <div 
                              key={index}
                              className={`w-8 h-8 border rounded ${colors[colorId].bg}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Renk Butonları */}
              {(gameState.phase === 'input' || gameState.phase === 'showing') && (
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  {colors.map((color) => (
                    <Button
                      key={color.id}
                      variant="outline"
                      size="lg"
                      onClick={() => handleColorInput(color.id)}
                      disabled={gameState.phase !== 'input'}
                      className={`aspect-square h-24 border-2 transition-all duration-200 ${color.bg} ${
                        highlightedColor === color.id 
                          ? `${color.active} scale-110 ring-4 ring-primary/50` 
                          : `${color.hover} hover:scale-105`
                      } ${gameState.phase !== 'input' ? 'cursor-not-allowed' : ''}`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {color.name}
                      </span>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* İstatistikler */}
            {isGameActive && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-primary">{gameState.currentLevel}</div>
                  <div className="text-xs text-muted-foreground">Mevcut Seviye</div>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-lg font-semibold text-success">{gameState.correctCount}</div>
                  <div className="text-xs text-muted-foreground">Doğru</div>
                </div>
                <div className="text-center p-3 bg-destructive/10 rounded-lg">
                  <div className="text-lg font-semibold text-destructive">{gameState.incorrectCount}</div>
                  <div className="text-xs text-muted-foreground">Yanlış</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Oyun Sonu Butonu */}
        {isGameActive && (
          <div className="text-center">
            <Button variant="destructive" onClick={handleGameEnd}>
              Oyunu Bitir
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RenkDizisiTakibiSayfasi
