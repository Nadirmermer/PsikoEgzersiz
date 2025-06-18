export interface ExerciseResult {
  exerciseName: string
  score: number
  duration: number
  date: string
  details?: any
  completed?: boolean
  exitedEarly?: boolean
  currentProgress?: any
}

export interface MemoryGameDetails {
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

export interface TowerOfLondonDetails {
  level_identifier: string
  level_number: number
  initial_config: any
  target_config: any
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
  // Başlangıç Seviyeleri (1-5)
  {
    id: 1,
    name: "Seviye 1",
    gridSize: { rows: 2, cols: 3 },
    description: "Başlangıç (2x3 Grid - 6 kart)",
    previewTime: 2500
  },
  {
    id: 2,
    name: "Seviye 2", 
    gridSize: { rows: 2, cols: 4 },
    description: "Kolay (2x4 Grid - 8 kart)",
    previewTime: 3000
  },
  {
    id: 3,
    name: "Seviye 3",
    gridSize: { rows: 3, cols: 4 },
    description: "Alışma (3x4 Grid - 12 kart)",
    previewTime: 3500
  },
  {
    id: 4,
    name: "Seviye 4",
    gridSize: { rows: 4, cols: 4 },
    description: "Orta (4x4 Grid - 16 kart)",
    previewTime: 4000
  },
  {
    id: 5,
    name: "Seviye 5",
    gridSize: { rows: 4, cols: 5 },
    description: "Orta-Zor (4x5 Grid - 20 kart)",
    previewTime: 4500
  },
  
  // Orta Seviyeler (6-10)
  {
    id: 6,
    name: "Seviye 6",
    gridSize: { rows: 5, cols: 4 },
    description: "Zor (5x4 Grid - 20 kart)",
    previewTime: 4500
  },
  {
    id: 7,
    name: "Seviye 7",
    gridSize: { rows: 5, cols: 5 },
    description: "Çok Zor (5x5 Grid - 25 kart)",
    previewTime: 5000
  },
  {
    id: 8,
    name: "Seviye 8",
    gridSize: { rows: 6, cols: 4 },
    description: "Uzman (6x4 Grid - 24 kart)",
    previewTime: 5000
  },
  {
    id: 9,
    name: "Seviye 9",
    gridSize: { rows: 6, cols: 5 },
    description: "Profesyonel (6x5 Grid - 30 kart)",
    previewTime: 5500
  },
  {
    id: 10,
    name: "Seviye 10",
    gridSize: { rows: 6, cols: 6 },
    description: "Master (6x6 Grid - 36 kart)",
    previewTime: 6000
  },
  
  // İleri Seviyeler (11-15)
  {
    id: 11,
    name: "Seviye 11",
    gridSize: { rows: 7, cols: 5 },
    description: "Süper Zor (7x5 Grid - 35 kart)",
    previewTime: 6000
  },
  {
    id: 12,
    name: "Seviye 12",
    gridSize: { rows: 7, cols: 6 },
    description: "Ultra (7x6 Grid - 42 kart)",
    previewTime: 6500
  },
  {
    id: 13,
    name: "Seviye 13",
    gridSize: { rows: 8, cols: 5 },
    description: "Legendary (8x5 Grid - 40 kart)",
    previewTime: 6500
  },
  {
    id: 14,
    name: "Seviye 14",
    gridSize: { rows: 8, cols: 6 },
    description: "Mythical (8x6 Grid - 48 kart)",
    previewTime: 7000
  },
  {
    id: 15,
    name: "Seviye 15",
    gridSize: { rows: 9, cols: 6 },
    description: "Ultimate (9x6 Grid - 54 kart)",
    previewTime: 7500
  },
  
  // Son Seviyeler (16-20)
  {
    id: 16,
    name: "Seviye 16",
    gridSize: { rows: 8, cols: 7 },
    description: "Impossible (8x7 Grid - 56 kart)",
    previewTime: 7500
  },
  {
    id: 17,
    name: "Seviye 17",
    gridSize: { rows: 9, cols: 7 },
    description: "Nightmare (9x7 Grid - 63 kart)",
    previewTime: 8000
  },
  {
    id: 18,
    name: "Seviye 18",
    gridSize: { rows: 10, cols: 6 },
    description: "Insane (10x6 Grid - 60 kart)",
    previewTime: 8000
  },
  {
    id: 19,
    name: "Seviye 19",
    gridSize: { rows: 10, cols: 7 },
    description: "God Mode (10x7 Grid - 70 kart)",
    previewTime: 8500
  },
  {
    id: 20,
    name: "Seviye 20",
    gridSize: { rows: 10, cols: 8 },
    description: "💎 GRANDMASTER 💎 (10x8 Grid - 80 kart)",
    previewTime: 9000
  }
]

import { saveToSupabase, addToPendingSync } from '../lib/supabaseClient'

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
  savePartialProgress(exerciseName: string, currentProgress: any, duration: number): void {
    // exerciseName'in string olduğundan emin olalım
    const normalizedExerciseName = typeof exerciseName === 'string' ? exerciseName : 'Bilinmeyen Egzersiz'
    
    const partialResult: ExerciseResult = {
      exerciseName: normalizedExerciseName,
      score: 0,
      duration: duration || 0,
      date: new Date().toISOString(),
      completed: false,
      exitedEarly: true,
      currentProgress,
      details: {
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

  getSettings(): any {
    const data = localStorage.getItem('appSettings')
    return data ? JSON.parse(data) : {}
  },

  saveSetting(key: string, value: any): void {
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
