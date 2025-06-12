
export interface ExerciseResult {
  exerciseName: string
  score: number
  duration: number
  date: string
  details?: any
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

export interface MemoryGameLevel {
  id: number
  name: string
  gridSize: { rows: number; cols: number }
  description: string
  previewTime: number // Kartları gösterme süresi (ms)
}

export const MEMORY_GAME_LEVELS: MemoryGameLevel[] = [
  {
    id: 1,
    name: "Seviye 1",
    gridSize: { rows: 2, cols: 4 },
    description: "Başlangıç (2x4 Grid)",
    previewTime: 3000
  },
  {
    id: 2,
    name: "Seviye 2", 
    gridSize: { rows: 3, cols: 4 },
    description: "Kolay (3x4 Grid)",
    previewTime: 4000
  },
  {
    id: 3,
    name: "Seviye 3",
    gridSize: { rows: 4, cols: 4 },
    description: "Orta (4x4 Grid)",
    previewTime: 5000
  },
  {
    id: 4,
    name: "Seviye 4",
    gridSize: { rows: 4, cols: 5 },
    description: "Zor (4x5 Grid)",
    previewTime: 6000
  }
]

export const LocalStorageManager = {
  getExerciseResults(): ExerciseResult[] {
    const data = localStorage.getItem('exerciseResults')
    return data ? JSON.parse(data) : []
  },

  saveExerciseResult(result: ExerciseResult): void {
    const results = this.getExerciseResults()
    results.push(result)
    localStorage.setItem('exerciseResults', JSON.stringify(results))
    console.log('Egzersiz sonucu kaydedildi:', result)
  },

  clearExerciseResults(): void {
    localStorage.removeItem('exerciseResults')
    console.log('Tüm egzersiz sonuçları temizlendi')
  },

  // Hafıza oyunu seviye ilerlemesi
  getCurrentMemoryGameLevel(): number {
    const level = localStorage.getItem('currentMemoryGameLevel')
    return level ? parseInt(level, 10) : 1
  },

  setCurrentMemoryGameLevel(level: number): void {
    localStorage.setItem('currentMemoryGameLevel', level.toString())
    console.log('Hafıza oyunu seviyesi güncellendi:', level)
  },

  // Seviye başarıyla tamamlandığında çağırılır
  completeMemoryGameLevel(level: number): boolean {
    const currentLevel = this.getCurrentMemoryGameLevel()
    if (level === currentLevel && level < MEMORY_GAME_LEVELS.length) {
      this.setCurrentMemoryGameLevel(currentLevel + 1)
      return true // Yeni seviyeye geçti
    }
    return false // Aynı seviyede kaldı
  },

  getSettings(): any {
    const data = localStorage.getItem('appSettings')
    return data ? JSON.parse(data) : {}
  },

  saveSetting(key: string, value: any): void {
    const settings = this.getSettings()
    settings[key] = value
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }
}
