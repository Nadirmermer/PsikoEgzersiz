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
  description: 'Gösterilen emojiye uygun kelimeyi seçin. Dikkatli olun, çeldiriciler var!',
  difficulty: 'Orta',
  estimatedTime: '3-5 dk',
  totalQuestions: 15,
  hasLevels: false,
  instructions: [
    {
      step: 1,
      title: 'Emojiyi İnceleyin',
      description: 'Ekranda bir emoji gösterilecek'
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

// Mantık Dizileri Konfigürasyonu
export const LOGIC_SEQUENCES_CONFIG: GameConfig = {
  id: 'logic-sequences',
  title: 'Mantık Dizileri',
  description: 'Sayı dizilerindeki mantığı bulun ve eksik sayıyı tamamlayın.',
  difficulty: 'Artan',
  estimatedTime: '5-8 dk',
  totalQuestions: 10,
  hasLevels: false,
  instructions: [
    {
      step: 1,
      title: 'Mantığı Bulun',
      description: 'Verilen sayı dizisindeki mantığı bulun'
    },
    {
      step: 2,
      title: 'Eksik Sayıyı Hesaplayın',
      description: 'Dizide eksik olan sayıyı hesaplayın'
    },
    {
      step: 3,
      title: 'Doğru Seçeneği İşaretleyin',
      description: 'Seçenekler arasından doğru cevabı seçin'
    },
    {
      step: 4,
      title: 'Egzersizi Tamamlayın',
      description: '10 soruyu tamamlayarak egzersizi bitirin'
    }
  ],
  stats: [
    { key: 'totalQuestions', label: 'Toplam Soru', icon: 'target', color: 'primary' },
    { key: 'difficulty', label: 'Dizi Türleri', icon: 'lightbulb', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Sayı Dizisi Takibi Konfigürasyonu
export const NUMBER_SEQUENCE_CONFIG: GameConfig = {
  id: 'number-sequence',
  title: 'Sayı Dizisi Takibi',
  description: 'Gösterilen sayı dizisini hatırlayın ve aynı sırayla tekrarlayın.',
  difficulty: 'Artan',
  estimatedTime: '5-10 dk',
  hasLevels: true,
  instructions: [
    {
      step: 1,
      title: 'Sayıları İzleyin',
      description: 'Ekranda sayılar sırayla gösterilecek'
    },
    {
      step: 2,
      title: 'Hatırlayın ve Girin',
      description: 'Sayıları hatırlayın ve aynı sırayla girin'
    },
    {
      step: 3,
      title: 'Seviye Atlayın',
      description: 'Her seviyede dizi uzunluğu artar'
    },
    {
      step: 4,
      title: 'Hata Durumu',
      description: 'Hata yaparsanız aynı seviyeyi tekrar denersiniz'
    }
  ],
  stats: [
    { key: 'hasLevels', label: 'Başlangıç Seviyesi', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Gösterim Süresi', icon: 'eye', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Londra Kulesi Konfigürasyonu
export const TOWER_OF_LONDON_CONFIG: GameConfig = {
  id: 'tower-of-london',
  title: 'Londra Kulesi',
  description: 'Diskleri minimum hamle ile hedef pozisyona taşıyın. Planlama becerilerinizi test edin.',
  difficulty: 'Artan',
  estimatedTime: '8-15 dk',
  hasLevels: true,
  maxLevel: 10,
  instructions: [
    {
      step: 1,
      title: 'Hedefi İnceleyin',
      description: 'Disklerin hangi pozisyonda olması gerektiğini görün'
    },
    {
      step: 2,
      title: 'Planınızı Yapın',
      description: 'Minimum hamle ile hedefe ulaşmak için plan yapın'
    },
    {
      step: 3,
      title: 'Diskleri Taşıyın',
      description: 'Diskleri tıklayarak doğru çubukları taşıyın'
    },
    {
      step: 4,
      title: 'Optimum Çözüm',
      description: 'En az hamle ile çözmeye çalışın'
    }
  ],
  stats: [
    { key: 'maxLevel', label: 'Toplam Seviye', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Tahmini Süre', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Renk Dizisi Takibi Konfigürasyonu
export const COLOR_SEQUENCE_CONFIG: GameConfig = {
  id: 'color-sequence',
  title: 'Renk Dizisi Takibi',
  description: 'Gösterilen renk dizisini hatırlayın ve tekrarlayın. Görsel hafızanızı geliştirin.',
  difficulty: 'Artan',
  estimatedTime: '5-10 dk',
  hasLevels: true,
  instructions: [
    {
      step: 1,
      title: 'Renkleri İzleyin',
      description: 'Ekranda renkler sırayla yanıp sönecek'
    },
    {
      step: 2,
      title: 'Sırayı Hatırlayın',
      description: 'Renklerin gösterilme sırasını hatırlayın'
    },
    {
      step: 3,
      title: 'Tekrarlayın',
      description: 'Aynı sırayla renklere tıklayın'
    },
    {
      step: 4,
      title: 'Seviye Atlayın',
      description: 'Her seviyede dizi uzunluğu artar'
    }
  ],
  stats: [
    { key: 'hasLevels', label: 'Başlangıç Seviyesi', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Gösterim Süresi', icon: 'eye', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Kelime Çemberi Bulmacası Konfigürasyonu
export const WORD_CIRCLE_CONFIG: GameConfig = {
  id: 'word-circle',
  title: 'Kelime Çemberi Bulmacası',
  description: 'Çemberdeki harflerden kelimeler oluşturun. Kelime bilginizi test edin.',
  difficulty: 'Artan',
  estimatedTime: '8-15 dk',
  hasLevels: true,
  maxLevel: 7,
  instructions: [
    {
      step: 1,
      title: 'Harfleri İnceleyin',
      description: 'Çemberdeki harfleri inceleyin'
    },
    {
      step: 2,
      title: 'Kelimeleri Bulun',
      description: 'Bu harflerden anlamlı kelimeler oluşturun'
    },
    {
      step: 3,
      title: 'Izgaraya Yerleştirin',
      description: 'Bulunan kelimeleri ızgaraya yerleştirin'
    },
    {
      step: 4,
      title: 'Seviyeyi Tamamlayın',
      description: 'Tüm hedef kelimeleri bulun'
    }
  ],
  stats: [
    { key: 'maxLevel', label: 'Toplam Seviye', icon: 'target', color: 'primary' },
    { key: 'estimatedTime', label: 'Tahmini Süre', icon: 'clock', color: 'primary' },
    { key: 'difficulty', label: 'Zorluk', icon: 'trophy', color: 'primary' }
  ]
}

// Kelime-Resim Eşleştirme Konfigürasyonu
export const WORD_IMAGE_MATCHING_CONFIG: GameConfig = {
  id: 'word-image-matching',
  title: 'Kelime-Resim Eşleştirme',
  description: 'Gösterilen kelimeye uygun emojiyi seçin. Tersine eşleştirme egzersizi.',
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
      title: 'Doğru Emojiyi Seçin',
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