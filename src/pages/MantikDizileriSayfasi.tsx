
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Brain, CheckCircle, X, Trophy, Clock, Target, Zap, Lightbulb, Star } from 'lucide-react'
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

    // 2.5 saniye sonra yeni soru
    setTimeout(() => {
      getNewProblem()
    }, 2500)
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
      case 'Kolay': return 'text-success bg-success/10 border-success/20'
      case 'Orta': return 'text-warning bg-warning/10 border-warning/20'
      case 'Zor': return 'text-destructive bg-destructive/10 border-destructive/20'
      default: return 'text-muted-foreground bg-muted/10 border-border'
    }
  }

  const getPatternIcon = (patternType: string) => {
    if (patternType.includes('Fibonacci')) return '🌀'
    if (patternType.includes('Geometrik')) return '📈'
    if (patternType.includes('Aritmetik')) return '➕'
    if (patternType.includes('Kare')) return '⬜'
    if (patternType.includes('Küp')) return '🧊'
    return '🔢'
  }

  const accuracyPercentage = sessionStats.questionsAttempted > 0 
    ? Math.round((sessionStats.correctAnswers / sessionStats.questionsAttempted) * 100) 
    : 0

  if (!currentProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-lg font-medium text-foreground">Soru hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
      {/* Header - Tutarlı tasarım */}
      <div className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={handleEndSession}
                className="gap-2 hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri Dön
              </Button>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Mantık Dizileri</h1>
                  <p className="text-sm text-muted-foreground">Sayısal örüntü tanıma</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2 hidden sm:flex">
                <Target className="w-3 h-3" />
                {sessionStats.questionsAttempted} Soru
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Trophy className="w-3 h-3" />
                {sessionStats.totalScore} Puan
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* İstatistik Kartları - Kompakt ve tutarlı */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-success mb-1">{sessionStats.correctAnswers}</div>
              <div className="text-xs text-muted-foreground">Doğru</div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-destructive mb-1">{sessionStats.incorrectAnswers}</div>
              <div className="text-xs text-muted-foreground">Yanlış</div>
            </CardContent>
          </Card>
          
          <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-primary mb-1">{accuracyPercentage}%</div>
              <div className="text-xs text-muted-foreground">Başarı</div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-amber-600 mb-1">{sessionStats.totalScore}</div>
              <div className="text-xs text-muted-foreground">Toplam</div>
            </CardContent>
          </Card>
        </div>

        {/* Ana Oyun Kartı - Cilalı tasarım */}
        <Card className="mx-auto max-w-2xl shadow-xl bg-background/95 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-2xl">{getPatternIcon(currentProblem.patternType)}</div>
              <div>
                <CardTitle className="text-xl">Dizinin Devamını Bulun</CardTitle>
                <CardDescription>Örüntüyü keşfedin ve tamamlayın</CardDescription>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge className={`${getDifficultyColor(currentProblem.difficulty)} font-medium px-3 py-1`}>
                {currentProblem.difficulty}
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {currentProblem.patternType}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Dizi Gösterimi - Geliştirilmiş animasyonlar */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span>Dizinin mantığını bulun:</span>
              </div>
              <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                {currentProblem.sequence.map((num, index) => (
                  <div
                    key={index}
                    className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 rounded-xl flex items-center justify-center text-lg font-bold text-primary shadow-sm transition-all duration-300 hover:scale-105 animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {num}
                  </div>
                ))}
                <div className="w-14 h-14 bg-gradient-to-br from-muted to-muted/50 border-2 border-dashed border-muted-foreground/40 rounded-xl flex items-center justify-center text-xl font-bold text-muted-foreground animate-pulse">
                  ?
                </div>
              </div>
            </div>

            {/* Cevap Girişi - Tutarlı kontroller */}
            {!showFeedback && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    Cevabınızı girin:
                  </label>
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Sayı girin..."
                    className="w-40 h-12 text-center text-xl font-bold mx-auto border-2 focus:border-primary transition-colors"
                    autoFocus
                  />
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={handleAnswerSubmit}
                    disabled={userAnswer.trim() === ''}
                    className="px-8 py-3 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Kontrol Et
                  </Button>
                </div>
              </div>
            )}

            {/* Geri Bildirim - Geliştirilmiş görsel feedback */}
            {showFeedback && (
              <div className={`text-center p-6 rounded-xl border-2 transition-all duration-500 animate-scale-in ${
                isCorrect 
                  ? 'bg-success/10 border-success/30 text-success' 
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
              }`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-success animate-bounce" />
                  ) : (
                    <X className="w-8 h-8 text-destructive animate-pulse" />
                  )}
                  <div className="text-xl font-bold">
                    {isCorrect ? '🎉 Harika!' : '😔 Yanlış!'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-lg font-semibold">
                    Doğru cevap: <span className="text-primary">{currentProblem.correctAnswer}</span>
                  </div>
                  <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                    <strong>Açıklama:</strong> {currentProblem.explanation}
                  </div>
                  
                  {isCorrect && (
                    <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                      <Star className="w-4 h-4" />
                      <span>+{Math.max(100 - Math.floor((Date.now() - questionStartTime) / 1000), 10)} puan!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sonraki Soru Bilgisi - Tutarlı bilgilendirme */}
        {showFeedback && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Yeni soru 2.5 saniye içinde gelecek...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MantikDizileriSayfasi
