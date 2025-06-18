import React from 'react'
import ExerciseHeader from '../ExerciseHeader'
import { ReadyScreen, PauseScreen, CompletedScreen } from './GameScreens'
import { UniversalGameEngineProps } from './types'
import { useAudio } from '@/hooks/useAudio'

const UniversalGameEngine: React.FC<UniversalGameEngineProps> = ({
  gameConfig,
  gameHook,
  children,
  onBack
}) => {
  const { playSound } = useAudio()
  const { gameState, gameStats, gameActions } = gameHook()

  // Format time utility
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle back with progress saving
  const handleBackWithProgress = () => {
    playSound('button-click')
    if (gameState.phase === 'playing' || gameState.phase === 'paused') {
      // Burada progress kaydetme mantığı gelecek
      console.log('Saving progress for:', gameConfig.title)
    }
    // Sayfa geçişinde en yukarı git
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onBack()
  }

  // Hazırlık ekranı
  if (gameState.phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={onBack}
          showExitConfirmation={false}
        />
        <ReadyScreen 
          config={gameConfig} 
          onStart={gameActions.onStart}
        />
      </div>
    )
  }

  // Oyun ekranı
  if (gameState.phase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={handleBackWithProgress}
          onPause={gameActions.onPause}
          onRestart={gameActions.onRestart}
          isPaused={false}
          isPlaying={true}
          stats={{
            time: formatTime(gameState.duration),
            level: gameStats.level,
            score: gameStats.score,
            progress: gameStats.progress
          }}
          showExitConfirmation={true}
        />
        
        {/* Oyun İçeriği */}
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 pb-28 max-w-full sm:max-w-2xl md:max-w-4xl overflow-x-hidden">
          {children}
        </div>
      </div>
    )
  }

  // Duraklatma ekranı
  if (gameState.phase === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={handleBackWithProgress}
          onPause={gameActions.onResume}
          onRestart={gameActions.onRestart}
          isPaused={true}
          isPlaying={false}
          stats={{
            time: formatTime(gameState.duration),
            level: gameStats.level,
            score: gameStats.score,
            progress: gameStats.progress
          }}
          showExitConfirmation={true}
        />
        
        <PauseScreen
          config={gameConfig}
          stats={gameStats}
          onResume={gameActions.onResume}
          onRestart={gameActions.onRestart}
        />
      </div>
    )
  }

  // Tamamlanma ekranı
  if (gameState.phase === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={onBack}
          showExitConfirmation={false}
          stats={{
            time: formatTime(gameState.duration),
            level: gameStats.level,
            score: gameStats.score,
            progress: 'Tamamlandı'
          }}
        />
        
        <CompletedScreen
          config={gameConfig}
          stats={gameStats}
          onRestart={gameActions.onRestart}
          onBack={onBack}
          showNextLevel={gameConfig.hasLevels}
          onNextLevel={() => {
            // Hafıza oyunu için sonraki seviyeye geç
            if (gameConfig.id === 'memory-game') {
              // Manuel buton ile sonraki seviyeye geçiş
              playSound('level-up')
              gameActions.onRestart()
            } else {
              console.log('Next level for:', gameConfig.title)
            }
          }}
        />
      </div>
    )
  }

  // Fallback
  return null
}

export default UniversalGameEngine 