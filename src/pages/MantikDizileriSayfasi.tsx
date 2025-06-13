import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Brain, CheckCircle, X, Trophy, Clock, Target, Zap, Lightbulb, Star, Play, RotateCcw, Pause, PlayCircle } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'
import { toast } from '@/components/ui/sonner'
import ExerciseHeader from '../components/ExerciseHeader'
import { useAudio } from '../hooks/useAudio'

interface MantikDizileriProps {
  onBack: () => void
}

interface GameState {
  phase: 'ready' | 'playing' | 'completed' | 'paused'
  currentLevel: number
  sequence: number[]
  userAnswer: number | null
  correctAnswer: number
  score: number
  correctCount: number
  incorrectCount: number
  startTime: number
  currentTime: number
  totalQuestions: number
  currentQuestion: number
  pausedTime: number
}

const generateSequence = (level: number): { sequence: number[], answer: number } => {
  const patterns = [
    // Aritmetik diziler
    () => {
      const start = Math.floor(Math.random() * 10) + 1
      const diff = Math.floor(Math.random() * 5) + 1
      const sequence = [start, start + diff, start + 2*diff, start + 3*diff]
      return { sequence, answer: start + 4*diff }
    },
    // Geometrik diziler
    () => {
      const start = Math.floor(Math.random() * 3) + 2
      const ratio = 2
      const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio]
      return { sequence, answer: start * Math.pow(ratio, 4) }
    },
    // Fibonacci benzeri
    () => {
      const a = Math.floor(Math.random() * 3) + 1
      const b = Math.floor(Math.random() * 3) + 1
      const sequence = [a, b, a + b, a + 2*b]
      return { sequence, answer: 2*a + 3*b }
    },
    // Kare sayılar
    () => {
      const start = Math.floor(Math.random() * 3) + 1
      const sequence = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)]
      return { sequence, answer: (start+4)*(start+4) }
    }
  ]

  const patternIndex = Math.min(level - 1, patterns.length - 1)
  return patterns[patternIndex]()
}

const MantikDizileriSayfasi: React.FC<MantikDizileriProps> = ({ onBack }) => {
  const { playSound } = useAudio()
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    currentLevel: 1,
    sequence: [],
    userAnswer: null,
    correctAnswer: 0,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    startTime: 0,
    currentTime: 0,
    totalQuestions: 10,
    currentQuestion: 0,
    pausedTime: 0
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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const generateNewQuestion = useCallback(() => {
    const level = Math.min(Math.floor(gameState.currentQuestion / 3) + 1, 4)
    const { sequence, answer } = generateSequence(level)
    
    setGameState(prev => ({
      ...prev,
      sequence,
      correctAnswer: answer,
      userAnswer: null,
      currentLevel: level
    }))
  }, [gameState.currentQuestion])

  const startGame = useCallback(() => {
    playSound('exercise-start')
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: Date.now(),
      currentTime: 0,
      currentQuestion: 1
    }))
    setIsGameActive(true)
    
    // İlk soruyu oluştur
    setTimeout(() => {
      const { sequence, answer } = generateSequence(1)
      setGameState(prev => ({
        ...prev,
        sequence,
        correctAnswer: answer,
        userAnswer: null,
        currentLevel: 1
      }))
    }, 100)
  }, [playSound])

  const resetGame = useCallback(() => {
    playSound('button-click')
    setGameState({
      phase: 'ready',
      currentLevel: 1,
      sequence: [],
      userAnswer: null,
      correctAnswer: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      startTime: 0,
      currentTime: 0,
      totalQuestions: 10,
      currentQuestion: 0,
      pausedTime: 0
    })
    setIsGameActive(false)
  }, [playSound])

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
      phase: 'playing',
      startTime: prev.startTime + pauseDuration
    }))
    setIsGameActive(true)
    toast.info('Oyun devam ediyor')
  }, [gameState.pausedTime])

  const handleAnswerSubmit = useCallback((answer: number) => {
    setGameState(prev => ({ ...prev, userAnswer: answer }))

    const isCorrect = answer === gameState.correctAnswer
    const points = isCorrect ? gameState.currentLevel * 10 : 0

    if (isCorrect) {
      playSound('correct-answer')
      toast.success(`Doğru! +${points} puan`)
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        correctCount: prev.correctCount + 1
      }))
    } else {
      playSound('wrong-answer')
      toast.error(`Yanlış! Doğru cevap: ${gameState.correctAnswer}`)
      setGameState(prev => ({
        ...prev,
        incorrectCount: prev.incorrectCount + 1
      }))
    }

    setTimeout(() => {
      if (gameState.currentQuestion >= gameState.totalQuestions) {
        // Oyun bitti
        finishGame()
      } else {
        // Sonraki soru
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }))
        generateNewQuestion()
      }
    }, 2000)
  }, [gameState])

  const [inputValue, setInputValue] = useState('')

  const handleInputSubmit = useCallback(() => {
    const answer = parseInt(inputValue)
    if (!isNaN(answer)) {
      handleAnswerSubmit(answer)
      setInputValue('')
    } else {
      toast.error('Lütfen geçerli bir sayı girin')
    }
  }, [inputValue, handleAnswerSubmit])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit()
    }
  }, [handleInputSubmit])

  const finishGame = useCallback(() => {
    const duration = Math.floor(gameState.currentTime / 1000)
    const accuracy = Math.round((gameState.correctCount / gameState.totalQuestions) * 100)

    // Mükemmel skor kontrolü (tüm soruları doğru cevapladıysa)
    if (gameState.correctCount === gameState.totalQuestions) {
      playSound('perfect-score')
      toast.success(`🏆 MÜKEMMEL! Tüm soruları doğru cevapladınız!`)
    } else {
      playSound('exercise-complete')
    }

    // İlk defa tamamlama kontrolü
    const previousResults = LocalStorageManager.getExerciseResults()
    const logicResults = previousResults.filter(r => r.exerciseName === 'Mantık Dizileri')
    if (logicResults.length === 0) {
      setTimeout(() => {
        playSound('achievement')
        toast.success(`🎖️ BAŞARI: İlk Mantık Dizileri tamamlandı!`)
      }, 1000)
    }

    const exerciseData = {
          exercise_name: 'Mantık Dizileri',
      questions_answered: gameState.totalQuestions,
      correct_answers: gameState.correctCount,
      accuracy_percentage: accuracy,
      session_duration_seconds: duration,
      final_score: gameState.score,
          timestamp: new Date().toISOString()
        }

    LocalStorageManager.saveExerciseResult({
      exerciseName: 'Mantık Dizileri',
      score: gameState.score,
      duration,
      date: new Date().toISOString(),
      details: exerciseData,
      completed: true,
      exitedEarly: false
    })

    setGameState(prev => ({ ...prev, phase: 'completed' }))
    setIsGameActive(false)
  }, [gameState, playSound])

  const handleBackWithProgress = useCallback(() => {
    playSound('button-click')
    if (gameState.phase === 'playing') {
      const duration = Math.floor(gameState.currentTime / 1000)
      const currentProgress = {
        currentQuestion: gameState.currentQuestion,
        totalQuestions: gameState.totalQuestions,
        correctCount: gameState.correctCount,
        incorrectCount: gameState.incorrectCount,
        score: gameState.score,
        currentLevel: gameState.currentLevel,
        currentSequence: gameState.sequence,
        userAnswer: gameState.userAnswer
      }
      LocalStorageManager.savePartialProgress('Mantık Dizileri', currentProgress, duration)
    }
    onBack()
  }, [gameState, onBack, playSound])

  const generateAnswerOptions = useCallback(() => {
    const correct = gameState.correctAnswer
    const options = [correct]
    
    // Yanlış seçenekler oluştur
    while (options.length < 4) {
      const variation = Math.floor(Math.random() * 20) - 10
      const option = correct + variation
      if (option > 0 && !options.includes(option)) {
        options.push(option)
      }
    }
    
    // Karıştır
    return options.sort(() => Math.random() - 0.5)
  }, [gameState.correctAnswer])

  if (gameState.phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Mantık Dizileri"
          onBack={handleBackWithProgress}
          showExitConfirmation={false}
          stats={{
            progress: 'Hazır'
          }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mantık Dizileri
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Sayı dizilerindeki mantığı bulun ve eksik sayıyı tamamlayın. Aritmetik, geometrik ve özel diziler.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Toplam Soru</h3>
                  <p className="text-2xl font-bold text-primary">10</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Dizi Türleri</h3>
                  <p className="text-2xl font-bold text-primary">4</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Zorluk</h3>
                  <p className="text-2xl font-bold text-primary">Artan</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm rounded-xl p-6 border border-blue-200/20 dark:border-blue-800/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Brain className="w-5 h-5 text-primary" />
                  Nasıl Oynanır?
                </h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">1</span>
                    <span>Verilen sayı dizisindeki mantığı bulun</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">2</span>
                    <span>Eksik olan sayıyı hesaplayın</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">3</span>
                    <span>Doğru seçeneği işaretleyin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">4</span>
                    <span>10 soruyu tamamlayarak egzersizi bitirin</span>
                  </li>
                </ul>
              </div>

              {/* Pattern Examples */}
              <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm rounded-xl p-6 border border-green-200/20 dark:border-green-800/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Zap className="w-5 h-5 text-primary" />
                  Dizi Türleri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Aritmetik Dizi:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">2, 5, 8, 11, ?</div>
                    <div className="text-xs text-gray-500">Her sayı 3 artıyor</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Geometrik Dizi:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">2, 4, 8, 16, ?</div>
                    <div className="text-xs text-gray-500">Her sayı 2 ile çarpılıyor</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Fibonacci Benzeri:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1, 2, 3, 5, ?</div>
                    <div className="text-xs text-gray-500">Önceki iki sayının toplamı</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-700 dark:text-gray-300">Kare Sayılar:</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">1, 4, 9, 16, ?</div>
                    <div className="text-xs text-gray-500">Sayıların kareleri</div>
                  </div>
                </div>
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

  if (gameState.phase === 'playing') {
    const answerOptions = generateAnswerOptions()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
                 <ExerciseHeader
           title="Mantık Dizileri"
           onBack={handleBackWithProgress}
           onPause={handlePauseGame}
           onRestart={resetGame}
           isPaused={false}
           isPlaying={true}
           stats={{
             score: gameState.score,
             progress: `${gameState.currentQuestion}/${gameState.totalQuestions}`,
             time: `${Math.floor(gameState.currentTime / 1000)}s`,
             level: gameState.currentQuestion
           }}
           showExitConfirmation={true}
         />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">İlerleme</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {gameState.currentQuestion}/{gameState.totalQuestions}
              </span>
            </div>
            <Progress 
              value={(gameState.currentQuestion / gameState.totalQuestions) * 100} 
              className="h-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
            />
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Seviye</div>
              <div className="text-xl font-bold text-primary">{gameState.currentLevel}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Doğru</div>
              <div className="text-xl font-bold text-green-600">{gameState.correctCount}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Yanlış</div>
              <div className="text-xl font-bold text-red-600">{gameState.incorrectCount}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Skor</div>
              <div className="text-xl font-bold text-purple-600">{gameState.score}</div>
            </div>
          </div>

          {/* Question */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                  Soru {gameState.currentQuestion}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Aşağıdaki dizide eksik olan sayıyı bulun:
                </p>
                
                {/* Sequence Display */}
                <div className="flex justify-center items-center gap-4 mb-8">
                  {gameState.sequence.map((number, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-primary/10 border-2 border-primary rounded-xl flex items-center justify-center text-xl font-bold text-primary"
                    >
                      {number}
                    </div>
                  ))}
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-xl flex items-center justify-center text-xl font-bold text-gray-400 dark:text-gray-500">
                    ?
                  </div>
                </div>

                {/* Answer Input */}
                <div className="max-w-md mx-auto space-y-4">
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="Cevabınızı girin..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={gameState.userAnswer !== null}
                      className="text-xl font-bold text-center h-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-white/20 dark:border-gray-700/20"
                    />
                    <Button
                      onClick={() => {
                        playSound('button-click')
                        handleInputSubmit()
                      }}
                      disabled={gameState.userAnswer !== null || !inputValue.trim()}
                      size="lg"
                      className="h-16 px-8 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Gönder
                    </Button>
                  </div>
                  
                  {gameState.userAnswer !== null && (
                    <div className={`text-center p-4 rounded-xl ${
                      gameState.userAnswer === gameState.correctAnswer
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                      {gameState.userAnswer === gameState.correctAnswer ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Doğru! Cevabınız: {gameState.userAnswer}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-5 h-5" />
                          <span className="font-semibold">Yanlış! Doğru cevap: {gameState.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  )}
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
          title="Mantık Dizileri"
          onBack={handleBackWithProgress}
          showExitConfirmation={true}
          onPause={handleResumeGame}
          onRestart={resetGame}
          isPaused={true}
          isPlaying={false}
          stats={{
            score: gameState.score,
            progress: `${gameState.currentQuestion}/${gameState.totalQuestions}`,
            time: `${Math.floor(gameState.currentTime / 1000)}s`,
            level: gameState.currentQuestion
          }}
        />

        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oyun Duraklatıldı</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Devam etmek için üstteki butonu kullanın</p>
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
        title="Mantık Dizileri"
        onBack={onBack}
        showExitConfirmation={false}
        stats={{
          score: gameState.score,
          progress: 'Tamamlandı',
          time: `${Math.floor(gameState.currentTime / 1000)}s`
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
              Mantık Dizileri egzersizini tamamladınız
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Doğru Cevap</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gameState.correctCount}/{gameState.totalQuestions}</p>
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

            {/* Accuracy */}
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 dark:border-gray-700/20">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Başarı Oranı</h3>
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round((gameState.correctCount / gameState.totalQuestions) * 100)}%
              </div>
              <Progress 
                value={(gameState.correctCount / gameState.totalQuestions) * 100} 
                className="h-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
                  />
                </div>
                
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                onClick={() => {
                  playSound('button-click')
                  resetGame()
                }}
                variant="outline"
                size="lg"
                className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Oyna
              </Button>
                  <Button 
                onClick={() => {
                  playSound('button-click')
                  onBack()
                }}
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

export default MantikDizileriSayfasi
