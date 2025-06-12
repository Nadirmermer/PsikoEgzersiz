import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Play, RotateCcw, Palette, Clock, Target, Eye, Trophy, Star, Brain, Pause, PlayCircle } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { toast } from '@/components/ui/sonner'
import ExerciseHeader from '../components/ExerciseHeader'

interface RenkDizisiTakibiProps {
  onBack: () => void
}

interface GameState {
  phase: 'ready' | 'showing' | 'input' | 'feedback' | 'completed' | 'paused'
  currentLevel: number
  sequence: number[]
  userInput: number[]
  showingIndex: number
  score: number
  correctCount: number
  incorrectCount: number
  startTime: number
  currentTime: number
  pausedTime: number
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
    currentTime: 0,
    pausedTime: 0
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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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
      currentTime: 0,
      pausedTime: 0
    })
    setIsGameActive(false)
    setHighlightedColor(null)
  }, [])

  const handlePauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'paused',
      pausedTime: Date.now()
    }))
    setIsGameActive(false)
    toast.info('Oyun duraklatıldı')
  }, [])

  const handleResumeGame = useCallback(() => {
    const pauseDuration = Date.now() - gameState.pausedTime
    setGameState(prev => ({
      ...prev,
      phase: 'input',
      startTime: prev.startTime + pauseDuration
    }))
    setIsGameActive(true)
    toast.info('Oyun devam ediyor')
  }, [gameState.pausedTime])

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
      }, 3000)
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
      }, 3000)
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
      details: exerciseData,
      completed: true,
      exitedEarly: false
    })

    toast.success(`Oyun bitti! En yüksek seviye: ${maxLevel}`)
    setIsGameActive(false)
  }, [gameState])

  const handleBackWithProgress = useCallback(() => {
    if (gameState.phase === 'showing' || gameState.phase === 'input') {
      const duration = Math.floor(gameState.currentTime / 1000)
      const currentProgress = {
        currentLevel: gameState.currentLevel,
        sequence: gameState.sequence,
        userInput: gameState.userInput,
        correctCount: gameState.correctCount,
        incorrectCount: gameState.incorrectCount,
        score: gameState.score,
        phase: gameState.phase,
        showingIndex: gameState.showingIndex
      }
      LocalStorageManager.savePartialProgress('Renk Dizisi Takibi', currentProgress, duration)
    }
    onBack()
  }, [gameState, onBack])

  if (gameState.phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Renk Dizisi Takibi"
          onBack={handleBackWithProgress}
          showExitConfirmation={false}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Palette className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Renk Dizisi Takibi
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Gösterilen renk dizisini hatırlayın ve aynı sırayla tekrarlayın. Her seviyede dizi uzunluğu artar.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Başlangıç Seviyesi</h3>
                  <p className="text-2xl font-bold text-primary">1</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Gösterim Süresi</h3>
                  <p className="text-2xl font-bold text-primary">0.75s/renk</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Zorluk</h3>
                  <p className="text-2xl font-bold text-primary">Artan</p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm rounded-xl p-6 border border-blue-200/20 dark:border-blue-800/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Palette className="w-5 h-5 text-primary" />
                  Renkler
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {colors.map((color) => (
                    <div key={color.id} className="text-center">
                      <div className={`w-16 h-16 ${color.bg} rounded-xl mx-auto mb-2 shadow-lg`} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm rounded-xl p-6 border border-green-200/20 dark:border-green-800/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Brain className="w-5 h-5 text-primary" />
                  Nasıl Oynanır?
                </h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">1</span>
                    <span>Ekranda renkler sırayla yanıp sönecek</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">2</span>
                    <span>Renkleri hatırlayın ve aynı sırayla tıklayın</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">3</span>
                    <span>Her seviyede dizi uzunluğu artar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">4</span>
                    <span>Hata yaparsanız aynı seviyeyi tekrar denersiniz</span>
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <div className="text-center pt-4">
                <Button 
                  onClick={startGame}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Egzersizi Başlat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState.phase === 'showing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
                 <ExerciseHeader
           title="Renk Dizisi Takibi"
           onBack={handleBackWithProgress}
           onPause={handlePauseGame}
           onRestart={resetGame}
           isPaused={false}
           isPlaying={true}
           stats={{
             time: formatTime(gameState.currentTime),
             level: gameState.currentLevel,
             score: gameState.score,
             progress: `Gösteriliyor...`
           }}
           showExitConfirmation={true}
         />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  Seviye {gameState.currentLevel}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Renkleri hatırlayın
                </p>
                
                {/* Color Display */}
                <div className="flex justify-center mb-8">
                  <div className="grid grid-cols-2 gap-6 w-fit">
                    {colors.map((color) => (
                      <div
                        key={color.id}
                        className={`
                          w-24 h-24 rounded-xl transition-all duration-300 shadow-lg
                          ${highlightedColor === color.id 
                            ? `${color.bg} scale-110 ring-4 ring-white shadow-2xl` 
                            : `${color.bg} opacity-50`
                          }
                        `}
                      />
                    ))}
                  </div>
                </div>

                <Progress 
                  value={(gameState.showingIndex + 1) / gameState.sequence.length * 100} 
                  className="h-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm max-w-md mx-auto"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState.phase === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Renk Dizisi Takibi"
          onBack={handleBackWithProgress}
          onPause={handlePauseGame}
          onRestart={resetGame}
          isPaused={false}
          isPlaying={true}
          stats={{
            time: formatTime(gameState.currentTime),
            level: gameState.currentLevel,
            score: gameState.score,
            progress: `${gameState.userInput.length}/${gameState.sequence.length}`
          }}
          showExitConfirmation={true}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  Renkleri Seçin
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Gördüğünüz sırayla renkleri tıklayın ({gameState.userInput.length}/{gameState.sequence.length})
                </p>
                
                {/* User Input Display */}
                <div className="flex justify-center items-center gap-4 mb-8">
                  {gameState.sequence.map((colorId, index) => (
                    <div
                      key={index}
                      className={`
                        w-16 h-16 rounded-xl transition-all duration-300 border-4
                        ${index < gameState.userInput.length
                          ? `${colors[colorId].bg} border-white shadow-lg`
                          : index === gameState.userInput.length
                            ? 'bg-gray-200 dark:bg-gray-700 border-primary border-dashed'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }
                      `}
                    />
                  ))}
                </div>

                {/* Color Buttons */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-2 gap-6 w-fit">
                    {colors.map((color) => (
                      <Button
                        key={color.id}
                        variant="outline"
                        size="lg"
                        onClick={() => handleColorInput(color.id)}
                        className={`
                          w-24 h-24 rounded-xl border-4 border-white/20 dark:border-gray-700/20 
                          ${color.bg} ${color.hover} hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl
                        `}
                      />
                    ))}
                  </div>
                </div>


              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState.phase === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Renk Dizisi Takibi"
          onBack={handleBackWithProgress}
          onResume={handleResumeGame}
          onRestart={resetGame}
          isPaused={true}
          isPlaying={false}
          stats={{
            time: formatTime(gameState.currentTime),
            level: gameState.currentLevel,
            score: gameState.score,
            progress: `${gameState.userInput.length}/${gameState.sequence.length}`
          }}
          showExitConfirmation={true}
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

  if (gameState.phase === 'feedback') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        {/* Header */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-white/20 dark:border-gray-800/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleGameEnd}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Bitir
                </Button>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
                <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Renk Dizisi Takibi
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(gameState.currentTime)}
                </Badge>
                <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                  <Star className="w-3 h-3 mr-1" />
                  Skor: {gameState.score}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Oyun Devam Ediyor!
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                En yüksek seviye: {gameState.currentLevel - 1}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Doğru Diziler</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gameState.correctCount}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(gameState.currentTime)}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Skor</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gameState.score}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={handleGameEnd}
                  variant="outline"
                  size="lg"
                  className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Oyunu Bitir
                </Button>
                <Button 
                  onClick={onBack}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Egzersizlere Dön
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}

export default RenkDizisiTakibiSayfasi
