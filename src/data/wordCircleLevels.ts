
export interface TargetWord {
  word: string
  startX: number
  startY: number
  direction: 'horizontal' | 'vertical'
}

export interface WordCircleLevel {
  levelNumber: number
  circleLetters: string[]
  targetWords: TargetWord[]
  gridDimensions: { rows: number; cols: number }
  bonusWords?: string[]
}

export const WORD_CIRCLE_LEVELS: WordCircleLevel[] = [
  {
    levelNumber: 1,
    circleLetters: ["K", "A", "L", "E"],
    targetWords: [
      { word: "KALE", startX: 0, startY: 0, direction: "horizontal" },
      { word: "AK", startX: 0, startY: 0, direction: "vertical" },
      { word: "EL", startX: 2, startY: 0, direction: "vertical" }
    ],
    gridDimensions: { rows: 4, cols: 4 },
    bonusWords: ["LA", "KE"]
  },
  {
    levelNumber: 2,
    circleLetters: ["B", "A", "L", "I", "K"],
    targetWords: [
      { word: "BALIK", startX: 0, startY: 1, direction: "horizontal" },
      { word: "KAL", startX: 1, startY: 0, direction: "vertical" },
      { word: "AL", startX: 3, startY: 0, direction: "vertical" },
      { word: "BIL", startX: 0, startY: 0, direction: "vertical" }
    ],
    gridDimensions: { rows: 5, cols: 5 },
    bonusWords: ["LAK", "BAK"]
  },
  {
    levelNumber: 3,
    circleLetters: ["E", "L", "M", "A", "K"],
    targetWords: [
      { word: "ELMA", startX: 0, startY: 0, direction: "horizontal" },
      { word: "KAL", startX: 1, startY: 0, direction: "vertical" },
      { word: "MAL", startX: 3, startY: 0, direction: "vertical" },
      { word: "KAM", startX: 0, startY: 3, direction: "horizontal" }
    ],
    gridDimensions: { rows: 5, cols: 5 },
    bonusWords: ["ALE", "LEM", "EMA"]
  },
  {
    levelNumber: 4,
    circleLetters: ["A", "N", "T", "E", "L"],
    targetWords: [
      { word: "ANTEN", startX: 0, startY: 0, direction: "horizontal" },
      { word: "TEN", startX: 1, startY: 2, direction: "vertical" },
      { word: "EL", startX: 3, startY: 0, direction: "vertical" },
      { word: "NET", startX: 2, startY: 1, direction: "horizontal" }
    ],
    gridDimensions: { rows: 5, cols: 6 },
    bonusWords: ["LEN", "ALT"]
  },
  {
    levelNumber: 5,
    circleLetters: ["S", "U", "R", "A", "T"],
    targetWords: [
      { word: "SURAT", startX: 1, startY: 0, direction: "vertical" },
      { word: "TUR", startX: 0, startY: 2, direction: "horizontal" },
      { word: "ARS", startX: 2, startY: 1, direction: "vertical" },
      { word: "ART", startX: 4, startY: 0, direction: "vertical" },
      { word: "SU", startX: 0, startY: 4, direction: "horizontal" }
    ],
    gridDimensions: { rows: 6, cols: 5 },
    bonusWords: ["RAS", "ASU", "SAT"]
  },
  {
    levelNumber: 6,
    circleLetters: ["K", "A", "R", "P", "U", "Z"],
    targetWords: [
      { word: "KARPUZ", startX: 0, startY: 0, direction: "horizontal" },
      { word: "ARK", startX: 0, startY: 1, direction: "vertical" },
      { word: "ZAR", startX: 2, startY: 3, direction: "horizontal" },
      { word: "KAZ", startX: 0, startY: 5, direction: "horizontal" },
      { word: "RAP", startX: 3, startY: 0, direction: "vertical" }
    ],
    gridDimensions: { rows: 6, cols: 6 },
    bonusWords: ["PARK", "AZUR"]
  },
  {
    levelNumber: 7,
    circleLetters: ["G", "Ü", "N", "E", "Ş", "L"],
    targetWords: [
      { word: "GÜNEŞ", startX: 0, startY: 0, direction: "horizontal" },
      { word: "ŞEN", startX: 2, startY: 0, direction: "vertical" },
      { word: "ŞEL", startX: 1, startY: 2, direction: "horizontal" },
      { word: "EL", startX: 4, startY: 1, direction: "vertical" },
      { word: "GEL", startX: 0, startY: 4, direction: "horizontal" }
    ],
    gridDimensions: { rows: 6, cols: 6 },
    bonusWords: ["LÜG", "LEŞ"]
  }
]
