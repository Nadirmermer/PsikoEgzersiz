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

// 🔧 FIX: Unified game timing system for consistency across all games
export const gameTimings = {
  memoryGame: {
    previewDuration: 3000,        // Card preview time
    cardFlipDuration: 300,        // Card flip animation
    mismatchRevealDuration: 1500, // Time to show mismatched cards
    feedbackDuration: 2500,       // Success/fail message duration
    autoProgressDelay: 3000       // Auto progression to next level
  },
  numberSequence: {
    showDelay: 500,               // Before showing sequence
    numberDisplayDuration: 800,   // Each number show time
    feedbackDuration: 2500,       // Success/fail message duration
    levelCompleteDelay: 1500      // Before allowing next level
  },
  colorSequence: {
    showDelay: 500,               // Before showing sequence  
    colorDisplayDuration: 750,    // Each color show time
    feedbackDuration: 2500,       // Success/fail message duration
    levelCompleteDelay: 1500      // Before allowing next level
  },
  matchingGames: {
    feedbackDuration: 2500,       // Answer feedback duration
    questionTransition: 800,      // Time between questions
    gameCompleteDelay: 3000       // Before showing final results
  },
  towerGames: {
    moveAnimationDuration: 300,   // Disk/ball move animation
    levelCompleteDelay: 2000,     // Success message duration
    autoProgressDelay: 3000       // Auto progression to next level
  },
  wordGames: {
    letterSelectionDelay: 200,    // Letter highlight duration
    wordCheckDelay: 1000,         // Word validation feedback
    levelCompleteDelay: 2500      // Level completion message
  }
} as const

// 🔧 FIX: Standardized UI styling classes for consistency
export const uiStyles = {
  // Standardized card backgrounds - using /70 + /30 pattern for better contrast
  gameCard: {
    primary: "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl",
    secondary: "bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-lg",
    accent: "bg-primary/10 dark:bg-primary/20 backdrop-blur-sm border-primary/20 dark:border-primary/30"
  },
  
  // Status/feedback card backgrounds
  statusCard: {
    error: "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 backdrop-blur-sm",
    loading: "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 backdrop-blur-sm",
    success: "bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800 backdrop-blur-sm",
    warning: "bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 backdrop-blur-sm",
    info: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/20 dark:border-blue-800/20 backdrop-blur-sm"
  },
  
  // Standardized containers
  container: {
    main: "w-full max-w-4xl mx-auto space-y-6",
    compact: "w-full max-w-2xl mx-auto space-y-6", 
    wide: "w-full max-w-6xl mx-auto space-y-6"
  },
  
  // Standardized content padding
  cardContent: {
    standard: "p-6 sm:p-8",
    compact: "p-4 sm:p-6",
    minimal: "p-3 sm:p-4"
  },
  
  // Badge styling
  badge: {
    level: "text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20",
    status: "text-xs px-2 py-1 bg-secondary/10 text-secondary border-secondary/20"
  }
} as const
