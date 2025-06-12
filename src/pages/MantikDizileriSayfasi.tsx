
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Brain, CheckCircle, X, Trophy, Clock, Target, Zap } from 'lucide-react'
import { LocalStorageManager } from '../utils/localStorage'

interface SequenceProblem {
  id: number
  sequence: number[]
  correctAnswer: number
  explanation: string
  difficulty: 'Kolay' | 'Orta' | 'Zor'
  patternType: string
}

interface SessionStats {
  questionsAttempted: number
  correctAnswers: number
  incorrectAnswers: number
  sessionStartTime: number
  totalScore: number
}

interface MantikDizileriSayfasiProps {
  onBack: () => void
}

const MantikDizileriSayfasi: React.FC<MantikDizileriSayfasiProps> = ({ onBack }) => {
  const [currentProblem, setCurrentProblem] = useState<SequenceProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    questionsAttempted: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    sessionStartTime: Date.now(),
    totalScore: 0
  })
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Soru havuzu - 15 farklı sayı dizisi problemi
  const sequenceProblems: SequenceProblem[] = [
    {
      id: 1,
      sequence: [2, 4, 6, 8],
      correctAnswer: 10,
      explanation: "Çift sayılar dizisi (+2)",
      difficulty: 'Kolay',
      patternType: 'Aritmetik Dizi'
    },
    {
      id: 2,
      sequence: [1, 3, 5, 7],
      correctAnswer: 9,
      explanation: "Tek sayılar dizisi (+2)",
      difficulty: 'Kolay',
      patternType: 'Aritmetik Dizi'
    },
    {
      id: 3,
      sequence: [5, 10, 15, 20],
      correctAnswer: 25,
      explanation: "5'in katları (+5)",
      difficulty: 'Kolay',
      patternType: 'Aritmetik Dizi'
    },
    {
      id: 4,
      sequence: [1, 4, 7, 10],
      correctAnswer: 13,
      explanation: "3'er artarak (+3)",
      difficulty: 'Kolay',
      patternType: 'Aritmetik Dizi'
    },
    {
      id: 5,
      sequence: [2, 4, 8, 16],
      correctAnswer: 32,
      explanation: "2 ile çarpılarak (×2)",
      difficulty: 'Orta',
      patternType: 'Geometrik Dizi'
    },
    {
      id: 6,
      sequence: [1, 1, 2, 3, 5],
      correctAnswer: 8,
      explanation: "Fibonacci dizisi (önceki iki sayının toplamı)",
      difficulty: 'Orta',
      patternType: 'Fibonacci'
    },
    {
      id: 7,
      sequence: [1, 4, 9, 16],
      correctAnswer: 25,
      explanation: "Kare sayılar (1², 2², 3², 4²)",
      difficulty: 'Orta',
      patternType: 'Kare Sayılar'
    },
    {
      id: 8,
      sequence: [3, 6, 12, 24],
      correctAnswer: 48,
      explanation: "2 ile çarpılarak (×2)",
      difficulty: 'Orta',
      patternType: 'Geometrik Dizi'
    },
    {
      id: 9,
      sequence: [100, 90, 80, 70],
      correctAnswer: 60,
      explanation: "10'ar azalarak (-10)",
      difficulty: 'Kolay',
      patternType: 'Azalan Dizi'
    },
    {
      id: 10,
      sequence: [1, 8, 27, 64],
      correctAnswer: 125,
      explanation: "Küp sayılar (1³, 2³, 3³, 4³)",
      difficulty: 'Zor',
      patternType: 'Küp Sayılar'
    },
    {
      id: 11,
      sequence: [2, 6, 18, 54],
      correctAnswer: 162,
      explanation: "3 ile çarpılarak (×3)",
      difficulty: 'Orta',
      patternType: 'Geometrik Dizi'
    },
    {
      id: 12,
      sequence: [1, 2, 4, 7, 11],
      correctAnswer: 16,
      explanation: "Artan farklar (+1, +2, +3, +4)",
      difficulty: 'Zor',
      patternType: 'Artan Farklar'
    },
    {
      id: 13,
      sequence: [0, 1, 1, 2, 3, 5, 8],
      correctAnswer: 13,
      explanation: "Fibonacci dizisi (0'dan başlayarak)",
      difficulty: 'Orta',
      patternType: 'Fibonacci'
    },
    {
      id: 14,
      sequence: [2, 5, 10, 17, 26],
      correctAnswer: 37,
      explanation: "n² + 1 formülü (1²+1, 2²+1, 3²+1, 4²+1)",
      difficulty: 'Zor',
      patternType: 'Polinom'
    },
    {
      id: 15,
      sequence: [1, 3, 6, 10, 15],
      correctAnswer: 21,
      explanation: "Üçgen sayılar (1+2, 1+2+3, 1+2+3+4...)",
      difficulty: 'Zor',
      patternType: 'Üçgen Sayılar'
    }
  ]

  // Yeni soru getir
  const getNewProblem = () => {
    const randomIndex = Math.floor(Math.random() * sequenceProblems.length)
    setCurrentProblem(sequenceProblems[randomIndex])
    setUserAnswer('')
    setShowFeedback(false)
    setQuestionStartTime(Date.now())
  }

  // İlk soru yükle
  useEffect(() => {
    getNewProblem()
  }, [])

  // Cevap kontrolü
  const handleAnswerSubmit = () => {
    if (!currentProblem || userAnswer.trim() === '') return

    const isAnswerCorrect = parseInt(userAnswer) === currentProblem.correctAnswer
    setIsCorrect(isAnswerCorrect)
    setShowFeedback(true)

    const responseTime = (Date.now() - questionStartTime) / 1000
    const scoreForQuestion = isAnswerCorrect ? Math.max(100 - Math.floor(responseTime), 10) : 0

    setSessionStats(prev => ({
      ...prev,
      questionsAttempted: prev.questionsAttempted + 1,
      correctAnswers: prev.correctAnswers + (isAnswerCorrect ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (isAnswerCorrect ? 0 : 1),
      totalScore: prev.totalScore + scoreForQuestion
    }))

    // 2 saniye sonra yeni soru
    setTimeout(() => {
      getNewProblem()
    }, 2000)
  }

  // Enter tuşu desteği
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleAnswerSubmit()
    }
  }

  // Seans bitir ve veriyi kaydet
  const handleEndSession = () => {
    if (sessionStats.questionsAttempted > 0) {
      const sessionDuration = (Date.now() - sessionStats.sessionStartTime) / 1000
      
      const exerciseResult = {
        exerciseName: 'Mantık Dizileri',
        score: sessionStats.totalScore,
        duration: Math.round(sessionDuration),
        date: new Date().toISOString(),
        details: {
          exercise_name: 'Mantık Dizileri',
          questions_attempted: sessionStats.questionsAttempted,
          correct_answers: sessionStats.correctAnswers,
          incorrect_answers: sessionStats.incorrectAnswers,
          session_duration_seconds: Math.round(sessionDuration),
          score: sessionStats.totalScore,
          timestamp: new Date().toISOString()
        }
      }

      LocalStorageManager.saveExerciseResult(exerciseResult)
      console.log('Mantık Dizileri - Seans verileri kaydedildi:', exerciseResult)
    }
    onBack()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950'
      case 'Orta': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950'
      case 'Zor': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950'
      default: return 'text-muted-foreground'
    }
  }

  const accuracyPercentage = sessionStats.questionsAttempted > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAttempted) * 100) 
    : 0

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p>Soru yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleEndSession}
              className="gap-2 hover:bg-muted/80"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2">
                <Target className="w-4 h-4" />
                {sessionStats.questionsAttempted} Soru
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Trophy className="w-4 h-4" />
                {sessionStats.totalScore} Puan
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-2">{sessionStats.correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Doğru Cevap</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-destructive mb-2">{sessionStats.incorrectAnswers}</div>
              <div className="text-sm text-muted-foreground">Yanlış Cevap</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-success mb-2">{accuracyPercentage}%</div>
              <div className="text-sm text-muted-foreground">Başarı Oranı</div>
            </CardContent>
          </Card>
        </div>

        {/* Ana Oyun Kartı */}
        <Card className="mx-auto max-w-2xl shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Mantık Dizileri</CardTitle>
                <CardDescription>Dizideki örüntüyü bulun ve tamamlayın</CardDescription>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Badge className={getDifficultyColor(currentProblem.difficulty)}>
                {currentProblem.difficulty}
              </Badge>
              <Badge variant="outline">{currentProblem.patternType}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Dizi Gösterimi */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-4">Dizinin devamını bulun:</div>
              <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
                {currentProblem.sequence.map((num, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-primary/10 border-2 border-primary/20 rounded-xl flex items-center justify-center text-xl font-bold text-primary"
                  >
                    {num}
                  </div>
                ))}
                <div className="w-16 h-16 bg-muted border-2 border-dashed border-muted-foreground/30 rounded-xl flex items-center justify-center text-xl font-bold text-muted-foreground">
                  ?
                </div>
              </div>
            </div>

            {/* Cevap Girişi */}
            {!showFeedback && (
              <div className="space-y-4">
                <div className="text-center">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Cevabınızı girin:
                  </label>
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Sayı girin..."
                    className="w-32 h-12 text-center text-xl font-bold mx-auto"
                    autoFocus
                  />
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={handleAnswerSubmit}
                    disabled={userAnswer.trim() === ''}
                    className="px-8 py-3 text-lg"
                  >
                    Cevabı Kontrol Et
                  </Button>
                </div>
              </div>
            )}

            {/* Geri Bildirim */}
            {showFeedback && (
              <div className={`text-center p-6 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <X className="w-8 h-8 text-red-600" />
                  )}
                  <div className="text-xl font-bold">
                    {isCorrect ? 'Doğru!' : 'Yanlış!'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    Doğru cevap: {currentProblem.correctAnswer}
                  </div>
                  <div className="text-muted-foreground">
                    {currentProblem.explanation}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sonraki Soru Bilgisi */}
        {showFeedback && (
          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Sonraki soru 2 saniye içinde yüklenecek...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MantikDizileriSayfasi
