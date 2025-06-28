export interface HanoiConfiguration {
  towers: number[][]  // [kule1, kule2, kule3] - Her kule array'inde en büyük disk altta
}

export interface HanoiLevel {
  id: number
  name: string
  description: string
  diskCount: number
  initialConfig: HanoiConfiguration
  targetConfig: HanoiConfiguration
  minMoves: number
  difficulty: 'Çok Kolay' | 'Kolay' | 'Orta' | 'Zor' | 'Çok Zor' | 'Expert' | 'Legendary'
}

export interface HanoiGameState {
  currentConfig: HanoiConfiguration
  targetConfig: HanoiConfiguration
  moves: number
  timeStarted: number
  selectedTower: number | null
  isCompleted: boolean
  level: number
  diskCount: number
}

export interface HanoiTowersDetails {
  level_identifier: string
  level_number: number
  initial_config: HanoiConfiguration
  target_config: HanoiConfiguration
  min_moves_required: number
  user_moves_taken: number
  time_seconds: number
  score: number
  completed_optimally: boolean
  efficiency_percentage: number
  disk_count: number
}

// Disk renkleri - size'a göre (1 en küçük, büyük sayılar daha büyük diskler)
export const getDiskStyle = (size: number, maxSize: number, isSelected: boolean = false) => {
  const diskStyles = [
    { bg: 'bg-red-500', border: 'border-red-600', shadow: 'shadow-red-500/50', name: 'Kırmızı' },
    { bg: 'bg-orange-500', border: 'border-orange-600', shadow: 'shadow-orange-500/50', name: 'Turuncu' },
    { bg: 'bg-yellow-500', border: 'border-yellow-600', shadow: 'shadow-yellow-500/50', name: 'Sarı' },
    { bg: 'bg-green-500', border: 'border-green-600', shadow: 'shadow-green-500/50', name: 'Yeşil' },
    { bg: 'bg-blue-500', border: 'border-blue-600', shadow: 'shadow-blue-500/50', name: 'Mavi' },
    { bg: 'bg-purple-500', border: 'border-purple-600', shadow: 'shadow-purple-500/50', name: 'Mor' },
    { bg: 'bg-pink-500', border: 'border-pink-600', shadow: 'shadow-pink-500/50', name: 'Pembe' },
    { bg: 'bg-indigo-500', border: 'border-indigo-600', shadow: 'shadow-indigo-500/50', name: 'İndigo' }
  ]

  const styleIndex = (size - 1) % diskStyles.length
  const style = diskStyles[styleIndex]
  const width = `${2 + size * 1.2}rem` // Küçük disk daha dar, büyük disk daha geniş

  return {
    ...style,
    width,
    className: `${style.bg} ${style.border} border-2 rounded-lg transition-all duration-300 ${
      isSelected ? `scale-110 ${style.shadow} shadow-lg animate-pulse` : 'hover:scale-105'
    }`
  }
}

// BFS algoritması ile gerçek minimum hamle sayısını hesaplama
export function calculateRealMinMoves(
  initialConfig: HanoiConfiguration,
  targetConfig: HanoiConfiguration
): number {
  // Durum karşılaştırması için string serileştirme
  const stateToString = (config: HanoiConfiguration): string => {
    return JSON.stringify(config.towers);
  };

  const initialState = stateToString(initialConfig);
  const targetState = stateToString(targetConfig);

  if (initialState === targetState) {
    return 0;
  }

  const queue: { config: HanoiConfiguration; moves: number }[] = [
    { config: initialConfig, moves: 0 }
  ];
  const visited = new Set<string>();
  visited.add(initialState);

  while (queue.length > 0) {
    const { config, moves } = queue.shift()!;

    // Tüm olası hamleleri dene
    for (let from = 0; from < 3; from++) {
      for (let to = 0; to < 3; to++) {
        if (from === to || config.towers[from].length === 0) continue;

        if (isValidMove(config, from, to)) {
          const newConfig = makeMove(config, from, to);
          const newState = stateToString(newConfig);

          if (newState === targetState) {
            return moves + 1;
          }

          if (!visited.has(newState)) {
            visited.add(newState);
            queue.push({ config: newConfig, moves: moves + 1 });
          }
        }
      }
    }
  }

  return -1; // Çözüm bulunamadı
}

// Güncellenmiş ve İyileştirilmiş Seviye Tasarımları
export const HANOI_LEVELS: HanoiLevel[] = [
  // TEMA 1: Temel Eğitim (1-4) - Standart Hanoi kurallarını ve üssel zorluğu öğretir.
  {
    id: 1,
    name: "İlk Adım",
    diskCount: 2,
    difficulty: "Çok Kolay",
    initialConfig: { towers: [[2, 1], [], []] },
    targetConfig: { towers: [[], [], [2, 1]] },
    minMoves: 3,
    description: "İki diski hedef kuleye taşıyarak temel mekaniği öğrenin."
  },
  {
    id: 2,
    name: "Klasik Başlangıç",
    diskCount: 3,
    difficulty: "Kolay",
    initialConfig: { towers: [[3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [3, 2, 1]] },
    minMoves: 7,
    description: "En bilinen 3 diskli Hanoi bulmacasını çözün."
  },
  {
    id: 3,
    name: "Dörtlü Denge",
    diskCount: 4,
    difficulty: "Orta",
    initialConfig: { towers: [[4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [4, 3, 2, 1]] },
    minMoves: 15,
    description: "4 disk ile hamle sayısının nasıl katlandığını keşfedin."
  },
  {
    id: 4,
    name: "Beşli Güç",
    diskCount: 5,
    difficulty: "Orta",
    initialConfig: { towers: [[5, 4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [5, 4, 3, 2, 1]] },
    minMoves: 31,
    description: "5 diskli bu kule, gerçek bir sabır ve planlama testi."
  },

  // TEMA 2: Kuleleri Birleştirme (5-8) - Dağınık diskleri tek bir kulede toplamayı öğretir.
  {
    id: 5,
    name: "Toparlama Zamanı",
    diskCount: 3,
    difficulty: "Kolay",
    initialConfig: { towers: [[3, 1], [2], []] },
    targetConfig: { towers: [[], [], [3, 2, 1]] },
    minMoves: 5, // Önceki: 11
    description: "Farklı kulelerdeki diskleri tek bir hedefte toplayın."
  },
  {
    id: 6,
    name: "Çapraz Birleştirme",
    diskCount: 4,
    difficulty: "Orta",
    initialConfig: { towers: [[4, 3], [2, 1], []] },
    targetConfig: { towers: [[], [], [4, 3, 2, 1]] },
    minMoves: 9, 
    description: "İki küçük kuleyi birleştirerek büyük bir kule oluşturun."
  },
  {
    id: 7,
    name: "Parçalı Bütün",
    diskCount: 5,
    difficulty: "Zor",
    initialConfig: { towers: [[5, 4], [3, 1], [2]] },
    targetConfig: { towers: [[], [], [5, 4, 3, 2, 1]] },
    minMoves: 11,
    description: "Üç kuleye yayılmış diskleri mantıksal bir sırayla bir araya getirin."
  },
  {
    id: 8,
    name: "Simetrik Çözüm",
    diskCount: 5,
    difficulty: "Zor",
    initialConfig: { towers: [[5, 3, 1], [4, 2], []] },
    targetConfig: { towers: [[], [], [5, 4, 3, 2, 1]] },
    minMoves: 13,
    description: "Tek ve çift sayıların ayrıldığı bu yapıyı çözmek planlama gerektirir."
  },

  // TEMA 3: Stratejik Engeller ve Hedef Değişimi (9-12) - Standart dışı hedefleri ve engelleri aşmayı öğretir.
  {
    id: 9,
    name: "Yön Değişimi",
    diskCount: 4,
    difficulty: "Orta",
    initialConfig: { towers: [[4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [4, 3, 2, 1], []] },
    minMoves: 15,
    description: "Hedef artık C kulesi değil. Stratejinizi ortadaki kuleye odaklayın."
  },
  {
    id: 10,
    name: "Engelli Parkur",
    diskCount: 4,
    difficulty: "Zor",
    initialConfig: { towers: [[4, 3, 2], [], [1]] },
    targetConfig: { towers: [[], [], [4, 3, 2, 1]] },
    minMoves: 9, // Önceki: 7 veya 12
    description: "Hedef kulenin en üstündeki küçük disk, tüm planınızı değiştirecek bir engeldir."
  },
  {
    id: 11,
    name: "Kule Takası",
    diskCount: 4,
    difficulty: "Çok Zor",
    initialConfig: { towers: [[4, 3], [], [2, 1]] },
    targetConfig: { towers: [[2, 1], [], [4, 3]] },
    minMoves: 13, // Yeni Seviye
    description: "İki kulenin yerini tamamen değiştirmek, ileri düzey bir meydan okumadır."
  },
  {
    id: 12,
    name: "Tersine Dünya",
    diskCount: 5,
    difficulty: "Çok Zor",
    initialConfig: { towers: [[], [], [5, 4, 3, 2, 1]] },
    targetConfig: { towers: [[5, 4, 3, 2, 1], [], []] },
    minMoves: 31,
    description: "Tamamlanmış bir kuleyi başlangıç noktasına geri taşımak da aynı derecede zordur."
  },

  // TEMA 4: Büyük Meydan Okumalar (13-18) - Yüksek disk sayılı zorlu bulmacalar.
  {
    id: 13,
    name: "Altı Katlı Yapı",
    diskCount: 6,
    difficulty: "Çok Zor",
    initialConfig: { towers: [[6, 5, 4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [6, 5, 4, 3, 2, 1]] },
    minMoves: 63,
    description: "6 diskli klasik problem. Hamlelerinizde çok dikkatli olun."
  },
  {
    id: 14,
    name: "Kaotik Altılı",
    diskCount: 6,
    difficulty: "Expert",
    initialConfig: { towers: [[6, 4], [5, 2], [3, 1]] },
    targetConfig: { towers: [[], [], [6, 5, 4, 3, 2, 1]] },
    minMoves: 25, // Yeni Seviye
    description: "6 diskin tamamen dağıldığı bu kaosu düzene sokun."
  },
  {
    id: 15,
    name: "Yedi Harikası",
    diskCount: 7,
    difficulty: "Expert",
    initialConfig: { towers: [[7, 6, 5, 4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [7, 6, 5, 4, 3, 2, 1]] },
    minMoves: 127,
    description: "7 diskli bu devasa kule, gerçek bir ustalık ve sabır testidir."
  },
  {
    id: 16,
    name: "Kaos Teorisi",
    diskCount: 7,
    difficulty: "Legendary",
    initialConfig: { towers: [[7, 5, 3, 1], [6, 4, 2], []] },
    targetConfig: { towers: [[], [], [7, 6, 5, 4, 3, 2, 1]] },
    minMoves: 63,
    description: "7 disklik bu karmaşık dağılım, standart çözümden çok daha farklı bir strateji gerektirir."
  },
  {
    id: 17,
    name: "Efsanevi Yapı",
    diskCount: 8,
    difficulty: "Legendary",
    initialConfig: { towers: [[8, 7, 6, 5, 4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [8, 7, 6, 5, 4, 3, 2, 1]] },
    minMoves: 255,
    description: "8 disk. Son meydan okuma. Sadece efsaneler tamamlayabilir."
  },
  {
    id: 18,
    name: "Sonsuz Kule",
    diskCount: 9,
    difficulty: "Legendary",
    initialConfig: { towers: [[9, 8, 7, 6, 5, 4, 3, 2, 1], [], []] },
    targetConfig: { towers: [[], [], [9, 8, 7, 6, 5, 4, 3, 2, 1]] },
    minMoves: 511, // Yeni Bonus Seviye
    description: "Teorik bir meydan okuma. Optimal çözüm yüzlerce hamle gerektirir. İyi şanslar!"
  }
];

// Geçerli hamle kontrolü
export const isValidMove = (
  config: HanoiConfiguration,
  fromTower: number,
  toTower: number
): boolean => {
  if (fromTower === toTower) return false
  
  const from = config.towers[fromTower]
  const to = config.towers[toTower]
  
  // Kaynak kulede disk yoksa hamle geçersiz
  if (from.length === 0) return false
  
  // Hedef kule boşsa hamle geçerli
  if (to.length === 0) return true
  
  // Küçük disk büyük diskin üzerine gidebilir (küçük sayı < büyük sayı)
  const topFromDisk = from[from.length - 1]
  const topToDisk = to[to.length - 1]
  
  return topFromDisk < topToDisk
}

// Hamle yapma
export const makeMove = (
  config: HanoiConfiguration,
  fromTower: number,
  toTower: number
): HanoiConfiguration => {
  if (!isValidMove(config, fromTower, toTower)) {
    return config // Geçersiz hamle, değişiklik yok
  }

  const newTowers = config.towers.map(tower => [...tower])
  const disk = newTowers[fromTower].pop()!
  newTowers[toTower].push(disk)

  return { towers: newTowers }
}

// Konfigürasyonları karşılaştırma
export const isConfigEqual = (
  config1: HanoiConfiguration,
  config2: HanoiConfiguration
): boolean => {
  return JSON.stringify(config1.towers) === JSON.stringify(config2.towers)
}

// Skor hesaplama
export const calculateScore = (minMoves: number, userMoves: number, timeSeconds: number): number => {
  // Temel verimlilik skoru (0-100)
  const efficiency = Math.max(0, Math.min(100, Math.round((minMoves / userMoves) * 100)))
  
  // Zaman bonusu - daha hızlı tamamlama daha iyi skor
  const timeBonus = Math.max(0, Math.min(50, Math.round(300 / timeSeconds)))
  
  // Optimal çözüm bonusu
  const perfectBonus = userMoves === minMoves ? 100 : 0
  
  return efficiency + timeBonus + perfectBonus
}

// Zorluk seviyesi renklendirilmesi
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'Çok Kolay': return 'bg-green-100 text-green-800 border-green-300'
    case 'Kolay': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'Orta': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'Zor': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Çok Zor': return 'bg-red-100 text-red-800 border-red-300'
    case 'Expert': return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'Legendary': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

// Minimum hamle sayısını hesaplama (2^n - 1 formülü)
export const calculateMinMoves = (diskCount: number): number => {
  return Math.pow(2, diskCount) - 1
}

// Hanoi problemi çözümü algoritması (rekürsif)
export const solveHanoi = (
  diskCount: number,
  from: number,
  to: number,
  aux: number
): Array<{ from: number; to: number }> => {
  if (diskCount === 1) {
    return [{ from, to }]
  }
  
  const moves: Array<{ from: number; to: number }> = []
  
  // n-1 diski ara çubuğa taşı
  moves.push(...solveHanoi(diskCount - 1, from, aux, to))
  
  // En büyük diski hedefe taşı
  moves.push({ from, to })
  
  // n-1 diski hedefe taşı
  moves.push(...solveHanoi(diskCount - 1, aux, to, from))
  
  return moves
}

// Seviye doğrulama fonksiyonu
export const validateHanoiLevel = (level: HanoiLevel): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Disk sayısı kontrolü
  const initialTotalDisks = level.initialConfig.towers.flat().length
  const targetTotalDisks = level.targetConfig.towers.flat().length
  
  if (initialTotalDisks !== level.diskCount) {
    errors.push(`Seviye ${level.id}: Başlangıç disk sayısı uyumsuz (${initialTotalDisks}/${level.diskCount})`)
  }
  
  if (targetTotalDisks !== level.diskCount) {
    errors.push(`Seviye ${level.id}: Hedef disk sayısı uyumsuz (${targetTotalDisks}/${level.diskCount})`)
  }
  
  // Disk sıralaması kontrolü (büyük diskler alta)
  level.initialConfig.towers.forEach((tower, towerIndex) => {
    for (let i = 0; i < tower.length - 1; i++) {
      if (tower[i] < tower[i + 1]) {
        errors.push(`Seviye ${level.id}: Başlangıç Kule ${towerIndex + 1} disk sıralaması hatalı`)
        break
      }
    }
  })
  
  level.targetConfig.towers.forEach((tower, towerIndex) => {
    for (let i = 0; i < tower.length - 1; i++) {
      if (tower[i] < tower[i + 1]) {
        errors.push(`Seviye ${level.id}: Hedef Kule ${towerIndex + 1} disk sıralaması hatalı`)
        break
      }
    }
  })
  
  // Disk tipleri kontrolü (aynı diskler olmalı)
  const initialDisks = level.initialConfig.towers.flat().sort((a, b) => a - b)
  const targetDisks = level.targetConfig.towers.flat().sort((a, b) => a - b)
  const expectedDisks = Array.from({length: level.diskCount}, (_, i) => i + 1)
  
  if (JSON.stringify(initialDisks) !== JSON.stringify(expectedDisks)) {
    errors.push(`Seviye ${level.id}: Başlangıç diskler beklenen sırayla uyumsuz`)
  }
  
  if (JSON.stringify(targetDisks) !== JSON.stringify(expectedDisks)) {
    errors.push(`Seviye ${level.id}: Hedef diskler beklenen sırayla uyumsuz`)
  }
  
  // Minimum hamle sayısı kontrolü
  const calculatedMinMoves = calculateRealMinMoves(level.initialConfig, level.targetConfig)
  if (calculatedMinMoves !== level.minMoves && calculatedMinMoves !== -1) {
    errors.push(`Seviye ${level.id}: Minimum hamle sayısı hatalı (tanımlanan: ${level.minMoves}, hesaplanan: ${calculatedMinMoves})`)
  }
  
  // Çözülebilirlik kontrolü
  if (calculatedMinMoves === -1) {
    errors.push(`Seviye ${level.id}: Çözülemeyen seviye!`)
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
export const validateAllHanoiLevels = (): void => {
  console.log('🔍 HANOI KULELERİ SEVİYE DOĞRULAMA\n')
  
  let totalErrors = 0
  let standardLevels = 0
  let nonStandardLevels = 0
  
  HANOI_LEVELS.forEach(level => {
    const validation = validateHanoiLevel(level)
    
    // Standart seviye kontrolü
    const isStandard = 
      level.initialConfig.towers[0].length === level.diskCount &&
      level.initialConfig.towers[1].length === 0 &&
      level.initialConfig.towers[2].length === 0 &&
      level.targetConfig.towers[0].length === 0 &&
      level.targetConfig.towers[1].length === 0 &&
      level.targetConfig.towers[2].length === level.diskCount
    
    if (isStandard) {
      standardLevels++
    } else {
      nonStandardLevels++
    }
    
    if (!validation.isValid) {
      console.log(`❌ Seviye ${level.id} (${level.name}) ${isStandard ? '[STANDART]' : '[ÖZEL]'}:`)
      validation.errors.forEach(error => console.log(`   - ${error}`))
      totalErrors += validation.errors.length
    } else {
      console.log(`✅ Seviye ${level.id} (${level.name}) ${isStandard ? '[STANDART]' : '[ÖZEL]'}: OK`)
    }
  })
  
  console.log(`\n📊 Toplam ${HANOI_LEVELS.length} seviye kontrol edildi`)
  console.log(`📈 ${standardLevels} standart seviye, ${nonStandardLevels} özel seviye`)
  console.log(`❌ ${totalErrors} hata bulundu`)
  
  if (totalErrors === 0) {
    console.log('🎉 Tüm seviyeler geçerli!')
  }
}

// Test sonuçlarını konsola yazdır (geliştirme amaçlı)
if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
  // Sadece localhost'ta test et
  setTimeout(() => {
    validateAllHanoiLevels();
  }, 1000);
} 