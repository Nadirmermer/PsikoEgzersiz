
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
}

export const GAME_EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔']

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export const generateCards = (gridSize: { rows: number; cols: number }): Card[] => {
  const totalCards = gridSize.rows * gridSize.cols
  const totalPairs = totalCards / 2
  
  // İlk 'totalPairs' sayıda emoji seç
  const selectedEmojis = GAME_EMOJIS.slice(0, totalPairs)
  
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

export const calculateScore = (stats: Omit<GameStats, 'score' | 'timestamp' | 'exercise_name'>): number => {
  const { total_pairs, moves_count, incorrect_moves_count, duration_seconds } = stats
  
  // Basit skorlama formülü: (Çift sayısı * 1000) / (hamle + hatalı hamle*2 + süre)
  const baseScore = total_pairs * 1000
  const penalty = moves_count + (incorrect_moves_count * 2) + Math.floor(duration_seconds)
  
  return Math.max(Math.floor(baseScore / penalty), 0)
}
