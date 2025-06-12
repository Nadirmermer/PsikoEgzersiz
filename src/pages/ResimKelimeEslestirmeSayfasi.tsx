
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, XCircle, Trophy, Clock, Target } from 'lucide-react'
import { toast } from 'sonner'
import { LocalStorageManager } from '../utils/localStorage'
import { generateMatchingQuestion, MatchingQuestion, MatchingGameResult } from '../utils/matchingExerciseUtils'

interface ResimKelimeEslestirmeSayfasiProps {
  onBack: () => void
}

const ResimKelimeEslestirmeSayfasi: React.FC<ResimKelimeEslestirmeSayfasiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [currentQuestion, setCurrentQuestion] = useState<MatchingQuestion | null>(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  
  // Oyun ayarları
  const TOTAL_QUESTIONS = 15
  const FEEDBACK_DURATION = 1500

  // İstatistikler için
  const [gameQuestions, setGameQuestions] = useState<MatchingQuestion[]>([])
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [responseTimes, setResponseTimes] = useState<number[]>([])

  const startGame = () => {
    setGameState('playing')
    setQuestionNumber(1)
    setScore(0)
    setStartTime(Date.now())
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
        details: gameResult
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
  }

  if (gameState === 'ready') {
    return (
      <div className="container mx-auto section-padding pb-28 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Egzersizlere Dön
          </Button>
        </div>

        <Card className="card-enhanced">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl mb-4">Resim-Kelime Eşleştirme</CardTitle>
            <CardDescription className="text-lg">
              Gösterilen emojiye uygun kelimeyi seçin. Dikkatli olun, çeldiriciler farklı kategorilerden geliyor!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Toplam Soru</h3>
                <p className="text-2xl font-bold text-primary">{TOTAL_QUESTIONS}</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Tahmini Süre</h3>
                <p className="text-2xl font-bold text-primary">3-5 dk</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Zorluk</h3>
                <p className="text-2xl font-bold text-primary">Orta</p>
              </div>
            </div>

            <div className="bg-muted/30 p-6 rounded-xl">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                📝 Nasıl Oynanır?
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">1.</span>
                  <span>Ekranda bir emoji gösterilecek</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">2.</span>
                  <span>4 kelime seçeneği arasından doğru olanı seçin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">3.</span>
                  <span>Çeldiriciler farklı kategorilerden gelir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">4.</span>
                  <span>15 soruyu tamamlayarak egzersizi bitirin</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={startGame}
              className="w-full py-6 text-lg"
              size="lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Egzersize Başla
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'playing' && currentQuestion) {
    const progress = ((questionNumber - 1) / TOTAL_QUESTIONS) * 100

    return (
      <div className="container mx-auto section-padding pb-28 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Soru {questionNumber}/{TOTAL_QUESTIONS}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Skor: {score}/{questionNumber - 1}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="card-enhanced">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl mb-6">Bu emojiye uygun kelimeyi seçin</CardTitle>
            <div className="text-8xl mb-4" role="img" aria-label="Soru emojisi">
              {currentQuestion.correctAnswer.emoji}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {currentQuestion.options.map((option, index) => {
                const optionText = typeof option === 'string' ? option : option.word
                const isSelected = selectedAnswer === optionText
                const isCorrect = optionText === currentQuestion.correctAnswer.word
                
                let buttonClass = "w-full p-6 text-lg font-medium border-2 transition-all duration-300 "
                
                if (showFeedback) {
                  if (isSelected && isCorrect) {
                    buttonClass += "bg-success/20 border-success text-success"
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-destructive/20 border-destructive text-destructive"
                  } else if (isCorrect) {
                    buttonClass += "bg-success/10 border-success/50 text-success"
                  } else {
                    buttonClass += "bg-muted/30 border-muted text-muted-foreground"
                  }
                } else {
                  buttonClass += "bg-background border-border hover:border-primary hover:bg-primary/5 hover:scale-105"
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonClass}
                    onClick={() => handleAnswerSelect(optionText)}
                    disabled={showFeedback}
                  >
                    <span className="text-center">{optionText}</span>
                    {showFeedback && isSelected && (
                      <span className="ml-2">
                        {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>

            {showFeedback && (
              <div className="mt-6 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  lastAnswerCorrect 
                    ? 'bg-success/20 text-success' 
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {lastAnswerCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Doğru!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Yanlış! Doğru cevap: {currentQuestion.correctAnswer.word}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (gameState === 'finished') {
    const finalScore = Math.round((score / TOTAL_QUESTIONS) * 100)
    
    return (
      <div className="container mx-auto section-padding pb-28 max-w-4xl">
        <Card className="card-enhanced">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl mb-4">Egzersiz Tamamlandı!</CardTitle>
            <CardDescription className="text-lg">
              Resim-Kelime Eşleştirme egzersizini başarıyla tamamladınız.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <h3 className="font-semibold text-muted-foreground">Doğru Cevap</h3>
                <p className="text-3xl font-bold text-success">{score}/{TOTAL_QUESTIONS}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-muted-foreground">Başarı Oranı</h3>
                <p className="text-3xl font-bold text-primary">%{finalScore}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-muted-foreground">Ortalama Süre</h3>
                <p className="text-3xl font-bold text-info">
                  {responseTimes.length > 0 ? 
                    Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 1000) 
                    : 0}s
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={resetGame} variant="outline" className="flex-1">
                Tekrar Oyna
              </Button>
              <Button onClick={onBack} className="flex-1">
                Egzersizlere Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

export default ResimKelimeEslestirmeSayfasi
