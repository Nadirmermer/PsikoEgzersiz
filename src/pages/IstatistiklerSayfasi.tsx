import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocalStorageManager, ExerciseResult } from '../utils/localStorage'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, Clock, Trophy, Target, Brain, User, Trash2, Download, Zap, Award, Star, Layers, Filter, Calendar, Gauge, CheckCircle, XCircle } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'

const IstatistiklerSayfasi: React.FC = () => {
  const { playSound } = useAudio()
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([])
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState<string>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all')
  const { professional } = useAuth()

  useEffect(() => {
    const results = LocalStorageManager.getExerciseResults()
    setExerciseResults(results)
  }, [])

  // Filter exercises based on selected filters
  const filteredResults = exerciseResults.filter(result => {
    let matchesExercise = true
    let matchesTime = true

    if (selectedExerciseFilter !== 'all') {
      matchesExercise = result.exerciseName === selectedExerciseFilter
    }

    if (selectedTimeRange !== 'all') {
      const resultDate = new Date(result.date)
      const now = new Date()
      const daysDiff = (now.getTime() - resultDate.getTime()) / (1000 * 3600 * 24)
      
      switch (selectedTimeRange) {
        case '7days':
          matchesTime = daysDiff <= 7
          break
        case '30days':
          matchesTime = daysDiff <= 30
          break
        case '90days':
          matchesTime = daysDiff <= 90
          break
      }
    }

    return matchesExercise && matchesTime
  })

  // Exercise type specific results
  const memoryGameResults = filteredResults.filter(result => result.exerciseName === 'Hafıza Oyunu')
  const towerOfLondonResults = filteredResults.filter(result => result.exerciseName === 'Londra Kulesi Testi')
  const imageWordResults = filteredResults.filter(result => result.exerciseName === 'Resim-Kelime Eşleştirme')
  const wordImageResults = filteredResults.filter(result => result.exerciseName === 'Kelime-Resim Eşleştirme')
  const numberSequenceResults = filteredResults.filter(result => result.exerciseName === 'Sayı Dizisi Takibi')
  const colorSequenceResults = filteredResults.filter(result => result.exerciseName === 'Renk Dizisi Takibi')
  const wordCircleResults = filteredResults.filter(result => result.exerciseName === 'Kelime Çemberi Bulmacası')
  const logicSequenceResults = filteredResults.filter(result => result.exerciseName === 'Mantık Dizileri')

  const totalExercises = filteredResults.length
  
  // Enhanced statistics
  const completedExercises = filteredResults.filter(result => result.completed === true).length
  const exitedEarlyCount = filteredResults.filter(result => result.exitedEarly === true).length
  const completionRate = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
  const averageScore = totalExercises > 0 
    ? (filteredResults.reduce((sum, result) => sum + result.score, 0) / totalExercises).toFixed(1)
    : '0'
  const totalTime = filteredResults.reduce((sum, result) => sum + result.duration, 0)
  const highestScore = totalExercises > 0 
    ? Math.max(...filteredResults.map(result => result.score))
    : 0

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}s ${minutes}d ${secs}sn`
    } else if (minutes > 0) {
      return `${minutes}d ${secs}sn`
    } else {
      return `${secs}sn`
    }
  }

  const clearData = () => {
    playSound('button-click')
    
    // 🔧 FIX: Comprehensive data clearing
    LocalStorageManager.clearExerciseResults()
    
    // Reset state immediately
    setExerciseResults([])
    
    // Clear any cached data
    localStorage.removeItem('exerciseResults')
    localStorage.removeItem('uploadedResults')
    localStorage.removeItem('currentMemoryGameLevel')
    
    // Force refresh of statistics
    window.location.reload()
    
    console.log('All exercise data cleared successfully')
  }

  // Exercise distribution for pie chart
  const exerciseDistribution = [
    { name: 'Hafıza Oyunu', count: memoryGameResults.length, color: '#3B82F6' },
    { name: 'Londra Kulesi', count: towerOfLondonResults.length, color: '#8B5CF6' },
    { name: 'Resim-Kelime', count: imageWordResults.length, color: '#10B981' },
    { name: 'Kelime-Resim', count: wordImageResults.length, color: '#F59E0B' },
    { name: 'Sayı Dizisi', count: numberSequenceResults.length, color: '#EF4444' },
    { name: 'Renk Dizisi', count: colorSequenceResults.length, color: '#06B6D4' },
    { name: 'Kelime Çemberi', count: wordCircleResults.length, color: '#84CC16' },
    { name: 'Mantık Dizileri', count: logicSequenceResults.length, color: '#F97316' }
  ].filter(item => item.count > 0)

  // Memory Game specific analytics - 🧠 CLINICAL ENHANCEMENT
  const prepareMemoryGameAnalytics = () => {
    if (memoryGameResults.length === 0) return null

    const levelPerformance = memoryGameResults.reduce((acc, result) => {
      const level = result.details?.level_identifier || 'Bilinmiyor'
      if (!acc[level]) {
        acc[level] = { 
          scores: [], 
          times: [], 
          moves: [], 
          incorrectMoves: [],
          // 🧠 Clinical metrics
          clinicalScores: [],
          accuracyScores: [],
          efficiencyScores: [],
          speedScores: [],
          workingMemoryScores: [],
          clinicalInsights: []
        }
      }
      acc[level].scores.push(result.score)
      acc[level].times.push(result.duration)
      acc[level].moves.push(result.details?.moves_count || 0)
      acc[level].incorrectMoves.push(result.details?.incorrect_moves_count || 0)
      
      // 🧠 Add clinical data if available
      if (result.details?.clinical_scores) {
        acc[level].clinicalScores.push(result.details.clinical_scores.total_score)
        acc[level].accuracyScores.push(result.details.clinical_scores.accuracy_score)
        acc[level].efficiencyScores.push(result.details.clinical_scores.efficiency_score)
        acc[level].speedScores.push(result.details.clinical_scores.speed_score)
        acc[level].workingMemoryScores.push(result.details.clinical_scores.working_memory_score)
      }
      
      if (result.details?.clinical_insights) {
        acc[level].clinicalInsights.push(...result.details.clinical_insights)
      }
      
      return acc
    }, {} as Record<string, { 
      scores: number[], 
      times: number[], 
      moves: number[], 
      incorrectMoves: number[],
      clinicalScores: number[],
      accuracyScores: number[],
      efficiencyScores: number[],
      speedScores: number[],
      workingMemoryScores: number[],
      clinicalInsights: string[]
    }>)

    return Object.entries(levelPerformance).map(([level, data]) => ({
      level,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      avgTime: Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length),
      avgMoves: Math.round(data.moves.reduce((a, b) => a + b, 0) / data.moves.length),
      avgIncorrectMoves: Math.round(data.incorrectMoves.reduce((a, b) => a + b, 0) / data.incorrectMoves.length),
      playCount: data.scores.length,
      // 🧠 Clinical analytics
      avgClinicalScore: data.clinicalScores.length > 0 ? Math.round(data.clinicalScores.reduce((a, b) => a + b, 0) / data.clinicalScores.length) : null,
      avgAccuracyScore: data.accuracyScores.length > 0 ? Math.round(data.accuracyScores.reduce((a, b) => a + b, 0) / data.accuracyScores.length) : null,
      avgEfficiencyScore: data.efficiencyScores.length > 0 ? Math.round(data.efficiencyScores.reduce((a, b) => a + b, 0) / data.efficiencyScores.length) : null,
      avgSpeedScore: data.speedScores.length > 0 ? Math.round(data.speedScores.reduce((a, b) => a + b, 0) / data.speedScores.length) : null,
      avgWorkingMemoryScore: data.workingMemoryScores.length > 0 ? Math.round(data.workingMemoryScores.reduce((a, b) => a + b, 0) / data.workingMemoryScores.length) : null,
      topClinicalInsights: [...new Set(data.clinicalInsights)].slice(0, 3) // Unique insights, top 3
    }))
  }

  // Tower of London specific analytics
  const prepareTowerAnalytics = () => {
    if (towerOfLondonResults.length === 0) return null

    const levelPerformance = towerOfLondonResults.reduce((acc, result) => {
      const level = result.details?.level_identifier || 'Bilinmiyor'
      if (!acc[level]) {
        acc[level] = { scores: [], times: [], efficiency: [], optimalCount: 0, totalCount: 0 }
      }
      acc[level].scores.push(result.score)
      acc[level].times.push(result.duration)
      acc[level].efficiency.push(result.details?.efficiency_percentage || 0)
      if (result.details?.completed_optimally) acc[level].optimalCount++
      acc[level].totalCount++
      return acc
    }, {} as Record<string, { scores: number[], times: number[], efficiency: number[], optimalCount: number, totalCount: number }>)

    return Object.entries(levelPerformance).map(([level, data]) => ({
      level,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      avgTime: Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length),
      avgEfficiency: Math.round(data.efficiency.reduce((a, b) => a + b, 0) / data.efficiency.length),
      optimalRate: Math.round((data.optimalCount / data.totalCount) * 100),
      playCount: data.scores.length
    }))
  }

  // Sequence exercises analytics
  const prepareSequenceAnalytics = (results: ExerciseResult[], exerciseName: string) => {
    if (results.length === 0) return null

    const levelPerformance = results.reduce((acc, result) => {
      const level = result.details?.max_sequence_length || result.details?.level || 1
      if (!acc[level]) {
        acc[level] = { scores: [], times: [], attempts: 0 }
      }
      acc[level].scores.push(result.score)
      acc[level].times.push(result.duration)
      acc[level].attempts++
      return acc
    }, {} as Record<number, { scores: number[], times: number[], attempts: number }>)

    return Object.entries(levelPerformance).map(([level, data]) => ({
      level: `Seviye ${level}`,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      avgTime: Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length),
      attempts: data.attempts,
      maxLevel: parseInt(level)
    })).sort((a, b) => a.maxLevel - b.maxLevel)
  }

  // Image-Word Matching specific analytics - 🧠 CLINICAL ENHANCEMENT  
  const prepareImageWordAnalytics = () => {
    if (imageWordResults.length === 0) return null

    const analytics = imageWordResults.reduce((acc, result) => {
      acc.games.push(result)
      acc.scores.push(result.score)
      acc.accuracies.push(result.details?.accuracy || result.score || 0)
      acc.durations.push(result.duration || 0)
      
      // 🧠 Clinical data processing
      if (result.details?.clinicalData) {
        const clinical = result.details.clinicalData
        acc.clinicalScores.push(clinical.overallCognition || 0)
        acc.semanticAccuracy.push(clinical.semanticAccuracy || 0)
        acc.processingSpeed.push(clinical.processingSpeed || 0)
        acc.patternRecognition.push(clinical.patternRecognition || 0)
        acc.cognitiveFlexibility.push(clinical.cognitiveFlexibility || 0)
        
        // Category performance aggregation
        if (clinical.categoryPerformance) {
          Object.entries(clinical.categoryPerformance).forEach(([category, perf]: [string, any]) => {
            if (!acc.categoryPerformance[category]) {
              acc.categoryPerformance[category] = {
                accuracies: [],
                responseTimes: [],
                questionCounts: []
              }
            }
            acc.categoryPerformance[category].accuracies.push(perf.accuracy || 0)
            acc.categoryPerformance[category].responseTimes.push(perf.averageResponseTime || 0)
            acc.categoryPerformance[category].questionCounts.push(perf.questionsAsked || 0)
          })
        }
        
        // Cognitive insights
        if (clinical.cognitiveProfile?.recommendedInterventions) {
          acc.clinicalInsights.push(...clinical.cognitiveProfile.recommendedInterventions)
        }
        if (clinical.cognitiveProfile?.clinicalNotes) {
          acc.clinicalInsights.push(...clinical.cognitiveProfile.clinicalNotes)
        }
      }
      
      return acc
    }, {
      games: [] as ExerciseResult[],
      scores: [] as number[],
      accuracies: [] as number[],
      durations: [] as number[],
      // 🧠 Clinical metrics
      clinicalScores: [] as number[],
      semanticAccuracy: [] as number[],
      processingSpeed: [] as number[],
      patternRecognition: [] as number[],
      cognitiveFlexibility: [] as number[],
      categoryPerformance: {} as Record<string, {
        accuracies: number[],
        responseTimes: number[],
        questionCounts: number[]
      }>,
      clinicalInsights: [] as string[]
    })

    // Calculate statistics
    const avgScore = analytics.scores.length > 0 ? Math.round(analytics.scores.reduce((a, b) => a + b, 0) / analytics.scores.length) : 0
    const avgAccuracy = analytics.accuracies.length > 0 ? Math.round(analytics.accuracies.reduce((a, b) => a + b, 0) / analytics.accuracies.length) : 0
    const avgDuration = analytics.durations.length > 0 ? Math.round(analytics.durations.reduce((a, b) => a + b, 0) / analytics.durations.length) : 0
    
    // 🧠 Clinical analytics
    const avgClinicalScore = analytics.clinicalScores.length > 0 ? Math.round(analytics.clinicalScores.reduce((a, b) => a + b, 0) / analytics.clinicalScores.length) : null
    const avgSemanticAccuracy = analytics.semanticAccuracy.length > 0 ? Math.round(analytics.semanticAccuracy.reduce((a, b) => a + b, 0) / analytics.semanticAccuracy.length) : null
    const avgProcessingSpeed = analytics.processingSpeed.length > 0 ? Math.round(analytics.processingSpeed.reduce((a, b) => a + b, 0) / analytics.processingSpeed.length) : null
    const avgPatternRecognition = analytics.patternRecognition.length > 0 ? Math.round(analytics.patternRecognition.reduce((a, b) => a + b, 0) / analytics.patternRecognition.length) : null
    const avgCognitiveFlexibility = analytics.cognitiveFlexibility.length > 0 ? Math.round(analytics.cognitiveFlexibility.reduce((a, b) => a + b, 0) / analytics.cognitiveFlexibility.length) : null
    
    // Category performance summary
    const categoryStats = Object.entries(analytics.categoryPerformance).map(([category, perf]) => ({
      category,
      avgAccuracy: perf.accuracies.length > 0 ? Math.round(perf.accuracies.reduce((a, b) => a + b, 0) / perf.accuracies.length) : 0,
      avgResponseTime: perf.responseTimes.length > 0 ? Math.round(perf.responseTimes.reduce((a, b) => a + b, 0) / perf.responseTimes.length) : 0,
      totalQuestions: perf.questionCounts.reduce((a, b) => a + b, 0)
    })).filter(stat => stat.totalQuestions > 0).sort((a, b) => b.avgAccuracy - a.avgAccuracy)
    
    return {
      totalGames: analytics.games.length,
      avgScore,
      avgAccuracy,
      avgDuration,
      // 🧠 Clinical metrics
      avgClinicalScore,
      avgSemanticAccuracy,
      avgProcessingSpeed,
      avgPatternRecognition,
      avgCognitiveFlexibility,
      categoryStats,
      topClinicalInsights: [...new Set(analytics.clinicalInsights)].slice(0, 5), // Unique insights, top 5
      // Chart data for category performance
      categoryChartData: categoryStats.map((stat, index) => ({
        name: stat.category,
        accuracy: stat.avgAccuracy,
        responseTime: Math.max(1, Math.round(stat.avgResponseTime / 100)), // Scale down for chart
        questions: stat.totalQuestions,
        fill: `hsl(${200 + (index * 40)}, 70%, 50%)` // Dynamic colors
      }))
    }
  }

  const memoryAnalytics = prepareMemoryGameAnalytics()
  const towerAnalytics = prepareTowerAnalytics()
  const numberSequenceAnalytics = prepareSequenceAnalytics(numberSequenceResults, 'Sayı Dizisi Takibi')
  const colorSequenceAnalytics = prepareSequenceAnalytics(colorSequenceResults, 'Renk Dizisi Takibi')
  const imageWordAnalytics = prepareImageWordAnalytics()

  const chartConfig = {
    skor: { label: "Skor", color: "hsl(var(--primary))" },
    sure: { label: "Süre (sn)", color: "hsl(var(--chart-2))" },
    verimlilik: { label: "Verimlilik (%)", color: "hsl(var(--chart-3))" },
    hamle: { label: "Hamle", color: "hsl(var(--chart-4))" },
  }

  const stats = [
    {
      title: 'Toplam Egzersiz',
      value: totalExercises.toString(),
      description: selectedExerciseFilter === 'all' ? 'Başlatılan egzersiz sayısı' : `${selectedExerciseFilter} egzersizi`,
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      title: 'Tamamlanan',
      value: completedExercises.toString(),
      description: `%${completionRate} tamamlanma oranı`,
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      title: 'Ortalama Skor',
      value: averageScore,
      description: 'Performans ortalaması',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      title: 'En Yüksek Skor',
      value: highestScore.toString(),
      description: 'En iyi performans',
      icon: Trophy,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      title: 'Toplam Süre',
      value: formatTime(totalTime),
      description: 'Egzersizlerde geçirilen süre',
      icon: Clock,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30'
    },
    {
      title: 'Erken Çıkış',
      value: exitedEarlyCount.toString(),
      description: 'Yarıda bırakılan egzersizler',
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    }
  ]

  const exerciseTypeSummary = [
    {
      name: 'Hafıza Oyunu',
      count: memoryGameResults.length,
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      name: 'Londra Kulesi',
      count: towerOfLondonResults.length,
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      name: 'Resim-Kelime',
      count: imageWordResults.length,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      name: 'Kelime-Resim',
      count: wordImageResults.length,
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="relative px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full border border-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight px-4">
                İstatistikler
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-6 leading-relaxed">
                Egzersiz performansınızı analiz edin ve <span className="font-medium text-primary">gelişiminizi takip edin</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card className="card-enhanced">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Egzersiz Türü
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedExerciseFilter} onValueChange={setSelectedExerciseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Egzersiz türü seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Egzersizler</SelectItem>
                <SelectItem value="Hafıza Oyunu">Hafıza Oyunu</SelectItem>
                <SelectItem value="Londra Kulesi Testi">Londra Kulesi Testi</SelectItem>
                <SelectItem value="Resim-Kelime Eşleştirme">Resim-Kelime Eşleştirme</SelectItem>
                <SelectItem value="Kelime-Resim Eşleştirme">Kelime-Resim Eşleştirme</SelectItem>
                <SelectItem value="Sayı Dizisi Takibi">Sayı Dizisi Takibi</SelectItem>
                <SelectItem value="Renk Dizisi Takibi">Renk Dizisi Takibi</SelectItem>
                <SelectItem value="Kelime Çemberi Bulmacası">Kelime Çemberi Bulmacası</SelectItem>
                <SelectItem value="Mantık Dizileri">Mantık Dizileri</SelectItem>
                <SelectItem value="Hanoi Kuleleri">Hanoi Kuleleri</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Zaman Aralığı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Zaman aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="7days">Son 7 Gün</SelectItem>
                <SelectItem value="30days">Son 30 Gün</SelectItem>
                <SelectItem value="90days">Son 90 Gün</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="card-enhanced hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className={`absolute inset-0 ${stat.bgColor} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
              <CardHeader className="pb-3 relative">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-background/80 shadow-sm`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {index === 2 && highestScore > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                      <Star className="w-3 h-3 mr-1" />
                      Rekor
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
                  {stat.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {stat.title}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalExercises === 0 ? (
        <Card className="card-enhanced">
          <CardContent className="text-center py-16">
            <div className="w-24 h-24 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">
              {selectedExerciseFilter === 'all' 
                ? 'Henüz egzersiz yapmadınız' 
                : `${selectedExerciseFilter} egzersizi için veri bulunamadı`
              }
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {selectedExerciseFilter === 'all'
                ? 'İlk egzersiznizi tamamladığınızda performans istatistikleriniz burada görünecek'
                : 'Bu egzersizi oynadığınızda detaylı analizler burada görünecek'
              }
            </p>
            <Badge variant="outline" className="text-sm px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Egzersizlere başlayın
            </Badge>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 p-1 bg-muted/50 h-auto sm:h-12">
            <TabsTrigger value="overview" className="font-semibold text-xs sm:text-sm p-2 sm:p-3">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Genel Bakış</span>
              <span className="sm:hidden">Genel</span>
            </TabsTrigger>
            <TabsTrigger value="specific" className="font-semibold text-xs sm:text-sm p-2 sm:p-3">
              <Gauge className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Özel Analizler</span>
              <span className="sm:hidden">Analiz</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="font-semibold text-xs sm:text-sm p-2 sm:p-3">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Grafikler</span>
              <span className="sm:hidden">Grafik</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="font-semibold text-xs sm:text-sm p-2 sm:p-3">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Detaylar</span>
              <span className="sm:hidden">Detay</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Exercise Distribution */}
            {exerciseDistribution.length > 1 && selectedExerciseFilter === 'all' && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    Egzersiz Dağılımı
                  </CardTitle>
                  <CardDescription className="text-base">
                    Hangi egzersizleri ne sıklıkla oynadığınız
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-6">
                    {/* Mobile ve Desktop için farklı düzen */}
                    <div className="block lg:hidden">
                      {/* Mobile: Liste üstte, chart altta */}
                      <div className="space-y-2 mb-6">
                        {exerciseDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium text-sm truncate">{item.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">{item.count} oyun</Badge>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={exerciseDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="count"
                              >
                                {exerciseDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>

                    {/* Desktop: Yan yana */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                      <div>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={exerciseDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="count"
                              >
                                {exerciseDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                      <div className="space-y-3">
                        {exerciseDistribution.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">{item.count} oyun</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Exercises */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  Son Egzersizler
                </CardTitle>
                <CardDescription className="text-base">
                  En son tamamladığınız egzersizlerin detayları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredResults.slice(-5).reverse().map((result, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gradient-to-r from-muted/20 to-muted/10 rounded-xl border border-border/30 hover:shadow-sm transition-all duration-300 gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                          {result.exerciseName === 'Hafıza Oyunu' && <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                          {result.exerciseName === 'Londra Kulesi Testi' && <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Eşleştirme') && <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Dizisi') && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Çemberi') && <Award className="w-4 h-4 sm:w-5 sm:h-5 text-lime-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Mantık') && <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            {typeof result.exerciseName === 'string' 
                              ? result.exerciseName 
                              : (result.exerciseName as any)?.exerciseName || 'Bilinmeyen Egzersiz'
                            }
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 sm:gap-3">
                            <span>{new Date(result.date).toLocaleDateString('tr-TR')}</span>
                            <span>•</span>
                            <span className="truncate">{result.details?.level_identifier || 'Detay Yok'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right sm:text-right flex-shrink-0">
                        <div className="font-bold text-base sm:text-lg text-primary">{result.score} puan</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {formatTime(result.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specific" className="space-y-8">
            {/* Memory Game Specific Analytics */}
            {memoryAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Hafıza Oyunu') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    Hafıza Oyunu - Detaylı Analiz
                  </CardTitle>
                  <CardDescription className="text-base">
                    Seviye bazında performans ve hamle analizi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={memoryAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="avgScore" fill="#3B82F6" name="Ortalama Skor" />
                        <Bar dataKey="avgMoves" fill="#10B981" name="Ortalama Hamle" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {memoryAnalytics.map((level, index) => (
                      <div key={index} className="p-3 sm:p-4 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl border border-border/50">
                        <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-sm sm:text-base">{level.level}</div>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <div>Ortalama Skor: <span className="font-bold">{level.avgScore}</span></div>
                          <div>Ortalama Süre: <span className="font-bold">{level.avgTime}s</span></div>
                          <div>Ortalama Hamle: <span className="font-bold">{level.avgMoves}</span></div>
                          <div>Hata Oranı: <span className="font-bold">{level.avgIncorrectMoves}</span></div>
                          
                          {/* 🧠 Clinical Data Display */}
                          {level.avgClinicalScore && (
                            <>
                              <div className="border-t border-blue-200/50 dark:border-blue-700/50 pt-2 mt-2">
                                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Klinik Analiz:</div>
                                <div>Doğruluk: <span className="font-bold text-green-600">{level.avgAccuracyScore}%</span></div>
                                <div>Verimlilik: <span className="font-bold text-purple-600">{level.avgEfficiencyScore}%</span></div>
                                <div>Hız: <span className="font-bold text-orange-600">{level.avgSpeedScore}%</span></div>
                                <div>Bellek: <span className="font-bold text-blue-600">{level.avgWorkingMemoryScore}%</span></div>
                              </div>
                              
                              {level.topClinicalInsights && level.topClinicalInsights.length > 0 && (
                                <div className="border-t border-blue-200/50 dark:border-blue-700/50 pt-2 mt-2">
                                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Öngörüler:</div>
                                  {level.topClinicalInsights.map((insight, idx) => (
                                    <div key={idx} className="text-xs text-blue-700 dark:text-blue-300 mb-1 leading-tight">
                                      • {insight}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                          
                          <Badge variant="outline" className="text-xs mt-2">{level.playCount} oyun</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tower of London Specific Analytics */}
            {towerAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Londra Kulesi Testi') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    Londra Kulesi - Detaylı Analiz
                  </CardTitle>
                  <CardDescription className="text-base">
                    Seviye bazında verimlilik ve optimal çözüm analizi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={towerAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="avgEfficiency" fill="#8B5CF6" name="Ortalama Verimlilik %" />
                        <Bar dataKey="optimalRate" fill="#10B981" name="Optimal Çözüm %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {towerAnalytics.map((level, index) => (
                      <div key={index} className="p-4 bg-purple-50/30 dark:bg-purple-950/20 rounded-xl border border-border/50">
                        <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">{level.level}</div>
                        <div className="space-y-2 text-sm">
                          <div>Ortalama Skor: <span className="font-bold">{level.avgScore}</span></div>
                          <div>Ortalama Süre: <span className="font-bold">{level.avgTime}s</span></div>
                          <div>Verimlilik: <span className="font-bold text-purple-600">{level.avgEfficiency}%</span></div>
                          <div>Optimal Çözüm: <span className="font-bold text-green-600">{level.optimalRate}%</span></div>
                          <Badge variant="outline" className="text-xs">{level.playCount} oyun</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image-Word Matching Specific Analytics - 🧠 CLINICAL ENHANCEMENT */}
            {imageWordAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Resim-Kelime Eşleştirme') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    Resim-Kelime Eşleştirme - Klinik Analiz
                  </CardTitle>
                  <CardDescription className="text-base">
                    Kategori bazında semantic memory performansı ve bilişsel değerlendirme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 🧠 Clinical Metrics Overview */}
                  {imageWordAnalytics.avgClinicalScore && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                      <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{imageWordAnalytics.avgClinicalScore}%</div>
                        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Genel Bilişsel Skor</div>
                      </div>
                      <div className="p-4 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{imageWordAnalytics.avgSemanticAccuracy}%</div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Semantic Doğruluk</div>
                      </div>
                      <div className="p-4 bg-purple-50/30 dark:bg-purple-950/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{imageWordAnalytics.avgProcessingSpeed}%</div>
                        <div className="text-sm font-medium text-purple-700 dark:text-purple-300">İşleme Hızı</div>
                      </div>
                      <div className="p-4 bg-orange-50/30 dark:bg-orange-950/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{imageWordAnalytics.avgPatternRecognition}%</div>
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Patern Tanıma</div>
                      </div>
                    </div>
                  )}

                  {/* Category Performance Chart */}
                  {imageWordAnalytics.categoryChartData && imageWordAnalytics.categoryChartData.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Kategori Bazında Performans
                      </h4>
                      <ChartContainer config={chartConfig} className="h-[300px] sm:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={imageWordAnalytics.categoryChartData} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                            <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="accuracy" fill="#10B981" name="Doğruluk %" />
                            <Bar dataKey="responseTime" fill="#F59E0B" name="Tepki Süresi (x100ms)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  )}

                  {/* Category Performance Grid */}
                  {imageWordAnalytics.categoryStats && imageWordAnalytics.categoryStats.length > 0 && (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                      {imageWordAnalytics.categoryStats.map((category, index) => (
                        <div key={index} className="p-3 sm:p-4 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border border-border/50">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2 text-sm sm:text-base">{category.category}</div>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                              <span>Doğruluk:</span>
                              <span className="font-bold text-emerald-600">{category.avgAccuracy}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tepki Süresi:</span>
                              <span className="font-bold text-blue-600">{category.avgResponseTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Soru Sayısı:</span>
                              <span className="font-bold text-purple-600">{category.totalQuestions}</span>
                            </div>
                            
                            {/* Performance indicator */}
                            <div className="mt-2 pt-2 border-t border-border/30">
                              {category.avgAccuracy >= 80 ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                  ⭐ Güçlü Alan
                                </Badge>
                              ) : category.avgAccuracy >= 60 ? (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                  ⚠️ Orta Seviye
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                  🎯 Gelişim Alanı
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🧠 Clinical Insights */}
                  {imageWordAnalytics.topClinicalInsights && imageWordAnalytics.topClinicalInsights.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <Brain className="w-5 h-5" />
                        Klinik Değerlendirme & Öneriler
                      </h4>
                      <div className="grid gap-3 sm:gap-4">
                        {imageWordAnalytics.topClinicalInsights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed">{insight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Basic Performance Stats */}
                  <div className="grid gap-4 md:grid-cols-3 mt-6 pt-6 border-t border-border/30">
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{imageWordAnalytics.totalGames}</div>
                      <div className="text-sm text-muted-foreground">Toplam Oyun</div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">{imageWordAnalytics.avgAccuracy}%</div>
                      <div className="text-sm text-muted-foreground">Ortalama Doğruluk</div>
                    </div>
                    <div className="text-center p-3 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(imageWordAnalytics.avgDuration / 60)}dk</div>
                      <div className="text-sm text-muted-foreground">Ortalama Süre</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sequence Exercises Analytics */}
            {numberSequenceAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Sayı Dizisi Takibi') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    Sayı Dizisi Takibi - İlerleme Analizi
                  </CardTitle>
                  <CardDescription className="text-base">
                    Ulaşılan maksimum seviyeler ve performans trendi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={numberSequenceAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="avgScore" stroke="#F97316" strokeWidth={3} name="Ortalama Skor" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {colorSequenceAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Renk Dizisi Takibi') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-cyan-600" />
                    </div>
                    Renk Dizisi Takibi - İlerleme Analizi
                  </CardTitle>
                  <CardDescription className="text-base">
                    Renk hafızası gelişimi ve seviye başarısı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={colorSequenceAnalytics}>
                        <defs>
                          <linearGradient id="colorSequenceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="avgScore" stroke="#06B6D4" fill="url(#colorSequenceGradient)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-8">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="text-2xl">Performans Trendi</CardTitle>
                <CardDescription className="text-base">
                  Zaman içindeki genel performans gelişimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredResults.map((result, index) => ({
                      index: index + 1,
                      skor: result.score,
                      tarih: new Date(result.date).toLocaleDateString('tr-TR')
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="skor" stroke="hsl(var(--primary))" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-8">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Target className="w-6 h-6 text-primary" />
                  Filtrelenmiş Egzersiz Sonuçları
                </CardTitle>
                <CardDescription className="text-base">
                  Seçilen kriterlere göre filtrelenmiş egzersiz detayları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border/50 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[80px]">Tarih</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[120px]">Egzersiz</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[80px]">Seviye</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[60px]">Skor</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[60px]">Süre</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm min-w-[150px]">Detay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResults.slice().reverse().map((result, index) => (
                        <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="text-xs sm:text-sm font-medium">
                            {new Date(result.date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm">
                          {typeof result.exerciseName === 'string' 
                            ? result.exerciseName 
                            : (result.exerciseName as any)?.exerciseName || 'Bilinmeyen Egzersiz'
                          }
                        </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {result.details?.level_identifier || 'Bilinmiyor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-primary text-sm sm:text-lg">{result.score}</span>
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">{formatTime(result.duration)}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {result.exerciseName === 'Hafıza Oyunu' && (
                              <span>Hamle: {result.details?.moves_count || '-'}, Hata: {result.details?.incorrect_moves_count || '-'}</span>
                            )}
                            {result.exerciseName === 'Londra Kulesi Testi' && (
                              <span>
                                Hamle: {result.details?.user_moves_taken || '-'}/{result.details?.min_moves_required || '-'}, 
                                Verimlilik: {result.details?.efficiency_percentage || '-'}%
                                {result.details?.completed_optimally && <Star className="w-3 h-3 inline ml-1 text-amber-500" />}
                              </span>
                            )}
                            {typeof result.exerciseName === 'string' && result.exerciseName.includes('Eşleştirme') && (
                              <span>Doğru: {result.details?.correct_answers || '-'}/{result.details?.total_questions || '-'}</span>
                            )}
                            {typeof result.exerciseName === 'string' && result.exerciseName.includes('Dizisi') && (
                              <span>Max Seviye: {result.details?.max_sequence_length || result.details?.level || '-'}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {professional && (
        <Card className="mt-8 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/60 dark:border-blue-800/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              Uzman Hesabı Bilgileri
            </CardTitle>
            <CardDescription className="text-base">
              Uzman hesabı detayları ve danışan bağlantı bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-muted-foreground">Uzman ID</label>
                  <div className="font-mono text-xs sm:text-sm bg-background/60 p-2 sm:p-3 rounded-lg border border-border/30 mt-1 break-all">
                    {professional.id}
                  </div>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-muted-foreground">Ad Soyad</label>
                  <div className="font-semibold text-base sm:text-lg mt-1">{professional.display_name}</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 sm:p-6 bg-background/40 rounded-xl border border-border/30">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                    Danışanlarınız bu ID'yi kullanarak verilerini sizinle paylaşabilir.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredResults.length > 0 && (
        <Card className="mt-8 border-amber-200/60 dark:border-amber-800/60 bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Trash2 className="w-6 h-6 text-amber-600" />
              </div>
              Veri Yönetimi
            </CardTitle>
            <CardDescription className="text-base">
              Yerel olarak saklanan egzersiz verilerinizi yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                variant="destructive" 
                onClick={clearData}
                className="flex-1 font-semibold text-sm sm:text-base py-2 sm:py-3"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Tüm Verileri Temizle
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold text-sm sm:text-base py-2 sm:py-3"
                disabled
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Verileri Dışa Aktar (Yakında)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 p-3 bg-background/40 rounded-lg border border-border/30">
              <strong>Uyarı:</strong> Veri temizleme işlemi geri alınamaz. Tüm egzersiz sonuçlarınız kalıcı olarak silinecektir.
            </p>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  )
}

export default IstatistiklerSayfasi
