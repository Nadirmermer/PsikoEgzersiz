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
      // 🚨 EARLY EXIT: Call onExitEarly to save partial results
      if (gameActions.onExitEarly) {
        gameActions.onExitEarly()
      } else {
        console.warn('onExitEarly not implemented for this game')
    }
    }
    
    // Sayfa geçişinde en yukarı git
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onBack()
  }

  // Hazırlık ekranı
  if (gameState.phase === 'ready') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 flex flex-col">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={onBack}
          showExitConfirmation={false}
        />
        {/* Ready Screen - Header'dan sonra kalan alanı kullan */}
        <div className="flex-1 flex items-center justify-center p-4">
          <ReadyScreen 
            config={gameConfig} 
            onStart={gameActions.onStart}
          />
        </div>
      </div>
    )
  }

  // Oyun ekranı
  if (gameState.phase === 'playing') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 flex flex-col">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={handleBackWithProgress}
          onPause={gameActions.onPause}
          onRestart={gameActions.onRestart}
          isPaused={false}
          isPlaying={true}
          showExitConfirmation={true}
        />
        
        {/* Oyun İçeriği - Header'dan sonra kalan tüm alanı kullan */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4">
            {children}
          </div>
        </div>
      </div>
    )
  }

  // Duraklatma ekranı
  if (gameState.phase === 'paused') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 flex flex-col">
        <ExerciseHeader
          title={gameConfig.title}
          onBack={handleBackWithProgress}
          onPause={gameActions.onResume}
          onRestart={gameActions.onRestart}
          isPaused={true}
          isPlaying={false}
          showExitConfirmation={true}
        />
        
        {/* Pause Screen - Overlay style korundu */}
        <div className="flex-1 relative">
          <PauseScreen
            config={gameConfig}
            stats={gameStats}
            onResume={gameActions.onResume}
            onRestart={gameActions.onRestart}
          />
        </div>
      </div>
    )
  }

  // Tamamlanma ekranı
  if (gameState.phase === 'completed') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 flex flex-col">
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
        
        {/* Completion Screen - Header'dan sonra kalan tüm alanı kullan */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-4">
            <CompletedScreen
              config={gameConfig}
              stats={gameStats}
              onRestart={gameActions.onRestart}
              onBack={onBack}
              showNextLevel={(() => {
                // 🧠 Intelligent showNextLevel logic based on game type and completion context
                if (gameConfig.id === 'number-sequence') {
                  // Number Sequence: No next level for assessment-style completion
                  return false
                } else if (gameConfig.id === 'color-sequence') {
                  // Color Sequence: No next level for visual-spatial memory assessment completion
                  return false
                } else if (gameConfig.id === 'memory-game') {
                  // Memory Game: Show next level if available
                  return gameConfig.hasLevels && Boolean(gameActions.onNextLevel)
                } else {
                  // Other games: Default behavior
                  return gameConfig.hasLevels
                }
              })()}
              onNextLevel={gameActions.onNextLevel}
            />
          </div>
        </div>
      </div>
    )
  }

  // Fallback
  return null
}

export default UniversalGameEngine 