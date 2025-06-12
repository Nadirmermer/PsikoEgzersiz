import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Shuffle, Clock, Target, Eye, Star, Play, RotateCcw, Trophy, Brain, Lightbulb, CheckCircle, Pause, PlayCircle } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { toast } from '@/components/ui/sonner'
import ExerciseHeader from '../components/ExerciseHeader'
import { WORD_CIRCLE_LEVELS, WordCircleLevel, TargetWord } from '../data/wordCircleLevels'

interface KelimeCemberiBulmacasiProps {
  onBack: () => void
}

interface GameState {
  phase: 'ready' | 'playing' | 'completed' | 'paused'
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
  pausedTime: number
}

const KelimeCemberiBulmacasiSayfasi: React.FC<KelimeCemberiBulmacasiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    currentLevel: 1,
    selectedLetters: [],
    currentWord: '',
    foundWords: [],
    bonusWords: [],
    score: 0,
    startTime: 0,
    currentTime: 0,
    isGameActive: false,
    grid: [],
    pausedTime: 0
  })

  const [isDragging, setIsDragging] = useState(false)
  const [currentLevelData, setCurrentLevelData] = useState<WordCircleLevel | null>(null)
  const [animatingLetters, setAnimatingLetters] = useState<Set<number>>(new Set())
  const [wordAnimation, setWordAnimation] = useState<string>('')

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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: Date.now(),
      currentTime: 0,
      isGameActive: true
    }))
    
    const levelData = WORD_CIRCLE_LEVELS.find(level => level.levelNumber === 1)
    if (levelData) {
      setCurrentLevelData(levelData)
      initializeGrid(levelData)
    }
  }, [initializeGrid])

  const resetGame = useCallback(() => {
    setGameState({
      phase: 'ready',
      currentLevel: 1,
      selectedLetters: [],
      currentWord: '',
      foundWords: [],
      bonusWords: [],
      score: 0,
      startTime: 0,
      currentTime: 0,
      isGameActive: false,
      grid: [],
      pausedTime: 0
    })
    setCurrentLevelData(null)
    setIsDragging(false)
    setAnimatingLetters(new Set())
    setWordAnimation('')
  }, [])

  const handlePauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'paused',
      pausedTime: Date.now(),
      isGameActive: false
    }))
    toast.info('Oyun duraklatıldı')
  }, [])

  const handleResumeGame = useCallback(() => {
    const pauseDuration = Date.now() - gameState.pausedTime
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: prev.startTime + pauseDuration,
      isGameActive: true
    }))
    toast.info('Oyun devam ediyor')
  }, [gameState.pausedTime])

  const handleBackWithProgress = useCallback(async () => {
    if (gameState.phase === 'playing' || gameState.phase === 'paused') {
      try {
        const progressData = {
          currentLevel: gameState.currentLevel,
          foundWords: gameState.foundWords,
          bonusWords: gameState.bonusWords,
          score: gameState.score,
          progress: Math.round((gameState.foundWords.length / (currentLevelData?.targetWords.length || 1)) * 100)
        }
        
        await LocalStorageManager.savePartialProgress(
          'Kelime Çemberi Bulmacası',
          progressData,
          Math.floor(gameState.currentTime / 1000)
        )
        toast.success('İlerleme kaydedildi')
      } catch (error) {
        console.error('İlerleme kaydedilirken hata:', error)
        toast.error('İlerleme kaydedilemedi')
      }
    }
    onBack()
  }, [gameState, currentLevelData, onBack])

  const shuffleLetters = useCallback(() => {
    if (!currentLevelData) return
    
    // Karıştırma animasyonu
    setAnimatingLetters(new Set(Array.from({ length: currentLevelData.circleLetters.length }, (_, i) => i)))
    
    setTimeout(() => {
    const shuffled = [...currentLevelData.circleLetters].sort(() => Math.random() - 0.5)
    setCurrentLevelData(prev => prev ? { ...prev, circleLetters: shuffled } : null)
    
    setGameState(prev => ({
      ...prev,
      selectedLetters: [],
      currentWord: ''
    }))
      
      setTimeout(() => {
        setAnimatingLetters(new Set())
      }, 300)
    }, 200)
  }, [currentLevelData])

  const handleLetterSelect = useCallback((index: number) => {
    if (gameState.phase !== 'playing') return
    
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
  }, [gameState.selectedLetters, gameState.phase, currentLevelData, isDragging])

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

      // Kelime bulundu animasyonu
      setWordAnimation(word)
      setTimeout(() => setWordAnimation(''), 2000)

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        foundWords: [...prev.foundWords, word],
        score: prev.score + word.length * 10,
        selectedLetters: [],
        currentWord: ''
      }))

      toast.success(`Harika! "${word}" kelimesini buldunuz! (+${word.length * 10} puan)`)

      // Seviye tamamlanma kontrolü
      if (gameState.foundWords.length + 1 >= currentLevelData.targetWords.length) {
        setTimeout(() => {
          completeLevel()
        }, 1500)
      }
    } else if (currentLevelData.bonusWords?.includes(word) && !gameState.bonusWords.includes(word)) {
      // Bonus kelime
      setWordAnimation(`BONUS: ${word}`)
      setTimeout(() => setWordAnimation(''), 2000)

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
      details: exerciseData,
      completed: true,
      exitedEarly: false
    })

      setGameState(prev => ({
        ...prev,
      phase: 'completed',
      isGameActive: false
    }))

    toast.success('Seviye tamamlandı!')
  }, [gameState, currentLevelData])

  const calculateAngle = (index: number, total: number) => {
    return (index * 360) / total - 90 // -90 to start from top
  }

  // Ready state
  if (gameState.phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime Çemberi Bulmacası"
          onBack={onBack}
          showExitConfirmation={false}
          stats={{
            score: gameState.score,
            progress: '0%'
          }}
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
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">1</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Bulunan</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">0</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Bonus</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">0</div>
                    </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Skor</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">0</div>
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
                    Çemberdeki harflerle kelimeler oluşturun
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
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Harfleri Seçin</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Çemberdeki harflere tıklayarak kelime oluşturun</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Kelime Oluşturun</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Geçerli kelimeler grid'de yerlerine yerleştirilir</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Bonus Kelimeler</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Ekstra kelimeler bularak bonus puan kazanın</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Preview */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-center text-gray-800 dark:text-gray-200">Oyun Önizlemesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  {/* Örnek çember */}
                  <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600"></div>
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                    <Lightbulb className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  {/* Örnek harfler */}
                  {['K', 'E', 'L', 'İ', 'M', 'E'].map((letter, index) => {
                    const angle = calculateAngle(index, 6)
                    const radius = 100
                    const x = Math.cos((angle * Math.PI) / 180) * radius
                    const y = Math.sin((angle * Math.PI) / 180) * radius
                    
                    return (
                      <div
                        key={index}
                        className="absolute w-12 h-12 bg-white dark:bg-gray-800 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 shadow-lg"
                        style={{
                          left: `calc(50% + ${x}px - 24px)`,
                          top: `calc(50% + ${y}px - 24px)`,
                        }}
                      >
                        {letter}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button 
              onClick={startGame}
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

  // Playing state
  if (gameState.phase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime Çemberi Bulmacası"
          onBack={handleBackWithProgress}
          showExitConfirmation={true}
          onPause={handlePauseGame}
          onRestart={resetGame}
          isPaused={false}
          isPlaying={true}
          stats={{
            time: formatTime(gameState.currentTime),
            level: gameState.currentLevel,
            score: gameState.score,
            progress: `${Math.round((gameState.foundWords.length / (currentLevelData?.targetWords.length || 1)) * 100)}%`
          }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Bulunan</div>
              <div className="text-xl font-bold text-green-600">{gameState.foundWords.length}/{currentLevelData?.targetWords.length || 0}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Bonus</div>
              <div className="text-xl font-bold text-purple-600">{gameState.bonusWords.length}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Skor</div>
              <div className="text-xl font-bold text-orange-600">{gameState.score}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Süre</div>
              <div className="text-xl font-bold text-blue-600">{formatTime(gameState.currentTime)}</div>
            </div>
          </div>

          {/* Word Animation */}
          {wordAnimation && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
                <div className="text-2xl font-bold">{wordAnimation}</div>
              </div>
            </div>
          )}

          {/* Current Word Display */}
          {gameState.currentWord && (
            <div className="text-center mb-6">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-3 inline-block border border-white/20 dark:border-gray-700/20">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Mevcut Kelime</div>
                <div className="text-2xl font-bold text-primary tracking-wider">{gameState.currentWord}</div>
                </div>
              </div>
            )}

          {/* Game Area */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Letter Circle */}
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-800 dark:text-gray-200">Harf Çemberi</CardTitle>
                <Button
                  onClick={shuffleLetters}
                  variant="outline"
                  size="sm"
                  className="mx-auto bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Karıştır
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative w-80 h-80">
                    {/* Center circle */}
                    <div className="absolute inset-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border-4 border-white/40 dark:border-gray-700/40 flex items-center justify-center shadow-lg">
            <div className="text-center">
                        <Lightbulb className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <div className="text-sm text-gray-500 dark:text-gray-400">Kelime<br/>Oluştur</div>
                      </div>
                    </div>
                    
                    {/* Letter buttons */}
                    {currentLevelData?.circleLetters.map((letter, index) => {
                  const angle = calculateAngle(index, currentLevelData.circleLetters.length)
                      const radius = 120
                      const x = Math.cos((angle * Math.PI) / 180) * radius
                      const y = Math.sin((angle * Math.PI) / 180) * radius
                  const isSelected = gameState.selectedLetters.includes(index)
                      const isAnimating = animatingLetters.has(index)
                  
                  return (
                    <button
                      key={index}
                      className={`
                            absolute w-16 h-16 rounded-full border-3 font-bold text-lg transition-all duration-300 shadow-lg
                        ${isSelected 
                              ? 'bg-gradient-to-br from-primary to-purple-600 text-white border-primary scale-110 shadow-xl' 
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                        }
                            ${isAnimating ? 'animate-spin' : ''}
                      `}
                      style={{
                            left: `calc(50% + ${x}px - 32px)`,
                            top: `calc(50% + ${y}px - 32px)`,
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Word Grid */}
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-gray-800 dark:text-gray-200">Kelime Tablosu</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Bulunan kelimeler burada görünür
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${currentLevelData?.gridDimensions.cols || 5}, 1fr)` }}>
                  {gameState.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          w-8 h-8 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-bold rounded transition-all duration-300
                          ${cell 
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 animate-pulse' 
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                          }
                        `}
                      >
                        {cell || ''}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Found Words */}
          {(gameState.foundWords.length > 0 || gameState.bonusWords.length > 0) && (
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl mt-6">
              <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">Bulunan Kelimeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Ana Kelimeler</h4>
                    <div className="flex flex-wrap gap-2">
                      {gameState.foundWords.map((word, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Bonus Kelimeler</h4>
                    <div className="flex flex-wrap gap-2">
                      {gameState.bonusWords.map((word, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (gameState.phase === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime Çemberi Bulmacası"
          onBack={handleBackWithProgress}
          showExitConfirmation={true}
          onPause={handleResumeGame}
          onRestart={resetGame}
          isPaused={true}
          isPlaying={false}
          stats={{
            time: formatTime(gameState.currentTime),
            level: gameState.currentLevel,
            score: gameState.score,
            progress: `${Math.round((gameState.foundWords.length / (currentLevelData?.targetWords.length || 1)) * 100)}%`
          }}
        />

        {/* Pause Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oyun Duraklatıldı</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Devam etmek için butona tıklayın</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleResumeGame} className="bg-gradient-to-r from-green-500 to-emerald-600">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Devam Et
                </Button>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Yeniden Başla
                </Button>
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
        title="Kelime Çemberi Bulmacası"
        onBack={onBack}
        showExitConfirmation={false}
        stats={{
          time: formatTime(gameState.currentTime),
          score: gameState.score,
          progress: '100%'
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
              Kelime Çemberi Bulmacası seviyesini tamamladınız
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Bulunan Kelimeler</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gameState.foundWords.length}</p>
              </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Bonus Kelimeler</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gameState.bonusWords.length}</p>
              </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Toplam Skor</h3>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{gameState.score}</p>
              </div>
            </div>

            {/* Time */}
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 dark:border-gray-700/20">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tamamlama Süresi</h3>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(gameState.currentTime)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={resetGame}
                variant="outline"
                size="lg"
                className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Oyna
              </Button>
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

export default KelimeCemberiBulmacasiSayfasi
