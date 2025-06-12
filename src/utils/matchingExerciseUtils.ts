
export interface ExerciseItem {
  word: string
  emoji: string
}

export interface ExerciseCategory {
  name: string
  items: ExerciseItem[]
}

export interface MatchingQuestion {
  correctAnswer: ExerciseItem
  options: (string | ExerciseItem)[]
  questionType: 'emoji-to-word' | 'word-to-emoji'
}

export interface MatchingGameResult {
  exercise_name: string
  category_played: string
  questions_total: number
  correct_answers: number
  incorrect_answers: number
  duration_seconds: number
  score: number
  timestamp: string
  details: {
    questions: MatchingQuestion[]
    user_answers: boolean[]
    response_times: number[]
  }
}

export const exerciseCategories: ExerciseCategory[] = [
  { 
    name: "Hayvanlar", 
    items: [ 
      { word: "Köpek", emoji: "🐶" }, 
      { word: "Kedi", emoji: "🐱" }, 
      { word: "İnek", emoji: "🐮" }, 
      { word: "Tavuk", emoji: "🐔" }, 
      { word: "At", emoji: "🐴" }, 
      { word: "Koyun", emoji: "🐑" }, 
      { word: "Fil", emoji: "🐘" }, 
      { word: "Ayı", emoji: "🐻" }, 
      { word: "Yılan", emoji: "🐍" }, 
      { word: "Balık", emoji: "🐟" }
    ] 
  },
  { 
    name: "Yiyecekler", 
    items: [ 
      { word: "Elma", emoji: "🍎" }, 
      { word: "Muz", emoji: "🍌" }, 
      { word: "Ekmek", emoji: "🍞" }, 
      { word: "Peynir", emoji: "🧀" }, 
      { word: "Tavuk eti", emoji: "🍗" }, 
      { word: "Pilav", emoji: "🍚" }, 
      { word: "Pasta", emoji: "🍰" }, 
      { word: "Bal", emoji: "🍯" }, 
      { word: "Yumurta", emoji: "🍳" }, 
      { word: "Çikolata", emoji: "🍫" }
    ] 
  },
  { 
    name: "Renkler", 
    items: [ 
      { word: "Kırmızı", emoji: "🔴" }, 
      { word: "Mavi", emoji: "🔵" }, 
      { word: "Yeşil", emoji: "🟢" }, 
      { word: "Sarı", emoji: "🟡" }, 
      { word: "Siyah", emoji: "⚫" }, 
      { word: "Beyaz", emoji: "⚪" }, 
      { word: "Kahverengi", emoji: "🟤" }, 
      { word: "Turuncu", emoji: "🟠" }, 
      { word: "Mor", emoji: "🟣" }, 
      { word: "Gökkuşağı", emoji: "🌈" }
    ] 
  },
  { 
    name: "Duygular", 
    items: [ 
      { word: "Mutlu", emoji: "😀" }, 
      { word: "Üzgün", emoji: "😢" }, 
      { word: "Kızgın", emoji: "😠" }, 
      { word: "Korkmuş", emoji: "😨" }, 
      { word: "Aşık", emoji: "😍" }, 
      { word: "Uykulu", emoji: "😴" }, 
      { word: "Şaşkın", emoji: "😮" }, 
      { word: "Havalı", emoji: "😎" }, 
      { word: "Kararsız", emoji: "😕" }, 
      { word: "Gülmek", emoji: "😂" }
    ] 
  },
  { 
    name: "Doğa", 
    items: [ 
      { word: "Güneş", emoji: "☀️" }, 
      { word: "Yağmur", emoji: "🌧️" }, 
      { word: "Gökkuşağı", emoji: "🌈" }, 
      { word: "Ay", emoji: "🌙" }, 
      { word: "Yıldız", emoji: "⭐" }, 
      { word: "Deniz", emoji: "🌊" }, 
      { word: "Ağaç", emoji: "🌳" }, 
      { word: "Çiçek", emoji: "🌻" }, 
      { word: "Kar", emoji: "❄️" }, 
      { word: "Dünya", emoji: "🌍" }
    ] 
  },
  { 
    name: "Eşyalar", 
    items: [ 
      { word: "Yatak", emoji: "🛏️" }, 
      { word: "Sandalye", emoji: "🪑" }, 
      { word: "Resim", emoji: "🖼️" }, 
      { word: "Televizyon", emoji: "📺" }, 
      { word: "Kapı", emoji: "🚪" }, 
      { word: "Ayna", emoji: "🪞" }, 
      { word: "Lamba", emoji: "💡" }, 
      { word: "Oyuncak", emoji: "🧸" }, 
      { word: "Saat", emoji: "🕰️" }, 
      { word: "Kalem", emoji: "🖊️" }
    ] 
  },
  { 
    name: "Taşıtlar", 
    items: [ 
      { word: "Araba", emoji: "🚗" }, 
      { word: "Otobüs", emoji: "🚌" }, 
      { word: "Bisiklet", emoji: "🚲" }, 
      { word: "Taksi", emoji: "🚕" }, 
      { word: "Ambulans", emoji: "🚑" }, 
      { word: "İtfaiye aracı", emoji: "🚒" }, 
      { word: "Polis arabası", emoji: "🚓" }, 
      { word: "Uçak", emoji: "✈️" }, 
      { word: "Gemi", emoji: "🚢" }, 
      { word: "Roket", emoji: "🚀" }
    ] 
  },
  { 
    name: "Meslekler", 
    items: [ 
      { word: "Öğretmen", emoji: "👩‍🏫" }, 
      { word: "Doktor", emoji: "👨‍⚕️" }, 
      { word: "Polis", emoji: "👮" }, 
      { word: "Aşçı", emoji: "👨‍🍳" }, 
      { word: "İşçi", emoji: "👷" }, 
      { word: "İtfaiyeci", emoji: "👨‍🚒" }, 
      { word: "Tamirci", emoji: "👨‍🔧" }, 
      { word: "Bilim insanı", emoji: "👨‍🔬" }, 
      { word: "Ressam", emoji: "👨‍🎨" }, 
      { word: "Pilot", emoji: "👨‍✈️" }
    ] 
  },
  { 
    name: "Vücut Bölümleri", 
    items: [ 
      { word: "Göz", emoji: "👁️" }, 
      { word: "Kulak", emoji: "👂" }, 
      { word: "Burun", emoji: "👃" }, 
      { word: "Ağız", emoji: "👄" }, 
      { word: "El", emoji: "🖐️" }, 
      { word: "Ayak", emoji: "🦶" }, 
      { word: "Diş", emoji: "🦷" }, 
      { word: "Beyin", emoji: "🧠" }, 
      { word: "Kalp", emoji: "🫀" }, 
      { word: "Kemik", emoji: "🦴" }
    ] 
  },
  { 
    name: "Giysiler", 
    items: [ 
      { word: "Tişört", emoji: "👕" }, 
      { word: "Pantolon", emoji: "👖" }, 
      { word: "Elbise", emoji: "👗" }, 
      { word: "Mont", emoji: "🧥" }, 
      { word: "Şapka", emoji: "🧢" }, 
      { word: "Çorap", emoji: "🧦" }, 
      { word: "Ayakkabı", emoji: "👟" }, 
      { word: "Şort", emoji: "🩳" }, 
      { word: "Atkı", emoji: "🧣" }, 
      { word: "Eldiven", emoji: "🧤" }
    ] 
  }
]

// Rastgele soru oluşturma yardımcı fonksiyonları
export const getRandomFromArray = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const generateMatchingQuestion = (questionType: 'emoji-to-word' | 'word-to-emoji'): MatchingQuestion => {
  // Rastgele kategori ve doğru cevap seç
  const correctCategory = getRandomFromArray(exerciseCategories)
  const correctAnswer = getRandomFromArray(correctCategory.items)
  
  // Diğer kategorilerden çeldiriciler seç
  const otherCategories = exerciseCategories.filter(cat => cat.name !== correctCategory.name)
  const distractors: ExerciseItem[] = []
  
  while (distractors.length < 3) {
    const randomCategory = getRandomFromArray(otherCategories)
    const randomItem = getRandomFromArray(randomCategory.items)
    
    // Aynı çeldiricinin tekrar eklenmemesi için kontrol
    if (!distractors.find(d => d.word === randomItem.word)) {
      distractors.push(randomItem)
    }
  }
  
  // Şıkları oluştur
  let options: (string | ExerciseItem)[]
  
  if (questionType === 'emoji-to-word') {
    // Emoji gösteriliyor, kelime seçenekleri sunuluyor
    options = [correctAnswer.word, ...distractors.map(d => d.word)]
  } else {
    // Kelime gösteriliyor, emoji seçenekleri sunuluyor  
    options = [correctAnswer, ...distractors]
  }
  
  // Şıkları karıştır
  options = shuffleArray(options)
  
  return {
    correctAnswer,
    options,
    questionType
  }
}
