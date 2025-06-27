import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 🔧 FIX: Unified touch target system for all games
export const touchTargetClasses = {
  // Base touch target - meets accessibility standards
  base: "min-h-[44px] min-w-[44px] touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95",
  
  // Enhanced tablet targets
  tablet: "tablet:min-h-[56px] tablet:min-w-[56px] tablet:hover:scale-105",
  
  // Game-specific variations
  card: "min-h-[44px] min-w-[44px] sm:min-h-[56px] sm:min-w-[56px] md:min-h-[64px] md:min-w-[64px]",
  button: "min-h-[44px] min-w-[44px] tablet:min-h-[48px] tablet:min-w-[48px]",
  colorTarget: "min-h-[44px] min-w-[44px] tablet:min-h-[64px] tablet:min-w-[64px]",
  
  // Combined classes for easy use
  gameCard: "min-h-[44px] min-w-[44px] sm:min-h-[56px] sm:min-w-[56px] md:min-h-[64px] md:min-w-[64px] touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 tablet:hover:scale-105",
  gameButton: "min-h-[44px] min-w-[44px] tablet:min-h-[48px] tablet:min-w-[48px] touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 tablet:hover:scale-105",
  gameColorTarget: "min-h-[44px] min-w-[44px] tablet:min-h-[64px] tablet:min-w-[64px] touch-manipulation select-none focus:outline-none focus:ring-4 focus:ring-primary/50 active:scale-95 tablet:hover:scale-105"
} as const

// Animation timing constants for consistency
export const animationTiming = {
  cardFlip: 300,
  colorHighlight: 750,
  sequenceShow: 1000,
  feedbackDuration: 2000,
  transitionQuick: 200,
  transitionNormal: 300,
  transitionSlow: 500
} as const

// 🔧 FIX: Unified level progression system
export const levelProgression = {
  // Standard feedback display duration before progression
  feedbackDuration: 2500,
  
  // Level completion celebration duration  
  completionDuration: 1500,
  
  // Auto-progression delay (user can see results)
  autoProgressDelay: 3000,
  
  // Quick progression for simple games
  quickProgressDelay: 2000,
  
  // Manual progression timeout (show continue button after)
  manualProgressTimeout: 5000,
  
  // Level preview duration
  previewDuration: 3000
} as const

// Game-specific progression configurations
export const gameProgressions = {
  memoryGame: {
    feedbackDuration: levelProgression.feedbackDuration,
    autoProgressDelay: levelProgression.autoProgressDelay,
    previewDuration: levelProgression.previewDuration,
    type: 'auto' as const
  },
  numberSequence: {
    feedbackDuration: levelProgression.feedbackDuration,
    manualProgressTimeout: levelProgression.manualProgressTimeout,
    type: 'manual' as const
  },
  colorSequence: {
    feedbackDuration: levelProgression.feedbackDuration,
    manualProgressTimeout: levelProgression.manualProgressTimeout,
    type: 'manual' as const
  },
  matchingGames: {
    feedbackDuration: levelProgression.completionDuration,
    autoProgressDelay: levelProgression.quickProgressDelay,
    type: 'auto' as const
  },
  puzzleGames: {
    feedbackDuration: levelProgression.feedbackDuration,
    autoProgressDelay: levelProgression.autoProgressDelay,
    previewDuration: levelProgression.previewDuration,
    type: 'auto' as const
  }
} as const

// Game timing configurations
export const gameTimings = {
  memoryGame: {
    previewDuration: gameProgressions.memoryGame.previewDuration,
    cardFlipDuration: animationTiming.cardFlip,
    mismatchRevealDuration: 1500,
    feedbackDuration: gameProgressions.memoryGame.feedbackDuration,
    autoProgressDelay: gameProgressions.memoryGame.autoProgressDelay
  },
  colorSequence: {
    showDelay: 500,
    showDuration: animationTiming.colorHighlight,
    hideDuration: 250,
    initialDelay: 1000,
    feedbackDuration: gameProgressions.colorSequence.feedbackDuration,
    manualProgressTimeout: gameProgressions.colorSequence.manualProgressTimeout
  },
  numberSequence: {
    showDuration: animationTiming.sequenceShow,
    inputTimeout: 30000,
    feedbackDuration: gameProgressions.numberSequence.feedbackDuration,
    manualProgressTimeout: gameProgressions.numberSequence.manualProgressTimeout
  },
  matchingGames: {
    feedbackDuration: gameProgressions.matchingGames.feedbackDuration,
    autoProgressDelay: gameProgressions.matchingGames.autoProgressDelay
  },
  puzzleGames: {
    previewDuration: gameProgressions.puzzleGames.previewDuration,
    feedbackDuration: gameProgressions.puzzleGames.feedbackDuration,
    autoProgressDelay: gameProgressions.puzzleGames.autoProgressDelay
  }
} as const
