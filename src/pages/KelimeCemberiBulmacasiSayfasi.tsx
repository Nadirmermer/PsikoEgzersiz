
import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Shuffle, Clock, Target, Eye, Star } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { toast } from '@/components/ui/sonner'
import { WORD_CIRCLE_LEVELS, WordCircleLevel, TargetWord } from '../data/wordCircleLevels'

interface KelimeCemberiBulmacasiProps {
  onBack: () => void
}

interface GameState {
  currentLevel: number
  selectedLetters: number[]
  currentWord: string
  foundWords: string[]
  bonusWords: string[]
  score: number
  startTime: number
  currentTime: number
  isGameActive: boolean
  grid: (string | null)[][]
}

const KelimeCemberiBulmacasiSayfasi: React.FC<KelimeCemberiBulmacasiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    selectedLetters: [],
    currentWord: '',
    foundWords: [],
    bonusWords: [],
    score: 0,
    startTime: 0,
    currentTime: 0,
    isGameActive: false,
    grid: []
  })

  const [isDragging, setIsDragging] = useState(false)
  const [currentLevelData, setCurrentLevelData] = useState<WordCircleLevel | null>(null)

  // Zamanlayıcı
  useEffect(() => {
    if (!gameState.isGameActive) return

    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        currentTime: Date.now() - prev.startTime
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState.isGameActive])

  // Seviye yükleme
  useEffect(() => {
    const levelData = WORD_CIRCLE_LEVELS.find(level => level.levelNumber === gameState.currentLevel)
    if (levelData) {
      setCurrentLevelData(levelData)
      initializeGrid(levelData)
    }
  }, [gameState.currentLevel])

  const initializeGrid = useCallback((levelData: WordCircleLevel) => {
    const { rows, cols } = levelData.gridDimensions
    const newGrid = Array(rows).fill(null).map(() => Array(cols).fill(null))
    
    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      foundWords: [],
      bonusWords: [],
      score: prev.score,
      isGameActive: true,
      startTime: prev.startTime || Date.now()
    }))
  }, [])

  const shuffleLetters = useCallback(() => {
    if (!currentLevelData) return
    
    const shuffled = [...currentLevelData.circleLetters].sort(() => Math.random() - 0.5)
    setCurrentLevelData(prev => prev ? { ...prev, circleLetters: shuffled } : null)
    
    setGameState(prev => ({
      ...prev,
      selectedLetters: [],
      currentWord: ''
    }))
  }, [currentLevelData])

  const handleLetterSelect = useCallback((index: number) => {
    if (!isDragging && gameState.selectedLetters.length === 0) {
      setIsDragging(true)
    }
    
    if (!gameState.selectedLetters.includes(index)) {
      const newSelectedLetters = [...gameState.selectedLetters, index]
      const newWord = newSelectedLetters.map(i => currentLevelData?.circleLetters[i] || '').join('')
      
      setGameState(prev => ({
        ...prev,
        selectedLetters: newSelectedLetters,
        currentWord: newWord
      }))
    }
  }, [gameState.selectedLetters, currentLevelData, isDragging])

  const handleLetterRelease = useCallback(() => {
    if (gameState.currentWord.length > 0) {
      checkWord(gameState.currentWord)
    }
    setIsDragging(false)
  }, [gameState.currentWord])

  const checkWord = useCallback((word: string) => {
    if (!currentLevelData) return

    // Ana kelimeler kontrolü
    const targetWord = currentLevelData.targetWords.find(tw => tw.word === word)
    if (targetWord && !gameState.foundWords.includes(word)) {
      // Kelimeyi grid'e yerleştir
      const newGrid = [...gameState.grid]
      const { startX, startY, direction } = targetWord
      
      for (let i = 0; i < word.length; i++) {
        const row = direction === 'horizontal' ? startY : startY + i
        const col = direction === 'horizontal' ? startX + i : startX
        if (row < newGrid.length && col < newGrid[0].length) {
          newGrid[row][col] = word[i]
        }
      }

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        foundWords: [...prev.foundWords, word],
        score: prev.score + word.length * 10,
        selectedLetters: [],
        currentWord: ''
      }))

      toast.success(`Harika! "${word}" kelimesini buldunuz!`)

      // Seviye tamamlanma kontrolü
      if (gameState.foundWords.length + 1 >= currentLevelData.targetWords.length) {
        setTimeout(() => {
          completeLevel()
        }, 1000)
      }
    } else if (currentLevelData.bonusWords?.includes(word) && !gameState.bonusWords.includes(word)) {
      // Bonus kelime
      setGameState(prev => ({
        ...prev,
        bonusWords: [...prev.bonusWords, word],
        score: prev.score + word.length * 5,
        selectedLetters: [],
        currentWord: ''
      }))

      toast.success(`Bonus kelime! "${word}" (+${word.length * 5} puan)`)
    } else {
      // Geçersiz kelime
      setGameState(prev => ({
        ...prev,
        selectedLetters: [],
        currentWord: ''
      }))

      if (word.length > 1) {
        toast.error('Geçersiz kelime')
      }
    }
  }, [currentLevelData, gameState.foundWords, gameState.bonusWords, gameState.grid])

  const completeLevel = useCallback(() => {
    const duration = Math.floor(gameState.currentTime / 1000)
    
    const exerciseData = {
      exercise_name: 'Kelime Çemberi Bulmacası',
      level_completed: gameState.currentLevel,
      words_found_on_level: gameState.foundWords.length,
      total_words_on_level: currentLevelData?.targetWords.length || 0,
      bonus_words_found_on_level: gameState.bonusWords.length,
      time_seconds_for_level: duration,
      score_for_level: gameState.score,
      timestamp: new Date().toISOString()
    }

    LocalStorageManager.saveExerciseResult({
      exerciseName: 'Kelime Çemberi Bulmacası',
      score: gameState.score,
      duration,
      date: new Date().toISOString(),
      details: exerciseData
    })

    toast.success(`Seviye ${gameState.currentLevel} tamamlandı!`)
    
    // Sonraki seviyeye geç
    if (gameState.currentLevel < WORD_CIRCLE_LEVELS.length) {
      setGameState(prev => ({
        ...prev,
        currentLevel: prev.currentLevel + 1
      }))
    } else {
      toast.success('Tebrikler! Tüm seviyeleri tamamladınız!')
      setGameState(prev => ({ ...prev, isGameActive: false }))
    }
  }, [gameState, currentLevelData])

  const resetGame = useCallback(() => {
    setGameState({
      currentLevel: 1,
      selectedLetters: [],
      currentWord: '',
      foundWords: [],
      bonusWords: [],
      score: 0,
      startTime: 0,
      currentTime: 0,
      isGameActive: false,
      grid: []
    })
  }, [])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const calculateAngle = (index: number, total: number) => {
    return (index * 360) / total - 90 // -90 to start from top
  }

  if (!currentLevelData) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="card-enhanced">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-4">Seviye Yükleniyor...</h3>
            <Button onClick={onBack}>Geri Dön</Button>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-primary">Kelime Çemberi Bulmacası</h1>
            <p className="text-sm text-muted-foreground">Harfleri birleştirerek kelimeleri bulun</p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Ana Oyun Kartı */}
        <Card className="card-enhanced mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  Seviye {gameState.currentLevel}
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
                    <Eye className="w-3 h-3" />
                    {gameState.foundWords.length}/{currentLevelData.targetWords.length} Kelime
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Kelime Grid'i */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Kelime Tablosu</h3>
              <div 
                className="inline-grid gap-1 bg-muted/20 p-4 rounded-lg"
                style={{
                  gridTemplateColumns: `repeat(${currentLevelData.gridDimensions.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${currentLevelData.gridDimensions.rows}, 1fr)`
                }}
              >
                {gameState.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-12 h-12 border-2 rounded-lg flex items-center justify-center font-bold text-lg
                        transition-all duration-300
                        ${cell 
                          ? 'bg-primary text-primary-foreground border-primary scale-105' 
                          : 'bg-background border-border'
                        }
                      `}
                    >
                      {cell && (
                        <span className="animate-scale-in">{cell}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bulunan Kelimeler */}
            {gameState.foundWords.length > 0 && (
              <div className="text-center">
                <h4 className="font-semibold mb-2">Bulunan Kelimeler</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.foundWords.map((word, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bonus Kelimeler */}
            {gameState.bonusWords.length > 0 && (
              <div className="text-center">
                <h4 className="font-semibold mb-2 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Bonus Kelimeler
                </h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {gameState.bonusWords.map((word, index) => (
                    <Badge key={index} className="text-sm bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Seçilen Kelime Önizlemesi */}
            {gameState.currentWord && (
              <div className="text-center">
                <div className="inline-block bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                  <span className="text-lg font-bold text-primary">{gameState.currentWord}</span>
                </div>
              </div>
            )}

            {/* Harf Dairesi */}
            <div className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-border/30"></div>
                
                {currentLevelData.circleLetters.map((letter, index) => {
                  const angle = calculateAngle(index, currentLevelData.circleLetters.length)
                  const radian = (angle * Math.PI) / 180
                  const radius = 100
                  const x = Math.cos(radian) * radius
                  const y = Math.sin(radian) * radius
                  
                  const isSelected = gameState.selectedLetters.includes(index)
                  
                  return (
                    <button
                      key={index}
                      className={`
                        absolute w-12 h-12 rounded-full border-2 font-bold text-lg
                        transition-all duration-200 transform
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground border-primary scale-110 z-10' 
                          : 'bg-background text-foreground border-border hover:scale-105 hover:border-primary/50'
                        }
                      `}
                      style={{
                        left: `calc(50% + ${x}px - 24px)`,
                        top: `calc(50% + ${y}px - 24px)`
                      }}
                      onMouseDown={() => handleLetterSelect(index)}
                      onMouseEnter={() => isDragging && handleLetterSelect(index)}
                      onMouseUp={handleLetterRelease}
                      onTouchStart={() => handleLetterSelect(index)}
                      onTouchEnd={handleLetterRelease}
                    >
                      {letter}
                    </button>
                  )
                })}
                
                {/* Merkez Karıştır Butonu */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={shuffleLetters}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-16 h-16 p-0"
                >
                  <Shuffle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* İlerleme */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>İlerleme</span>
                <span>{gameState.foundWords.length}/{currentLevelData.targetWords.length}</span>
              </div>
              <Progress 
                value={(gameState.foundWords.length / currentLevelData.targetWords.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reset Butonu */}
        <div className="text-center">
          <Button variant="outline" onClick={resetGame}>
            Yeniden Başla
          </Button>
        </div>
      </div>
    </div>
  )
}

export default KelimeCemberiBulmacasiSayfasi
