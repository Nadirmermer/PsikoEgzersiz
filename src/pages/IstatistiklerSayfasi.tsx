import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocalStorageManager, ExerciseResult } from '../utils/localStorage'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, TrendingUp, Clock, Trophy, Target, Brain, User, Trash2, Download, Zap, Award, Star, Layers, Filter, Calendar, Gauge, CheckCircle, XCircle, ArrowRightLeft, Lightbulb, Palette, Building, Calculator, Book } from 'lucide-react'
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
  const hanoiTowersResults = filteredResults.filter(result => result.exerciseName === 'Hanoi Kuleleri')
  const imageWordResults = filteredResults.filter(result => result.exerciseName === 'Resim-Kelime Eşleştirme')
  const wordImageResults = filteredResults.filter(result => result.exerciseName === 'Kelime-Resim Eşleştirme')
  const numberSequenceResults = filteredResults.filter(result => result.exerciseName === 'Sayı Dizisi Takibi')
  const colorSequenceResults = filteredResults.filter(result => result.exerciseName === 'Renk Dizisi Takibi')

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
    { name: 'Hanoi Kuleleri', count: hanoiTowersResults.length, color: '#F59E0B' },
    { name: 'Resim-Kelime', count: imageWordResults.length, color: '#10B981' },
    { name: 'Kelime-Resim', count: wordImageResults.length, color: '#EF4444' },
    { name: 'Sayı Dizisi', count: numberSequenceResults.length, color: '#06B6D4' },
    { name: 'Renk Dizisi', count: colorSequenceResults.length, color: '#84CC16' },

    { name: 'Mantık Dizileri', count: logicSequenceResults.length, color: '#EC4899' }
  ].filter(item => item.count > 0)

  // Memory Game specific analytics - 🧠 CLINICAL ENHANCEMENT
  const prepareMemoryGameAnalytics = () => {
    if (memoryGameResults.length === 0) return null

    const levelPerformance = memoryGameResults.reduce((acc, result) => {
      const level = (result.details?.level_identifier as string) || 'Bilinmiyor'
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
      acc[level].moves.push((result.details?.moves_count as number) || 0)
      acc[level].incorrectMoves.push((result.details?.incorrect_moves_count as number) || 0)
      
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

  // Tower of London specific analytics - 🧠 EXECUTIVE FUNCTION CLINICAL ENHANCEMENT
  const prepareTowerOfLondonAnalytics = () => {
    if (towerOfLondonResults.length === 0) return null

    const analytics = towerOfLondonResults.reduce((acc, result) => {
      acc.games.push(result)
      acc.scores.push(result.score)
      acc.efficiencies.push((result.details?.efficiency_percentage as number) || 0)
      acc.durations.push(result.duration || 0)
      acc.levels.push((result.details?.level_number as number) || 1)
      
      // 🧠 Executive Function clinical data processing
      if (result.details?.clinicalData && 'executiveFunctionScore' in result.details.clinicalData) {
        const clinical = result.details.clinicalData as Record<string, unknown>
        acc.clinicalScores.push(clinical.executiveFunctionScore || 0)
        acc.planningScores.push(clinical.planningAbility || 0)
        acc.workingMemoryScores.push(clinical.workingMemoryLoad || 0)
        acc.inhibitoryScores.push(clinical.inhibitoryControl || 0)
        acc.flexibilityScores.push(clinical.cognitiveFlexibility || 0)
        acc.planningTimes.push(clinical.planningTimeSeconds || 0)
        acc.optimalSolutions.push(clinical.isOptimalSolution ? 1 : 0)
        
        // Level-based performance tracking
        const levelKey = `level_${clinical.levelCompleted}`
        if (!acc.levelPerformance[levelKey]) {
          acc.levelPerformance[levelKey] = {
            attempts: 0,
            optimalSolutions: 0,
            averageMoves: [],
            averagePlanningTime: [],
            efficiencies: []
          }
        }
        acc.levelPerformance[levelKey].attempts++
        if (clinical.isOptimalSolution) acc.levelPerformance[levelKey].optimalSolutions++
        acc.levelPerformance[levelKey].averageMoves.push(clinical.totalMoves)
        acc.levelPerformance[levelKey].averagePlanningTime.push(clinical.planningTimeSeconds)
        acc.levelPerformance[levelKey].efficiencies.push(clinical.efficiencyPercentage)
        
        // Executive function insights based on performance
        if (clinical.planningAbility >= 80) {
          acc.clinicalInsights.push("Excellent planning and foresight abilities")
        }
        if (clinical.workingMemoryLoad >= 85) {
          acc.clinicalInsights.push("Strong working memory capacity")
        }
        if (clinical.inhibitoryControl >= 80) {
          acc.clinicalInsights.push("Good impulse control and response inhibition")
        }
        if (clinical.cognitiveFlexibility >= 75) {
          acc.clinicalInsights.push("Adaptive problem-solving approach")
        }
        if (clinical.isOptimalSolution) {
          acc.clinicalInsights.push("Demonstrates efficient executive planning")
        }
      }
      
      return acc
    }, {
      games: [] as ExerciseResult[],
      scores: [] as number[],
      efficiencies: [] as number[],
      durations: [] as number[],
      levels: [] as number[],
      // 🧠 Executive Function clinical metrics
      clinicalScores: [] as number[],
      planningScores: [] as number[],
      workingMemoryScores: [] as number[],
      inhibitoryScores: [] as number[],
      flexibilityScores: [] as number[],
      planningTimes: [] as number[],
      optimalSolutions: [] as number[],
      levelPerformance: {} as Record<string, {
        attempts: number,
        optimalSolutions: number,
        averageMoves: number[],
        averagePlanningTime: number[],
        efficiencies: number[]
      }>,
      clinicalInsights: [] as string[]
    })

    // Calculate comprehensive statistics
    const avgScore = analytics.scores.length > 0 ? Math.round(analytics.scores.reduce((a, b) => a + b, 0) / analytics.scores.length) : 0
    const avgEfficiency = analytics.efficiencies.length > 0 ? Math.round(analytics.efficiencies.reduce((a, b) => a + b, 0) / analytics.efficiencies.length) : 0
    const avgDuration = analytics.durations.length > 0 ? Math.round(analytics.durations.reduce((a, b) => a + b, 0) / analytics.durations.length) : 0
    const maxLevel = analytics.levels.length > 0 ? Math.max(...analytics.levels) : 0
    
    // 🧠 Executive Function clinical analytics
    const avgExecutiveFunctionScore = analytics.clinicalScores.length > 0 ? Math.round(analytics.clinicalScores.reduce((a, b) => a + b, 0) / analytics.clinicalScores.length) : null
    const avgPlanningScore = analytics.planningScores.length > 0 ? Math.round(analytics.planningScores.reduce((a, b) => a + b, 0) / analytics.planningScores.length) : null
    const avgWorkingMemoryScore = analytics.workingMemoryScores.length > 0 ? Math.round(analytics.workingMemoryScores.reduce((a, b) => a + b, 0) / analytics.workingMemoryScores.length) : null
    const avgInhibitoryScore = analytics.inhibitoryScores.length > 0 ? Math.round(analytics.inhibitoryScores.reduce((a, b) => a + b, 0) / analytics.inhibitoryScores.length) : null
    const avgFlexibilityScore = analytics.flexibilityScores.length > 0 ? Math.round(analytics.flexibilityScores.reduce((a, b) => a + b, 0) / analytics.flexibilityScores.length) : null
    const avgPlanningTime = analytics.planningTimes.length > 0 ? Math.round(analytics.planningTimes.reduce((a, b) => a + b, 0) / analytics.planningTimes.length) : null
    const optimalSolutionRate = analytics.optimalSolutions.length > 0 ? Math.round((analytics.optimalSolutions.reduce((a, b) => a + b, 0) / analytics.optimalSolutions.length) * 100) : 0
    
    // Level progression analysis
    const levelStats = Object.entries(analytics.levelPerformance).map(([level, perf]) => ({
      level: parseInt(level.replace('level_', '')),
      attempts: perf.attempts,
      optimalRate: Math.round((perf.optimalSolutions / perf.attempts) * 100),
      avgMoves: perf.averageMoves.length > 0 ? Math.round(perf.averageMoves.reduce((a, b) => a + b, 0) / perf.averageMoves.length) : 0,
      avgPlanningTime: perf.averagePlanningTime.length > 0 ? Math.round(perf.averagePlanningTime.reduce((a, b) => a + b, 0) / perf.averagePlanningTime.length) : 0,
      avgEfficiency: perf.efficiencies.length > 0 ? Math.round(perf.efficiencies.reduce((a, b) => a + b, 0) / perf.efficiencies.length) : 0
    })).sort((a, b) => a.level - b.level)
    
    return {
      totalGames: analytics.games.length,
      avgScore,
      avgEfficiency,
      avgDuration,
      maxLevel,
      // 🧠 Executive Function clinical metrics
      avgExecutiveFunctionScore,
      avgPlanningScore,
      avgWorkingMemoryScore,
      avgInhibitoryScore,
      avgFlexibilityScore,
      avgPlanningTime,
      optimalSolutionRate,
      levelStats,
      topClinicalInsights: [...new Set(analytics.clinicalInsights)].slice(0, 5), // Unique insights, top 5
      // Chart data for executive function performance
      executiveFunctionChartData: levelStats.slice(0, 10).map((stat, index) => ({
        name: `L${stat.level}`,
        planning: Math.min(100, stat.avgPlanningTime * 2), // Scale for chart
        efficiency: stat.avgEfficiency,
        optimalRate: stat.optimalRate,
        fill: `hsl(${240 + (index * 15)}, 70%, 50%)` // Purple gradient
      }))
    }
  }

  // Hanoi Towers specific analytics - 🧠 MATHEMATICAL THINKING CLINICAL ENHANCEMENT
  const prepareHanoiTowersAnalytics = () => {
    if (hanoiTowersResults.length === 0) return null

    const analytics = hanoiTowersResults.reduce((acc, result) => {
      acc.games.push(result)
      acc.scores.push(result.score)
      acc.efficiencies.push((result.details?.efficiency_percentage as number) || 0)
      acc.durations.push(result.duration || 0)
      acc.levels.push((result.details?.level_number as number) || 1)
      
      // 🧠 Mathematical Thinking clinical data processing
      if (result.details?.clinicalData) {
        const clinical = result.details.clinicalData as any
        acc.clinicalScores.push(clinical.overallCognitive || 0)
        acc.mathematicalThinking.push(clinical.mathematicalThinking || 0)
        acc.recursiveProblemSolving.push(clinical.recursiveProblemSolving || 0)
        acc.spatialReasoning.push(clinical.spatialReasoning || 0)
        acc.sequentialPlanning.push(clinical.sequentialPlanning || 0)
        acc.algorithmicThinking.push(clinical.algorithmicThinking || 0)
        acc.logicalDeduction.push(clinical.logicalDeduction || 0)
        
        // Level-based performance tracking
        if (clinical.levelPerformance) {
          Object.entries(clinical.levelPerformance).forEach(([levelKey, perf]: [string, {
            attempts: number;
            optimalSolutions: number;
            efficiency: number;
            planningTime: number;
          }]) => {
            if (!acc.levelPerformance[levelKey]) {
              acc.levelPerformance[levelKey] = {
                attempts: 0,
                optimalSolutions: 0,
                efficiencies: [],
                planningTimes: []
              }
            }
            acc.levelPerformance[levelKey].attempts += perf.attempts
            acc.levelPerformance[levelKey].optimalSolutions += perf.optimalSolutions
            acc.levelPerformance[levelKey].efficiencies.push(perf.efficiency)
            acc.levelPerformance[levelKey].planningTimes.push(perf.planningTime)
          })
        }
        
        // Mathematical thinking insights based on performance
        if (clinical.mathematicalThinking >= 85) {
          acc.clinicalInsights.push("Excellent mathematical and recursive reasoning")
        }
        if (clinical.recursiveProblemSolving >= 80) {
          acc.clinicalInsights.push("Strong recursive problem-solving abilities")
        }
        if (clinical.spatialReasoning >= 85) {
          acc.clinicalInsights.push("Superior spatial reasoning and visualization")
        }
        if (clinical.algorithmicThinking >= 80) {
          acc.clinicalInsights.push("Advanced algorithmic thinking patterns")
        }
        if (clinical.logicalDeduction >= 85) {
          acc.clinicalInsights.push("Exceptional logical deduction skills")
        }
      }
      
      return acc
    }, {
      games: [] as ExerciseResult[],
      scores: [] as number[],
      efficiencies: [] as number[],
      durations: [] as number[],
      levels: [] as number[],
      // 🧠 Mathematical Thinking clinical metrics
      clinicalScores: [] as number[],
      mathematicalThinking: [] as number[],
      recursiveProblemSolving: [] as number[],
      spatialReasoning: [] as number[],
      sequentialPlanning: [] as number[],
      algorithmicThinking: [] as number[],
      logicalDeduction: [] as number[],
      levelPerformance: {} as Record<string, {
        attempts: number,
        optimalSolutions: number,
        efficiencies: number[],
        planningTimes: number[]
      }>,
      clinicalInsights: [] as string[]
    })

    // Calculate comprehensive statistics
    const avgScore = analytics.scores.length > 0 ? Math.round(analytics.scores.reduce((a, b) => a + b, 0) / analytics.scores.length) : 0
    const avgEfficiency = analytics.efficiencies.length > 0 ? Math.round(analytics.efficiencies.reduce((a, b) => a + b, 0) / analytics.efficiencies.length) : 0
    const avgDuration = analytics.durations.length > 0 ? Math.round(analytics.durations.reduce((a, b) => a + b, 0) / analytics.durations.length) : 0
    const maxLevel = analytics.levels.length > 0 ? Math.max(...analytics.levels) : 0
    
    // 🧠 Mathematical Thinking clinical analytics
    const avgClinicalScore = analytics.clinicalScores.length > 0 ? Math.round(analytics.clinicalScores.reduce((a, b) => a + b, 0) / analytics.clinicalScores.length) : null
    const avgMathematicalThinking = analytics.mathematicalThinking.length > 0 ? Math.round(analytics.mathematicalThinking.reduce((a, b) => a + b, 0) / analytics.mathematicalThinking.length) : null
    const avgRecursiveProblemSolving = analytics.recursiveProblemSolving.length > 0 ? Math.round(analytics.recursiveProblemSolving.reduce((a, b) => a + b, 0) / analytics.recursiveProblemSolving.length) : null
    const avgSpatialReasoning = analytics.spatialReasoning.length > 0 ? Math.round(analytics.spatialReasoning.reduce((a, b) => a + b, 0) / analytics.spatialReasoning.length) : null
    const avgSequentialPlanning = analytics.sequentialPlanning.length > 0 ? Math.round(analytics.sequentialPlanning.reduce((a, b) => a + b, 0) / analytics.sequentialPlanning.length) : null
    const avgAlgorithmicThinking = analytics.algorithmicThinking.length > 0 ? Math.round(analytics.algorithmicThinking.reduce((a, b) => a + b, 0) / analytics.algorithmicThinking.length) : null
    const avgLogicalDeduction = analytics.logicalDeduction.length > 0 ? Math.round(analytics.logicalDeduction.reduce((a, b) => a + b, 0) / analytics.logicalDeduction.length) : null
    
    // Level progression analysis
    const levelStats = Object.entries(analytics.levelPerformance).map(([level, perf]) => ({
      level: parseInt(level),
      attempts: perf.attempts,
      optimalRate: perf.attempts > 0 ? Math.round((perf.optimalSolutions / perf.attempts) * 100) : 0,
      avgEfficiency: perf.efficiencies.length > 0 ? Math.round(perf.efficiencies.reduce((a, b) => a + b, 0) / perf.efficiencies.length) : 0,
      avgPlanningTime: perf.planningTimes.length > 0 ? Math.round(perf.planningTimes.reduce((a, b) => a + b, 0) / perf.planningTimes.length) : 0
    })).sort((a, b) => a.level - b.level)
    
    return {
      totalGames: analytics.games.length,
      avgScore,
      avgEfficiency,
      avgDuration,
      maxLevel,
      // 🧠 Mathematical Thinking clinical metrics
      avgClinicalScore,
      avgMathematicalThinking,
      avgRecursiveProblemSolving,
      avgSpatialReasoning,
      avgSequentialPlanning,
      avgAlgorithmicThinking,
      avgLogicalDeduction,
      levelStats,
      topClinicalInsights: [...new Set(analytics.clinicalInsights)].slice(0, 5), // Unique insights, top 5
      // Chart data for mathematical thinking performance
      mathematicalThinkingChartData: levelStats.slice(0, 10).map((stat, index) => ({
        name: `L${stat.level}`,
        efficiency: stat.avgEfficiency,
        optimalRate: stat.optimalRate,
        planningTime: Math.max(10, Math.min(100, 100 - stat.avgPlanningTime)), // Inverted for chart
        fill: `hsl(${30 + (index * 15)}, 70%, 50%)` // Orange gradient
      }))
    }
  }

  // Sequence exercises analytics
  const prepareSequenceAnalytics = (results: ExerciseResult[], exerciseName: string) => {
    if (results.length === 0) return null

    const levelPerformance = results.reduce((acc, result) => {
      const level = (result.details?.max_sequence_length as number) || (result.details?.level as number) || 1
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
      acc.accuracies.push((result.details?.accuracy as number) || result.score || 0)
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
          Object.entries(clinical.categoryPerformance).forEach(([category, perf]: [string, {
            accuracy?: number;
            averageResponseTime?: number;
            questionsAsked?: number;
          }]) => {
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

  // Word-Image Matching specific analytics - 🧠 REVERSE PROCESSING CLINICAL ENHANCEMENT  
  const prepareWordImageAnalytics = () => {
    if (wordImageResults.length === 0) return null

    const analytics = wordImageResults.reduce((acc, result) => {
      acc.games.push(result)
      acc.scores.push(result.score)
      acc.accuracies.push((result.details?.accuracy as number) || result.score || 0)
      acc.durations.push(result.duration || 0)
      
      // 🧠 Reverse processing clinical data processing
      if (result.details?.clinicalData) {
        const clinical = result.details.clinicalData
        acc.clinicalScores.push(clinical.overallReverseProcessing || 0)
        acc.visualSemanticMapping.push(clinical.visualSemanticMapping || 0)
        acc.reverseProcessingSpeed.push(clinical.reverseProcessingSpeed || 0)
        acc.visualRecognition.push(clinical.visualRecognition || 0)
        acc.crossModalIntegration.push(clinical.crossModalIntegration || 0)
        
        // Category visual performance aggregation
        if (clinical.categoryVisualPerformance) {
          Object.entries(clinical.categoryVisualPerformance).forEach(([category, perf]: [string, {
            semanticToVisualAccuracy?: number;
            visualRecognitionSpeed?: number;
            questionsAsked?: number;
          }]) => {
            if (!acc.categoryVisualPerformance[category]) {
              acc.categoryVisualPerformance[category] = {
                semanticToVisualAccuracies: [],
                visualRecognitionSpeeds: [],
                questionCounts: []
              }
            }
            acc.categoryVisualPerformance[category].semanticToVisualAccuracies.push(perf.semanticToVisualAccuracy || 0)
            acc.categoryVisualPerformance[category].visualRecognitionSpeeds.push(perf.visualRecognitionSpeed || 0)
            acc.categoryVisualPerformance[category].questionCounts.push(perf.questionsAsked || 0)
          })
        }
        
        // Reverse processing insights
        if (clinical.reverseCognitiveProfile?.crossModalRecommendations) {
          acc.clinicalInsights.push(...clinical.reverseCognitiveProfile.crossModalRecommendations)
        }
        if (clinical.reverseCognitiveProfile?.reverseProcessingNotes) {
          acc.clinicalInsights.push(...clinical.reverseCognitiveProfile.reverseProcessingNotes)
        }
      }
      
      return acc
    }, {
      games: [] as ExerciseResult[],
      scores: [] as number[],
      accuracies: [] as number[],
      durations: [] as number[],
      // 🧠 Reverse processing clinical metrics
      clinicalScores: [] as number[],
      visualSemanticMapping: [] as number[],
      reverseProcessingSpeed: [] as number[],
      visualRecognition: [] as number[],
      crossModalIntegration: [] as number[],
      categoryVisualPerformance: {} as Record<string, {
        semanticToVisualAccuracies: number[],
        visualRecognitionSpeeds: number[],
        questionCounts: number[]
      }>,
      clinicalInsights: [] as string[]
    })

    // Calculate statistics
    const avgScore = analytics.scores.length > 0 ? Math.round(analytics.scores.reduce((a, b) => a + b, 0) / analytics.scores.length) : 0
    const avgAccuracy = analytics.accuracies.length > 0 ? Math.round(analytics.accuracies.reduce((a, b) => a + b, 0) / analytics.accuracies.length) : 0
    const avgDuration = analytics.durations.length > 0 ? Math.round(analytics.durations.reduce((a, b) => a + b, 0) / analytics.durations.length) : 0
    
    // 🧠 Reverse processing clinical analytics
    const avgClinicalScore = analytics.clinicalScores.length > 0 ? Math.round(analytics.clinicalScores.reduce((a, b) => a + b, 0) / analytics.clinicalScores.length) : null
    const avgVisualSemanticMapping = analytics.visualSemanticMapping.length > 0 ? Math.round(analytics.visualSemanticMapping.reduce((a, b) => a + b, 0) / analytics.visualSemanticMapping.length) : null
    const avgReverseProcessingSpeed = analytics.reverseProcessingSpeed.length > 0 ? Math.round(analytics.reverseProcessingSpeed.reduce((a, b) => a + b, 0) / analytics.reverseProcessingSpeed.length) : null
    const avgVisualRecognition = analytics.visualRecognition.length > 0 ? Math.round(analytics.visualRecognition.reduce((a, b) => a + b, 0) / analytics.visualRecognition.length) : null
    const avgCrossModalIntegration = analytics.crossModalIntegration.length > 0 ? Math.round(analytics.crossModalIntegration.reduce((a, b) => a + b, 0) / analytics.crossModalIntegration.length) : null
    
    // Category visual performance summary
    const categoryVisualStats = Object.entries(analytics.categoryVisualPerformance).map(([category, perf]) => ({
      category,
      avgSemanticToVisualAccuracy: perf.semanticToVisualAccuracies.length > 0 ? Math.round(perf.semanticToVisualAccuracies.reduce((a, b) => a + b, 0) / perf.semanticToVisualAccuracies.length) : 0,
      avgVisualRecognitionSpeed: perf.visualRecognitionSpeeds.length > 0 ? Math.round(perf.visualRecognitionSpeeds.reduce((a, b) => a + b, 0) / perf.visualRecognitionSpeeds.length) : 0,
      totalQuestions: perf.questionCounts.reduce((a, b) => a + b, 0)
    })).filter(stat => stat.totalQuestions > 0).sort((a, b) => b.avgSemanticToVisualAccuracy - a.avgSemanticToVisualAccuracy)
    
    return {
      totalGames: analytics.games.length,
      avgScore,
      avgAccuracy,
      avgDuration,
      // 🧠 Reverse processing clinical metrics
      avgClinicalScore,
      avgVisualSemanticMapping,
      avgReverseProcessingSpeed,
      avgVisualRecognition,
      avgCrossModalIntegration,
      categoryVisualStats,
      topClinicalInsights: [...new Set(analytics.clinicalInsights)].slice(0, 5), // Unique insights, top 5
      // Chart data for category visual performance
      categoryVisualChartData: categoryVisualStats.map((stat, index) => ({
        name: stat.category,
        semanticToVisual: stat.avgSemanticToVisualAccuracy,
        visualSpeed: stat.avgVisualRecognitionSpeed,
        questions: stat.totalQuestions,
        fill: `hsl(${280 + (index * 40)}, 70%, 50%)` // Dynamic colors (purple-ish range)
      }))
    }
  }

  const memoryAnalytics = prepareMemoryGameAnalytics()
  const towerOfLondonAnalytics = prepareTowerOfLondonAnalytics()
  const hanoiTowersAnalytics = prepareHanoiTowersAnalytics()
  // Number Sequence specific analytics - 🧠 WORKING MEMORY CLINICAL ENHANCEMENT  
  const prepareNumberSequenceAnalytics = () => {
    if (numberSequenceResults.length === 0) return null

    const analytics = numberSequenceResults.reduce((acc, result) => {
      acc.games.push(result)
      acc.scores.push(result.score)
      acc.maxLevels.push((result.details?.max_level_reached as number) || 1)
      acc.durations.push(result.duration || 0)
      
      // 🧠 Working memory clinical data processing
      if (result.details?.clinicalData) {
        const clinical = result.details.clinicalData
        acc.clinicalScores.push(clinical.overallWorkingMemory || 0)
        acc.digitSpanCapacities.push(clinical.digitSpanCapacity || 0)
        acc.processingSpeeds.push(clinical.processingSpeed || 0)
        acc.cognitiveLoads.push(clinical.cognitiveLoad || 0)
        acc.attentionControls.push(clinical.attentionControl || 0)
        
        // Miller's 7±2 Rule compliance tracking
        if (clinical.millerCompliance) {
          acc.millerCompliances.push({
            capacity: clinical.digitSpanCapacity,
            isWithinNormal: clinical.millerCompliance.isWithinNormalRange,
            category: clinical.millerCompliance.capacityCategory,
            deviation: clinical.millerCompliance.millerDeviation
          })
        }
        
        // Working memory insights
        if (clinical.workingMemoryCognitiveProfile?.cognitiveRecommendations) {
          acc.clinicalInsights.push(...clinical.workingMemoryCognitiveProfile.cognitiveRecommendations)
        }
        if (clinical.workingMemoryCognitiveProfile?.workingMemoryNotes) {
          acc.clinicalInsights.push(...clinical.workingMemoryCognitiveProfile.workingMemoryNotes)
        }
      }
      
      return acc
    }, {
      games: [] as ExerciseResult[],
      scores: [] as number[],
      maxLevels: [] as number[],
      durations: [] as number[],
      // 🧠 Working memory clinical metrics
      clinicalScores: [] as number[],
      digitSpanCapacities: [] as number[],
      processingSpeeds: [] as number[],
      cognitiveLoads: [] as number[],
      attentionControls: [] as number[],
      millerCompliances: [] as Array<{
        capacity: number,
        isWithinNormal: boolean,
        category: string,
        deviation: number
      }>,
      clinicalInsights: [] as string[]
    })

    // Calculate statistics
    const avgScore = analytics.scores.length > 0 ? Math.round(analytics.scores.reduce((a, b) => a + b, 0) / analytics.scores.length) : 0
    const avgMaxLevel = analytics.maxLevels.length > 0 ? Math.round(analytics.maxLevels.reduce((a, b) => a + b, 0) / analytics.maxLevels.length) : 0
    const avgDuration = analytics.durations.length > 0 ? Math.round(analytics.durations.reduce((a, b) => a + b, 0) / analytics.durations.length) : 0
    
    // 🧠 Working memory clinical analytics
    const avgClinicalScore = analytics.clinicalScores.length > 0 ? Math.round(analytics.clinicalScores.reduce((a, b) => a + b, 0) / analytics.clinicalScores.length) : null
    const avgDigitSpanCapacity = analytics.digitSpanCapacities.length > 0 ? Math.round(analytics.digitSpanCapacities.reduce((a, b) => a + b, 0) / analytics.digitSpanCapacities.length) : null
    const avgProcessingSpeed = analytics.processingSpeeds.length > 0 ? Math.round(analytics.processingSpeeds.reduce((a, b) => a + b, 0) / analytics.processingSpeeds.length) : null
    const avgCognitiveLoad = analytics.cognitiveLoads.length > 0 ? Math.round(analytics.cognitiveLoads.reduce((a, b) => a + b, 0) / analytics.cognitiveLoads.length) : null
    const avgAttentionControl = analytics.attentionControls.length > 0 ? Math.round(analytics.attentionControls.reduce((a, b) => a + b, 0) / analytics.attentionControls.length) : null
    
    // Miller's 7±2 Rule analysis
    const millerStats = analytics.millerCompliances.length > 0 ? {
      totalAssessments: analytics.millerCompliances.length,
      withinNormalRange: analytics.millerCompliances.filter(m => m.isWithinNormal).length,
      belowAverage: analytics.millerCompliances.filter(m => m.category === 'below-average').length,
      average: analytics.millerCompliances.filter(m => m.category === 'average').length,
      aboveAverage: analytics.millerCompliances.filter(m => m.category === 'above-average').length,
      exceptional: analytics.millerCompliances.filter(m => m.category === 'exceptional').length,
      averageCapacity: Math.round(analytics.millerCompliances.reduce((sum, m) => sum + m.capacity, 0) / analytics.millerCompliances.length)
    } : null
    
    return {
      totalGames: analytics.games.length,
      avgScore,
      avgMaxLevel,
      avgDuration,
      // 🧠 Working memory clinical metrics
      avgClinicalScore,
      avgDigitSpanCapacity,
      avgProcessingSpeed,
      avgCognitiveLoad,
      avgAttentionControl,
      millerStats,
      topClinicalInsights: [...new Set(analytics.clinicalInsights)].slice(0, 5), // Unique insights, top 5
      // Chart data for Miller's 7±2 Rule progression
      millerProgressionData: analytics.millerCompliances.map((compliance, index) => ({
        session: index + 1,
        capacity: compliance.capacity,
        isWithinNormal: compliance.isWithinNormal,
        category: compliance.category,
        fill: compliance.isWithinNormal ? '#10B981' : compliance.capacity > 9 ? '#8B5CF6' : '#3B82F6'
      }))
    }
  }

  const numberSequenceAnalytics = prepareNumberSequenceAnalytics()
  
  // Color Sequence specific analytics - 🧠 VISUAL-SPATIAL MEMORY CLINICAL ENHANCEMENT  
  const prepareColorSequenceAnalytics = () => {
    if (colorSequenceResults.length === 0) return null

    const analytics = colorSequenceResults.reduce((acc, result) => {
      acc.games.push(result)
      acc.scores.push(result.score)
      acc.maxLevels.push((result.details?.max_level_reached as number) || 1)
      acc.durations.push(result.duration || 0)
      
      // 🧠 Visual-spatial memory clinical data processing
      if (result.details?.clinicalData) {
        const clinical = result.details.clinicalData
        acc.clinicalScores.push(clinical.overallVisualSpatialMemory || 0)
        acc.visualSpanCapacities.push(clinical.visualSpanCapacity || 0)
        acc.visualMemoryScores.push(clinical.visualMemoryScore || 0)
        acc.spatialProcessingSpeeds.push(clinical.spatialProcessingSpeed || 0)
        acc.colorRecognitionAccuracies.push(clinical.colorRecognitionAccuracy || 0)
        acc.visualAttentionSpans.push(clinical.visualAttentionSpan || 0)
        
        // Visual pattern compliance tracking
        if (clinical.visualPatternCompliance) {
          acc.visualPatternCompliances.push({
            capacity: clinical.visualSpanCapacity,
            complexity: clinical.visualPatternCompliance.visualComplexity,
            category: clinical.visualPatternCompliance.patternRecognitionCategory,
            deviation: clinical.visualPatternCompliance.visualProcessingDeviation
          })
        }
        
        // Visual-spatial insights
        if (clinical.visualSpatialCognitiveProfile?.visualCognitiveRecommendations) {
          acc.clinicalInsights.push(...clinical.visualSpatialCognitiveProfile.visualCognitiveRecommendations)
        }
        if (clinical.visualSpatialCognitiveProfile?.spatialMemoryNotes) {
          acc.clinicalInsights.push(...clinical.visualSpatialCognitiveProfile.spatialMemoryNotes)
        }
      }
      
      return acc
    }, {
      games: [] as ExerciseResult[],
      scores: [] as number[],
      maxLevels: [] as number[],
      durations: [] as number[],
      // 🧠 Visual-spatial memory clinical metrics
      clinicalScores: [] as number[],
      visualSpanCapacities: [] as number[],
      visualMemoryScores: [] as number[],
      spatialProcessingSpeeds: [] as number[],
      colorRecognitionAccuracies: [] as number[],
      visualAttentionSpans: [] as number[],
      visualPatternCompliances: [] as Array<{
        capacity: number,
        complexity: string,
        category: string,
        deviation: number
      }>,
      clinicalInsights: [] as string[]
    })

    // Calculate statistics
    const avgScore = analytics.scores.length > 0 ? Math.round(analytics.scores.reduce((a, b) => a + b, 0) / analytics.scores.length) : 0
    const avgMaxLevel = analytics.maxLevels.length > 0 ? Math.round(analytics.maxLevels.reduce((a, b) => a + b, 0) / analytics.maxLevels.length) : 0
    const avgDuration = analytics.durations.length > 0 ? Math.round(analytics.durations.reduce((a, b) => a + b, 0) / analytics.durations.length) : 0
    
    // 🧠 Visual-spatial memory clinical analytics
    const avgClinicalScore = analytics.clinicalScores.length > 0 ? Math.round(analytics.clinicalScores.reduce((a, b) => a + b, 0) / analytics.clinicalScores.length) : null
    const avgVisualSpanCapacity = analytics.visualSpanCapacities.length > 0 ? Math.round(analytics.visualSpanCapacities.reduce((a, b) => a + b, 0) / analytics.visualSpanCapacities.length) : null
    const avgVisualMemoryScore = analytics.visualMemoryScores.length > 0 ? Math.round(analytics.visualMemoryScores.reduce((a, b) => a + b, 0) / analytics.visualMemoryScores.length) : null
    const avgSpatialProcessingSpeed = analytics.spatialProcessingSpeeds.length > 0 ? Math.round(analytics.spatialProcessingSpeeds.reduce((a, b) => a + b, 0) / analytics.spatialProcessingSpeeds.length) : null
    const avgColorRecognitionAccuracy = analytics.colorRecognitionAccuracies.length > 0 ? Math.round(analytics.colorRecognitionAccuracies.reduce((a, b) => a + b, 0) / analytics.colorRecognitionAccuracies.length) : null
    const avgVisualAttentionSpan = analytics.visualAttentionSpans.length > 0 ? Math.round(analytics.visualAttentionSpans.reduce((a, b) => a + b, 0) / analytics.visualAttentionSpans.length) : null
    
    // Visual pattern analysis
    const visualPatternStats = analytics.visualPatternCompliances.length > 0 ? {
      totalAssessments: analytics.visualPatternCompliances.length,
      lowComplexity: analytics.visualPatternCompliances.filter(v => v.complexity === 'low').length,
      mediumComplexity: analytics.visualPatternCompliances.filter(v => v.complexity === 'medium').length,
      highComplexity: analytics.visualPatternCompliances.filter(v => v.complexity === 'high').length,
      exceptionalComplexity: analytics.visualPatternCompliances.filter(v => v.complexity === 'exceptional').length,
      belowAverage: analytics.visualPatternCompliances.filter(v => v.category === 'below-average').length,
      average: analytics.visualPatternCompliances.filter(v => v.category === 'average').length,
      aboveAverage: analytics.visualPatternCompliances.filter(v => v.category === 'above-average').length,
      exceptional: analytics.visualPatternCompliances.filter(v => v.category === 'exceptional').length,
      averageCapacity: Math.round(analytics.visualPatternCompliances.reduce((sum, v) => sum + v.capacity, 0) / analytics.visualPatternCompliances.length)
    } : null
    
    return {
      totalGames: analytics.games.length,
      avgScore,
      avgMaxLevel,
      avgDuration,
      // 🧠 Visual-spatial memory clinical metrics
      avgClinicalScore,
      avgVisualSpanCapacity,
      avgVisualMemoryScore,
      avgSpatialProcessingSpeed,
      avgColorRecognitionAccuracy,
      avgVisualAttentionSpan,
      visualPatternStats,
      topClinicalInsights: [...new Set(analytics.clinicalInsights)].slice(0, 5), // Unique insights, top 5
      // Chart data for visual-spatial progression
      visualSpatialProgressionData: analytics.visualPatternCompliances.map((compliance, index) => ({
        session: index + 1,
        capacity: compliance.capacity,
        complexity: compliance.complexity,
        category: compliance.category,
        fill: compliance.complexity === 'exceptional' ? '#8B5CF6' : 
              compliance.complexity === 'high' ? '#10B981' :
              compliance.complexity === 'medium' ? '#06B6D4' : '#3B82F6'
      }))
    }
  }

  const colorSequenceAnalytics = prepareColorSequenceAnalytics()
  const legacyColorSequenceAnalytics = prepareSequenceAnalytics(colorSequenceResults, 'Renk Dizisi Takibi')
  const imageWordAnalytics = prepareImageWordAnalytics()
  const wordImageAnalytics = prepareWordImageAnalytics()

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        
        {/* 📱 TABLET: Quick Summary Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                İstatistikler
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Bilişsel performans analizi ve gelişim takibi
              </p>
            </div>
          </div>
          
          {/* 📱 TABLET: Compact Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-gray-800/20 shadow-lg">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-primary">{totalExercises}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Toplam Egzersiz</div>
        </div>
      </div>

            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-gray-800/20 shadow-lg">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{completionRate}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Tamamlama</div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-gray-800/20 shadow-lg">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-amber-600">{averageScore}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Ortalama Skor</div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 dark:border-gray-800/20 shadow-lg">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatTime(totalTime)}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Toplam Süre</div>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 TABLET: Compact Filter Bar */}
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Egzersiz Türü</label>
            <Select value={selectedExerciseFilter} onValueChange={setSelectedExerciseFilter}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Egzersizler</SelectItem>
                <SelectItem value="Hafıza Oyunu">Hafıza Oyunu</SelectItem>
                    <SelectItem value="Londra Kulesi Testi">Londra Kulesi</SelectItem>
                <SelectItem value="Hanoi Kuleleri">Hanoi Kuleleri</SelectItem>
                    <SelectItem value="Resim-Kelime Eşleştirme">Resim-Kelime</SelectItem>
                    <SelectItem value="Kelime-Resim Eşleştirme">Kelime-Resim</SelectItem>
                    <SelectItem value="Sayı Dizisi Takibi">Sayı Dizisi</SelectItem>
                    <SelectItem value="Renk Dizisi Takibi">Renk Dizisi</SelectItem>
                    <SelectItem value="Mantık Dizileri">Mantık Dizileri</SelectItem>
              </SelectContent>
            </Select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Zaman Aralığı</label>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="7days">Son 7 Gün</SelectItem>
                <SelectItem value="30days">Son 30 Gün</SelectItem>
                <SelectItem value="90days">Son 90 Gün</SelectItem>
              </SelectContent>
            </Select>
      </div>
                </div>
              </CardContent>
            </Card>

        {filteredResults.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-white/20 dark:border-gray-800/20 shadow-lg">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center mx-auto">
                  <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-semibold">Henüz Veri Bulunmuyor</h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                    {selectedExerciseFilter !== 'all' || selectedTimeRange !== 'all' 
                      ? "Seçilen filtrelere uygun egzersiz sonucu bulunmuyor. Filtrelerinizi değiştirip tekrar deneyin."
                      : "Egzersiz yapmaya başladığınızda istatistikleriniz burada görünecek."
              }
            </p>
                </div>
              </div>
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
                        {result.exerciseName === 'Hanoi Kuleleri' && <Building className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Eşleştirme') && <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Dizisi') && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Çemberi') && <Award className="w-4 h-4 sm:w-5 sm:h-5 text-lime-600" />}
                          {typeof result.exerciseName === 'string' && result.exerciseName.includes('Mantık') && <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            {typeof result.exerciseName === 'string' 
                              ? result.exerciseName 
                              : (result.exerciseName as { exerciseName?: string })?.exerciseName || 'Bilinmeyen Egzersiz'
                            }
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 sm:gap-3">
                            <span>{new Date(result.date).toLocaleDateString('tr-TR')}</span>
                            <span>•</span>
                            <span className="truncate">{(result.details?.level_identifier as string) || 'Detay Yok'}</span>
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
            {towerOfLondonAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Londra Kulesi Testi') && (
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
                      <BarChart data={towerOfLondonAnalytics.levelStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="level" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="avgEfficiency" fill="#8B5CF6" name="Ortalama Verimlilik %" />
                        <Bar dataKey="optimalRate" fill="#10B981" name="Optimal Çözüm %" />
                        <Bar dataKey="avgPlanningTime" fill="#F59E0B" name="Planlama Süresi (sn)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {towerOfLondonAnalytics.levelStats.map((level, index) => (
                      <div key={index} className="p-4 bg-purple-50/30 dark:bg-purple-950/20 rounded-xl border border-border/50">
                        <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Seviye {level.level}</div>
                        <div className="space-y-2 text-sm">
                          <div>Denemeler: <span className="font-bold">{level.attempts}</span></div>
                          <div>Ortalama Hamle: <span className="font-bold">{level.avgMoves}</span></div>
                          <div>Planlama Süresi: <span className="font-bold">{level.avgPlanningTime}s</span></div>
                          <div>Verimlilik: <span className="font-bold text-purple-600">{level.avgEfficiency}%</span></div>
                          <div>Optimal Çözüm: <span className="font-bold text-green-600">{level.optimalRate}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 🧠 Clinical Insights */}
                  {towerOfLondonAnalytics.topClinicalInsights && towerOfLondonAnalytics.topClinicalInsights.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50 mt-6">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Brain className="w-5 h-5" />
                        Executive Function Clinical Insights
                      </h4>
                      <div className="grid gap-3 sm:gap-4">
                        {towerOfLondonAnalytics.topClinicalInsights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed">{insight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hanoi Towers Specific Analytics - 🧠 MATHEMATICAL THINKING ENHANCEMENT */}
            {hanoiTowersAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Hanoi Kuleleri') && (
              <Card className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/60 dark:border-orange-800/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <Building className="w-6 h-6 sm:w-7 sm:h-7" />
                    Hanoi Kuleleri - Detaylı Analiz
                  </CardTitle>
                  <CardDescription className="text-orange-600 dark:text-orange-400">
                    Mathematical thinking, recursive problem solving ve algorithmic reasoning analizi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Toplam Oyun</div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{hanoiTowersAnalytics.totalGames}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ortalama Skor</div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{hanoiTowersAnalytics.avgScore}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ortalama Verimlilik</div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{hanoiTowersAnalytics.avgEfficiency}%</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Maksimum Seviye</div>
                      <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{hanoiTowersAnalytics.maxLevel}</div>
                    </div>
                  </div>

                  {/* 🧠 Clinical Mathematical Thinking Metrics */}
                  {(hanoiTowersAnalytics.avgClinicalScore || hanoiTowersAnalytics.avgMathematicalThinking) && (
                    <div className="p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <Brain className="w-5 h-5" />
                        Mathematical Thinking Clinical Metrics
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {hanoiTowersAnalytics.avgClinicalScore && (
                          <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hanoiTowersAnalytics.avgClinicalScore}</div>
                            <div className="text-xs text-muted-foreground mt-1">Overall Cognitive</div>
                          </div>
                        )}
                        {hanoiTowersAnalytics.avgMathematicalThinking && (
                          <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hanoiTowersAnalytics.avgMathematicalThinking}</div>
                            <div className="text-xs text-muted-foreground mt-1">Mathematical Thinking</div>
                          </div>
                        )}
                        {hanoiTowersAnalytics.avgRecursiveProblemSolving && (
                          <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hanoiTowersAnalytics.avgRecursiveProblemSolving}</div>
                            <div className="text-xs text-muted-foreground mt-1">Recursive Problem Solving</div>
                          </div>
                        )}
                        {hanoiTowersAnalytics.avgSpatialReasoning && (
                          <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hanoiTowersAnalytics.avgSpatialReasoning}</div>
                            <div className="text-xs text-muted-foreground mt-1">Spatial Reasoning</div>
                          </div>
                        )}
                        {hanoiTowersAnalytics.avgAlgorithmicThinking && (
                          <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hanoiTowersAnalytics.avgAlgorithmicThinking}</div>
                            <div className="text-xs text-muted-foreground mt-1">Algorithmic Thinking</div>
                          </div>
                        )}
                        {hanoiTowersAnalytics.avgLogicalDeduction && (
                          <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{hanoiTowersAnalytics.avgLogicalDeduction}</div>
                            <div className="text-xs text-muted-foreground mt-1">Logical Deduction</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Level Performance Details */}
                  <div className="p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                    <h4 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-300">Seviye Performansları</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {hanoiTowersAnalytics.levelStats.map((level, index) => (
                        <div key={index} className="p-4 bg-orange-50/30 dark:bg-orange-950/20 rounded-xl border border-border/50">
                          <div className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Seviye {level.level}</div>
                          <div className="space-y-2 text-sm">
                            <div>Denemeler: <span className="font-bold">{level.attempts}</span></div>
                            <div>Ortalama Verimlilik: <span className="font-bold">{level.avgEfficiency}%</span></div>
                            <div>Optimal Çözüm: <span className="font-bold text-green-600">{level.optimalRate}%</span></div>
                            <div>Planlama Süresi: <span className="font-bold text-orange-600">{level.avgPlanningTime}s</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 🧠 Clinical Insights */}
                  {hanoiTowersAnalytics.topClinicalInsights && hanoiTowersAnalytics.topClinicalInsights.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-xl border border-orange-200/50 dark:border-orange-700/50 mt-6">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <Brain className="w-5 h-5" />
                        Mathematical Thinking Clinical Insights
                      </h4>
                      <div className="grid gap-3 sm:gap-4">
                        {hanoiTowersAnalytics.topClinicalInsights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-background/40 rounded-lg border border-border/30">
                            <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">{idx + 1}</span>
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed">{insight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Logic Sequences Specific Analytics - 🧠 ANALYTICAL THINKING CLINICAL ENHANCEMENT */}
            {logicSequenceResults.length > 0 && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Mantık Dizileri') && (
              <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/60 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />
                    Mantık Dizileri - Analytical Thinking Analizi
                  </CardTitle>
                  <CardDescription className="text-amber-600 dark:text-amber-400">
                    Pattern recognition, mathematical reasoning ve cognitive flexibility analizi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Toplam Oyun</div>
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{logicSequenceResults.length}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ortalama Skor</div>
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        {logicSequenceResults.length > 0 ? Math.round(logicSequenceResults.reduce((acc, result) => acc + result.score, 0) / logicSequenceResults.length) : 0}
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ortalama Doğruluk</div>
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        {logicSequenceResults.length > 0 ? Math.round(logicSequenceResults.reduce((acc, result) => acc + (result.accuracy || 0), 0) / logicSequenceResults.length) : 0}%
                      </div>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Ortalama Süre</div>
                      <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                        {logicSequenceResults.length > 0 ? Math.round(logicSequenceResults.reduce((acc, result) => acc + (result.duration || 0), 0) / logicSequenceResults.length / 60) : 0}dk
                      </div>
                    </div>
                  </div>

                  {/* 🧠 Clinical Analytical Thinking Metrics */}
                  {logicSequenceResults.some(result => result.details?.clinicalData) && (
                    <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <Brain className="w-5 h-5" />
                        Analytical Thinking Clinical Metrics
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Calculate average clinical scores */}
                        {(() => {
                          const clinicalResults = logicSequenceResults.filter(result => result.details?.clinicalData)
                          if (clinicalResults.length === 0) return null
                          
                          const avgAnalyticalThinking = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.analyticalThinking || 0), 0) / clinicalResults.length)
                          const avgPatternRecognition = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.patternRecognition || 0), 0) / clinicalResults.length)
                          const avgMathematicalReasoning = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.mathematicalReasoning || 0), 0) / clinicalResults.length)
                          const avgSequentialLogic = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.sequentialLogic || 0), 0) / clinicalResults.length)
                          const avgAbstractReasoning = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.abstractReasoning || 0), 0) / clinicalResults.length)
                          const avgCognitiveFlexibility = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.cognitiveFlexibility || 0), 0) / clinicalResults.length)
                          const avgOverallCognitive = Math.round(clinicalResults.reduce((acc, result) => acc + (result.details?.clinicalData?.overallCognitive || 0), 0) / clinicalResults.length)
                          
                          return (
                            <>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgOverallCognitive}</div>
                                <div className="text-xs text-muted-foreground mt-1">Overall Cognitive</div>
                              </div>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgAnalyticalThinking}</div>
                                <div className="text-xs text-muted-foreground mt-1">Analytical Thinking</div>
                              </div>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgPatternRecognition}</div>
                                <div className="text-xs text-muted-foreground mt-1">Pattern Recognition</div>
                              </div>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgMathematicalReasoning}</div>
                                <div className="text-xs text-muted-foreground mt-1">Mathematical Reasoning</div>
                              </div>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgSequentialLogic}</div>
                                <div className="text-xs text-muted-foreground mt-1">Sequential Logic</div>
                              </div>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgAbstractReasoning}</div>
                                <div className="text-xs text-muted-foreground mt-1">Abstract Reasoning</div>
                              </div>
                              <div className="text-center p-3 bg-background/40 rounded-lg border border-border/30">
                                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgCognitiveFlexibility}</div>
                                <div className="text-xs text-muted-foreground mt-1">Cognitive Flexibility</div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Pattern Performance Analysis */}
                  {logicSequenceResults.some(result => result.details?.clinicalData?.patternPerformance) && (
                    <div className="p-4 bg-white/40 dark:bg-gray-800/40 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                      <h4 className="text-lg font-semibold mb-3 text-amber-700 dark:text-amber-300">Pattern Türü Performansları</h4>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {(() => {
                          // Aggregate pattern performance from all games
                          const allPatternPerformances: Record<string, {
                            attempts: number
                            correctAnswers: number
                            totalResponseTime: number
                            accuracy: number
                            averageResponseTime: number
                          }> = {}
                          
                          logicSequenceResults.forEach(result => {
                            if (result.details?.clinicalData?.patternPerformance) {
                              Object.entries(result.details.clinicalData.patternPerformance).forEach(([pattern, perf]) => {
                                if (!allPatternPerformances[pattern]) {
                                  allPatternPerformances[pattern] = {
                                    attempts: 0,
                                    correctAnswers: 0,
                                    totalResponseTime: 0,
                                    accuracy: 0,
                                    averageResponseTime: 0
                                  }
                                }
                                const perfData = perf as any
                                allPatternPerformances[pattern].attempts += perfData.attempts || 0
                                allPatternPerformances[pattern].correctAnswers += perfData.correctAnswers || 0
                                allPatternPerformances[pattern].totalResponseTime += (perfData.averageResponseTime || 0) * (perfData.attempts || 0)
                              })
                            }
                          })
                          
                          // Calculate final averages
                          Object.keys(allPatternPerformances).forEach(pattern => {
                            const perf = allPatternPerformances[pattern]
                            perf.accuracy = perf.attempts > 0 ? Math.round((perf.correctAnswers / perf.attempts) * 100) : 0
                            perf.averageResponseTime = perf.attempts > 0 ? Math.round(perf.totalResponseTime / perf.attempts) : 0
                          })
                          
                          return Object.entries(allPatternPerformances).map(([pattern, perf], index) => (
                            <div key={index} className="p-4 bg-amber-50/30 dark:bg-amber-950/20 rounded-xl border border-border/50">
                              <div className="font-semibold text-amber-700 dark:text-amber-300 mb-2">{pattern}</div>
                              <div className="space-y-2 text-sm">
                                <div>Toplam Deneme: <span className="font-bold">{perf.attempts}</span></div>
                                <div>Doğru Cevap: <span className="font-bold text-green-600">{perf.correctAnswers}</span></div>
                                <div>Doğruluk: <span className="font-bold text-amber-600">{perf.accuracy}%</span></div>
                                <div>Ortalama Tepki: <span className="font-bold text-orange-600">{perf.averageResponseTime}ms</span></div>
                              </div>
                              
                              {/* Performance indicator */}
                              <div className="mt-3 pt-2 border-t border-border/30">
                                {perf.accuracy >= 80 ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                    ⭐ Güçlü Pattern
                                  </Badge>
                                ) : perf.accuracy >= 60 ? (
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
                          ))
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* 🧠 Clinical Insights */}
                  {logicSequenceResults.some(result => result.details?.clinicalData?.clinicalInsights?.length > 0) && (
                    <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50 mt-6">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <Brain className="w-5 h-5" />
                        Analytical Thinking Clinical Insights
                      </h4>
                      <div className="grid gap-3 sm:gap-4">
                        {(() => {
                          // Collect all clinical insights
                          const allInsights = []
                          logicSequenceResults.forEach(result => {
                            if (result.details?.clinicalData?.clinicalInsights) {
                              allInsights.push(...result.details.clinicalData.clinicalInsights)
                            }
                          })
                          
                          // Get unique insights
                          const uniqueInsights = [...new Set(allInsights)]
                          
                          return uniqueInsights.slice(0, 5).map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-background/40 rounded-lg border border-border/30">
                              <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">{idx + 1}</span>
                              </div>
                              <div className="text-sm text-muted-foreground leading-relaxed">{insight}</div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Cognitive Profile Summary */}
                  {logicSequenceResults.some(result => result.details?.clinicalData?.cognitiveProfile) && (
                    <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Trophy className="w-5 h-5" />
                        Cognitive Profile & Recommendations
                      </h4>
                      
                      {(() => {
                        // Collect cognitive profile data
                        const allStrengths = []
                        const allImprovementAreas = []
                        const allRecommendations = []
                        
                        logicSequenceResults.forEach(result => {
                          if (result.details?.clinicalData?.cognitiveProfile) {
                            const profile = result.details.clinicalData.cognitiveProfile
                            if (profile.strengths) allStrengths.push(...profile.strengths)
                            if (profile.improvementAreas) allImprovementAreas.push(...profile.improvementAreas)
                            if (profile.recommendations) allRecommendations.push(...profile.recommendations)
                          }
                        })
                        
                        const uniqueStrengths = [...new Set(allStrengths)]
                        const uniqueImprovementAreas = [...new Set(allImprovementAreas)]
                        const uniqueRecommendations = [...new Set(allRecommendations)]
                        
                        return (
                          <div className="grid gap-4 md:grid-cols-3">
                            {/* Strengths */}
                            {uniqueStrengths.length > 0 && (
                              <div className="p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-700/50">
                                <h5 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Güçlü Yönler
                                </h5>
                                <ul className="text-sm space-y-1">
                                  {uniqueStrengths.slice(0, 3).map((strength, idx) => (
                                    <li key={idx} className="text-green-600 dark:text-green-400">• {strength}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Improvement Areas */}
                            {uniqueImprovementAreas.length > 0 && (
                              <div className="p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-700/50">
                                <h5 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  Gelişim Alanları
                                </h5>
                                <ul className="text-sm space-y-1">
                                  {uniqueImprovementAreas.slice(0, 3).map((area, idx) => (
                                    <li key={idx} className="text-orange-600 dark:text-orange-400">• {area}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Recommendations */}
                            {uniqueRecommendations.length > 0 && (
                              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                                <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1">
                                  <Lightbulb className="w-4 h-4" />
                                  Öneriler
                                </h5>
                                <ul className="text-sm space-y-1">
                                  {uniqueRecommendations.slice(0, 3).map((recommendation, idx) => (
                                    <li key={idx} className="text-blue-600 dark:text-blue-400">• {recommendation}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
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

            {/* Word-Image Matching Specific Analytics - 🧠 REVERSE PROCESSING CLINICAL ENHANCEMENT */}
            {wordImageAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Kelime-Resim Eşleştirme') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                    </div>
                    Kelime-Resim Eşleştirme - Reverse Processing Analizi
                  </CardTitle>
                  <CardDescription className="text-base">
                    Semantic→Visual pathway assessment ve kategori-bazlı reverse processing performansı
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* 🧠 Reverse Processing Clinical Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                          {wordImageAnalytics.avgClinicalScore !== null ? `${wordImageAnalytics.avgClinicalScore}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          Genel Reverse Processing
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-violet-200 dark:border-violet-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-violet-700 dark:text-violet-300 mb-2">
                          {wordImageAnalytics.avgVisualSemanticMapping !== null ? `${wordImageAnalytics.avgVisualSemanticMapping}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                          Visual-Semantic Mapping
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                          {wordImageAnalytics.avgReverseProcessingSpeed !== null ? `${wordImageAnalytics.avgReverseProcessingSpeed}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                          Reverse Processing Hızı
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                          {wordImageAnalytics.avgCrossModalIntegration !== null ? `${wordImageAnalytics.avgCrossModalIntegration}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Cross-Modal Integration
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 📊 Category Visual Performance Chart */}
                  {wordImageAnalytics.categoryVisualChartData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Kategori-bazlı Reverse Processing Performansı
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={wordImageAnalytics.categoryVisualChartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis domain={[0, 100]} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                      <p className="font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                                      <p className="text-purple-600">Semantic→Visual: {data.semanticToVisual}%</p>
                                      <p className="text-indigo-600">Visual Speed: {data.visualSpeed}%</p>
                                      <p className="text-gray-600">Sorular: {data.questions}</p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="semanticToVisual" fill="#9333ea" name="Semantic→Visual" />
                            <Bar dataKey="visualSpeed" fill="#6366f1" name="Visual Speed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* 💡 Reverse Processing Clinical Insights */}
                  {wordImageAnalytics.topClinicalInsights.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Reverse Processing Clinical Insights
                      </h4>
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <ul className="list-disc list-inside space-y-2 text-yellow-800 dark:text-yellow-200">
                          {wordImageAnalytics.topClinicalInsights.map((insight, index) => (
                            <li key={index} className="text-sm">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* 📈 Performance Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {wordImageAnalytics.totalGames}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Toplam Oyun
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
                          {wordImageAnalytics.avgScore}%
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Ortalama Skor
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {wordImageAnalytics.avgAccuracy}%
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Doğruluk Oranı
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-orange-50 dark:bg-orange-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                          {Math.round(wordImageAnalytics.avgDuration / 60)}dk
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Ortalama Süre
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                </CardContent>
              </Card>
            )}

            {/* Number Sequence Specific Analytics - 🧠 WORKING MEMORY CLINICAL ENHANCEMENT */}
            {numberSequenceAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Sayı Dizisi Takibi') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Brain className="w-6 h-6 text-orange-600" />
                    </div>
                    Sayı Dizisi Takibi - Working Memory Analizi
                  </CardTitle>
                  <CardDescription className="text-base">
                    Miller's 7±2 Rule compliance ve working memory capacity assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* 🧠 Working Memory Clinical Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mb-2">
                          {numberSequenceAnalytics.avgClinicalScore !== null ? `${numberSequenceAnalytics.avgClinicalScore}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                          Working Memory Skoru
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                          {numberSequenceAnalytics.avgDigitSpanCapacity !== null ? `${numberSequenceAnalytics.avgDigitSpanCapacity}` : 'N/A'}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          Digit Span Kapasitesi
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                          {numberSequenceAnalytics.avgProcessingSpeed !== null ? `${numberSequenceAnalytics.avgProcessingSpeed}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Processing Speed
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                          {numberSequenceAnalytics.avgAttentionControl !== null ? `${numberSequenceAnalytics.avgAttentionControl}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          Attention Control
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 📊 Miller's 7±2 Rule Progression Chart */}
                  {numberSequenceAnalytics.millerProgressionData && numberSequenceAnalytics.millerProgressionData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                        Miller's 7±2 Rule - Working Memory Progression
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={numberSequenceAnalytics.millerProgressionData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 12]} label={{ value: 'Digit Span', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                      <p className="font-semibold text-gray-900 dark:text-gray-100">Session {label}</p>
                                      <p className="text-orange-600">Digit Span: {data.capacity}</p>
                                      <p className="text-gray-600">Category: {data.category}</p>
                                      <p className={`${data.isWithinNormal ? 'text-green-600' : 'text-blue-600'}`}>
                                        {data.isWithinNormal ? 'Miller 7±2 ✓' : 'Outside Normal Range'}
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            {/* Miller's 7±2 Rule reference lines */}
                            <ReferenceLine y={5} stroke="#EF4444" strokeDasharray="5 5" label="Miller 7-2" />
                            <ReferenceLine y={7} stroke="#10B981" strokeDasharray="3 3" label="Miller Optimal" />
                            <ReferenceLine y={9} stroke="#EF4444" strokeDasharray="5 5" label="Miller 7+2" />
                            <Line type="monotone" dataKey="capacity" stroke="#F97316" strokeWidth={3} name="Digit Span Capacity" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* 📈 Miller's 7±2 Rule Statistics */}
                  {numberSequenceAnalytics.millerStats && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Miller's 7±2 Rule Compliance Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="bg-gray-50 dark:bg-gray-800/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                              {numberSequenceAnalytics.millerStats.totalAssessments}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Toplam Test
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50 dark:bg-green-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-green-700 dark:text-green-300">
                              {numberSequenceAnalytics.millerStats.withinNormalRange}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Normal Range (5-9)
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-blue-50 dark:bg-blue-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                              {numberSequenceAnalytics.millerStats.average}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              Average (6-8)
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 dark:bg-purple-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                              {numberSequenceAnalytics.millerStats.exceptional}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                              Exceptional (10+)
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-orange-50 dark:bg-orange-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                              {numberSequenceAnalytics.millerStats.averageCapacity}
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                              Ortalama Kapasite
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  
                  {/* 💡 Working Memory Clinical Insights */}
                  {numberSequenceAnalytics.topClinicalInsights && numberSequenceAnalytics.topClinicalInsights.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Working Memory Clinical Insights
                      </h4>
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <ul className="list-disc list-inside space-y-2 text-yellow-800 dark:text-yellow-200">
                          {numberSequenceAnalytics.topClinicalInsights.map((insight, index) => (
                            <li key={index} className="text-sm">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* 📈 Performance Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {numberSequenceAnalytics.totalGames}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Toplam Oyun
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
                          {numberSequenceAnalytics.avgScore}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Ortalama Skor
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {numberSequenceAnalytics.avgMaxLevel}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Ortalama Max Level
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-orange-50 dark:bg-orange-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                          {Math.round(numberSequenceAnalytics.avgDuration / 60)}dk
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Ortalama Süre
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                </CardContent>
              </Card>
            )}

            {colorSequenceAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Renk Dizisi Takibi') && (
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Palette className="w-6 h-6 text-cyan-600" />
                    </div>
                    Renk Dizisi Takibi - Visual-Spatial Memory Assessment
                  </CardTitle>
                  <CardDescription className="text-base">
                    Görsel-uzamsal bellek analizi ve klinik değerlendirme sonuçları
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* 🧠 Visual-Spatial Memory Clinical Overview */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-cyan-600" />
                      Visual-Spatial Memory Clinical Overview
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300 mb-2">
                            {colorSequenceAnalytics.avgClinicalScore !== null ? `${colorSequenceAnalytics.avgClinicalScore}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                            Görsel-Uzamsal Bellek
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                            {colorSequenceAnalytics.avgVisualSpanCapacity !== null ? `${colorSequenceAnalytics.avgVisualSpanCapacity}` : 'N/A'}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Visual Span Kapasitesi
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                            {colorSequenceAnalytics.avgSpatialProcessingSpeed !== null ? `${colorSequenceAnalytics.avgSpatialProcessingSpeed}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            Spatial Processing Speed
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2">
                            {colorSequenceAnalytics.avgColorRecognitionAccuracy !== null ? `${colorSequenceAnalytics.avgColorRecognitionAccuracy}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Color Recognition
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* 📊 Visual-Spatial Pattern Progression Chart */}
                  {colorSequenceAnalytics?.visualSpatialProgressionData && colorSequenceAnalytics.visualSpatialProgressionData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-600" />
                        Visual-Spatial Pattern - Capacity Progression
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={colorSequenceAnalytics.visualSpatialProgressionData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 12]} label={{ value: 'Color Span', angle: -90, position: 'insideLeft' }} />
                            <Tooltip 
                              formatter={(value: number | string, name: string) => [
                                name === 'capacity' ? `${value} Color Pattern` : value,
                                name === 'capacity' ? 'Visual Span' : name
                              ]}
                              labelFormatter={(label: string | number) => `Session ${label}`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="capacity" 
                              stroke="#06B6D4" 
                              strokeWidth={3}
                              dot={{ r: 6, fill: '#06B6D4' }}
                              activeDot={{ r: 8, stroke: '#06B6D4', strokeWidth: 2, fill: '#fff' }}
                            />
                            {/* Visual Complexity Reference Lines */}
                            <ReferenceLine y={4} stroke="#3B82F6" strokeDasharray="5 5" label={{ value: "Baseline (4 colors)", position: "top" }} />
                            <ReferenceLine y={7} stroke="#10B981" strokeDasharray="5 5" label={{ value: "Normal Visual Range (7 colors)", position: "top" }} />
                            <ReferenceLine y={9} stroke="#8B5CF6" strokeDasharray="5 5" label={{ value: "Exceptional (9+ colors)", position: "top" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  
                  {/* 🎯 Visual Pattern Complexity Analysis */}
                  {colorSequenceAnalytics?.visualPatternStats && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Visual Pattern Complexity Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="bg-gray-50 dark:bg-gray-800/50">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                              {colorSequenceAnalytics.visualPatternStats.totalAssessments}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Toplam Test
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-blue-50 dark:bg-blue-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                              {colorSequenceAnalytics.visualPatternStats.mediumComplexity}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              Medium Complexity
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50 dark:bg-green-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-green-700 dark:text-green-300">
                              {colorSequenceAnalytics.visualPatternStats.highComplexity}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">
                              High Complexity
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 dark:bg-purple-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-purple-700 dark:text-purple-300">
                              {colorSequenceAnalytics.visualPatternStats.exceptionalComplexity}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                              Exceptional
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-cyan-50 dark:bg-cyan-900/20">
                          <CardContent className="p-4 text-center">
                            <div className="text-xl font-bold text-cyan-700 dark:text-cyan-300">
                              {colorSequenceAnalytics.visualPatternStats.averageCapacity}
                            </div>
                            <div className="text-sm text-cyan-600 dark:text-cyan-400">
                              Ortalama Kapasite
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                  
                  {/* 💡 Visual-Spatial Clinical Insights */}
                  {colorSequenceAnalytics?.topClinicalInsights && colorSequenceAnalytics.topClinicalInsights.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Visual-Spatial Memory Clinical Insights
                      </h4>
                      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 p-4 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <ul className="list-disc list-inside space-y-2 text-cyan-800 dark:text-cyan-200">
                          {colorSequenceAnalytics.topClinicalInsights.map((insight, index) => (
                            <li key={index} className="text-sm">{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* 📈 Performance Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {colorSequenceAnalytics.totalGames}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Toplam Oyun
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 dark:bg-green-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
                          {colorSequenceAnalytics.avgScore}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Ortalama Skor
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-50 dark:bg-blue-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {colorSequenceAnalytics.avgMaxLevel}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          Ortalama Max Level
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-orange-50 dark:bg-orange-900/20">
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-orange-700 dark:text-orange-300">
                          {Math.round(colorSequenceAnalytics.avgDuration / 60)}dk
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Ortalama Süre
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                </CardContent>
              </Card>
            )}

            {/* Legacy Color Sequence Chart - Keep for backwards compatibility */}
            {legacyColorSequenceAnalytics && !colorSequenceAnalytics && (selectedExerciseFilter === 'all' || selectedExerciseFilter === 'Renk Dizisi Takibi') && (
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
                      <AreaChart data={legacyColorSequenceAnalytics}>
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
                {filteredResults.length > 1 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Trend görüntülemek için en az 2 egzersiz gerekli</p>
                    </div>
                  </div>
                )}
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
                            : (result.exerciseName as { exerciseName?: string })?.exerciseName || 'Bilinmeyen Egzersiz'
                          }
                        </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {(result.details?.level_identifier as string) || 'Bilinmiyor'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-primary text-sm sm:text-lg">{result.score}</span>
                          </TableCell>
                          <TableCell className="font-medium text-xs sm:text-sm">{formatTime(result.duration)}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {result.exerciseName === 'Hafıza Oyunu' && (
                              <span>Hamle: {(result.details?.moves_count as number) || '-'}, Hata: {(result.details?.incorrect_moves_count as number) || '-'}</span>
                            )}
                            {result.exerciseName === 'Londra Kulesi Testi' && (
                              <span>
                                Hamle: {(result.details?.user_moves_taken as number) || '-'}/{(result.details?.min_moves_required as number) || '-'}, 
                                Verimlilik: {(result.details?.efficiency_percentage as number) || '-'}%
                                {result.details?.completed_optimally && <Star className="w-3 h-3 inline ml-1 text-amber-500" />}
                              </span>
                            )}
                            {typeof result.exerciseName === 'string' && result.exerciseName.includes('Eşleştirme') && (
                              <span>Doğru: {(result.details?.correct_answers as number) || '-'}/{(result.details?.total_questions as number) || '-'}</span>
                            )}
                            {typeof result.exerciseName === 'string' && result.exerciseName.includes('Dizisi') && (
                              <span>Max Seviye: {(result.details?.max_sequence_length as number) || (result.details?.level as number) || '-'}</span>
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
  )
}

export default IstatistiklerSayfasi
