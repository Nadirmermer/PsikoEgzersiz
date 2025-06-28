
export interface TowerConfiguration {
  peg1: string[]  // En üstteki top array'in sonunda
  peg2: string[]
  peg3: string[]
}

export interface TowerLevel {
  id: number
  name: string
  description: string
  initialConfig: TowerConfiguration
  targetConfig: TowerConfiguration
  minMoves: number
  difficulty: 'Kolay' | 'Orta' | 'Zor' | 'Çok Zor'
}

export interface TowerGameState {
  currentConfig: TowerConfiguration
  targetConfig: TowerConfiguration
  moves: number
  timeStarted: number
  selectedPeg: number | null
  isCompleted: boolean
  level: number
}

export interface TowerOfLondonDetails {
  level_identifier: string
  level_number: number
  initial_config: TowerConfiguration
  target_config: TowerConfiguration
  min_moves_required: number
  user_moves_taken: number
  time_seconds: number
  score: number
  completed_optimally: boolean
  efficiency_percentage: number
}

// Çubuk kapasiteleri: [3, 2, 1]
export const PEG_CAPACITIES = [3, 2, 1]

// Renkler
export const BEAD_COLORS = {
  red: { name: 'Kırmızı', color: '#ef4444', bgColor: 'bg-red-500' },
  green: { name: 'Yeşil', color: '#22c55e', bgColor: 'bg-green-500' },
  blue: { name: 'Mavi', color: '#3b82f6', bgColor: 'bg-blue-500' }
} as const

export type BeadColor = keyof typeof BEAD_COLORS

// 15 seviye tanımı - zorluk derecesine göre sıralanmış
export const TOWER_LEVELS: TowerLevel[] = [
  {
    id: 1,
    name: 'Seviye 1',
    description: 'Basit taşıma (2 hamle)',
    difficulty: 'Kolay',
    minMoves: 2,
    initialConfig: {
      peg1: ['red', 'green'],
      peg2: ['blue'],
      peg3: []
    },
    targetConfig: {
      peg1: ['green'],
      peg2: ['blue'],
      peg3: ['red']
    }
  },
  {
    id: 2,
    name: 'Seviye 2', 
    description: 'İki top hareketi (3 hamle)',
    difficulty: 'Kolay',
    minMoves: 3,
    initialConfig: {
      peg1: ['red', 'blue'],
      peg2: ['green'],
      peg3: []
    },
    targetConfig: {
      peg1: ['blue'],
      peg2: [],
      peg3: ['red', 'green']
    }
  },
  {
    id: 3,
    name: 'Seviye 3',
    description: 'Çubuk kapasitesi kullanımı (3 hamle)',
    difficulty: 'Kolay',
    minMoves: 3,
    initialConfig: {
      peg1: ['green'],
      peg2: ['red', 'blue'],
      peg3: []
    },
    targetConfig: {
      peg1: ['red', 'green'],
      peg2: ['blue'],
      peg3: []
    }
  },
  {
    id: 4,
    name: 'Seviye 4',
    description: 'Üç top koordinasyonu (4 hamle)',
    difficulty: 'Kolay',
    minMoves: 4,
    initialConfig: {
      peg1: ['red', 'green', 'blue'],
      peg2: [],
      peg3: []
    },
    targetConfig: {
      peg1: ['blue'],
      peg2: ['green'],
      peg3: ['red']
    }
  },
  {
    id: 5,
    name: 'Seviye 5',
    description: 'Ara hamle kullanımı (4 hamle)',
    difficulty: 'Orta',
    minMoves: 4,
    initialConfig: {
      peg1: ['green', 'red'],
      peg2: ['blue'],
      peg3: []
    },
    targetConfig: {
      peg1: ['red'],
      peg2: ['green'],
      peg3: ['blue']
    }
  },
  {
    id: 6,
    name: 'Seviye 6',
    description: 'Ters çevirme (5 hamle)',
    difficulty: 'Orta',
    minMoves: 5,
    initialConfig: {
      peg1: ['red', 'green', 'blue'],
      peg2: [],
      peg3: []
    },
    targetConfig: {
      peg1: [],
      peg2: [],
      peg3: ['blue', 'green', 'red']
    }
  },
  {
    id: 7,
    name: 'Seviye 7',
    description: 'Karmaşık dönüştürme (5 hamle)',
    difficulty: 'Orta',
    minMoves: 5,
    initialConfig: {
      peg1: ['blue'],
      peg2: ['red', 'green'],
      peg3: []
    },
    targetConfig: {
      peg1: ['green', 'blue'],
      peg2: [],
      peg3: ['red']
    }
  },
  {
    id: 8,
    name: 'Seviye 8',
    description: 'Çok adımlı planlama (6 hamle)',
    difficulty: 'Orta',
    minMoves: 6,
    initialConfig: {
      peg1: ['green'],
      peg2: ['blue', 'red'],
      peg3: []
    },
    targetConfig: {
      peg1: ['red', 'blue', 'green'],
      peg2: [],
      peg3: []
    }
  },
  {
    id: 9,
    name: 'Seviye 9',
    description: 'İleri seviye koordinasyon (6 hamle)',
    difficulty: 'Zor',
    minMoves: 6,
    initialConfig: {
      peg1: ['red'],
      peg2: ['green'],
      peg3: ['blue']
    },
    targetConfig: {
      peg1: ['blue', 'green', 'red'],
      peg2: [],
      peg3: []
    }
  },
  {
    id: 10,
    name: 'Seviye 10',
    description: 'Kapsamlı yeniden düzenleme (7 hamle)',
    difficulty: 'Zor',
    minMoves: 7,
    initialConfig: {
      peg1: ['blue', 'red'],
      peg2: ['green'],
      peg3: []
    },
    targetConfig: {
      peg1: [],
      peg2: ['red'],
      peg3: ['green', 'blue']
    }
  },
  {
    id: 11,
    name: 'Seviye 11',
    description: 'Uzun seri hareketler (7 hamle)',
    difficulty: 'Zor',
    minMoves: 7,
    initialConfig: {
      peg1: ['green', 'blue'],
      peg2: [],
      peg3: ['red']
    },
    targetConfig: {
      peg1: ['red'],
      peg2: ['blue', 'green'],
      peg3: []
    }
  },
  {
    id: 12,
    name: 'Seviye 12',
    description: 'Çok katmanlı strateji (8 hamle)',
    difficulty: 'Çok Zor',
    minMoves: 8,
    initialConfig: {
      peg1: ['red', 'blue'],
      peg2: [],
      peg3: ['green']
    },
    targetConfig: {
      peg1: [],
      peg2: ['green', 'blue', 'red'],
      peg3: []
    }
  },
  {
    id: 13,
    name: 'Seviye 13',
    description: 'İleri düzey problem çözme (8 hamle)',
    difficulty: 'Çok Zor',
    minMoves: 8,
    initialConfig: {
      peg1: [],
      peg2: ['blue'],
      peg3: ['red', 'green']
    },
    targetConfig: {
      peg1: ['green', 'red', 'blue'],
      peg2: [],
      peg3: []
    }
  },
  {
    id: 14,
    name: 'Seviye 14',
    description: 'Ustaca planlama (7 hamle)',
    difficulty: 'Çok Zor',
    minMoves: 7,
    initialConfig: {
      peg1: ['blue'],
      peg2: [],
      peg3: ['green', 'red']
    },
    targetConfig: {
      peg1: ['red'],
      peg2: ['green'],
      peg3: ['blue']
    }
  },
  {
    id: 15,
    name: 'Seviye 15',
    description: 'Uzmanlık seviyesi (8 hamle)',
    difficulty: 'Çok Zor',
    minMoves: 8,
    initialConfig: {
      peg1: ['green'],
      peg2: ['red'],
      peg3: ['blue']
    },
    targetConfig: {
      peg1: ['red', 'green'],
      peg2: ['blue'],
      peg3: []
    }
  }
]

// Yardımcı fonksiyonlar
export const isValidMove = (
  config: TowerConfiguration,
  fromPeg: number,
  toPeg: number
): boolean => {
  const pegs = [config.peg1, config.peg2, config.peg3]
  
  // Aynı çubuk kontrolü
  if (fromPeg === toPeg) return false
  
  // Kaynak çubuk boş mu kontrolü
  if (pegs[fromPeg].length === 0) return false
  
  // Hedef çubuk kapasitesi kontrolü
  if (pegs[toPeg].length >= PEG_CAPACITIES[toPeg]) return false
  
  return true
}

export const makeMove = (
  config: TowerConfiguration,
  fromPeg: number,
  toPeg: number
): TowerConfiguration => {
  const pegs = [
    [...config.peg1],
    [...config.peg2], 
    [...config.peg3]
  ]
  
  const bead = pegs[fromPeg].pop()
  if (bead) {
    pegs[toPeg].push(bead)
  }
  
  return {
    peg1: pegs[0],
    peg2: pegs[1],
    peg3: pegs[2]
  }
}

export const isConfigEqual = (
  config1: TowerConfiguration,
  config2: TowerConfiguration
): boolean => {
  return (
    JSON.stringify(config1.peg1) === JSON.stringify(config2.peg1) &&
    JSON.stringify(config1.peg2) === JSON.stringify(config2.peg2) &&
    JSON.stringify(config1.peg3) === JSON.stringify(config2.peg3)
  )
}

export const calculateScore = (minMoves: number, userMoves: number, timeSeconds: number): number => {
  const moveEfficiency = Math.min(100, (minMoves / userMoves) * 100)
  const timeBonus = Math.max(0, 100 - timeSeconds) // Zaman bonusu (saniye başına 1 puan kaybı)
  return Math.round(moveEfficiency * 0.8 + timeBonus * 0.2)
}

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Kolay': return 'text-green-600 dark:text-green-400'
    case 'Orta': return 'text-yellow-600 dark:text-yellow-400'  
    case 'Zor': return 'text-orange-600 dark:text-orange-400'
    case 'Çok Zor': return 'text-red-600 dark:text-red-400'
    default: return 'text-muted-foreground'
  }
}

// Seviye doğrulama fonksiyonu
export const validateTowerLevel = (level: TowerLevel): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Kapasite kontrolü
  const pegs = [level.initialConfig.peg1, level.initialConfig.peg2, level.initialConfig.peg3]
  const targetPegs = [level.targetConfig.peg1, level.targetConfig.peg2, level.targetConfig.peg3]
  
  pegs.forEach((peg, index) => {
    if (peg.length > PEG_CAPACITIES[index]) {
      errors.push(`Seviye ${level.id}: Peg ${index + 1} kapasitesi aşılmış (${peg.length}/${PEG_CAPACITIES[index]})`)
    }
  })
  
  targetPegs.forEach((peg, index) => {
    if (peg.length > PEG_CAPACITIES[index]) {
      errors.push(`Seviye ${level.id}: Hedef Peg ${index + 1} kapasitesi aşılmış (${peg.length}/${PEG_CAPACITIES[index]})`)
    }
  })
  
  // Top sayısı kontrolü
  const initialBeads = [...level.initialConfig.peg1, ...level.initialConfig.peg2, ...level.initialConfig.peg3]
  const targetBeads = [...level.targetConfig.peg1, ...level.targetConfig.peg2, ...level.targetConfig.peg3]
  
  if (initialBeads.length !== targetBeads.length) {
    errors.push(`Seviye ${level.id}: Başlangıç ve hedef top sayıları farklı`)
  }
  
  // Aynı topların olup olmadığı kontrolü
  const initialSorted = initialBeads.sort()
  const targetSorted = targetBeads.sort()
  if (JSON.stringify(initialSorted) !== JSON.stringify(targetSorted)) {
    errors.push(`Seviye ${level.id}: Başlangıç ve hedef topları farklı`)
  }
  
  // Aynı konfigürasyon kontrolü
  if (isConfigEqual(level.initialConfig, level.targetConfig)) {
    errors.push(`Seviye ${level.id}: Başlangıç ve hedef aynı - hiç hamle gerekmez`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Tüm seviyeleri doğrula
export const validateAllTowerLevels = (): void => {
  console.log('🔍 LONDRA KULESİ SEVİYE DOĞRULAMA\n')
  
  let totalErrors = 0
  
  TOWER_LEVELS.forEach(level => {
    const validation = validateTowerLevel(level)
    if (!validation.isValid) {
      console.log(`❌ Seviye ${level.id} (${level.name}):`)
      validation.errors.forEach(error => console.log(`   - ${error}`))
      totalErrors += validation.errors.length
    } else {
      console.log(`✅ Seviye ${level.id} (${level.name}): OK`)
    }
  })
  
  console.log(`\n📊 Toplam ${TOWER_LEVELS.length} seviye kontrol edildi`)
  console.log(`❌ ${totalErrors} hata bulundu`)
  
  if (totalErrors === 0) {
    console.log('🎉 Tüm seviyeler geçerli!')
  }
}
