import { useState, useCallback, useEffect, useRef } from 'react'
import { useAudio } from './useAudio'

interface UseNumberSequenceProps {
  initialLevel?: number
}

// 🧠 Clinical Data Structure - Working Memory Assessment (Miller's 7±2 Rule)
export interface ClinicalWorkingMemoryData {
  // Core working memory metrics
  digitSpanCapacity: number          // Maximum successful span length (0-12+)
  workingMemoryScore: number         // Overall working memory efficiency (0-100)
  processingSpeed: number            // Encoding/retrieval speed score (0-100)
  cognitiveLoad: number              // Performance under increasing complexity (0-100)
  attentionControl: number           // Sustained attention during tasks (0-100)
  overallWorkingMemory: number       // Weighted composite score (0-100)
  
  // Miller's 7±2 Rule specific analysis
  millerCompliance: {
    spanRange: string                // e.g., "5±2", "7±2", "9±2"
    isWithinNormalRange: boolean     // 5-9 digit span normal range
    capacityCategory: 'below-average' | 'average' | 'above-average' | 'exceptional'
    millerDeviation: number          // How far from 7±2 optimal range
  }
  
  // Level-specific working memory performance
  levelWorkingMemoryPerformance: {
    [level: number]: {
      digitSpan: number               // Sequence length for this level
      attempts: number                // How many attempts at this level
      successes: number               // Successful completions
      failures: number                // Failed attempts
      averageReactionTime: number     // Average time per digit input
      encodingTime: number            // Time to encode the sequence
      retrievalAccuracy: number       // Accuracy during retrieval phase
      cognitiveLoadIndex: number      // Cognitive load for this span length
      millerRuleCompliance: boolean   // Whether span follows Miller's rule
    }
  }
  
  // Working memory pattern analysis
  workingMemoryPatterns: {
    maxSpanReached: number            // Highest successful span
    optimalSpanRange: [number, number] // User's optimal working memory range
    learningCurve: number[]           // Success rate progression over levels
    fatigueIndex: number              // Performance degradation over time
    consistencyScore: number          // Variability in performance
    workingMemoryEfficiency: number  // Overall cognitive efficiency
  }
  
  // Clinical insights and working memory profiling
  workingMemoryCognitiveProfile: {
    capacityStrengths: string[]       // Strong working memory areas
    processingWeaknesses: string[]    // Areas needing improvement
    millerRuleStatus: string          // Relationship to Miller's 7±2 rule
    cognitiveRecommendations: string[]
    workingMemoryNotes: string[]
  }
  
  // Raw data for detailed working memory analysis
  rawWorkingMemorySessionData: {
    levels: Array<{
      level: number
      digitSpan: number
      sequence: number[]
      userInput: number[]
      isSuccess: boolean
      reactionTimes: number[]         // Time for each digit input
      encodingStartTime: number       // When sequence display started
      encodingEndTime: number         // When input phase started
      retrievalStartTime: number      // When user started inputting
      retrievalEndTime: number        // When sequence was completed/failed
      cognitiveLoadAtLevel: number    // Calculated cognitive load
      timestamp: string
    }>
  }
}

interface NumberSequenceState {
  currentLevel: number
  sequence: number[]
  userInput: number[]
  phase: 'ready' | 'showing' | 'input' | 'feedback'
  showingIndex: number
  score: number
  correctCount: number
  incorrectCount: number
  questionStartTime: number
  isGameCompleted: boolean
  maxLevelReached: number
  
  // Enhanced tracking for working memory clinical assessment
  encodingStartTime: number
  encodingEndTime: number
  retrievalStartTime: number
  currentReactionTimes: number[]
  
  // Clinical data
  clinicalData: ClinicalWorkingMemoryData
}

// Error handling için
interface NumberSequenceError {
  type: 'initialization' | 'gameplay' | 'timer' | 'working_memory_analysis'
  message: string
}

export const useNumberSequence = ({ initialLevel = 1 }: UseNumberSequenceProps = {}) => {
  const { playSound } = useAudio()
  const mountedRef = useRef(true)
  const sequenceTimerRef = useRef<NodeJS.Timeout>()
  
  // Error states
  const [error, setError] = useState<NumberSequenceError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize clinical data structure for working memory assessment
  const initializeClinicalData = (): ClinicalWorkingMemoryData => ({
    digitSpanCapacity: 0,
    workingMemoryScore: 0,
    processingSpeed: 0,
    cognitiveLoad: 0,
    attentionControl: 0,
    overallWorkingMemory: 0,
    millerCompliance: {
      spanRange: '0±0',
      isWithinNormalRange: false,
      capacityCategory: 'below-average',
      millerDeviation: 7
    },
    levelWorkingMemoryPerformance: {},
    workingMemoryPatterns: {
      maxSpanReached: 0,
      optimalSpanRange: [0, 0],
      learningCurve: [],
      fatigueIndex: 0,
      consistencyScore: 0,
      workingMemoryEfficiency: 0
    },
    workingMemoryCognitiveProfile: {
      capacityStrengths: [],
      processingWeaknesses: [],
      millerRuleStatus: 'Unknown',
      cognitiveRecommendations: [],
      workingMemoryNotes: []
    },
    rawWorkingMemorySessionData: {
      levels: []
    }
  })
  
  const [state, setState] = useState<NumberSequenceState>({
    currentLevel: initialLevel,
    sequence: [],
    userInput: [],
    phase: 'ready',
    showingIndex: 0,
    score: 0,
    correctCount: 0,
    incorrectCount: 0,
    questionStartTime: 0,
    isGameCompleted: false,
    maxLevelReached: initialLevel,
    encodingStartTime: 0,
    encodingEndTime: 0,
    retrievalStartTime: 0,
    currentReactionTimes: [],
    clinicalData: initializeClinicalData()
  })

  // 🧠 Clinical Analysis Functions for Working Memory Assessment

  // Calculate working memory capacity based on Miller's 7±2 Rule
  const calculateWorkingMemoryCapacity = (levelPerformance: ClinicalWorkingMemoryData['levelWorkingMemoryPerformance']): number => {
    const successfulSpans = Object.entries(levelPerformance)
      .filter(([_, perf]) => perf.successes > 0)
      .map(([level, _]) => parseInt(level) + 2) // Convert level to actual digit span
    
    return successfulSpans.length > 0 ? Math.max(...successfulSpans) : 0
  }

  // Calculate processing speed (encoding and retrieval efficiency)
  const calculateProcessingSpeed = (rawData: ClinicalWorkingMemoryData['rawWorkingMemorySessionData']): number => {
    if (rawData.levels.length === 0) return 0
    
    const avgEncodingTime = rawData.levels.reduce((sum, level) => 
      sum + (level.encodingEndTime - level.encodingStartTime), 0) / rawData.levels.length
    
    const avgRetrievalTime = rawData.levels.reduce((sum, level) => 
      sum + (level.retrievalEndTime - level.retrievalStartTime), 0) / rawData.levels.length
    
    // Optimal encoding: ~1000ms per digit, optimal retrieval: ~500ms per digit
    const optimalEncodingTime = 1000 * (rawData.levels[0]?.digitSpan || 3)
    const optimalRetrievalTime = 500 * (rawData.levels[0]?.digitSpan || 3)
    
    const encodingEfficiency = Math.max(0, 100 - ((avgEncodingTime - optimalEncodingTime) / optimalEncodingTime) * 100)
    const retrievalEfficiency = Math.max(0, 100 - ((avgRetrievalTime - optimalRetrievalTime) / optimalRetrievalTime) * 100)
    
    return Math.round((encodingEfficiency + retrievalEfficiency) / 2)
  }

  // Calculate cognitive load performance
  const calculateCognitiveLoad = (levelPerformance: ClinicalWorkingMemoryData['levelWorkingMemoryPerformance']): number => {
    const levels = Object.entries(levelPerformance).sort(([a], [b]) => parseInt(a) - parseInt(b))
    if (levels.length < 2) return 50 // Default for insufficient data
    
    let loadScore = 100
    for (let i = 1; i < levels.length; i++) {
      const [prevLevel, prevPerf] = levels[i-1]
      const [currLevel, currPerf] = levels[i]
      
      const prevAccuracy = prevPerf.successes / (prevPerf.successes + prevPerf.failures)
      const currAccuracy = currPerf.successes / (currPerf.successes + currPerf.failures)
      
      // Expect some decline as cognitive load increases, but not dramatic
      const expectedDecline = (parseInt(currLevel) - parseInt(prevLevel)) * 5 // 5% per level increase
      const actualDecline = (prevAccuracy - currAccuracy) * 100
      
      if (actualDecline > expectedDecline * 2) {
        loadScore -= 15 // Poor cognitive load management
      } else if (actualDecline <= expectedDecline) {
        loadScore += 5 // Good cognitive load management
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(loadScore)))
  }

  // Calculate attention control (consistency across attempts)
  const calculateAttentionControl = (levelPerformance: ClinicalWorkingMemoryData['levelWorkingMemoryPerformance']): number => {
    const allAccuracies = Object.values(levelPerformance).map(perf => 
      perf.successes / (perf.successes + perf.failures)
    ).filter(acc => !isNaN(acc))
    
    if (allAccuracies.length === 0) return 0
    
    const mean = allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length
    const variance = allAccuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / allAccuracies.length
    
    // Lower variance = better attention control
    const consistencyScore = Math.max(0, 100 - (variance * 200)) // Scale variance to 0-100
    return Math.round(consistencyScore)
  }

  // Generate Miller's 7±2 Rule compliance analysis
  const generateMillerCompliance = (maxSpan: number): ClinicalWorkingMemoryData['millerCompliance'] => {
    const deviation = Math.abs(maxSpan - 7)
    
    let spanRange: string
    let isWithinNormalRange: boolean
    let capacityCategory: ClinicalWorkingMemoryData['millerCompliance']['capacityCategory']
    
    if (maxSpan <= 4) {
      spanRange = `${maxSpan}±2`
      isWithinNormalRange = false
      capacityCategory = 'below-average'
    } else if (maxSpan <= 9) {
      spanRange = `7±${Math.max(2, deviation)}`
      isWithinNormalRange = true
      capacityCategory = maxSpan < 6 ? 'below-average' : maxSpan > 8 ? 'above-average' : 'average'
    } else {
      spanRange = `${maxSpan}±2`
      isWithinNormalRange = false
      capacityCategory = 'exceptional'
    }
    
    return {
      spanRange,
      isWithinNormalRange,
      capacityCategory,
      millerDeviation: deviation
    }
  }

  // Generate working memory cognitive profile and recommendations
  const generateWorkingMemoryProfile = (
    capacity: number,
    overallMetrics: { processing: number, load: number, attention: number, memory: number }
  ): ClinicalWorkingMemoryData['workingMemoryCognitiveProfile'] => {
    const profile: ClinicalWorkingMemoryData['workingMemoryCognitiveProfile'] = {
      capacityStrengths: [],
      processingWeaknesses: [],
      millerRuleStatus: 'Unknown',
      cognitiveRecommendations: [],
      workingMemoryNotes: []
    }

    // Determine Miller's rule status
    if (capacity >= 5 && capacity <= 9) {
      profile.millerRuleStatus = `Normal range (${capacity}/7±2) - Healthy working memory capacity`
    } else if (capacity < 5) {
      profile.millerRuleStatus = `Below normal range (${capacity}/7±2) - May indicate working memory limitations`
    } else {
      profile.millerRuleStatus = `Above normal range (${capacity}/7±2) - Exceptional working memory capacity`
    }

    // Identify strengths
    if (overallMetrics.processing >= 80) profile.capacityStrengths.push('Excellent processing speed')
    if (overallMetrics.attention >= 80) profile.capacityStrengths.push('Strong attention control')
    if (overallMetrics.load >= 80) profile.capacityStrengths.push('Good cognitive load management')
    if (capacity >= 8) profile.capacityStrengths.push('High digit span capacity')

    // Identify areas for improvement
    if (overallMetrics.processing < 60) profile.processingWeaknesses.push('Processing speed enhancement needed')
    if (overallMetrics.attention < 60) profile.processingWeaknesses.push('Attention control training recommended')
    if (overallMetrics.load < 60) profile.processingWeaknesses.push('Cognitive load management practice needed')
    if (capacity < 5) profile.processingWeaknesses.push('Working memory capacity building required')

    // Generate recommendations
    if (capacity < 5) {
      profile.cognitiveRecommendations.push('Working memory span training exercises')
      profile.cognitiveRecommendations.push('Chunking strategy instruction')
    }
    
    if (overallMetrics.processing < 60) {
      profile.cognitiveRecommendations.push('Processing speed enhancement activities')
      profile.cognitiveRecommendations.push('Rapid naming exercises')
    }
    
    if (overallMetrics.attention < 60) {
      profile.cognitiveRecommendations.push('Sustained attention training')
      profile.cognitiveRecommendations.push('Mindfulness-based attention exercises')
    }
    
    if (overallMetrics.load < 60) {
      profile.cognitiveRecommendations.push('Gradual cognitive load increase training')
      profile.cognitiveRecommendations.push('Dual-task working memory exercises')
    }

    // Generate clinical notes
    profile.workingMemoryNotes.push(`Working memory capacity: ${capacity} digits`)
    profile.workingMemoryNotes.push(`Processing speed: ${overallMetrics.processing}%`)
    profile.workingMemoryNotes.push(`Cognitive load management: ${overallMetrics.load}%`)
    profile.workingMemoryNotes.push(`Attention control: ${overallMetrics.attention}%`)

    return profile
  }

  // Comprehensive working memory clinical analysis
  const generateWorkingMemoryAssessment = (finalState: NumberSequenceState): ClinicalWorkingMemoryData => {
    const clinicalData = { ...finalState.clinicalData }
    
    // Update level working memory performance
    const levelPerf: ClinicalWorkingMemoryData['levelWorkingMemoryPerformance'] = {}
    
    finalState.clinicalData.rawWorkingMemorySessionData.levels.forEach(levelData => {
      const level = levelData.level
      
      if (!levelPerf[level]) {
        levelPerf[level] = {
          digitSpan: levelData.digitSpan,
          attempts: 0,
          successes: 0,
          failures: 0,
          averageReactionTime: 0,
          encodingTime: 0,
          retrievalAccuracy: 0,
          cognitiveLoadIndex: 0,
          millerRuleCompliance: levelData.digitSpan >= 5 && levelData.digitSpan <= 9
        }
      }
      
      const perf = levelPerf[level]
      perf.attempts++
      if (levelData.isSuccess) perf.successes++
      else perf.failures++
      
      perf.encodingTime = levelData.encodingEndTime - levelData.encodingStartTime
      perf.averageReactionTime = levelData.reactionTimes.length > 0 
        ? levelData.reactionTimes.reduce((sum, time) => sum + time, 0) / levelData.reactionTimes.length 
        : 0
      perf.retrievalAccuracy = levelData.isSuccess ? 100 : 0
      perf.cognitiveLoadIndex = levelData.cognitiveLoadAtLevel
    })
    
    clinicalData.levelWorkingMemoryPerformance = levelPerf
    
    // Calculate core working memory metrics
    clinicalData.digitSpanCapacity = calculateWorkingMemoryCapacity(levelPerf)
    clinicalData.processingSpeed = calculateProcessingSpeed(finalState.clinicalData.rawWorkingMemorySessionData)
    clinicalData.cognitiveLoad = calculateCognitiveLoad(levelPerf)
    clinicalData.attentionControl = calculateAttentionControl(levelPerf)
    
    // Calculate weighted overall working memory score
    clinicalData.overallWorkingMemory = Math.round(
      (clinicalData.digitSpanCapacity / 12 * 100 * 0.4) +
      (clinicalData.processingSpeed * 0.25) +
      (clinicalData.cognitiveLoad * 0.2) +
      (clinicalData.attentionControl * 0.15)
    )
    
    // Set working memory score (alias for consistency)
    clinicalData.workingMemoryScore = clinicalData.overallWorkingMemory
    
    // Generate Miller's compliance analysis
    clinicalData.millerCompliance = generateMillerCompliance(clinicalData.digitSpanCapacity)
    
    // Generate working memory patterns
    const allLevels = Object.keys(levelPerf).map(Number).sort((a, b) => a - b)
    clinicalData.workingMemoryPatterns = {
      maxSpanReached: clinicalData.digitSpanCapacity,
      optimalSpanRange: [
        Math.max(1, clinicalData.digitSpanCapacity - 2),
        Math.min(12, clinicalData.digitSpanCapacity + 1)
      ],
      learningCurve: allLevels.map(level => {
        const perf = levelPerf[level]
        return perf.successes / (perf.successes + perf.failures) * 100
      }),
      fatigueIndex: allLevels.length > 1 ? Math.max(0, 
        (levelPerf[allLevels[0]]?.retrievalAccuracy || 0) - 
        (levelPerf[allLevels[allLevels.length - 1]]?.retrievalAccuracy || 0)
      ) : 0,
      consistencyScore: clinicalData.attentionControl,
      workingMemoryEfficiency: clinicalData.overallWorkingMemory
    }
    
    // Generate working memory cognitive profile
    clinicalData.workingMemoryCognitiveProfile = generateWorkingMemoryProfile(
      clinicalData.digitSpanCapacity,
      {
        processing: clinicalData.processingSpeed,
        load: clinicalData.cognitiveLoad,
        attention: clinicalData.attentionControl,
        memory: clinicalData.workingMemoryScore
      }
    )
    
    return clinicalData
  }

  const generateSequence = useCallback((length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10))
  }, [])

  // Cleanup effect - memory leaks önlenir
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
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
      
      // Clear any existing timers
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
      
    setState({
      currentLevel: initialLevel,
      sequence: [],
      userInput: [],
      phase: 'ready',
      showingIndex: 0,
      score: 0,
      correctCount: 0,
      incorrectCount: 0,
      questionStartTime: 0,
      isGameCompleted: false,
        maxLevelReached: initialLevel,
        encodingStartTime: 0,
        encodingEndTime: 0,
        retrievalStartTime: 0,
        currentReactionTimes: [],
        clinicalData: initializeClinicalData()
      })
      
      console.log('🧠 Number Sequence Initialized with Working Memory Clinical Assessment')
      
      setIsLoading(false)
    } catch (err) {
      console.error('Number sequence initialization error:', err)
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
      
    const sequenceLength = 2 + state.currentLevel
    const newSequence = generateSequence(sequenceLength)
      
      // Clear any existing timers
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
      
      const encodingStartTime = Date.now()
    
    setState(prev => ({
      ...prev,
      sequence: newSequence,
      userInput: [],
      phase: 'showing',
      showingIndex: 0,
        questionStartTime: Date.now(),
        encodingStartTime,
        encodingEndTime: 0,
        retrievalStartTime: 0,
        currentReactionTimes: []
      }))
    } catch (err) {
      console.error('Start next level error:', err)
      setError({
        type: 'gameplay',
        message: 'Yeni seviye başlatılamadı.'
      })
    }
  }, [state.currentLevel, generateSequence, error, isLoading])

  // Dizi gösterimi otomatik ilerlemesi - Safe timer with error handling
  useEffect(() => {
    if (state.phase !== 'showing') return

    try {
      sequenceTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return

      if (state.showingIndex < state.sequence.length - 1) {
        setState(prev => ({
          ...prev,
          showingIndex: prev.showingIndex + 1
        }))
      } else {
          const encodingEndTime = Date.now()
          const retrievalStartTime = Date.now()
          
        setState(prev => ({
          ...prev,
          phase: 'input',
            showingIndex: 0,
            encodingEndTime,
            retrievalStartTime
        }))
      }
    }, 1000) // Her sayı 1 saniye gösterilir
    } catch (err) {
      console.error('Sequence timer error:', err)
      setError({
        type: 'timer',
        message: 'Dizi gösterimi sırasında hata oluştu.'
      })
    }

    return () => {
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current)
    }
  }, [state.phase, state.showingIndex, state.sequence.length])

  const handleNumberInput = useCallback((number: number) => {
    try {
      if (state.phase !== 'input' || error || isLoading) return

      const inputTime = Date.now()
      const reactionTime = inputTime - (state.retrievalStartTime + (state.userInput.length * 1000)) // Approximate time for this specific input

    const newUserInput = [...state.userInput, number]
      const newReactionTimes = [...state.currentReactionTimes, reactionTime]
    const isCorrect = newUserInput[newUserInput.length - 1] === state.sequence[newUserInput.length - 1]

    if (!isCorrect) {
      // Hatalı giriş - seviye başarısız
      playSound('wrong-answer')
        
        // Record failed level data for working memory analysis
        const levelData = {
          level: state.currentLevel,
          digitSpan: state.sequence.length,
          sequence: state.sequence,
          userInput: newUserInput,
          isSuccess: false,
          reactionTimes: newReactionTimes,
          encodingStartTime: state.encodingStartTime,
          encodingEndTime: state.encodingEndTime,
          retrievalStartTime: state.retrievalStartTime,
          retrievalEndTime: inputTime,
          cognitiveLoadAtLevel: Math.min(100, state.sequence.length * 15), // Simplified cognitive load calculation
          timestamp: new Date().toISOString()
        }
        
        const newIncorrectCount = state.incorrectCount + 1
        
        // 🧠 AUTO GAME COMPLETION: End game after 3 incorrect attempts
        const shouldEndGame = newIncorrectCount >= 3
        
      setState(prev => ({
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
          incorrectCount: newIncorrectCount,
          currentReactionTimes: newReactionTimes,
          isGameCompleted: shouldEndGame, // 🔧 FIX: Auto-complete after 3 mistakes
          clinicalData: {
            ...prev.clinicalData,
            rawWorkingMemorySessionData: {
              levels: [...prev.clinicalData.rawWorkingMemorySessionData.levels, levelData]
            }
          }
      }))
      return 'incorrect'
    }

    if (newUserInput.length === state.sequence.length) {
      // Seviye tamamlandı - doğru
      playSound('correct-answer')
      const newScore = state.score + (state.currentLevel * 10)
      const newLevel = state.currentLevel + 1
        
        // Record successful level data for working memory analysis
        const levelData = {
          level: state.currentLevel,
          digitSpan: state.sequence.length,
          sequence: state.sequence,
          userInput: newUserInput,
          isSuccess: true,
          reactionTimes: newReactionTimes,
          encodingStartTime: state.encodingStartTime,
          encodingEndTime: state.encodingEndTime,
          retrievalStartTime: state.retrievalStartTime,
          retrievalEndTime: inputTime,
          cognitiveLoadAtLevel: Math.min(100, state.sequence.length * 15), // Simplified cognitive load calculation
          timestamp: new Date().toISOString()
        }
        
        // 🧠 AUTO GAME COMPLETION: End game after reaching level 10 (12+ digits - exceptional capacity)
        const shouldEndGame = newLevel > 10
      
      setState(prev => ({
        ...prev,
        phase: 'feedback',
        userInput: newUserInput,
        score: newScore,
        correctCount: prev.correctCount + 1,
        currentLevel: newLevel,
          maxLevelReached: Math.max(prev.maxLevelReached, newLevel),
          currentReactionTimes: newReactionTimes,
          isGameCompleted: shouldEndGame, // 🔧 FIX: Auto-complete after reaching level 10
          clinicalData: {
            ...prev.clinicalData,
            rawWorkingMemorySessionData: {
              levels: [...prev.clinicalData.rawWorkingMemorySessionData.levels, levelData]
            }
          }
      }))
      return 'level_complete'
    } else {
      // Doğru sayı girildi, devam et
      setState(prev => ({
        ...prev,
          userInput: newUserInput,
          currentReactionTimes: newReactionTimes
      }))
      return 'continue'
    }
    } catch (err) {
      console.error('Number input error:', err)
      setError({
        type: 'gameplay',
        message: 'Sayı girişi işlenirken hata oluştu.'
      })
      return 'error'
    }
  }, [state.phase, state.userInput, state.sequence, state.score, state.currentLevel, state.incorrectCount, state.encodingStartTime, state.encodingEndTime, state.retrievalStartTime, state.currentReactionTimes, playSound, error, isLoading])

  const nextLevel = useCallback(() => {
    startNextLevel()
  }, [startNextLevel])

  const retryLevel = useCallback(() => {
    startNextLevel()
  }, [startNextLevel])

  const endGame = useCallback(() => {
    setState(prev => ({ ...prev, isGameCompleted: true }))
  }, [])

  const getSequenceLength = useCallback(() => {
    return 2 + state.currentLevel
  }, [state.currentLevel])

  const getFinalStats = useCallback(() => {
    // Generate comprehensive working memory clinical assessment
    const workingMemoryAssessment = generateWorkingMemoryAssessment(state)

    return {
      maxLevelReached: state.maxLevelReached,
      score: state.score,
      correctCount: state.correctCount,
      incorrectCount: state.incorrectCount,
      finalLevel: state.currentLevel,
      
      // 🧠 Enhanced working memory clinical data
      clinicalData: workingMemoryAssessment,
      digitSpanCapacity: workingMemoryAssessment.digitSpanCapacity,
      workingMemoryScore: workingMemoryAssessment.workingMemoryScore
    }
  }, [state])

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
    score: state.score,
    correctCount: state.correctCount,
    incorrectCount: state.incorrectCount,
    isGameCompleted: state.isGameCompleted,
    maxLevelReached: state.maxLevelReached,
    
    // 🧠 Enhanced state for working memory clinical assessment
    clinicalData: state.clinicalData,
    digitSpanCapacity: state.clinicalData.digitSpanCapacity,
    
    // Computed
    sequenceLength: getSequenceLength(),
    
    // Actions
    initializeGame,
    startNextLevel,
    handleNumberInput,
    nextLevel,
    retryLevel,
    endGame,
    getFinalStats
  }
} 