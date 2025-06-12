
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Play, RotateCcw, Brain, Clock, Target, Eye } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { toast } from '@/components/ui/sonner'

interface SayiDizisiTakibiProps {
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

const SayiDizisiTakibiSayfasi: React.FC<SayiDizisiTakibiProps> = ({ onBack }) => {
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
    return Array.from({ length }, () => Math.floor(Math.random() * 10))
  }, [])

  const startGame = useCallback(() => {
    const newSequence = generateSequence(2 + gameState.currentLevel)
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
  }, [])

  // Dizi gösterimi
  useEffect(() => {
    if (gameState.phase !== 'showing') return

    const timer = setTimeout(() => {
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
    }, 1000)

    return () => clearTimeout(timer)
  }, [gameState.phase, gameState.showingIndex, gameState.sequence.length])

  const handleNumberInput = useCallback((number: number) => {
    if (gameState.phase !== 'input') return

    const newUserInput = [...gameState.userInput, number]
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
        const newSequence = generateSequence(2 + gameState.currentLevel)
        setGameState(prev => ({
          ...prev,
          phase: 'showing',
          sequence: newSequence,
          userInput: [],
          showingIndex: 0
        }))
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
        const newSequence = generateSequence(3 + gameState.currentLevel)
        setGameState(prev => ({
          ...prev,
          phase: 'showing',
          sequence: newSequence,
          userInput: [],
          showingIndex: 0
        }))
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
      exercise_name: 'Sayı Dizisi Takibi',
      max_level_reached: maxLevel,
      total_correct_sequences: gameState.correctCount,
      total_incorrect_sequences: gameState.incorrectCount,
      session_duration_seconds: duration,
      score: gameState.score,
      timestamp: new Date().toISOString()
    }

    LocalStorageManager.saveExerciseResult({
      exerciseName: 'Sayı Dizisi Takibi',
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

  const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

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
            <h1 className="text-2xl font-bold text-primary">Sayı Dizisi Takibi</h1>
            <p className="text-sm text-muted-foreground">Sayı dizilerini hatırlayın ve tekrar edin</p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Ana Oyun Kartı */}
        <Card className="card-enhanced mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Seviye {gameState.currentLevel} - Dizi Uzunluğu: {2 + gameState.currentLevel}
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
                    <Brain className="w-3 h-3" />
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
                    <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Başlamaya Hazır</h3>
                    <p className="text-muted-foreground mb-4">
                      Ekranda gösterilen sayı dizisini hatırlayın ve aynı sırada tekrar edin
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
                  <div className="p-12 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="text-8xl font-bold text-primary">
                      {gameState.sequence[gameState.showingIndex]}
                    </div>
                  </div>
                  <Progress 
                    value={((gameState.showingIndex + 1) / gameState.sequence.length) * 100} 
                    className="w-64 mx-auto"
                  />
                </div>
              )}

              {gameState.phase === 'input' && (
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Diziyi Girin ({gameState.userInput.length}/{gameState.sequence.length})
                  </Badge>
                  
                  {/* Kullanıcı girişi gösterimi */}
                  <div className="flex justify-center gap-2 mb-6">
                    {Array.from({ length: gameState.sequence.length }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-lg font-semibold ${
                          index < gameState.userInput.length
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        {index < gameState.userInput.length ? gameState.userInput[index] : '?'}
                      </div>
                    ))}
                  </div>

                  {/* Sayı tuş takımı */}
                  <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
                    {keypadNumbers.map((number) => (
                      <Button
                        key={number}
                        variant="outline"
                        size="lg"
                        onClick={() => handleNumberInput(number)}
                        className="aspect-square text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {number}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {gameState.phase === 'feedback' && (
                <div className="space-y-4">
                  <div className="p-6 border rounded-lg">
                    <div className="text-lg font-semibold">
                      {gameState.userInput.join('') === gameState.sequence.join('') 
                        ? '✅ Doğru!' 
                        : '❌ Yanlış!'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Doğru dizi: {gameState.sequence.join(' - ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sizin girdiğiniz: {gameState.userInput.join(' - ')}
                    </div>
                  </div>
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

export default SayiDizisiTakibiSayfasi
