import { useState, useCallback, useEffect, useRef } from 'react'
import { useAudio } from './useAudio'
import React from 'react'

interface UseColorSequenceProps {
  initialLevel?: number
}

// 🧠 Clinical Data Structure - Visual-Spatial Memory Assessment
export interface ClinicalVisualSpatialData {
  // Core visual-spatial memory metrics
  visualSpanCapacity: number          // Maximum successful visual sequence length (0-12+)
  visualMemoryScore: number           // Overall visual memory efficiency (0-100)
  spatialProcessingSpeed: number      // Visual encoding/retrieval speed score (0-100)
  colorRecognitionAccuracy: number    // Color pattern recognition accuracy (0-100)
  visualAttentionSpan: number         // Sustained visual attention during tasks (0-100)
  overallVisualSpatialMemory: number  // Weighted composite score (0-100)
  
  // Visual pattern analysis
  visualPatternCompliance: {
    sequenceRange: string             // e.g., "4-color", "6-color" patterns
    visualComplexity: 'low' | 'medium' | 'high' | 'exceptional'
    patternRecognitionCategory: 'below-average' | 'average' | 'above-average' | 'exceptional'
    visualProcessingDeviation: number // How far from optimal visual processing
  }
  
  // Level-specific visual-spatial performance
  levelVisualPerformance: {
    [level: number]: {
      sequenceLength: number          // Visual sequence length for this level
      attempts: number                // How many attempts at this level
      successes: number               // Successful completions
      failures: number                // Failed attempts
      averageColorReactionTime: number // Average time per color input
      visualEncodingTime: number      // Time to encode the visual sequence
      spatialRetrievalAccuracy: number // Accuracy during visual retrieval phase
      colorDiscriminationIndex: number // Color differentiation ability
      visualAttentionMaintenance: boolean // Whether attention maintained throughout
    }
  }
  
  // Visual-spatial pattern analysis
  visualSpatialPatterns: {
    maxVisualSpanReached: number      // Highest successful visual span
    optimalVisualRange: [number, number] // User's optimal visual memory range
    visualLearningCurve: number[]     // Success rate progression over levels
    colorFatigueIndex: number         // Performance degradation over time with colors
    visualConsistencyScore: number   // Variability in visual performance
    spatialMemoryEfficiency: number  // Overall visual-spatial cognitive efficiency
  }
  
  // Clinical insights and visual-spatial profiling
  visualSpatialCognitiveProfile: {
    visualStrengths: string[]         // Strong visual-spatial areas
    spatialWeaknesses: string[]       // Areas needing improvement
    colorProcessingStatus: string     // Relationship to color processing norms
    visualCognitiveRecommendations: string[]
    spatialMemoryNotes: string[]
  }
  
  // Raw data for detailed visual-spatial analysis
  rawVisualSessionData: {
    levels: Array<{
      level: number
      sequenceLength: number
      colorSequence: number[]
      userColorInput: number[]
      isSuccess: boolean
      colorReactionTimes: number[]    // Time for each color input
      visualEncodingStartTime: number // When color sequence display started
      visualEncodingEndTime: number   // When input phase started
      spatialRetrievalStartTime: number // When user started inputting colors
      spatialRetrievalEndTime: number // When sequence was completed/failed
      visualCognitiveLoadAtLevel: number // Calculated visual-spatial cognitive load
      timestamp: string
    }>
  }
}

interface ColorSequenceState {
  currentLevel: number
  sequence: number[]
  userInput: number[]
  phase: 'ready' | 'showing' | 'input' | 'feedback'
  showingIndex: number
  highlightedColor: number | null
  score: number
  correctCount: number
  incorrectCount: number
  questionStartTime: number
  isGameCompleted: boolean
  maxLevelReached: number
  
  // Enhanced tracking for visual-spatial memory clinical assessment
  visualEncodingStartTime: number
  visualEncodingEndTime: number
  spatialRetrievalStartTime: number
  currentColorReactionTimes: number[]
  
  // Clinical data
  clinicalData: ClinicalVisualSpatialData
}

// Error handling için
interface ColorSequenceError {
  type: 'initialization' | 'gameplay' | 'timer'
  message: string
}

// 🔧 FIX: Unified timing configuration
const TIMING_CONFIG = {
  SHOW_DELAY: 500,        // Renk gösterilmeden önce bekleme
  SHOW_DURATION: 750,     // Renk gösterilme süresi  
  HIDE_DURATION: 250,     // Renkler arası bekleme
  INITIAL_DELAY: 1000     // İlk renk öncesi bekleme
} as const

// Renk tanımları
export const colors = [
  { id: 0, name: 'Kırmızı', bg: 'bg-red-500', hover: 'hover:bg-red-600', active: 'bg-red-600' },
  { id: 1, name: 'Yeşil', bg: 'bg-green-500', hover: 'hover:bg-green-600', active: 'bg-green-600' },
  { id: 2, name: 'Mavi', bg: 'bg-blue-500', hover: 'hover:bg-blue-600', active: 'bg-blue-600' },
  { id: 3, name: 'Sarı', bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', active: 'bg-yellow-600' }
]

export const useColorSequence = ({ initialLevel = 1 }: UseColorSequenceProps = {}) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)
  // 🔧 FIX: Single unified timer instead of multiple timers
  const sequenceTimerRef = useRef<NodeJS.Timeout>()
  
  // Error states
  const [error, setError] = useState<ColorSequenceError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [state, setState] = useState<ColorSequenceState>({
    currentLevel: initialLevel,
    sequence: [],
    userInput: [],
    phase: 'ready',
    showingIndex: 0,
    highlightedColor: null,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    questionStartTime: 0,
    isGameCompleted: false,
    maxLevelReached: initialLevel,
    
    // Enhanced tracking for visual-spatial memory clinical assessment
    visualEncodingStartTime: 0,
    visualEncodingEndTime: 0,
    spatialRetrievalStartTime: 0,
    currentColorReactionTimes: [],
    
    // Clinical data
    clinicalData: {
      visualSpanCapacity: 0,
      visualMemoryScore: 0,
      spatialProcessingSpeed: 0,
      colorRecognitionAccuracy: 0,
      visualAttentionSpan: 0,
      overallVisualSpatialMemory: 0,
      visualPatternCompliance: {
        sequenceRange: "",
        visualComplexity: "low",
        patternRecognitionCategory: "below-average",
        visualProcessingDeviation: 0
      },
      levelVisualPerformance: {},
      visualSpatialPatterns: {
        maxVisualSpanReached: 0,
        optimalVisualRange: [0, 0],
        visualLearningCurve: [],
        colorFatigueIndex: 0,
        visualConsistencyScore: 0,
        spatialMemoryEfficiency: 0
      },
      visualSpatialCognitiveProfile: {
        visualStrengths: [],
        spatialWeaknesses: [],
        colorProcessingStatus: "",
        visualCognitiveRecommendations: [],
        spatialMemoryNotes: []
      },
      rawVisualSessionData: {
        levels: []
      }
    }
  })

  const generateSequence = useCallback((length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 4))
  }, [])

  // 🔧 FIX: Cleanup effect with single timer cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current)
      }
    }
  }, [])

  // Error recovery function
  const recoverFromError = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  const initializeGame = useCallback(() => {
    try {
      setError(null)
      setIsLoading(true)
      
      // 🔧 FIX: Clear single timer
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current)
      }
      
    setState({
      currentLevel: initialLevel,
      sequence: [],
      userInput: [],
      phase: 'ready',
      showingIndex: 0,
      highlightedColor: null,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      questionStartTime: 0,
      isGameCompleted: false,
        maxLevelReached: initialLevel,
        
        // Enhanced tracking for visual-spatial memory clinical assessment
        visualEncodingStartTime: 0,
        visualEncodingEndTime: 0,
        spatialRetrievalStartTime: 0,
        currentColorReactionTimes: [],
        
        // Clinical data
        clinicalData: {
          visualSpanCapacity: 0,
          visualMemoryScore: 0,
          spatialProcessingSpeed: 0,
          colorRecognitionAccuracy: 0,
          visualAttentionSpan: 0,
          overallVisualSpatialMemory: 0,
          visualPatternCompliance: {
            sequenceRange: "",
            visualComplexity: "low",
            patternRecognitionCategory: "below-average",
            visualProcessingDeviation: 0
          },
          levelVisualPerformance: {},
          visualSpatialPatterns: {
            maxVisualSpanReached: 0,
            optimalVisualRange: [0, 0],
            visualLearningCurve: [],
            colorFatigueIndex: 0,
            visualConsistencyScore: 0,
            spatialMemoryEfficiency: 0
          },
          visualSpatialCognitiveProfile: {
            visualStrengths: [],
            spatialWeaknesses: [],
            colorProcessingStatus: "",
            visualCognitiveRecommendations: [],
            spatialMemoryNotes: []
          },
          rawVisualSessionData: {
            levels: []
          }
        }
      })
      
      setIsLoading(false)
    } catch (err) {
      console.error('Color sequence initialization error:', err)
      setError({
        type: 'initialization',
        message: 'Oyun başlatılamadı. Lütfen tekrar deneyin.'
      })
      setIsLoading(false)
    }
  }, [initialLevel])

  const startNextLevel = useCallback(() => {
    try {
      if (error || isLoading) return
      
    const sequenceLength = 1 + state.currentLevel
    const newSequence = generateSequence(sequenceLength)
      
      // Clear any existing timer
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current)
      }
    
    setState(prev => ({
      ...prev,
      sequence: newSequence,
      userInput: [],
      phase: 'showing',
      showingIndex: 0,
      highlightedColor: null,
        questionStartTime: Date.now(),
        // 🧠 Enhanced clinical tracking
        visualEncodingStartTime: Date.now(),
        visualEncodingEndTime: 0,
        spatialRetrievalStartTime: 0,
        currentColorReactionTimes: []
      }))
    } catch (err) {
      console.error('Start next level error:', err)
      setError({
        type: 'gameplay',
        message: 'Yeni seviye başlatılamadı.'
      })
    }
  }, [state.currentLevel, generateSequence, error, isLoading])

  // 🔧 FIX: Unified sequence showing system with single timer
  const showSequence = useCallback(() => {
    if (!mountedRef.current || state.phase !== 'showing') return

    try {
      let currentIndex = 0

      const showNextColor = () => {
        if (!mountedRef.current || currentIndex >= state.sequence.length) {
          // Sequence completed, switch to input phase with clinical tracking
      setState(prev => ({
        ...prev,
            phase: 'input',
            highlightedColor: null,
            visualEncodingEndTime: Date.now(),
            spatialRetrievalStartTime: Date.now()
      }))
          return
    }

        // Show current color
      setState(prev => ({
        ...prev,
          highlightedColor: prev.sequence[currentIndex],
          showingIndex: currentIndex
        }))

        // Hide color after SHOW_DURATION and continue
        sequenceTimerRef.current = setTimeout(() => {
          if (!mountedRef.current) return
          
          setState(prev => ({ ...prev, highlightedColor: null }))
          
          // Move to next color after HIDE_DURATION
          sequenceTimerRef.current = setTimeout(() => {
            if (!mountedRef.current) return
            currentIndex++
            showNextColor()
          }, TIMING_CONFIG.HIDE_DURATION)
          
        }, TIMING_CONFIG.SHOW_DURATION)
      }

      // Start showing sequence with initial delay
      sequenceTimerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          showNextColor()
            }
      }, TIMING_CONFIG.INITIAL_DELAY)

    } catch (err) {
      console.error('Sequence showing error:', err)
      setError({
        type: 'timer',
        message: 'Renk dizisi gösterimi sırasında hata oluştu.'
      })
    }
  }, [state.phase, state.sequence])

  // 🔧 FIX: Simple effect to trigger sequence showing
  useEffect(() => {
    if (state.phase === 'showing' && state.sequence.length > 0) {
      showSequence()
    }

    return () => {
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current)
      }
    }
  }, [state.phase, state.sequence.length, showSequence])

  const handleColorInput = useCallback((colorId: number) => {
    try {
      if (state.phase !== 'input' || error || isLoading) return

      const inputTime = Date.now()
      const reactionTime = inputTime - (state.spatialRetrievalStartTime + (state.userInput.length * 500)) // Approximate time for this specific input
    const newUserInput = [...state.userInput, colorId]
      const newReactionTimes = [...state.currentColorReactionTimes, reactionTime]
    const isCorrect = newUserInput[newUserInput.length - 1] === state.sequence[newUserInput.length - 1]

    if (!isCorrect) {
      // Hatalı giriş - seviye başarısız
      playSound('wrong-answer')
        
        // Record failed level data for visual-spatial analysis
        const levelData = {
          level: state.currentLevel,
          sequenceLength: state.sequence.length,
          colorSequence: state.sequence,
          userColorInput: newUserInput,
          isSuccess: false,
          colorReactionTimes: newReactionTimes,
          visualEncodingStartTime: state.visualEncodingStartTime,
          visualEncodingEndTime: state.visualEncodingEndTime,
          spatialRetrievalStartTime: state.spatialRetrievalStartTime,
          spatialRetrievalEndTime: inputTime,
          visualCognitiveLoadAtLevel: Math.min(100, state.sequence.length * 15),
          timestamp: new Date().toISOString()
        }

        setState(prev => {
          const newClinicalData = { ...prev.clinicalData }
          
          // Update level performance
          if (!newClinicalData.levelVisualPerformance[state.currentLevel]) {
            newClinicalData.levelVisualPerformance[state.currentLevel] = {
              sequenceLength: state.sequence.length,
              attempts: 0,
              successes: 0,
              failures: 0,
              averageColorReactionTime: 0,
              visualEncodingTime: 0,
              spatialRetrievalAccuracy: 0,
              colorDiscriminationIndex: 0,
              visualAttentionMaintenance: false
            }
          }
          
          const levelPerf = newClinicalData.levelVisualPerformance[state.currentLevel]
          levelPerf.attempts += 1
          levelPerf.failures += 1
          levelPerf.averageColorReactionTime = (levelPerf.averageColorReactionTime * (levelPerf.attempts - 1) + reactionTime) / levelPerf.attempts
          levelPerf.visualEncodingTime = state.visualEncodingEndTime - state.visualEncodingStartTime
          levelPerf.spatialRetrievalAccuracy = Math.max(0, ((newUserInput.length - 1) / state.sequence.length) * 100)
          levelPerf.colorDiscriminationIndex = Math.max(20, 100 - (reactionTime / 50)) // Slower reaction = lower discrimination
          levelPerf.visualAttentionMaintenance = reactionTime < 3000 // Maintained attention if quick response
          
          // Add to raw data
          newClinicalData.rawVisualSessionData.levels.push(levelData)
          
          const newIncorrectCount = prev.incorrectCount + 1
          
          // 🧠 AUTO GAME COMPLETION: End game after 3 incorrect attempts
          const shouldEndGame = newIncorrectCount >= 3
          
          console.log(`🧠 Color Sequence - Incorrect answer. Count: ${newIncorrectCount}/3. ${shouldEndGame ? 'ENDING GAME' : 'Continue'}`)
          
          return {
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
            incorrectCount: newIncorrectCount,
            currentColorReactionTimes: newReactionTimes,
            isGameCompleted: shouldEndGame,
            clinicalData: newClinicalData
          }
        })
      return 'incorrect'
    }

    if (newUserInput.length === state.sequence.length) {
      // Seviye tamamlandı - doğru
      playSound('correct-answer')
      const newScore = state.score + (state.currentLevel * 10)
      const newLevel = state.currentLevel + 1
      
        // Record successful level data for visual-spatial analysis
        const levelData = {
          level: state.currentLevel,
          sequenceLength: state.sequence.length,
          colorSequence: state.sequence,
          userColorInput: newUserInput,
          isSuccess: true,
          colorReactionTimes: newReactionTimes,
          visualEncodingStartTime: state.visualEncodingStartTime,
          visualEncodingEndTime: state.visualEncodingEndTime,
          spatialRetrievalStartTime: state.spatialRetrievalStartTime,
          spatialRetrievalEndTime: inputTime,
          visualCognitiveLoadAtLevel: Math.min(100, state.sequence.length * 15),
          timestamp: new Date().toISOString()
        }
        
        setState(prev => {
          const newClinicalData = { ...prev.clinicalData }
          
          // Update level performance
          if (!newClinicalData.levelVisualPerformance[state.currentLevel]) {
            newClinicalData.levelVisualPerformance[state.currentLevel] = {
              sequenceLength: state.sequence.length,
              attempts: 0,
              successes: 0,
              failures: 0,
              averageColorReactionTime: 0,
              visualEncodingTime: 0,
              spatialRetrievalAccuracy: 0,
              colorDiscriminationIndex: 0,
              visualAttentionMaintenance: false
            }
          }
          
          const levelPerf = newClinicalData.levelVisualPerformance[state.currentLevel]
          levelPerf.attempts += 1
          levelPerf.successes += 1
          levelPerf.averageColorReactionTime = (levelPerf.averageColorReactionTime * (levelPerf.attempts - 1) + (newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length)) / levelPerf.attempts
          levelPerf.visualEncodingTime = state.visualEncodingEndTime - state.visualEncodingStartTime
          levelPerf.spatialRetrievalAccuracy = 100 // Perfect accuracy
          levelPerf.colorDiscriminationIndex = Math.max(80, 100 - (newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length / 100))
          levelPerf.visualAttentionMaintenance = newReactionTimes.every(rt => rt < 2000) // Consistent attention
          
          // Add to raw data
          newClinicalData.rawVisualSessionData.levels.push(levelData)
          
          // 🧠 AUTO GAME COMPLETION: End game after reaching level 10 (11+ colors)
          const shouldEndGame = newLevel > 10
          
          console.log(`🧠 Color Sequence - Level ${state.currentLevel} completed! New level: ${newLevel}. ${shouldEndGame ? 'ENDING GAME - Max level reached' : 'Continue'}`)
          
          return {
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
        score: newScore,
        correctCount: prev.correctCount + 1,
        currentLevel: newLevel,
            maxLevelReached: Math.max(prev.maxLevelReached, newLevel),
            currentColorReactionTimes: newReactionTimes,
            isGameCompleted: shouldEndGame,
            clinicalData: newClinicalData
          }
        })
      return 'level_complete'
    } else {
      // Doğru renk seçildi, devam et
      setState(prev => ({
        ...prev,
          userInput: newUserInput,
          currentColorReactionTimes: newReactionTimes
      }))
      return 'continue'
    }
    } catch (err) {
      console.error('Color input error:', err)
      setError({
        type: 'gameplay',
        message: 'Renk seçimi işlenirken hata oluştu.'
      })
      return 'error'
    }
  }, [state.phase, state.userInput, state.sequence, state.score, state.currentLevel, state.visualEncodingStartTime, state.visualEncodingEndTime, state.spatialRetrievalStartTime, state.currentColorReactionTimes, playSound, error, isLoading])

  const nextLevel = useCallback(() => {
    startNextLevel()
  }, [startNextLevel])

  const retryLevel = useCallback(() => {
    startNextLevel()
  }, [startNextLevel])

  const endGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGameCompleted: true
    }))
    
    // Update clinical data one final time
    setTimeout(() => {
      updateClinicalData()
    }, 100)
  }, [])

  const getSequenceLength = useCallback(() => {
    return 1 + state.currentLevel
  }, [state.currentLevel])

  const getFinalStats = useCallback(() => {
    return {
      maxLevelReached: state.maxLevelReached,
      score: state.score,
      correctCount: state.correctCount,
      incorrectCount: state.incorrectCount,
      finalLevel: state.currentLevel,
      // 🧠 Clinical data for visual-spatial memory assessment
      clinicalData: state.clinicalData
    }
  }, [state])

  // Update clinical data with current state
  const updateClinicalData = useCallback(() => {
    setState(prev => {
      const levelData = { ...prev.clinicalData }
      
      // Calculate all clinical metrics
      levelData.visualSpanCapacity = calculateVisualSpanCapacity(levelData)
      levelData.visualMemoryScore = calculateVisualMemoryScore(levelData)
      levelData.spatialProcessingSpeed = calculateSpatialProcessingSpeed(levelData)
      levelData.colorRecognitionAccuracy = calculateColorRecognitionAccuracy(levelData)
      levelData.visualAttentionSpan = calculateVisualAttentionSpan(levelData)
      
      // Calculate overall visual-spatial memory score
      levelData.overallVisualSpatialMemory = Math.round(
        (levelData.visualMemoryScore * 0.3 + 
         levelData.spatialProcessingSpeed * 0.2 + 
         levelData.colorRecognitionAccuracy * 0.2 + 
         levelData.visualAttentionSpan * 0.15 +
         Math.min(100, levelData.visualSpanCapacity * 15) * 0.15)
      )
      
      // Generate pattern compliance and profile
      levelData.visualPatternCompliance = generateVisualPatternCompliance(levelData)
      levelData.visualSpatialCognitiveProfile = generateVisualSpatialCognitiveProfile(levelData)
      
      return { ...prev, clinicalData: levelData }
    })
  }, [])

  // 🧠 VISUAL-SPATIAL MEMORY CLINICAL ASSESSMENT FUNCTIONS
  
  // Calculate visual span capacity based on successful completions
  const calculateVisualSpanCapacity = useCallback((levelData: ClinicalVisualSpatialData): number => {
    const maxSuccess = Math.max(...Object.keys(levelData.levelVisualPerformance)
      .map(Number)
      .filter(level => levelData.levelVisualPerformance[level].successes > 0))
    return isFinite(maxSuccess) ? maxSuccess + 1 : 1 // +1 because level 1 = 2 colors, etc.
  }, [])

  // Calculate visual memory efficiency score
  const calculateVisualMemoryScore = useCallback((levelData: ClinicalVisualSpatialData): number => {
    const performances = Object.values(levelData.levelVisualPerformance)
    if (performances.length === 0) return 0
    
    const totalSuccesses = performances.reduce((sum, p) => sum + p.successes, 0)
    const totalAttempts = performances.reduce((sum, p) => sum + p.attempts, 0)
    const successRate = totalAttempts > 0 ? (totalSuccesses / totalAttempts) : 0
    
    // Weight by sequence length difficulty
    const weightedScore = performances.reduce((sum, p) => {
      const difficulty = p.sequenceLength
      const levelSuccessRate = p.attempts > 0 ? (p.successes / p.attempts) : 0
      return sum + (levelSuccessRate * difficulty * 10)
    }, 0)
    
    return Math.min(100, Math.round(successRate * 70 + weightedScore * 0.3))
  }, [])

  // Calculate spatial processing speed
  const calculateSpatialProcessingSpeed = useCallback((levelData: ClinicalVisualSpatialData): number => {
    const performances = Object.values(levelData.levelVisualPerformance)
    if (performances.length === 0) return 0
    
    const avgEncodingTimes = performances.map(p => p.visualEncodingTime).filter(t => t > 0)
    const avgReactionTimes = performances.map(p => p.averageColorReactionTime).filter(t => t > 0)
    
    if (avgEncodingTimes.length === 0 && avgReactionTimes.length === 0) return 0
    
    // Fast encoding and reaction = higher score
    const avgEncoding = avgEncodingTimes.length > 0 ? avgEncodingTimes.reduce((a, b) => a + b, 0) / avgEncodingTimes.length : 3000
    const avgReaction = avgReactionTimes.length > 0 ? avgReactionTimes.reduce((a, b) => a + b, 0) / avgReactionTimes.length : 1000
    
    // Normalize: faster = higher score (max 100)
    const encodingScore = Math.max(0, 100 - Math.min(100, (avgEncoding - 500) / 50))
    const reactionScore = Math.max(0, 100 - Math.min(100, (avgReaction - 200) / 20))
    
    return Math.round((encodingScore + reactionScore) / 2)
  }, [])

  // Calculate color recognition accuracy
  const calculateColorRecognitionAccuracy = useCallback((levelData: ClinicalVisualSpatialData): number => {
    const performances = Object.values(levelData.levelVisualPerformance)
    if (performances.length === 0) return 0
    
    const accuracyScores = performances.map(p => p.spatialRetrievalAccuracy * p.colorDiscriminationIndex)
    return accuracyScores.length > 0 ? Math.round(accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length) : 0
  }, [])

  // Calculate visual attention span
  const calculateVisualAttentionSpan = useCallback((levelData: ClinicalVisualSpatialData): number => {
    const performances = Object.values(levelData.levelVisualPerformance)
    if (performances.length === 0) return 0
    
    const attentionMaintained = performances.filter(p => p.visualAttentionMaintenance).length
    const totalPerformances = performances.length
    
    const baseAttentionScore = totalPerformances > 0 ? (attentionMaintained / totalPerformances) * 100 : 0
    
    // Bonus for maintaining attention at higher difficulty levels
    const highLevelAttention = performances.filter(p => p.sequenceLength >= 5 && p.visualAttentionMaintenance).length
    const attentionBonus = highLevelAttention * 5
    
    return Math.min(100, Math.round(baseAttentionScore + attentionBonus))
  }, [])

  // Generate visual pattern compliance analysis
  const generateVisualPatternCompliance = useCallback((levelData: ClinicalVisualSpatialData) => {
    const maxSpan = calculateVisualSpanCapacity(levelData)
    const sequenceRange = `${maxSpan}-color pattern`
    
    let visualComplexity: 'low' | 'medium' | 'high' | 'exceptional' = 'low'
    let patternRecognitionCategory: 'below-average' | 'average' | 'above-average' | 'exceptional' = 'below-average'
    
    if (maxSpan >= 8) {
      visualComplexity = 'exceptional'
      patternRecognitionCategory = 'exceptional'
    } else if (maxSpan >= 6) {
      visualComplexity = 'high'
      patternRecognitionCategory = 'above-average'
    } else if (maxSpan >= 4) {
      visualComplexity = 'medium'
      patternRecognitionCategory = 'average'
    }
    
    // Visual processing deviation from optimal (4-7 color span)
    const optimalRange = [4, 7]
    const visualProcessingDeviation = maxSpan < optimalRange[0] 
      ? optimalRange[0] - maxSpan 
      : maxSpan > optimalRange[1] 
        ? maxSpan - optimalRange[1] 
        : 0
    
    return {
      sequenceRange,
      visualComplexity,
      patternRecognitionCategory,
      visualProcessingDeviation
    }
  }, [])

  // Generate visual-spatial cognitive profile with recommendations
  const generateVisualSpatialCognitiveProfile = useCallback((levelData: ClinicalVisualSpatialData) => {
    const visualStrengths: string[] = []
    const spatialWeaknesses: string[] = []
    const visualCognitiveRecommendations: string[] = []
    const spatialMemoryNotes: string[] = []
    
    const visualMemoryScore = levelData.visualMemoryScore
    const spatialProcessingSpeed = levelData.spatialProcessingSpeed
    const colorRecognitionAccuracy = levelData.colorRecognitionAccuracy
    const visualAttentionSpan = levelData.visualAttentionSpan
    const maxSpan = levelData.visualSpanCapacity
    
    // Analyze strengths
    if (visualMemoryScore >= 80) visualStrengths.push("Güçlü görsel hafıza")
    if (spatialProcessingSpeed >= 80) visualStrengths.push("Hızlı görsel işleme")
    if (colorRecognitionAccuracy >= 80) visualStrengths.push("Mükemmel renk ayırt etme")
    if (visualAttentionSpan >= 80) visualStrengths.push("Sürdürülmüş görsel dikkat")
    if (maxSpan >= 7) visualStrengths.push("Üstün görsel-uzamsal bellek kapasitesi")
    
    // Analyze weaknesses
    if (visualMemoryScore < 60) spatialWeaknesses.push("Görsel hafıza güçlendirilmeli")
    if (spatialProcessingSpeed < 60) spatialWeaknesses.push("Görsel işleme hızı yavaş")
    if (colorRecognitionAccuracy < 60) spatialWeaknesses.push("Renk ayırt etme zorluğu")
    if (visualAttentionSpan < 60) spatialWeaknesses.push("Görsel dikkat süresi kısa")
    if (maxSpan < 4) spatialWeaknesses.push("Görsel-uzamsal bellek kapasitesi sınırlı")
    
    // Generate recommendations
    if (visualMemoryScore < 70) {
      visualCognitiveRecommendations.push("Görsel hafıza egzersizleri önerilir")
      visualCognitiveRecommendations.push("Renk-şekil eşleştirme aktiviteleri")
    }
    if (spatialProcessingSpeed < 70) {
      visualCognitiveRecommendations.push("Hızlı görsel tanıma egzersizleri")
      visualCognitiveRecommendations.push("Zamanlı görsel görevler")
    }
    if (maxSpan >= 7) {
      visualCognitiveRecommendations.push("İleri seviye görsel-uzamsal egzersizler")
    }
    
    // Clinical notes
    const compliance = levelData.visualPatternCompliance
    spatialMemoryNotes.push(`Görsel-uzamsal bellek kategorisi: ${compliance.patternRecognitionCategory}`)
    spatialMemoryNotes.push(`Maksimum renk dizisi: ${maxSpan} renk`)
    spatialMemoryNotes.push(`Görsel karmaşıklık seviyesi: ${compliance.visualComplexity}`)
    
    return {
      visualStrengths,
      spatialWeaknesses,
      colorProcessingStatus: `Renk işleme performansı: ${colorRecognitionAccuracy >= 80 ? 'Mükemmel' : colorRecognitionAccuracy >= 60 ? 'İyi' : 'Geliştirilmeli'}`,
      visualCognitiveRecommendations,
      spatialMemoryNotes
    }
  }, [])

  // 🔧 FIX: Only log once when hook is actually initialized, not on every render
  React.useEffect(() => {
    if (state.currentLevel === 1 && state.phase === 'ready' && !state.isGameCompleted) {
      console.log('🧠 Color Sequence Initialized with Visual-Spatial Memory Clinical Assessment')
    }
  }, []) // Empty dependency array - only run once on mount

  return {
    // Error states
    error,
    isLoading,
    recoverFromError,
    
    // Game state
    currentLevel: state.currentLevel,
    sequence: state.sequence,
    userInput: state.userInput,
    phase: state.phase,
    showingIndex: state.showingIndex,
    highlightedColor: state.highlightedColor,
    score: state.score,
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    isGameCompleted: state.isGameCompleted,
    maxLevelReached: state.maxLevelReached,
    
    // Computed
    sequenceLength: getSequenceLength(),
    
    // Actions
    initializeGame,
    startNextLevel,
    handleColorInput,
    nextLevel,
    retryLevel,
    endGame,
    getFinalStats
  }
} 