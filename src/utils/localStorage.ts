
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
