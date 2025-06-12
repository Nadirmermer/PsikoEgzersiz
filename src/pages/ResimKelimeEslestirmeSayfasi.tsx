import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock, Target, Play, RotateCcw, Star, Brain, Pause, PlayCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LocalStorageManager } from '../utils/localStorage'
import { generateMatchingQuestion, MatchingQuestion, MatchingGameResult } from '../utils/matchingExerciseUtils'
import ExerciseHeader from '../components/ExerciseHeader'

interface ResimKelimeEslestirmeSayfasiProps {
  onBack: () => void
}

const ResimKelimeEslestirmeSayfasi: React.FC<ResimKelimeEslestirmeSayfasiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished' | 'paused'>('ready')
  const [currentQuestion, setCurrentQuestion] = useState<MatchingQuestion | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(0)
  const [pausedTime, setPausedTime] = useState(0)
  
  // Oyun ayarları
  const TOTAL_QUESTIONS = 15
  const FEEDBACK_DURATION = 1500

  // İstatistikler için
  const [gameQuestions, setGameQuestions] = useState<MatchingQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [responseTimes, setResponseTimes] = useState<number[]>([])

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing' && startTime > 0) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState, startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startGame = () => {
    setGameState('playing')
    setQuestionNumber(1)
    setScore(0)
    setStartTime(Date.now())
    setCurrentTime(0)
    setGameQuestions([])
    setUserAnswers([])
    setResponseTimes([])
    generateNewQuestion()
  }

  const generateNewQuestion = () => {
    const question = generateMatchingQuestion('emoji-to-word')
    setCurrentQuestion(question)
    setQuestionStartTime(Date.now())
    setShowFeedback(false)
    setSelectedAnswer('')
  }

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback || !currentQuestion) return

    const isCorrect = answer === currentQuestion.correctAnswer.word
    const responseTime = Date.now() - questionStartTime

    setSelectedAnswer(answer)
    setLastAnswerCorrect(isCorrect)
    setShowFeedback(true)

    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    // İstatistikleri güncelle
    setGameQuestions(prev => [...prev, currentQuestion])
    setUserAnswers(prev => [...prev, isCorrect])
    setResponseTimes(prev => [...prev, responseTime])

    // Geri bildirim sonrası devam et
    setTimeout(() => {
      if (questionNumber >= TOTAL_QUESTIONS) {
        finishGame()
      } else {
        setQuestionNumber(prev => prev + 1)
        generateNewQuestion()
      }
    }, FEEDBACK_DURATION)
  }

  const finishGame = async () => {
    const endTime = Date.now()
    const totalDuration = Math.round((endTime - startTime) / 1000)
    const finalScore = Math.round((score / TOTAL_QUESTIONS) * 100)

    const gameResult: MatchingGameResult = {
      exercise_name: 'Resim-Kelime Eşleştirme',
      category_played: 'Karışık',
      questions_total: TOTAL_QUESTIONS,
      correct_answers: score,
      incorrect_answers: TOTAL_QUESTIONS - score,
      duration_seconds: totalDuration,
      score: finalScore,
      timestamp: new Date().toISOString(),
      details: {
        questions: gameQuestions,
        user_answers: userAnswers,
        response_times: responseTimes
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

      toast.success(`Tebrikler! ${score}/${TOTAL_QUESTIONS} doğru cevap verdiniz.`)
    } catch (error) {
      console.error('Sonuç kaydedilirken hata:', error)
      toast.error('Sonuç kaydedilirken hata oluştu')
    }

    setGameState('finished')
  }

  const resetGame = () => {
    setGameState('ready')
    setCurrentQuestion(null)
    setQuestionNumber(1)
    setScore(0)
    setCurrentTime(0)
  }

  const handlePauseGame = () => {
    if (gameState === 'playing') {
      setPausedTime(Date.now())
      setGameState('paused')
    }
  }

  const handleResumeGame = () => {
    if (gameState === 'paused') {
      const pauseDuration = Date.now() - pausedTime
      setStartTime(prev => prev + pauseDuration)
      setQuestionStartTime(prev => prev + pauseDuration)
      setGameState('playing')
    }
  }

  const handleBackWithProgress = async () => {
    if (gameState === 'playing' || gameState === 'paused') {
      try {
        await LocalStorageManager.savePartialProgress({
          exerciseName: 'Resim-Kelime Eşleştirme',
          progress: Math.round((questionNumber / TOTAL_QUESTIONS) * 100),
          currentLevel: questionNumber,
          score: score,
          timeSpent: currentTime,
          date: new Date().toISOString()
        })
        toast.success('İlerleme kaydedildi')
      } catch (error) {
        console.error('İlerleme kaydedilirken hata:', error)
        toast.error('İlerleme kaydedilemedi')
      }
    }
    onBack()
  }

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Resim-Kelime Eşleştirme"
          onBack={onBack}
          showExitConfirmation={false}
          stats={{
            phase: 'Hazır',
            score: 0,
            progress: 0,
            timeElapsed: 0
          }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Resim-Kelime Eşleştirme
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Gösterilen emojiye uygun kelimeyi seçin. Dikkatli olun, çeldiriciler farklı kategorilerden geliyor!
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
                  <p className="text-2xl font-bold text-primary">{TOTAL_QUESTIONS}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Tahmini Süre</h3>
                  <p className="text-2xl font-bold text-primary">3-5 dk</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Zorluk</h3>
                  <p className="text-2xl font-bold text-primary">Orta</p>
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
                    <span>Ekranda bir emoji gösterilecek</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">2</span>
                    <span>4 kelime seçeneği arasından doğru olanı seçin</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">3</span>
                    <span>Çeldiriciler farklı kategorilerden gelir</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">4</span>
                    <span>15 soruyu tamamlayarak egzersizi bitirin</span>
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

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Resim-Kelime Eşleştirme"
          onBack={handleBackWithProgress}
          showExitConfirmation={true}
          onPause={handlePauseGame}
          onRestart={resetGame}
          isPaused={false}
          isPlaying={true}
          stats={{
            phase: 'Oynuyor',
            score: score,
            progress: Math.round(((questionNumber - 1) / TOTAL_QUESTIONS) * 100),
            timeElapsed: currentTime,
            currentLevel: questionNumber,
            totalLevels: TOTAL_QUESTIONS
          }}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Soru {questionNumber} / {TOTAL_QUESTIONS}
              </span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Skor: {score}/{TOTAL_QUESTIONS}
              </span>
            </div>
            <Progress 
              value={(questionNumber - 1) / TOTAL_QUESTIONS * 100} 
              className="h-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
            />
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
              <CardContent className="p-8">
                {/* Emoji Display */}
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4 animate-pulse">
                    {currentQuestion.correctAnswer.emoji}
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Bu emojiye uygun kelimeyi seçin
                  </p>
                </div>

                                 {/* Answer Options */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {currentQuestion.options.map((option, index) => {
                     const optionText = typeof option === 'string' ? option : option.word
                     return (
                       <Button
                         key={index}
                         variant="outline"
                         size="lg"
                         onClick={() => handleAnswerSelect(optionText)}
                         disabled={showFeedback}
                         className={`
                           h-16 text-lg font-medium transition-all duration-200 border-2
                           ${showFeedback && selectedAnswer === optionText
                             ? lastAnswerCorrect
                               ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
                               : 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-400 dark:text-red-300'
                             : showFeedback && optionText === currentQuestion.correctAnswer.word
                               ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
                               : 'bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60'
                           }
                         `}
                       >
                         {showFeedback && selectedAnswer === optionText && (
                           lastAnswerCorrect ? (
                             <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                           ) : (
                             <XCircle className="w-5 h-5 mr-2 text-red-600" />
                           )
                         )}
                         {showFeedback && optionText === currentQuestion.correctAnswer.word && selectedAnswer !== optionText && (
                           <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                         )}
                         {optionText}
                       </Button>
                     )
                   })}
                 </div>

                {/* Feedback */}
                {showFeedback && (
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      lastAnswerCorrect 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {lastAnswerCorrect ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Doğru!
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Yanlış! Doğru cevap: {currentQuestion.correctAnswer.word}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (gameState === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Resim-Kelime Eşleştirme"
          onBack={handleBackWithProgress}
          showExitConfirmation={true}
          onPause={handleResumeGame}
          onRestart={resetGame}
          isPaused={true}
          isPlaying={false}
          stats={{
            phase: 'Duraklatıldı',
            score: score,
            progress: Math.round(((questionNumber - 1) / TOTAL_QUESTIONS) * 100),
            timeElapsed: currentTime,
            currentLevel: questionNumber,
            totalLevels: TOTAL_QUESTIONS
          }}
        />

        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Pause className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Oyun Duraklatıldı
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Hazır olduğunuzda devam edebilirsiniz
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Soru</h3>
                  <p className="text-xl font-bold text-primary">{questionNumber}/{TOTAL_QUESTIONS}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Skor</h3>
                  <p className="text-xl font-bold text-primary">{score}/{TOTAL_QUESTIONS}</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
                  <p className="text-xl font-bold text-primary">{formatTime(currentTime)}</p>
                </div>
              </div>
              <Button 
                onClick={handleResumeGame}
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Devam Et
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Finished state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <ExerciseHeader
        title="Resim-Kelime Eşleştirme"
        onBack={onBack}
        showExitConfirmation={false}
        stats={{
          phase: 'Tamamlandı',
          score: score,
          progress: 100,
          timeElapsed: currentTime
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
              Resim-Kelime Eşleştirme egzersizini tamamladınız
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
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{score}/{TOTAL_QUESTIONS}</p>
              </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(currentTime)}</p>
              </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Başarı</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round((score / TOTAL_QUESTIONS) * 100)}%</p>
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

export default ResimKelimeEslestirmeSayfasi
