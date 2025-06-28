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

// Oyun durumu (unified)
export interface GameState {
  phase: GamePhase
  isPlaying: boolean
  isPaused: boolean
  isCompleted: boolean
  startTime: number
  currentTime: number
  pausedTime: number
  duration: number
  // Additional state properties
  isActive: boolean
  currentLevel: number
  score: number
  timeElapsed: number
  data: Record<string, unknown>
}

// Oyun istatistikleri
export interface GameStats {
  score: number
  level?: number | string
  progress: string
  time?: string
  accuracy?: number
  [key: string]: unknown
}

// Oyun sonucu (unified)
export interface GameResult {
  exerciseName: string
  score: number
  duration: number
  completed: boolean
  accuracy?: number
  level?: number
  details?: Record<string, unknown>
  timestamp: string
}

// Oyun aksiyonları (unified)
export interface GameActions {
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onRestart: () => void
  onComplete: (result: GameResult) => void
  onBack: () => void
  onNextLevel?: () => void
  onExitEarly?: () => void
  // Additional action methods
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
  updateScore: (score: number) => void
  updateLevel: (level: number) => void
  setData: (data: Record<string, unknown>) => void
}

// Oyun bileşeni props
export interface GameComponentProps {
  gameState: GameState
  gameStats: GameStats
  onAction: (action: string, data?: Record<string, unknown>) => void
}

// Oyun hook return type - helper methodları da dahil
export interface GameHookReturn {
  gameState: GameState
  gameStats: GameStats
  gameActions: GameActions
  gameData: Record<string, unknown>
  // Helper methods
  updateGameStats: (newStats: Partial<GameStats>) => void
  updateGameData: (newData: Record<string, unknown>) => void
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

// Extended Exercise Configs
export interface BaseExerciseConfig {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: number
  category: string
  tags: string[]
  cognitiveAreas: string[]
}

export interface MemoryGameConfig extends BaseExerciseConfig {
  type: 'memory'
  gridSize: {
    rows: number
    cols: number
  }
  cardCount: number
  timeLimit?: number
  showTime: number
  categories: string[]
}

export interface SequenceGameConfig extends BaseExerciseConfig {
  type: 'sequence'
  maxSequenceLength: number
  timePerElement: number
  sequenceType: 'numbers' | 'colors' | 'shapes'
  startLength: number
  incrementRate: number
}

export interface MatchingGameConfig extends BaseExerciseConfig {
  type: 'matching'
  questionCount: number
  timePerQuestion: number
  categories: string[]
  shuffleOptions: boolean
  showImages: boolean
}

export interface TowerGameConfig extends BaseExerciseConfig {
  type: 'tower'
  diskCount: number
  minMoves: number
  timeLimit?: number
  showOptimalPath: boolean
  allowHints: boolean
}

export type ExerciseConfig = MemoryGameConfig | SequenceGameConfig | MatchingGameConfig | TowerGameConfig

export interface GameSession {
  sessionId: string
  exerciseId: string
  startTime: Date
  endTime?: Date
  score: number
  completed: boolean
  data: Record<string, unknown>
} 