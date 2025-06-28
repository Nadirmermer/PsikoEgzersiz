import { GameConfig } from './types'

// Hafıza Oyunu Konfigürasyonu
export const MEMORY_GAME_CONFIG: GameConfig = {
  id: 'memory-game',
  title: 'Hafıza Oyunu',
  description: 'Kartları eşleştirerek hafızanızı test edin. Her seviyede zorluk artar.',
  difficulty: 'Artan',
  estimatedTime: '3-8 dk',
  hasLevels: true,
  maxLevel: 4,
  instructions: [
    {
      step: 1,
      title: 'Kartları İnceleyin',
      description: 'Oyun başında kartların konumlarını hatırlamaya çalışın'
    },
    {
      step: 2,
      title: 'Çiftleri Bulun',
      description: 'Kartları tıklayarak aynı emojileri eşleştirin'
    },
    {
      step: 3,
      title: 'Seviyeyi Tamamlayın',
      description: 'Tüm çiftleri bularak bir sonraki seviyeye geçin'
    }
  ],
  stats: [
    { key: 'hasLevels', label: 'Seviyeler', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Tahmini Süre', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Resim-Kelime Eşleştirme Konfigürasyonu
export const IMAGE_WORD_MATCHING_CONFIG: GameConfig = {
  id: 'image-word-matching',
  title: 'Resim-Kelime Eşleştirme',
  description: 'Gösterilene uygun kelimeyi seçin. Dikkatli olun, çeldiriciler var!',
  difficulty: 'Orta',
  estimatedTime: '3-5 dk',
  totalQuestions: 15,
  hasLevels: false,
  instructions: [
    {
      step: 1,
      title: 'Resmi İnceleyin',
      description: 'Ekranda bir resim gösterilecek'
    },
    {
      step: 2,
      title: 'Doğru Kelimeyi Seçin',
      description: '4 kelime seçeneği arasından doğru olanı seçin'
    },
    {
      step: 3,
      title: 'Egzersizi Tamamlayın',
      description: '15 soruyu tamamlayarak egzersizi bitirin'
    }
  ],
  stats: [
    { key: 'totalQuestions', label: 'Toplam Soru', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Tahmini Süre', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Mantık Dizileri Konfigürasyonu - 🧠 ANALYTICAL THINKING ASSESSMENT
export const LOGIC_SEQUENCES_CONFIG: GameConfig = {
  id: 'logic-sequences',
  title: 'Mantık Dizileri',
  description: 'Analytical thinking, pattern recognition ve mathematical reasoning assessment. Sayı dizilerindeki mantığı bulun.',
  difficulty: 'Artan',
  estimatedTime: '8-12 dk',
  totalQuestions: 25,
  hasLevels: true,
  instructions: [
    {
      step: 1,
      title: '🧮 Pattern Recognition',
      description: 'Aritmetik, geometrik, Fibonacci ve özel pattern türlerini tanıyın'
    },
    {
      step: 2,
      title: '🔢 Mathematical Reasoning',
      description: 'Kare sayılar, asal sayılar, üçgensel sayılar gibi advanced patterns'
    },
    {
      step: 3,
      title: '🧠 Analytical Thinking',
      description: 'Sequential logic ve abstract reasoning ile complex problems'
    },
    {
      step: 4,
      title: '⚡ Cognitive Assessment',
      description: '25 soru ile comprehensive clinical analytical thinking evaluation'
    },
    {
      step: 5,
      title: '📊 Clinical Insights',
      description: 'Pattern performance ve cognitive flexibility analizi alın'
    }
  ],
  stats: [
    { key: 'totalQuestions', label: '25 Soru • 8 Level', icon: 'target', color: 'primary' },
    { key: 'difficulty', label: '12 Pattern Türü', icon: 'lightbulb', color: 'primary' },
    { key: 'difficulty', label: 'Clinical Assessment', icon: 'trophy', color: 'primary' }
  ]
}

// Sayı Dizisi Takibi Konfigürasyonu
export const NUMBER_SEQUENCE_CONFIG: GameConfig = {
  id: 'number-sequence',
  title: 'Sayı Dizisi Takibi',
  description: 'Gösterilen sayı dizisini hatırlayın ve aynı sırayla tekrarlayın. Working Memory (çalışma belleği) assessment test.',
  difficulty: 'Artan',
  estimatedTime: '5-10 dk',
  hasLevels: true,
  instructions: [
    {
      step: 1,
      title: 'Sayıları İzleyin',
      description: 'Ekranda sayılar sırayla gösterilecek, dikkatle izleyin'
    },
    {
      step: 2,
      title: 'Hatırlayın ve Girin',
      description: 'Sayıları hatırlayın ve aynı sırayla girin'
    },
    {
      step: 3,
      title: 'Seviye Atlayın',
      description: 'Her seviyede dizi uzunluğu artar (Miller\'s 7±2 Rule test)'
    },
    {
      step: 4,
      title: '⚠️ DİKKAT: Test Kuralı',
      description: '3 hata yaparsanız working memory assessment tamamlanır ve sonuçlar değerlendirilir'
    },
    {
      step: 5,
      title: 'Erken Çıkış Uyarısı',
      description: 'Testi yarıda bırakırsanız sonuçlar kaydedilmez - lütfen tamamlayın!'
    }
  ],
  stats: [
    { key: 'hasLevels', label: 'Working Memory Test', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Miller\'s 7±2 Rule', icon: 'eye', color: 'primary' },
    { key: 'difficulty', label: '3 Hata = Test Biter', icon: 'trophy', color: 'primary' }
  ]
}

// Londra Kulesi Konfigürasyonu
export const TOWER_OF_LONDON_CONFIG: GameConfig = {
  id: 'tower-of-london',
  title: 'Londra Kulesi',
  description: 'Topları minimum hamle ile hedef pozisyona taşıyın. Planlama ve executive function becerilerinizi test edin.',
  difficulty: 'Artan',
  estimatedTime: '10-25 dk',
  hasLevels: true,
  maxLevel: 30,
  instructions: [
    {
      step: 1,
      title: 'Hedefi İnceleyin',
      description: 'Topların hangi pozisyonda olması gerektiğini analiz edin'
    },
    {
      step: 2,
      title: 'Planınızı Yapın',
      description: 'Minimum hamle ile hedefe ulaşmak için önceden planlama yapın (Planning Time ölçümü)'
    },
    {
      step: 3,
      title: 'Topları Taşıyın',
      description: 'Kule kapasitelerine dikkat ederek [3,2,1] topları optimum şekilde taşıyın'
    },
    {
      step: 4,
      title: 'Executive Function Test',
      description: 'Bu test planning, working memory ve problem solving becerilerinizi ölçer'
    }
  ],
  stats: [
    { key: 'maxLevel', label: '30 Seviye', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Clinical Assessment', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Executive Function', icon: 'trophy', color: 'primary' }
  ]
}

// Renk Dizisi Takibi Konfigürasyonu
export const COLOR_SEQUENCE_CONFIG: GameConfig = {
  id: 'color-sequence',
  title: 'Renk Dizisi Takibi',
  description: 'Gösterilen renk dizisini hatırlayın ve tekrarlayın. Visual-Spatial Memory (görsel-uzamsal bellek) assessment test.',
  difficulty: 'Artan',
  estimatedTime: '5-10 dk',
  hasLevels: true,
  instructions: [
    {
      step: 1,
      title: 'Renkleri İzleyin',
      description: 'Ekranda renkler sırayla yanıp sönecek, dikkatle izleyin'
    },
    {
      step: 2,
      title: 'Sırayı Hatırlayın',
      description: 'Renklerin gösterilme sırasını hatırlayın ve aynı sırayla renklere tıklayın'
    },
    {
      step: 3,
      title: 'Seviye Atlayın',
      description: 'Her seviyede dizi uzunluğu artar (Visual-spatial memory assessment)'
    },
    {
      step: 4,
      title: '⚠️ DİKKAT: Test Kuralı',
      description: '3 hata yaparsanız görsel-uzamsal bellek assessment tamamlanır ve sonuçlar değerlendirilir'
    },
    {
      step: 5,
      title: 'Erken Çıkış Uyarısı',
      description: 'Testi yarıda bırakırsanız sonuçlar kaydedilmez - lütfen tamamlayın!'
    }
  ],
  stats: [
    { key: 'hasLevels', label: 'Visual-Spatial Test', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Renk Ayırt Etme', icon: 'eye', color: 'primary' },
    { key: 'difficulty', label: '3 Hata = Test Biter', icon: 'trophy', color: 'primary' }
  ]
}



// Kelime-Resim Eşleştirme Konfigürasyonu
export const WORD_IMAGE_MATCHING_CONFIG: GameConfig = {
  id: 'word-image-matching',
  title: 'Kelime-Resim Eşleştirme',
  description: 'Gösterilen kelimeye uygun resmi seçin. Tersine eşleştirme egzersizi.',
  difficulty: 'Orta',
  estimatedTime: '3-5 dk',
  totalQuestions: 15,
  hasLevels: false,
  instructions: [
    {
      step: 1,
      title: 'Kelimeyi Okuyun',
      description: 'Ekranda bir kelime gösterilecek'
    },
    {
      step: 2,
      title: 'Doğru Resmi Seçin',
      description: '4 emoji seçeneği arasından doğru olanı seçin'
    },
    {
      step: 3,
      title: 'Egzersizi Tamamlayın',
      description: '15 soruyu tamamlayarak egzersizi bitirin'
    }
  ],
  stats: [
    { key: 'totalQuestions', label: 'Toplam Soru', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Tahmini Süre', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Hanoi Kuleleri Konfigürasyonu
export const HANOI_TOWERS_CONFIG: GameConfig = {
  id: 'hanoi-towers',
  title: 'Hanoi Kuleleri',
  description: 'Klasik Hanoi Kuleleri bulmacası. Diskleri minimum hamle ile hedefe taşıyın ve rekürsif düşünme becerilerinizi geliştirin.',
  difficulty: 'Artan',
  estimatedTime: '10-30 dk',
  hasLevels: true,
  maxLevel: 18,
  instructions: [
    {
      step: 1,
      title: 'Hedef Düzenlemeyi İnceleyin',
      description: 'Disklerin hangi kule düzenlemesinde olması gerektiğini görün'
    },
    {
      step: 2,
      title: 'Kuralları Hatırlayın',
      description: 'Büyük disk küçük diskin üzerine konulamaz'
    },
    {
      step: 3,
      title: 'Stratejinizi Planlayın',
      description: 'Minimum hamle ile hedefe ulaşmak için plan yapın'
    },
    {
      step: 4,
      title: 'Diskleri Taşıyın',
      description: 'Sırayla kulelere tıklayarak diskleri taşıyın'
    }
  ],
  stats: [
    { key: 'maxLevel', label: 'Toplam Seviye', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Tahmini Süre', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
} 