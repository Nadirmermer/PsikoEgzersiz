import React from 'react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { WORD_CIRCLE_CONFIG } from '../components/GameEngine/gameConfigs'
import { useWordCircleGame, useWordCircle } from '../hooks/useWordCircle'
import { Shuffle, Check, X, RotateCcw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'

interface KelimeCemberiBulmacasiProps {
  onBack: () => void
}

// Letter Circle Component - Güzel çember tasarımı
const LetterCircle: React.FC<{
  letters: string[]
  selectedLetters: number[]
  onLetterClick: (index: number) => void
}> = ({ letters, selectedLetters, onLetterClick }) => {
  const calculatePosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90 // -90 to start from top
    const radius = 120 // Daha büyük radius
    const x = Math.cos((angle * Math.PI) / 180) * radius
    const y = Math.sin((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Çember çizgisi */}
      <div className="absolute inset-0 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-600" />
      
      {/* Orta alan */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-gray-200 dark:border-gray-700" />

      {/* Harfler */}
      {letters.map((letter, index) => {
        const { x, y } = calculatePosition(index, letters.length)
        const isSelected = selectedLetters.includes(index)
        const selectionOrder = selectedLetters.indexOf(index) + 1

        return (
          <div
            key={index}
            className={`
              absolute w-16 h-16 rounded-full cursor-pointer transition-all duration-300 shadow-lg
              flex items-center justify-center font-bold text-lg
              ${isSelected 
                ? 'bg-primary text-white scale-110 shadow-primary/50 z-10' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:scale-105 hover:shadow-xl'
              }
              border-2 ${isSelected ? 'border-primary' : 'border-gray-200 dark:border-gray-600'}
            `}
            style={{
              left: `calc(50% + ${x}px - 32px)`,
              top: `calc(50% + ${y}px - 32px)`,
            }}
            onClick={() => onLetterClick(index)}
          >
            {letter}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {selectionOrder}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Word Display Component
const WordDisplay: React.FC<{
  currentWord: string
  onSubmit: () => void
  onClear: () => void
}> = ({ currentWord, onSubmit, onClear }) => {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-gray-700/20">
      <div className="text-center space-y-4">
        <h3 className="font-bold text-gray-700 dark:text-gray-300">Oluşturulan Kelime</h3>
        
        {/* Word display */}
        <div className="min-h-[60px] bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          {currentWord ? (
            <span className="text-2xl font-bold text-primary tracking-wider">
              {currentWord}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              Harfleri seçin...
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={!currentWord}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Temizle
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={currentWord.length < 2}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            Kelimeyi Kontrol Et
          </Button>
        </div>
      </div>
    </div>
  )
}

// Found Words Component
const FoundWords: React.FC<{
  foundWords: string[]
  bonusWords: string[]
  targetWords: string[]
}> = ({ foundWords, bonusWords, targetWords }) => {
  return (
    <div className="space-y-4">
      {/* Target Words */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
        <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-2">
          Hedef Kelimeler ({foundWords.length}/{targetWords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {targetWords.map((word) => (
            <div
              key={word}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                foundWords.includes(word)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {foundWords.includes(word) ? word : '???'}
            </div>
          ))}
        </div>
      </div>

      {/* Bonus Words */}
      {bonusWords.length > 0 && (
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
          <h4 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            Bonus Kelimeler ({bonusWords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {bonusWords.map((word) => (
              <div
                key={word}
                className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Ana Oyun Komponenti
const WordCircleGame: React.FC = () => {
  const wordCircle = useWordCircle({ maxLevel: 7 })

  React.useEffect(() => {
    // Oyun başlatıldığında seviye 1'i yükle
    wordCircle.startGame()
  }, [])

  const handleSubmitWord = () => {
    const result = wordCircle.submitWord()
    if (!result) return

    switch (result.type) {
      case 'target_word':
        toast.success(`🎉 Harika! "${result.word}" kelimesini buldunuz! (+${result.score} puan)`)
        if (result.isComplete) {
          setTimeout(() => {
            toast.success('🏆 Seviye tamamlandı!')
            wordCircle.nextLevel()
          }, 1500)
        }
        break
      case 'bonus_word':
        toast.success(`⭐ Bonus kelime! "${result.word}" (+${result.score} puan)`)
        break
      case 'invalid':
        if (result.word.length > 1) {
          toast.error(`"${result.word}" geçerli bir kelime değil`)
        }
        break
    }
  }

  if (!wordCircle.levelData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Seviye yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Level Info */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Seviye {wordCircle.currentLevel}
        </h2>
        <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Skor: <strong className="text-primary">{wordCircle.score}</strong></span>
          <span>İlerleme: <strong className="text-green-600">{wordCircle.progress}%</strong></span>
        </div>
      </div>

      {/* Letter Circle */}
      <LetterCircle
        letters={wordCircle.levelData.circleLetters}
        selectedLetters={wordCircle.selectedLetters}
        onLetterClick={wordCircle.handleLetterClick}
      />

      {/* Word Display */}
      <WordDisplay
        currentWord={wordCircle.currentWord}
        onSubmit={handleSubmitWord}
        onClear={wordCircle.clearSelection}
      />

      {/* Actions */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={wordCircle.shuffleLetters}
          className="flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          Harfleri Karıştır
        </Button>
      </div>

      {/* Found Words */}
      <FoundWords
        foundWords={wordCircle.foundWords}
        bonusWords={wordCircle.bonusWords}
        targetWords={wordCircle.levelData.targetWords.map(tw => tw.word)}
      />
    </div>
  )
}

const KelimeCemberiBulmacasiSayfasiYeni: React.FC<KelimeCemberiBulmacasiProps> = ({ onBack }) => {
  return (
    <UniversalGameEngine
      gameConfig={WORD_CIRCLE_CONFIG}
      gameHook={useWordCircleGame}
      onBack={onBack}
    >
      <WordCircleGame />
    </UniversalGameEngine>
  )
}

export default KelimeCemberiBulmacasiSayfasiYeni 