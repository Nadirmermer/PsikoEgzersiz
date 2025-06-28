import { saveToSupabase, addToPendingSync } from '../lib/supabaseClient'

// Clinical data type definitions for better type safety
interface ClinicalScores {
  total_score: number
  accuracy_score: number
  efficiency_score: number
  speed_score: number
  working_memory_score: number
}

// Common properties for all exercise details
interface BaseExerciseDetails {
  // Common identifiers
  level_identifier?: string
  level_number?: number
  level?: number
  
  // Common game metrics
  moves_count?: number
  incorrect_moves_count?: number
  efficiency_percentage?: number
  accuracy?: number
  correct_answers?: number
  total_questions?: number
  max_level_reached?: number
  max_sequence_length?: number
  
  // Clinical data
  clinical_scores?: ClinicalScores
  clinical_insights?: string[]
  clinicalData?: any
  
  // Exercise metadata
  exercise_name?: string
  timestamp?: string
  completed?: boolean
  exited_early?: boolean
}

interface TowerOfLondonClinicalData extends BaseExerciseDetails {
  executiveFunctionScore: number
  planningAbility: number
  workingMemoryLoad: number
  inhibitoryControl: number
  cognitiveFlexibility: number
  planningTimeSeconds: number
  isOptimalSolution: boolean
  levelCompleted: number
  totalMoves: number
  efficiencyPercentage: number
}

interface HanoiTowersClinicalData extends BaseExerciseDetails {
  overallCognitive: number
  mathematicalThinking: number
  recursiveProblemSolving: number
  spatialReasoning: number
  sequentialPlanning: number
  algorithmicThinking: number
  logicalDeduction: number
  levelPerformance: Record<string, {
    attempts: number
    optimalSolutions: number
    efficiency: number
    planningTime: number
  }>
}

interface CategoryPerformance {
  accuracy: number
  averageResponseTime: number
  questionsAsked: number
}

interface ImageWordClinicalData extends BaseExerciseDetails {
  overallCognition: number
  semanticAccuracy: number
  processingSpeed: number
  patternRecognition: number
  cognitiveFlexibility: number
  categoryPerformance: Record<string, CategoryPerformance>
  cognitiveProfile?: {
    recommendedInterventions: string[]
    clinicalNotes: string[]
  }
}

interface WordImageClinicalData extends BaseExerciseDetails {
  overallReverseProcessing: number
  visualSemanticMapping: number
  reverseProcessingSpeed: number
  visualRecognition: number
  crossModalIntegration: number
  categoryVisualPerformance: Record<string, {
    semanticToVisualAccuracy: number
    visualRecognitionSpeed: number
    questionsAsked: number
  }>
  reverseCognitiveProfile?: {
    crossModalRecommendations: string[]
    reverseProcessingNotes: string[]
  }
}

interface NumberSequenceClinicalData extends BaseExerciseDetails {
  overallWorkingMemory: number
  digitSpanCapacity: number
  processingSpeed: number
  cognitiveLoad: number
  attentionControl: number
  millerCompliance: {
    isWithinNormalRange: boolean
    capacityCategory: string
    millerDeviation: number
  }
  workingMemoryCognitiveProfile?: {
    cognitiveRecommendations: string[]
    workingMemoryNotes: string[]
  }
}

interface ColorSequenceClinicalData extends BaseExerciseDetails {
  overallVisualSpatialMemory: number
  visualSpanCapacity: number
  visualMemoryScore: number
  spatialProcessingSpeed: number
  colorRecognitionAccuracy: number
  visualAttentionSpan: number
  visualPatternCompliance: {
    visualComplexity: string
    patternRecognitionCategory: string
    visualProcessingDeviation: number
  }
  visualSpatialCognitiveProfile?: {
    visualCognitiveRecommendations: string[]
    spatialMemoryNotes: string[]
  }
}

interface LogicSequenceClinicalData extends BaseExerciseDetails {
  overallCognitive: number
  analyticalThinking: number
  patternRecognition: number
  mathematicalReasoning: number
  sequentialLogic: number
  abstractReasoning: number
  cognitiveFlexibility: number
  patternPerformance: Record<string, {
    attempts: number
    correctAnswers: number
    averageResponseTime: number
  }>
  clinicalInsights: string[]
  cognitiveProfile?: {
    strengths: string[]
    improvementAreas: string[]
    recommendations: string[]
  }
}

// Union type for all possible exercise details
type ExerciseDetails = 
  | MemoryGameDetails
  | TowerOfLondonDetails  
  | ImageWordClinicalData
  | WordImageClinicalData
  | NumberSequenceClinicalData
  | ColorSequenceClinicalData
  | LogicSequenceClinicalData
  | HanoiTowersClinicalData
  | TowerOfLondonClinicalData
  | Record<string, unknown> // Fallback for unknown exercise types

// Enhanced ExerciseResult interface with proper typing
export interface ExerciseResult {
  id: string
  date: string
  exerciseName: string
  score: number
  duration: number
  completed: boolean
  exitedEarly?: boolean
  accuracy?: number
  details?: ExerciseDetails
}

export interface MemoryGameDetails extends BaseExerciseDetails {
  level_identifier: string
  grid_size: string
  duration_seconds: number
  moves_count: number
  incorrect_moves_count: number
  pairs_found: number
  total_pairs: number
  score: number
  first_match_time_seconds?: number
  card_flips_total: number
}

export interface TowerOfLondonDetails extends BaseExerciseDetails {
  level_identifier: string
  level_number: number
  initial_config: Record<string, unknown>
  target_config: Record<string, unknown>
  min_moves_required: number
  user_moves_taken: number
  time_seconds: number
  score: number
  completed_optimally: boolean
  efficiency_percentage: number
}

export interface MemoryGameLevel {
  id: number
  name: string
  gridSize: { rows: number; cols: number }
  description: string
  previewTime: number // Kartları gösterme süresi (ms)
}

export const MEMORY_GAME_LEVELS: MemoryGameLevel[] = [
  // 🧠 CLINICAL TIER 1: BASELINE ASSESSMENT (Working Memory: 3-4 items)
  {
    id: 1,
    name: "Temel Seviye",
    gridSize: { rows: 2, cols: 3 },
    description: "Başlangıç Değerlendirmesi (6 kart - 3 çift)",
    previewTime: 3000
  },
  {
    id: 2,
    name: "Kolay Seviye",
    gridSize: { rows: 2, cols: 4 },
    description: "Hafif İlerleme (8 kart - 4 çift)",
    previewTime: 3000
  },
  
  // 🧠 CLINICAL TIER 2: WORKING MEMORY TEST (5-6 items)
  {
    id: 3,
    name: "Orta Seviye",
    gridSize: { rows: 2, cols: 5 },
    description: "Çalışma Belleği Testi (10 kart - 5 çift)",
    previewTime: 3500
  },
  {
    id: 4,
    name: "Gelişmiş Seviye",
    gridSize: { rows: 3, cols: 4 },
    description: "Hafif Zorluk (12 kart - 6 çift)",
    previewTime: 4000
  },
  
  // 🧠 CLINICAL TIER 3: MILLER'S LIMIT (7±2 items)
  {
    id: 5,
    name: "Zor Seviye",
    gridSize: { rows: 2, cols: 7 },
    description: "Miller Limiti Testi (14 kart - 7 çift)",
    previewTime: 4500
  },
  {
    id: 6,
    name: "Uzman Seviye",
    gridSize: { rows: 4, cols: 4 },
    description: "Üst Ortalama Yetenek (16 kart - 8 çift)",
    previewTime: 5000
  },
  
  // 🧠 CLINICAL TIER 4: ADVANCED ASSESSMENT (Above average cognitive ability)
  {
    id: 7,
    name: "İleri Seviye",
    gridSize: { rows: 3, cols: 6 },
    description: "İleri Değerlendirme (18 kart - 9 çift)",
    previewTime: 5500
  },
  {
    id: 8,
    name: "Master Seviye",
    gridSize: { rows: 4, cols: 5 },
    description: "Üstün Yetenek Testi (20 kart - 10 çift)",
    previewTime: 6000
  },
  
  // 🧠 CLINICAL TIER 5: EXCEPTIONAL ABILITY (Research/Gaming purposes only)
  {
    id: 9,
    name: "Süper İleri",
    gridSize: { rows: 3, cols: 8 },
    description: "İstisnaî Yetenek (24 kart - 12 çift)",
    previewTime: 6500
  },
  {
    id: 10,
    name: "Efsanevi",
    gridSize: { rows: 4, cols: 6 },
    description: "🏆 Efsanevi Seviye (24 kart - 12 çift)",
    previewTime: 7000
  }
  
  // 🧠 CLINICAL NOTE: Levels 11-20 REMOVED for therapeutic appropriateness
  // Levels beyond 10 create cognitive overload and patient frustration
  // Maximum working memory capacity is ~7±2 items for clinical populations
  
  // FOR GAMING ENTHUSIASTS: Could be added as separate "Challenge Mode"
  // But NOT recommended for clinical or therapeutic assessment
]

export interface ConnectionData {
  professionalId: string
  clientIdentifier: string
}

export interface AudioSettings {
  masterVolume: number
  buttonClickEnabled: boolean
  gameActionEnabled: boolean
  notificationEnabled: boolean
  backgroundMusicEnabled: boolean
}

export interface GameProgress {
  unlockedLevels: number[]
  completedLevels: number[]
  highScores: Record<number, number>
}

interface MemoryGameProgress extends GameProgress {
  currentDifficulty: 'easy' | 'medium' | 'hard'
  preferredGridSize: string
}

interface AppSettings {
  theme?: 'light' | 'dark' | 'system'
  language?: 'tr' | 'en'
  notifications?: boolean
  sound?: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
  [key: string]: unknown
}

interface LocalStorageData {
  exerciseResults: ExerciseResult[]
  connectionData?: ConnectionData
  pendingSyncData: Record<string, unknown>
  audioSettings: AudioSettings
  memoryGameProgress: MemoryGameProgress
  // ... other data types
}

// 🔧 Type-safe localStorage wrapper
const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`localStorage getItem error for key "${key}":`, error)
    return defaultValue
  }
}

const safeSetItem = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`localStorage setItem error for key "${key}":`, error)
    throw error
  }
}

export const LocalStorageManager = {
  getExerciseResults(): ExerciseResult[] {
    const data = localStorage.getItem('exerciseResults')
    return data ? JSON.parse(data) : []
  },

  async saveExerciseResult(result: ExerciseResult): Promise<void> {
    const results = this.getExerciseResults()
    results.push(result)
    localStorage.setItem('exerciseResults', JSON.stringify(results))
    console.log('LocalStorageManager - Exercise result saved to localStorage:', result)

    // Enhanced logging for better statistics tracking
    console.log('LocalStorageManager - Enhanced stats:', {
      exerciseName: result.exerciseName,
      completed: result.completed,
      exitedEarly: result.exitedEarly,
      score: result.score,
      duration: result.duration,
      hasDetails: !!result.details,
      detailsKeys: result.details ? Object.keys(result.details) : []
    })

    // Check if user is connected to a professional
    const connectionData = this.getConnectionData()
    if (connectionData) {
      console.log('LocalStorageManager - User connected to professional, preparing Supabase save:', {
        professionalId: connectionData.professionalId,
        clientIdentifier: connectionData.clientIdentifier,
        exerciseData: result.details || result
      })
      
      const supabaseData = {
        professional_id: connectionData.professionalId,
        client_identifier: connectionData.clientIdentifier,
        exercise_data: result.details || result,
        is_client_mode_session: false
      }

      console.log('LocalStorageManager - Attempting to save to Supabase...')
      const success = await saveToSupabase(supabaseData)
      if (!success) {
        // Add to pending sync if failed
        addToPendingSync(supabaseData)
        console.log('LocalStorageManager - Supabase save failed, added to pending sync queue')
      } else {
        console.log('LocalStorageManager - Successfully saved to Supabase')
      }
    } else {
      console.log('LocalStorageManager - No professional connection found, data saved only locally')
    }

    // Client mode handling
    const clientMode = localStorage.getItem('clientMode')
    const clientModeDataStr = localStorage.getItem('clientModeData')
    
    if (clientMode === 'true' && clientModeDataStr) {
      console.log('LocalStorageManager - Client mode active, preparing client mode save')
      
      try {
        const clientModeData = JSON.parse(clientModeDataStr)
        console.log('LocalStorageManager - Client mode data:', {
          professionalId: clientModeData.professionalId,
          clientIdentifier: clientModeData.clientIdentifier,
          startTime: clientModeData.startTime
        })
        
        const supabaseData = {
          professional_id: clientModeData.professionalId,
          client_identifier: clientModeData.clientIdentifier,
          exercise_data: result.details || result,
          is_client_mode_session: true
        }

        console.log('LocalStorageManager - Attempting client mode save to Supabase...')
        const success = await saveToSupabase(supabaseData)
        if (!success) {
          addToPendingSync(supabaseData)
          console.log('LocalStorageManager - Client mode Supabase save failed, added to pending sync')
        } else {
          console.log('LocalStorageManager - Client mode data successfully saved to Supabase')
        }
      } catch (error) {
        console.error('LocalStorageManager - Client mode data save error:', error)
      }
    } else {
      console.log('LocalStorageManager - Client mode not active')
    }
  },

  clearExerciseResults(): void {
    localStorage.removeItem('exerciseResults')
    console.log('Tüm egzersiz sonuçları temizlendi')
  },

  // Save partial progress when exiting early
  savePartialProgress(exerciseName: string, currentProgress: Record<string, unknown>, duration: number): void {
    // exerciseName'in string olduğundan emin olalım
    const normalizedExerciseName = typeof exerciseName === 'string' ? exerciseName : 'Bilinmeyen Egzersiz'
    
    const partialResult: ExerciseResult = {
      id: Date.now().toString(),
      exerciseName: normalizedExerciseName,
      score: 0,
      duration: duration || 0,
      date: new Date().toISOString(),
      completed: false,
      exitedEarly: true,
      details: {
        currentProgress,
        exercise_name: normalizedExerciseName,
        session_duration_seconds: duration || 0,
        completed: false,
        exited_early: true,
        partial_data: currentProgress,
        timestamp: new Date().toISOString()
      }
    }

    this.saveExerciseResult(partialResult)
    console.log('LocalStorageManager - Partial progress saved:', partialResult)
  },

  getCurrentMemoryGameLevel(): number {
    const level = localStorage.getItem('currentMemoryGameLevel')
    return level ? parseInt(level, 10) : 1
  },

  setCurrentMemoryGameLevel(level: number): void {
    localStorage.setItem('currentMemoryGameLevel', level.toString())
    console.log('Hafıza oyunu seviyesi güncellendi:', level)
  },

  completeMemoryGameLevel(level: number): boolean {
    const currentLevel = this.getCurrentMemoryGameLevel()
    if (level === currentLevel && level < MEMORY_GAME_LEVELS.length) {
      this.setCurrentMemoryGameLevel(currentLevel + 1)
      return true
    }
    return false
  },

  getSettings(): AppSettings {
    const data = localStorage.getItem('appSettings')
    return data ? JSON.parse(data) : {}
  },

  saveSetting(key: string, value: unknown): void {
    const settings = this.getSettings()
    settings[key] = value
    localStorage.setItem('appSettings', JSON.stringify(settings))
  },

  getConnectionData(): { professionalId: string; clientIdentifier: string } | null {
    const dataStr = localStorage.getItem('professionalConnection')
    if (!dataStr) return null
    
    try {
      const data = JSON.parse(dataStr)
      console.log('LocalStorageManager - Professional connection data retrieved:', {
        professionalId: data.professionalId ? `${data.professionalId.substring(0, 8)}...` : null,
        clientIdentifier: data.clientIdentifier
      })
      return data
    } catch {
      console.log('LocalStorageManager - Failed to parse professional connection data')
      return null
    }
  },

  setConnectionData(professionalId: string, clientIdentifier: string): void {
    const data = { professionalId, clientIdentifier }
    localStorage.setItem('professionalConnection', JSON.stringify(data))
    console.log('LocalStorageManager - Professional connection saved:', {
      professionalId: `${professionalId.substring(0, 8)}...`,
      clientIdentifier
    })
  },

  clearConnectionData(): void {
    localStorage.removeItem('professionalConnection')
    console.log('LocalStorageManager - Professional connection cleared')
  },

  markResultsAsUploaded(resultIds: string[]): void {
    const uploadedStr = localStorage.getItem('uploadedResults')
    const uploaded = uploadedStr ? JSON.parse(uploadedStr) : []
    
    resultIds.forEach(id => {
      if (!uploaded.includes(id)) {
        uploaded.push(id)
      }
    })
    
    localStorage.setItem('uploadedResults', JSON.stringify(uploaded))
  },

  getUnuploadedResults(): ExerciseResult[] {
    const allResults = this.getExerciseResults()
    const uploadedStr = localStorage.getItem('uploadedResults')
    const uploaded = uploadedStr ? JSON.parse(uploadedStr) : []
    
    return allResults.filter((result, index) => !uploaded.includes(index.toString()))
  }
}
