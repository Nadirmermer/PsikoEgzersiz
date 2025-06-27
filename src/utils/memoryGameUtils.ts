export interface Card {
  id: string
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export interface GameStats {
  exercise_name: string
  level_identifier: string
  grid_size: string
  duration_seconds: number
  moves_count: number
  incorrect_moves_count: number
  pairs_found: number
  total_pairs: number
  score: number
  timestamp: string
  first_match_time_seconds?: number
  card_flips_total: number
  // 🧠 CLINICAL ENHANCEMENTS
  working_memory_span?: number
  attention_span_seconds?: number
  error_pattern?: 'random' | 'spatial' | 'temporal' | 'systematic'
  strategy_type?: 'random' | 'systematic' | 'spatial' | 'sequential'
  fatigue_indicator?: number
  learning_efficiency?: number
}

// 🧠 CLINICAL EMOJI CATEGORIZATION for therapeutic assessment
export const CLINICAL_EMOJI_SETS = {
  // Test basic recognition and semantic memory
  animals: ['🐶', '🐱', '🐭', '🐰', '🐸', '🐧', '🦁', '🐯', '🐼', '🐨', '🐵', '🐮'],
  
  // Test object recognition and everyday memory
  objects: ['🚗', '🏠', '📱', '⌚', '💻', '📚', '✏️', '🎵', '⚽', '🎈', '🍎', '☕'],
  
  // Test emotional processing (useful for mood assessment)
  emotions: ['😊', '😢', '😡', '😱', '😴', '🤔', '😍', '🤗', '😮', '😎', '🥳', '😌'],
  
  // Test abstract symbol processing
  symbols: ['❤️', '⭐', '🔥', '💎', '🌟', '💫', '⚡', '🎯', '🏆', '🎪', '🎭', '🎨']
}

// 🧠 CLINICAL UTILITY: Get appropriate emoji set based on assessment needs
export const getEmojiSetForLevel = (level: number, assessmentType: 'standard' | 'emotional' | 'cognitive' = 'standard'): string[] => {
  const { animals, objects, emotions, symbols } = CLINICAL_EMOJI_SETS
  
  switch (assessmentType) {
    case 'emotional':
      return [...emotions, ...symbols].slice(0, Math.ceil((level + 4) / 2))
    
    case 'cognitive':
      return [...objects, ...symbols].slice(0, Math.ceil((level + 4) / 2))
    
    default: // standard
      return [...animals, ...objects].slice(0, Math.ceil((level + 4) / 2))
  }
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const generateCards = (gridSize: { rows: number; cols: number }, level: number = 1): Card[] => {
  const totalCards = gridSize.rows * gridSize.cols
  const totalPairs = totalCards / 2
  
  // 🧠 CLINICAL IMPROVEMENT: Use appropriate emoji set for level
  const availableEmojis = getEmojiSetForLevel(level)
  const selectedEmojis = availableEmojis.slice(0, totalPairs)
  
  // Her emoji'den iki tane oluştur
  const cardPairs: Card[] = []
  selectedEmojis.forEach((emoji, index) => {
    cardPairs.push(
      {
        id: `${index}-1`,
        emoji,
        isFlipped: false,
        isMatched: false
      },
      {
        id: `${index}-2`,
        emoji,
        isFlipped: false,
        isMatched: false
      }
    )
  })
  
  return shuffleArray(cardPairs)
}

// 🧠 CLINICAL-GRADE SCORING SYSTEM
export const calculateClinicalScore = (stats: Omit<GameStats, 'score' | 'timestamp' | 'exercise_name'>): {
  totalScore: number
  accuracyScore: number
  efficiencyScore: number
  speedScore: number
  workingMemoryScore: number
  clinicalInsights: string[]
} => {
  const { 
    total_pairs, 
    pairs_found, 
    moves_count, 
    incorrect_moves_count, 
    duration_seconds,
    first_match_time_seconds
  } = stats
  
  // 📊 ACCURACY SCORE (0-100): Correctness of responses
  const accuracyScore = Math.round((pairs_found / total_pairs) * 100)
  
  // 📊 EFFICIENCY SCORE (0-100): Optimal moves vs actual moves
  const minimalMoves = total_pairs * 2 // Perfect scenario: each pair found in 2 moves
  const actualMoves = moves_count
  const efficiencyScore = Math.round(Math.min((minimalMoves / actualMoves) * 100, 100))
  
  // 📊 SPEED SCORE (0-100): Reasonable time expectations
  const expectedTime = total_pairs * 3 // 3 seconds per pair baseline
  const speedScore = Math.round(Math.min((expectedTime / duration_seconds) * 100, 100))
  
  // 📊 WORKING MEMORY SCORE (0-100): Based on level completed successfully
  const workingMemoryScore = Math.round((total_pairs / 12) * 100) // Max 12 pairs in clinical levels
  
  // 📊 TOTAL CLINICAL SCORE: Weighted average for therapeutic value
  const totalScore = Math.round(
    (accuracyScore * 0.4) +      // 40% accuracy (most important)
    (efficiencyScore * 0.25) +   // 25% efficiency (strategy)
    (speedScore * 0.2) +         // 20% speed (processing)
    (workingMemoryScore * 0.15)  // 15% memory span (capacity)
  )
  
  // 🧠 CLINICAL INSIGHTS: Therapeutic interpretations
  const clinicalInsights: string[] = []
  
  if (accuracyScore >= 90) {
    clinicalInsights.push("Mükemmel hafıza doğruluğu - Güçlü bilişsel işlev")
  } else if (accuracyScore >= 70) {
    clinicalInsights.push("İyi hafıza performansı - Normal bilişsel işlev")
  } else if (accuracyScore >= 50) {
    clinicalInsights.push("Orta hafıza performansı - Hafif zorluk göstergesi")
  } else {
    clinicalInsights.push("Hafıza performansında zorluk - Değerlendirme önerilir")
  }
  
  if (efficiencyScore >= 80) {
    clinicalInsights.push("Sistematik strateji kullanımı - İyi planlama becerisi")
  } else if (efficiencyScore < 50) {
    clinicalInsights.push("Rastgele yaklaşım - Strateji geliştirme desteği önerilir")
  }
  
  if (speedScore >= 80) {
    clinicalInsights.push("Hızlı bilgi işleme - İyi bilişsel hız")
  } else if (speedScore < 40) {
    clinicalInsights.push("Yavaş bilgi işleme - Detaylı değerlendirme önerilir")
  }
  
  if (first_match_time_seconds && first_match_time_seconds > 15) {
    clinicalInsights.push("İlk eşleşme gecikmesi - Dikkat ve konsantrasyon desteği önerilir")
  }
  
  return {
    totalScore,
    accuracyScore,
    efficiencyScore,
    speedScore,
    workingMemoryScore,
    clinicalInsights
  }
}

// Legacy function for backward compatibility
export const calculateScore = (stats: Omit<GameStats, 'score' | 'timestamp' | 'exercise_name'>): number => {
  return calculateClinicalScore(stats).totalScore
}
