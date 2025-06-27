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

// Balanced question generation for clinical assessment
interface QuestionGenerationState {
  categoryDistribution: { [categoryName: string]: number }
  totalQuestionsGenerated: number
  targetQuestionsPerCategory: number
}

let questionState: QuestionGenerationState = {
  categoryDistribution: {},
  totalQuestionsGenerated: 0,
  targetQuestionsPerCategory: 0
}

// Initialize balanced question generation
export const initializeBalancedGeneration = (totalQuestions: number) => {
  const categoriesCount = exerciseCategories.length
  const questionsPerCategory = Math.floor(totalQuestions / categoriesCount)
  const remainingQuestions = totalQuestions % categoriesCount
  
  // Reset state
  questionState = {
    categoryDistribution: {},
    totalQuestionsGenerated: 0,
    targetQuestionsPerCategory: questionsPerCategory
  }
  
  // Initialize distribution - equal questions per category
  exerciseCategories.forEach((category, index) => {
    // Distribute remaining questions to first few categories
    const extraQuestion = index < remainingQuestions ? 1 : 0
    questionState.categoryDistribution[category.name] = questionsPerCategory + extraQuestion
  })
  
  console.log('🎯 Balanced Question Generation Initialized:', {
    totalQuestions,
    categoriesCount,
    questionsPerCategory,
    remainingQuestions,
    distribution: questionState.categoryDistribution
  })
}

// Get next category that needs more questions (balanced approach)
const getNextBalancedCategory = (): ExerciseCategory | null => {
  // Find categories that still need questions
  const availableCategories = exerciseCategories.filter(category => {
    const currentCount = questionState.categoryDistribution[category.name] || 0
    return currentCount > 0
  })
  
  if (availableCategories.length === 0) {
    // Fallback: reset if all exhausted (shouldn't happen in normal flow)
    console.warn('⚠️ All categories exhausted, resetting distribution')
    exerciseCategories.forEach(category => {
      questionState.categoryDistribution[category.name] = 1
    })
    return getRandomFromArray(exerciseCategories)
  }
  
  // Prefer categories with highest remaining questions
  const sortedCategories = availableCategories.sort((a, b) => {
    const aRemaining = questionState.categoryDistribution[a.name] || 0
    const bRemaining = questionState.categoryDistribution[b.name] || 0
    return bRemaining - aRemaining
  })
  
  return sortedCategories[0]
}

// Enhanced question generation with clinical balance
export const generateMatchingQuestion = (questionType: 'emoji-to-word' | 'word-to-emoji'): MatchingQuestion => {
  // Get balanced category selection
  const correctCategory = getNextBalancedCategory()
  if (!correctCategory) {
    // Fallback to random if balance fails
    console.warn('⚠️ Balanced generation failed, using random fallback')
    return generateRandomMatchingQuestion(questionType)
  }
  
  // Decrease count for selected category
  questionState.categoryDistribution[correctCategory.name]--
  questionState.totalQuestionsGenerated++
  
  const correctAnswer = getRandomFromArray(correctCategory.items)
  
  // Generate distractors from other categories (improved distribution)
  const otherCategories = exerciseCategories.filter(cat => cat.name !== correctCategory.name)
  const distractors: ExerciseItem[] = []
  
  // Ensure we get distractors from different categories when possible
  const shuffledOtherCategories = shuffleArray(otherCategories)
  
  while (distractors.length < 3 && shuffledOtherCategories.length > 0) {
    const categoryForDistractor = shuffledOtherCategories[distractors.length % shuffledOtherCategories.length]
    const randomItem = getRandomFromArray(categoryForDistractor.items)
    
    // Avoid duplicate words/emojis
    if (!distractors.find(d => d.word === randomItem.word || d.emoji === randomItem.emoji)) {
      distractors.push(randomItem)
    } else {
      // If we hit a duplicate, try another item from same category
      const alternativeItem = getRandomFromArray(categoryForDistractor.items)
      if (!distractors.find(d => d.word === alternativeItem.word || d.emoji === alternativeItem.emoji)) {
        distractors.push(alternativeItem)
      }
    }
  }
  
  // Fill remaining distractors if needed (shouldn't happen with sufficient categories)
  while (distractors.length < 3) {
    const randomCategory = getRandomFromArray(otherCategories)
    const randomItem = getRandomFromArray(randomCategory.items)
    
    if (!distractors.find(d => d.word === randomItem.word || d.emoji === randomItem.emoji)) {
      distractors.push(randomItem)
    }
  }
  
  // Create options based on question type
  let options: (string | ExerciseItem)[]
  
  if (questionType === 'emoji-to-word') {
    options = [correctAnswer.word, ...distractors.map(d => d.word)]
  } else {
    options = [correctAnswer, ...distractors]
  }
  
  // Shuffle options
  options = shuffleArray(options)
  
  console.log(`📊 Question generated: ${correctCategory.name} (${correctAnswer.emoji} -> ${correctAnswer.word})`, {
    remainingInCategory: questionState.categoryDistribution[correctCategory.name],
    totalGenerated: questionState.totalQuestionsGenerated,
    categoryDistribution: questionState.categoryDistribution
  })
  
  return {
    correctAnswer,
    options,
    questionType
  }
}

// Fallback random generation (original method)
const generateRandomMatchingQuestion = (questionType: 'emoji-to-word' | 'word-to-emoji'): MatchingQuestion => {
  // Original random logic as fallback
  const correctCategory = getRandomFromArray(exerciseCategories)
  const correctAnswer = getRandomFromArray(correctCategory.items)
  
  const otherCategories = exerciseCategories.filter(cat => cat.name !== correctCategory.name)
  const distractors: ExerciseItem[] = []
  
  while (distractors.length < 3) {
    const randomCategory = getRandomFromArray(otherCategories)
    const randomItem = getRandomFromArray(randomCategory.items)
    
    if (!distractors.find(d => d.word === randomItem.word)) {
      distractors.push(randomItem)
    }
  }
  
  let options: (string | ExerciseItem)[]
  
  if (questionType === 'emoji-to-word') {
    options = [correctAnswer.word, ...distractors.map(d => d.word)]
  } else {
    options = [correctAnswer, ...distractors]
  }
  
  options = shuffleArray(options)
  
  return {
    correctAnswer,
    options,
    questionType
  }
}

// Get current question generation statistics
export const getQuestionGenerationStats = () => {
  return {
    totalGenerated: questionState.totalQuestionsGenerated,
    distribution: { ...questionState.categoryDistribution },
    remainingQuestions: Object.values(questionState.categoryDistribution).reduce((sum, count) => sum + count, 0)
  }
}

// Reset question generation (for new game)
export const resetQuestionGeneration = () => {
  questionState = {
    categoryDistribution: {},
    totalQuestionsGenerated: 0,
    targetQuestionsPerCategory: 0
  }
}
