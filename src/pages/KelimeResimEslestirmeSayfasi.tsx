import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock, Target, Brain, Lightbulb, Star, Play, RotateCcw, Pause, PlayCircle } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { LocalStorageManager } from '@/utils/localStorage'
import { generateMatchingQuestion, MatchingQuestion, MatchingGameResult, ExerciseItem } from '@/utils/matchingExerciseUtils'
import ExerciseHeader from '@/components/ExerciseHeader'
import { useAudio } from '@/hooks/useAudio'

interface KelimeResimEslestirmeSayfasiProps {
  onBack: () => void
}

interface GameState {
  phase: 'ready' | 'playing' | 'completed' | 'paused'
  currentQuestion: MatchingQuestion | null
  questionNumber: number
  score: number
  startTime: number
  currentTime: number
  questionStartTime: number
  showFeedback: boolean
  lastAnswerCorrect: boolean
  selectedAnswer: ExerciseItem | null
  gameQuestions: MatchingQuestion[]
  userAnswers: boolean[]
  responseTimes: number[]
  pausedTime: number
}

const KelimeResimEslestirmeSayfasi: React.FC<KelimeResimEslestirmeSayfasiProps> = ({ onBack }) => {
  const { playSound } = useAudio()
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    currentQuestion: null,
    questionNumber: 1,
    score: 0,
    startTime: 0,
    currentTime: 0,
    questionStartTime: 0,
    showFeedback: false,
    lastAnswerCorrect: false,
    selectedAnswer: null,
    gameQuestions: [],
    userAnswers: [],
    responseTimes: [],
    pausedTime: 0
  })

  const [isGameActive, setIsGameActive] = useState(false)
  
  // Oyun ayarları
  const TOTAL_QUESTIONS = 15
  const FEEDBACK_DURATION = 1500

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isGameActive && gameState.phase === 'playing') {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          currentTime: Date.now() - prev.startTime
        }))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isGameActive, gameState.phase])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const resetGame = useCallback(() => {
    setGameState({
      phase: 'ready',
      currentQuestion: null,
      questionNumber: 1,
      score: 0,
      startTime: 0,
      currentTime: 0,
      questionStartTime: 0,
      showFeedback: false,
      lastAnswerCorrect: false,
      selectedAnswer: null,
      gameQuestions: [],
      userAnswers: [],
      responseTimes: [],
      pausedTime: 0
    })
    setIsGameActive(false)
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
      phase: 'playing',
      startTime: prev.startTime + pauseDuration
    }))
    setIsGameActive(true)
    toast.info('Oyun devam ediyor')
  }, [gameState.pausedTime])

  const startGame = useCallback(() => {
    playSound('exercise-start')
    const now = Date.now()
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      questionNumber: 1,
      score: 0,
      startTime: now,
      currentTime: 0,
      gameQuestions: [],
      userAnswers: [],
      responseTimes: []
    }))
    setIsGameActive(true)
    generateNewQuestion()
  }, [playSound])

  const generateNewQuestion = useCallback(() => {
    const question = generateMatchingQuestion('word-to-emoji')
    setGameState(prev => ({
      ...prev,
      currentQuestion: question,
      questionStartTime: Date.now(),
      showFeedback: false,
      selectedAnswer: null
    }))
  }, [])

  const handleAnswerSelect = useCallback((answer: ExerciseItem) => {
    if (gameState.showFeedback || !gameState.currentQuestion) return

    const isCorrect = answer.emoji === gameState.currentQuestion.correctAnswer.emoji
    const responseTime = Date.now() - gameState.questionStartTime

    // Ses efekti
    playSound(isCorrect ? 'correct-answer' : 'wrong-answer')

    setGameState(prev => ({
      ...prev,
      selectedAnswer: answer,
      lastAnswerCorrect: isCorrect,
      showFeedback: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      gameQuestions: [...prev.gameQuestions, prev.currentQuestion!],
      userAnswers: [...prev.userAnswers, isCorrect],
      responseTimes: [...prev.responseTimes, responseTime]
    }))

    // Geri bildirim sonrası devam et
    setTimeout(() => {
      if (gameState.questionNumber >= TOTAL_QUESTIONS) {
        finishGame()
      } else {
        setGameState(prev => ({
          ...prev,
          questionNumber: prev.questionNumber + 1
        }))
        generateNewQuestion()
      }
    }, FEEDBACK_DURATION)
  }, [gameState.showFeedback, gameState.currentQuestion, gameState.questionStartTime, gameState.questionNumber, playSound])

  const finishGame = useCallback(async () => {
    const endTime = Date.now()
    const totalDuration = Math.round((endTime - gameState.startTime) / 1000)
    const finalScore = Math.round((gameState.score / TOTAL_QUESTIONS) * 100)

    // Mükemmel skor kontrolü
    if (gameState.score === TOTAL_QUESTIONS) {
      playSound('perfect-score')
      toast.success(`🏆 MÜKEMMEL! Tüm soruları doğru cevapladınız!`)
    } else {
      playSound('exercise-complete')
    }

    // İlk defa tamamlama kontrolü
    const previousResults = LocalStorageManager.getExerciseResults()
    const exerciseResults = previousResults.filter(r => r.exerciseName === 'Kelime-Resim Eşleştirme')
    if (exerciseResults.length === 0) {
      setTimeout(() => {
        playSound('achievement')
        toast.success(`🎖️ BAŞARI: İlk Kelime-Resim Eşleştirme tamamlandı!`)
      }, 1000)
    }

    const gameResult: MatchingGameResult = {
      exercise_name: 'Kelime-Resim Eşleştirme',
      category_played: 'Karışık',
      questions_total: TOTAL_QUESTIONS,
      correct_answers: gameState.score,
      incorrect_answers: TOTAL_QUESTIONS - gameState.score,
      duration_seconds: totalDuration,
      score: finalScore,
      timestamp: new Date().toISOString(),
      details: {
        questions: gameState.gameQuestions,
        user_answers: gameState.userAnswers,
        response_times: gameState.responseTimes
      }
    }

    try {
      await LocalStorageManager.saveExerciseResult({
        exerciseName: gameResult.exercise_name,
        score: gameResult.score,
        duration: gameResult.duration_seconds,
        date: gameResult.timestamp,
        details: gameResult,
        completed: true,
        exitedEarly: false
      })

      toast.success(`Tebrikler! ${gameState.score}/${TOTAL_QUESTIONS} doğru cevap verdiniz.`)
    } catch (error) {
      console.error('Sonuç kaydedilirken hata:', error)
      toast.error('Sonuç kaydedilirken hata oluştu')
    }

    setGameState(prev => ({ ...prev, phase: 'completed' }))
    setIsGameActive(false)
  }, [gameState.startTime, gameState.score, gameState.gameQuestions, gameState.userAnswers, gameState.responseTimes, playSound])

  const handleBackWithProgress = useCallback(() => {
    playSound('button-click')
    if (gameState.phase === 'playing') {
      const currentTime = Date.now()
      const duration = Math.round((currentTime - gameState.startTime) / 1000)
      const currentProgress = {
        questionNumber: gameState.questionNumber,
        score: gameState.score,
        totalQuestions: TOTAL_QUESTIONS,
        currentQuestion: gameState.currentQuestion,
        userAnswers: gameState.userAnswers,
        responseTimes: gameState.responseTimes
      }
      LocalStorageManager.savePartialProgress('Kelime-Resim Eşleştirme', currentProgress, duration)
    }
    onBack()
  }, [gameState, onBack, playSound])

  // Ready state
  if (gameState.phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime-Resim Eşleştirme"
          onBack={handleBackWithProgress}
          showExitConfirmation={false}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Kelime-Resim Eşleştirme
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Gösterilen kelimeye uygun emojiye seçin. Dikkatli olun, çeldiriciler farklı kategorilerden geliyor!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Toplam Soru</h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{TOTAL_QUESTIONS}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Tahmini Süre</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">3-5 dk</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Zorluk</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">Orta</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Nasıl Oynanır?
                </h4>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <span>Ekranda bir kelime gösterilecek</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <span>4 emoji seçeneği arasından doğru olanı seçin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <span>Çeldiriciler farklı kategorilerden gelir</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <span>15 soruyu tamamlayarak egzersizi bitirin</span>
                  </li>
                </ul>
              </div>

              {/* Start Button */}
              <Button 
                onClick={startGame}
                size="lg"
                className="w-full py-6 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-5 h-5 mr-2" />
                Egzersize Başla
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Playing state
  if (gameState.phase === 'playing' && gameState.currentQuestion) {
    const progress = ((gameState.questionNumber - 1) / TOTAL_QUESTIONS) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime-Resim Eşleştirme"
          onBack={handleBackWithProgress}
          onPause={handlePauseGame}
          onRestart={resetGame}
          isPaused={false}
          isPlaying={true}
          stats={{
            time: formatTime(gameState.currentTime),
            score: gameState.score,
            progress: `${gameState.questionNumber}/${TOTAL_QUESTIONS}`
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
                {gameState.questionNumber}/{TOTAL_QUESTIONS}
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
            />
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Soru</div>
              <div className="text-xl font-bold text-primary">{gameState.questionNumber}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Doğru</div>
              <div className="text-xl font-bold text-green-600">{gameState.score}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Yanlış</div>
              <div className="text-xl font-bold text-red-600">{gameState.questionNumber - 1 - gameState.score}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Süre</div>
              <div className="text-xl font-bold text-blue-600">{formatTime(gameState.currentTime)}</div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-6 text-gray-800 dark:text-gray-200">Bu kelimeye uygun emojiye seçin</CardTitle>
              <div className="text-4xl font-bold mb-4 p-6 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-700/20">
                {gameState.currentQuestion.correctAnswer.word}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {gameState.currentQuestion.options.map((option, index) => {
                  const optionItem = option as ExerciseItem
                  const isSelected = gameState.selectedAnswer?.emoji === optionItem.emoji
                  const isCorrect = optionItem.emoji === gameState.currentQuestion!.correctAnswer.emoji
                  
                  let buttonClass = "w-full p-12 text-6xl border-2 transition-all duration-300 hover:scale-105 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 "
                  
                  if (gameState.showFeedback) {
                    if (isSelected && isCorrect) {
                      buttonClass += "bg-green-100 dark:bg-green-900/20 border-green-500 dark:border-green-400"
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "bg-red-100 dark:bg-red-900/20 border-red-500 dark:border-red-400"
                    } else if (isCorrect) {
                      buttonClass += "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-600"
                    } else {
                      buttonClass += "opacity-50"
                    }
                  } else {
                    buttonClass += "hover:bg-white/60 dark:hover:bg-gray-800/60 hover:border-emerald-500 dark:hover:border-emerald-400"
                  }

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={buttonClass}
                      onClick={() => handleAnswerSelect(optionItem)}
                      disabled={gameState.showFeedback}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span role="img" aria-label={optionItem.word}>
                          {optionItem.emoji}
                        </span>
                        {gameState.showFeedback && isSelected && (
                          <span className="text-base">
                            {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                          </span>
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>

              {gameState.showFeedback && (
                <div className="mt-6 text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    gameState.lastAnswerCorrect 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }`}>
                    {gameState.lastAnswerCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Doğru!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Yanlış! Doğru cevap: {gameState.currentQuestion.correctAnswer.emoji}</span>
                      </>
                    )}
                  </div>
                </div>
              )}


            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Paused state
  if (gameState.phase === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime-Resim Eşleştirme"
          onBack={handleBackWithProgress}
          onPause={handleResumeGame}
          onRestart={resetGame}
          isPaused={true}
          isPlaying={false}
          stats={{
            time: formatTime(gameState.currentTime),
            score: gameState.score,
            progress: `${gameState.questionNumber}/${TOTAL_QUESTIONS}`
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

  // Completed state
  if (gameState.phase === 'completed') {
    const finalScore = Math.round((gameState.score / TOTAL_QUESTIONS) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Kelime-Resim Eşleştirme"
          onBack={onBack}
          showExitConfirmation={false}
          stats={{
            time: formatTime(gameState.currentTime),
            score: gameState.score,
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
                Kelime-Resim Eşleştirme egzersizini başarıyla tamamladınız
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Doğru Cevap</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gameState.score}/{TOTAL_QUESTIONS}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Başarı Oranı</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">%{finalScore}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Ortalama Süre</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {gameState.responseTimes.length > 0 ? 
                      Math.round(gameState.responseTimes.reduce((a, b) => a + b, 0) / gameState.responseTimes.length / 1000) 
                      : 0}s
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 dark:border-gray-700/20">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Toplam Süre</h3>
                <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
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
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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

export default KelimeResimEslestirmeSayfasi
