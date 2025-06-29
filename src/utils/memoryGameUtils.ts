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
  
  // 🚀 YENİ: Akıllı emoji seçim sistemi kullan
  const selectedEmojis = getIntelligentEmojiSet(level, totalPairs)
  
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

/**
 * Optimal Grid Layout Calculator
 * Verilen kart sayısı için en uygun rows x cols kombinasyonunu hesaplar
 */
export const calculateOptimalGridSize = (totalCards: number): { rows: number; cols: number } => {
  // Kart sayısı çift olmalı (her emoji'den 2 tane)
  if (totalCards % 2 !== 0) {
    throw new Error('Total cards must be even number')
  }

  // Özel durumlar - UI açısından optimize edilmiş
  const specialCases: Record<number, { rows: number; cols: number }> = {
    6: { rows: 2, cols: 3 },   // 2x3 - güzel rectangle
    8: { rows: 2, cols: 4 },   // 2x4 - orta rectangle  
    10: { rows: 2, cols: 5 },  // 2x5 - uzun ama tolere edilebilir
    12: { rows: 3, cols: 4 },  // 3x4 - güzel rectangle ✅
    14: { rows: 2, cols: 7 },  // 2x7 - çok uzun, değiştirilmeli
    16: { rows: 4, cols: 4 },  // 4x4 - perfect square ✅
    18: { rows: 3, cols: 6 },  // 3x6 - uzun ama tolere edilebilir
    20: { rows: 4, cols: 5 },  // 4x5 - güzel rectangle ✅
    24: { rows: 4, cols: 6 },  // 4x6 - reasonable rectangle ✅
    30: { rows: 5, cols: 6 },  // 5x6 - büyük ama organized ✅
    36: { rows: 6, cols: 6 }   // 6x6 - perfect square ✅
  }

  // Özel durum varsa onu kullan
  if (specialCases[totalCards]) {
    return specialCases[totalCards]
  }

  // Genel algoritma: En kareye yakın kombinasyon bul
  let bestRatio = Infinity
  let bestLayout = { rows: 1, cols: totalCards }

  // Tüm faktörleri kontrol et
  for (let rows = 1; rows <= Math.sqrt(totalCards); rows++) {
    if (totalCards % rows === 0) {
      const cols = totalCards / rows
      const ratio = Math.max(rows, cols) / Math.min(rows, cols) // Aspect ratio
      
      // En kareye yakın olanı seç (ratio 1'e yakın olanı)
      if (ratio < bestRatio) {
        bestRatio = ratio
        bestLayout = { rows, cols }
      }
    }
  }

  return bestLayout
}

/**
 * Improved Grid Size Generator
 * Optimal layout hesaplayarak yeni grid size döndürür
 */
export const generateOptimalGridSize = (pairCount: number): { rows: number; cols: number } => {
  const totalCards = pairCount * 2
  return calculateOptimalGridSize(totalCards)
}

/**
 * Layout Analysis - Debug için
 */
export const analyzeGridLayout = (gridSize: { rows: number; cols: number }) => {
  const totalCards = gridSize.rows * gridSize.cols
  const aspectRatio = Math.max(gridSize.rows, gridSize.cols) / Math.min(gridSize.rows, gridSize.cols)
  
  return {
    totalCards,
    aspectRatio: Math.round(aspectRatio * 100) / 100,
    isSquarish: aspectRatio <= 1.5, // 1.5'ten küçükse "kareye yakın"
    layoutType: aspectRatio === 1 ? 'perfect-square' : 
                aspectRatio <= 1.5 ? 'good-rectangle' : 
                aspectRatio <= 2.5 ? 'long-rectangle' : 'too-long'
  }
}

// 🧠 TABLET-FRIENDLy EMOJI SYSTEM for Seniors & Children
// Yaşlılar ve çocuklar için optimize edilmiş emoji kategorileri

export const SENIOR_CHILD_EMOJI_SYSTEM = {
  // 🌟 TIER 1: MAXIMUM DISTINCTION (İlk seviyeler - çok farklı kategoriler)
  highContrast: {
    // Büyük hayvanlar - kolay tanınır
    bigAnimals: ['🐶', '🐱', '🐸', '🐧', '🦁', '🐯'],
    // Ulaşım araçları - çok farklı şekiller  
    vehicles: ['🚗', '✈️', '🚢', '🚂', '🚲', '🏍️'],
    // Meyveler - renkli ve tanıdık
    fruits: ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝'],
    // Ev eşyaları - günlük objeler
    household: ['🏠', '⌚', '📱', '💻', '🎈', '⚽']
  },

  // 🌟 TIER 2: MODERATE DISTINCTION (Orta seviyeler - aynı kategori farklı türler)
  mediumContrast: {
    // Farklı hayvan türleri
    animalVariety: ['🐶', '🐱', '🐰', '🐭', '🐸', '🐧', '🦁', '🐯', '🐼', '🐨'],
    // Farklı araç türleri  
    vehicleTypes: ['🚗', '🚌', '🚛', '🏍️', '🚲', '✈️', '🚢', '🚂', '🚜', '🏎️'],
    // Yiyecek çeşitleri
    foodVariety: ['🍎', '🍌', '🍞', '🥛', '🍕', '🍰', '☕', '🥪', '🍝', '🍪'],
    // Doğa objeleri
    nature: ['🌳', '🌺', '⭐', '🌙', '☀️', '🌈', '🏔️', '🌊', '🔥', '❄️']
  },

  // 🌟 TIER 3: FINE DISTINCTION (İleri seviyeler - benzer objeler, ince farklar)
  fineContrast: {
    // Benzer hayvanlar - ince farklar
    similarAnimals: ['🐶', '🐕', '🦮', '🐩', '🐺', '🦊', '🐱', '🐈', '🦁', '🐯', '🐆', '🐴'],
    // Benzer emojiler - dikkat gerektirir
    similarObjects: ['😊', '😍', '🤗', '😎', '🥳', '😌', '🤔', '😮', '😢', '��', '😡', '😱'],
    // Benzer semboller  
    similarSymbols: ['❤️', '💙', '💚', '💛', '🧡', '💜', '⭐', '🌟', '💫', '✨', '💎', '🔥'],
    // Kompleks objeler
    complexObjects: ['🎭', '🎨', '🎪', '🎯', '🏆', '🎖️', '🏅', '🎗️', '🏵️', '🎀', '🎁', '🎊']
  }
}

// 🧠 INTELLIGENT EMOJI SELECTION - Seviye tabanlı akıllı seçim
export const getIntelligentEmojiSet = (level: number, totalPairs: number): string[] => {
  const { highContrast, mediumContrast, fineContrast } = SENIOR_CHILD_EMOJI_SYSTEM

  // Level 1-3: Maksimum ayırt edicilik (Farklı kategorilerden)
  if (level <= 3) {
    const mixed = [
      ...highContrast.bigAnimals.slice(0, Math.ceil(totalPairs * 0.4)),
      ...highContrast.vehicles.slice(0, Math.ceil(totalPairs * 0.3)), 
      ...highContrast.fruits.slice(0, Math.ceil(totalPairs * 0.2)),
      ...highContrast.household.slice(0, Math.ceil(totalPairs * 0.1))
    ]
    return mixed.slice(0, totalPairs)
  }

  // Level 4-6: Orta ayırt edicilik (Aynı kategori, farklı türler)
  if (level <= 6) {
    const categoryPool = Math.random() > 0.5 
      ? mediumContrast.animalVariety 
      : mediumContrast.vehicleTypes
    return categoryPool.slice(0, totalPairs)
  }

  // Level 7+: İnce ayırt edicilik (Benzer objeler, dikkat gerektirir)
  const challengePool = level % 2 === 0 
    ? fineContrast.similarAnimals 
    : fineContrast.similarObjects
  return challengePool.slice(0, totalPairs)
}
