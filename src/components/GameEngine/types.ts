// Game Engine Types - Tüm oyunlar için ortak tipler

export type GamePhase = 'ready' | 'playing' | 'paused' | 'completed'
export type GameDifficulty = 'Kolay' | 'Orta' | 'Zor' | 'Artan'

// Oyun yapılandırması
export interface GameConfig {
  id: string
  title: string
  description: string
  difficulty: GameDifficulty
  estimatedTime: string
  totalQuestions?: number
  hasLevels?: boolean
  maxLevel?: number
  instructions: GameInstruction[]
  stats: GameStatConfig[]
}

// Oyun talimatları
export interface GameInstruction {
  step: number
  title: string
  description: string
  icon?: string
}

// Oyun istatistik yapılandırması
export interface GameStatConfig {
  key: string
  label: string
  icon: string
  color: string
}

// Oyun durumu
export interface GameState {
  phase: GamePhase
  isPlaying: boolean
  isPaused: boolean
  isCompleted: boolean
  startTime: number
  currentTime: number
  pausedTime: number
  duration: number
}

// Oyun istatistikleri
export interface GameStats {
  score: number
  level?: number | string
  progress: string
  time?: string
  accuracy?: number
  [key: string]: any
}

// Oyun sonucu
export interface GameResult {
  exerciseName: string
  score: number
  duration: number
  completed: boolean
  accuracy?: number
  level?: number
  details: any
  timestamp: string
}

// Oyun aksiyonları
export interface GameActions {
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onComplete: (result: GameResult) => void
  onBack: () => void
}

// Oyun bileşeni props
export interface GameComponentProps {
  gameState: GameState
  gameStats: GameStats
  onAction: (action: string, data?: any) => void
}

// Oyun hook return type - helper methodları da dahil
export interface GameHookReturn {
  gameState: GameState
  gameStats: GameStats
  gameActions: GameActions
  gameData: any
  // Helper methods
  updateGameStats: (newStats: Partial<GameStats>) => void
  updateGameData: (newData: any) => void
  updateGameState: (newState: Partial<GameState>) => void
  formatTime: (seconds: number) => string
}

// Universal Game Engine Props
export interface UniversalGameEngineProps {
  gameConfig: GameConfig
  gameHook: () => GameHookReturn
  children: React.ReactNode
  onBack: () => void
} 