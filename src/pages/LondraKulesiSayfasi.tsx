import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  TOWER_LEVELS, 
  PEG_CAPACITIES, 
  BEAD_COLORS,
  TowerGameState,
  TowerOfLondonDetails,
  isValidMove,
  makeMove,
  isConfigEqual,
  calculateScore,
  getDifficultyColor,
  BeadColor
} from '../utils/towerOfLondonUtils'
import { LocalStorageManager } from '../utils/localStorage'
import { ArrowLeft, RotateCcw, Target, Clock, Move, Trophy, Star, CheckCircle, Play, HelpCircle, ChevronDown, Mouse, Castle, Zap, Brain, Pause, PlayCircle } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import ExerciseHeader from '../components/ExerciseHeader'

interface LondraKulesiProps {
  onBack: () => void
}

interface GameState {
  phase: 'ready' | 'playing' | 'completed' | 'paused'
  currentLevel: number
  towers: number[][]
  selectedTower: number | null
  moves: number
  minMoves: number
  startTime: number
  currentTime: number
  score: number
  levelsCompleted: number
  pausedTime: number
}

const LondraKulesiSayfasi: React.FC<LondraKulesiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'ready',
    currentLevel: 1,
    towers: [[], [], []],
    selectedTower: null,
    moves: 0,
    minMoves: 0,
    startTime: 0,
    currentTime: 0,
    score: 0,
    levelsCompleted: 0,
    pausedTime: 0
  })

  const [isGameActive, setIsGameActive] = useState(false)

  // Zamanlayıcı
  useEffect(() => {
    if (!isGameActive) return

      const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        currentTime: Date.now() - prev.startTime
      }))
      }, 1000)

      return () => clearInterval(interval)
  }, [isGameActive])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const initializeLevel = useCallback((level: number) => {
    const diskCount = Math.min(2 + level, 6) // 3-6 disk arası
    const initialTower = Array.from({ length: diskCount }, (_, i) => i + 1) // En büyük disk altta (1=en büyük)
    const minMoves = Math.pow(2, diskCount) - 1

    setGameState(prev => ({
      ...prev,
      towers: [initialTower, [], []],
      selectedTower: null,
      moves: 0,
      minMoves,
      startTime: prev.startTime || Date.now()
    }))
  }, [])

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: Date.now(),
      currentTime: 0
    }))
    setIsGameActive(true)
    initializeLevel(1)
  }, [initializeLevel])

  const resetGame = useCallback(() => {
    setGameState({
      phase: 'ready',
      currentLevel: 1,
      towers: [[], [], []],
      selectedTower: null,
      moves: 0,
      minMoves: 0,
      startTime: 0,
      currentTime: 0,
      score: 0,
      levelsCompleted: 0,
      pausedTime: 0
    })
    setIsGameActive(false)
  }, [])

  const handlePauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'paused',
      pausedTime: Date.now()
    }))
    setIsGameActive(false)
    toast.info('Oyun duraklatıldı')
  }, [])

  const handleResumeGame = useCallback(() => {
    const pauseDuration = Date.now() - gameState.pausedTime
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      startTime: prev.startTime + pauseDuration
    }))
    setIsGameActive(true)
    toast.info('Oyun devam ediyor')
  }, [gameState.pausedTime])

  const canMoveDisk = useCallback((fromTower: number, toTower: number): boolean => {
    const from = gameState.towers[fromTower]
    const to = gameState.towers[toTower]
    
    if (from.length === 0) return false
    if (to.length === 0) return true
    
    return from[from.length - 1] > to[to.length - 1] // Büyük sayı = büyük disk, küçük disk büyük diskin üstüne gidebilir
  }, [gameState.towers])

  const moveDisk = useCallback((fromTower: number, toTower: number) => {
    if (!canMoveDisk(fromTower, toTower)) return

    const newTowers = gameState.towers.map(tower => [...tower])
    const disk = newTowers[fromTower].pop()!
    newTowers[toTower].push(disk)

        const newMoves = gameState.moves + 1
    
    setGameState(prev => ({
      ...prev,
      towers: newTowers,
          moves: newMoves,
      selectedTower: null
    }))

    // Seviye tamamlanma kontrolü
    const diskCount = Math.min(2 + gameState.currentLevel, 6)
    if (newTowers[2].length === diskCount) {
      // Seviye tamamlandı
      const efficiency = Math.max(0, 100 - Math.floor((newMoves - gameState.minMoves) / gameState.minMoves * 50))
      const timeBonus = Math.max(0, 50 - Math.floor(gameState.currentTime / 1000))
      const levelScore = efficiency + timeBonus

      toast.success(`Seviye ${gameState.currentLevel} tamamlandı! Skor: ${levelScore}`)

      setTimeout(() => {
        if (gameState.currentLevel >= 5) {
          // Oyun tamamlandı
          finishGame()
        } else {
          // Sonraki seviye
          setGameState(prev => ({
            ...prev,
            currentLevel: prev.currentLevel + 1,
            score: prev.score + levelScore,
            levelsCompleted: prev.levelsCompleted + 1
          }))
          initializeLevel(gameState.currentLevel + 1)
        }
      }, 1500)
    }
  }, [gameState, canMoveDisk, initializeLevel])

  const handleTowerClick = useCallback((towerIndex: number) => {
    if (gameState.phase !== 'playing') return

    if (gameState.selectedTower === null) {
      // Kule seçimi
      if (gameState.towers[towerIndex].length > 0) {
        setGameState(prev => ({ ...prev, selectedTower: towerIndex }))
      }
    } else {
      // Disk hareketi
      if (gameState.selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        setGameState(prev => ({ ...prev, selectedTower: null }))
      } else {
        // Farklı kuleye tıklandı, disk taşı
        moveDisk(gameState.selectedTower, towerIndex)
      }
    }
  }, [gameState, moveDisk])

  const handleBackWithProgress = useCallback(() => {
    if (gameState.phase === 'playing' && gameState.moves > 0) {
      const duration = Math.floor(gameState.currentTime / 1000)
      const currentProgress = {
        currentLevel: gameState.currentLevel,
        levelsCompleted: gameState.levelsCompleted,
        totalMoves: gameState.moves,
        score: gameState.score,
        towers: gameState.towers
      }
      LocalStorageManager.savePartialProgress('Londra Kulesi', currentProgress, duration)
    }
    onBack()
  }, [gameState, onBack])

  const finishGame = useCallback(() => {
    const duration = Math.floor(gameState.currentTime / 1000)
    const finalScore = gameState.score

    const exerciseData = {
      exercise_name: 'Londra Kulesi',
      levels_completed: gameState.levelsCompleted,
      total_moves: gameState.moves,
      session_duration_seconds: duration,
      final_score: finalScore,
      timestamp: new Date().toISOString()
    }

    LocalStorageManager.saveExerciseResult({
      exerciseName: 'Londra Kulesi',
      score: finalScore,
      duration,
      date: new Date().toISOString(),
      details: exerciseData,
      completed: true,
      exitedEarly: false
    })

    setGameState(prev => ({ ...prev, phase: 'completed' }))
    setIsGameActive(false)
  }, [gameState])

  const getDiskColor = (size: number, maxSize: number) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500', 
      'bg-yellow-500',
      'bg-green-500',
      'bg-blue-500',
      'bg-purple-500'
    ]
    return colors[maxSize - size] || 'bg-gray-500'
  }

  if (gameState.phase === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Londra Kulesi"
          onBack={handleBackWithProgress}
          showExitConfirmation={false}
        />
        
        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Castle className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Londra Kulesi
              </CardTitle>
              <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Klasik Hanoi Kulesi bulmacası. Tüm diskleri en az hamle ile sağ kuleye taşıyın.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Toplam Seviye</h3>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Zorluk</h3>
                  <p className="text-2xl font-bold text-primary">Artan</p>
                </div>
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Hedef</h3>
                  <p className="text-2xl font-bold text-primary">En Az Hamle</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm rounded-xl p-6 border border-blue-200/20 dark:border-blue-800/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Brain className="w-5 h-5 text-primary" />
                  Nasıl Oynanır?
                </h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">1</span>
                    <span>Tüm diskleri sol kuleden sağ kuleye taşıyın</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">2</span>
                    <span>Büyük disk küçük diskin üzerine konulamaz</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">3</span>
                    <span>Bir seferde sadece bir disk taşıyabilirsiniz</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">4</span>
                    <span>En az hamle ile tamamlamaya çalışın</span>
                  </li>
                </ul>
              </div>

              {/* Game Preview */}
              <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm rounded-xl p-6 border border-green-200/20 dark:border-green-800/20">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Castle className="w-5 h-5 text-primary" />
                  Örnek Oyun
                </h4>
                <div className="flex justify-center items-end gap-8">
                  {/* Sol Kule - Başlangıç */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">Başlangıç</div>
                    <div className="w-2 h-20 bg-gray-400 rounded-t relative">
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 space-y-1">
                        <div className="w-8 h-3 bg-red-500 rounded"></div>
                        <div className="w-10 h-3 bg-orange-500 rounded"></div>
                        <div className="w-12 h-3 bg-yellow-500 rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-2 bg-gray-400 rounded mt-1"></div>
                  </div>
                  
                  {/* Orta Kule */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">Yardımcı</div>
                    <div className="w-2 h-20 bg-gray-400 rounded-t"></div>
                    <div className="w-16 h-2 bg-gray-400 rounded mt-1"></div>
                  </div>
                  
                  {/* Sağ Kule - Hedef */}
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-2">Hedef</div>
                    <div className="w-2 h-20 bg-gray-400 rounded-t"></div>
                    <div className="w-16 h-2 bg-gray-400 rounded mt-1"></div>
                  </div>
                </div>
          </div>
          
              {/* Start Button */}
              <div className="text-center pt-4">
                <Button 
                  onClick={startGame}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Egzersizi Başlat
                </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (gameState.phase === 'playing') {
    const diskCount = Math.min(2 + gameState.currentLevel, 6)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Londra Kulesi"
          onBack={handleBackWithProgress}
          onPause={handlePauseGame}
          onRestart={resetGame}
          isPaused={false}
          isPlaying={true}
          stats={{
            time: formatTime(gameState.currentTime),
            level: gameState.currentLevel,
            progress: `${gameState.moves} hamle`,
            score: gameState.score
          }}
          showExitConfirmation={true}
        />

        {/* Content */}
        <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
          {/* Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Hamle</div>
              <div className="text-xl font-bold text-primary">{gameState.moves}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Min Hamle</div>
              <div className="text-xl font-bold text-green-600">{gameState.minMoves}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Disk</div>
              <div className="text-xl font-bold text-blue-600">{diskCount}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <div className="text-sm text-gray-600 dark:text-gray-300">Skor</div>
              <div className="text-xl font-bold text-purple-600">{gameState.score}</div>
            </div>
          </div>

          {/* Game Board */}
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
            <CardContent className="p-8">
              <div className="flex justify-center items-end gap-12">
                {gameState.towers.map((tower, towerIndex) => (
                  <div key={towerIndex} className="flex flex-col items-center">
                    {/* Tower Label */}
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">
                      {towerIndex === 0 ? 'Başlangıç' : towerIndex === 1 ? 'Yardımcı' : 'Hedef'}
                    </div>
                    
                    {/* Tower */}
                    <div 
                      className={`
                        relative w-4 h-32 bg-gray-400 dark:bg-gray-600 rounded-t cursor-pointer transition-all duration-200
                        ${gameState.selectedTower === towerIndex ? 'ring-4 ring-primary/50 bg-primary' : 'hover:bg-gray-500'}
                      `}
                      onClick={() => handleTowerClick(towerIndex)}
                    >
                      {/* Disks */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center">
                        {tower.map((diskSize, diskIndex) => (
                          <div
                            key={diskIndex}
                            className={`
                              h-4 rounded transition-all duration-200 shadow-lg mb-1
                              ${getDiskColor(diskSize, diskCount)}
                              ${gameState.selectedTower === towerIndex && diskIndex === tower.length - 1 ? 'animate-pulse' : ''}
                            `}
                            style={{ width: `${(diskCount - diskSize + 1) * 12 + 24}px` }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Base */}
                    <div className="w-20 h-3 bg-gray-400 dark:bg-gray-600 rounded mt-2"></div>
                  </div>
                ))}
              </div>
              
              {/* Instructions */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  {gameState.selectedTower !== null 
                    ? 'Diski taşımak için hedef kuleyi seçin' 
                    : 'Taşımak istediğiniz diski seçin'
                  }
                </p>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    )
  }

  if (gameState.phase === 'paused') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
        <ExerciseHeader
          title="Londra Kulesi"
          onBack={handleBackWithProgress}
          onPause={handleResumeGame}
          onRestart={resetGame}
          isPaused={true}
          isPlaying={false}
          stats={{
            time: formatTime(gameState.currentTime),
            level: gameState.currentLevel,
            progress: `${gameState.moves} hamle`,
            score: gameState.score
          }}
          showExitConfirmation={true}
        />

        {/* Pause Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Oyun Duraklatıldı</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Devam etmek için butona tıklayın</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleResumeGame} className="bg-gradient-to-r from-green-500 to-emerald-600">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Devam Et
              </Button>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Yeniden Başla
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    )
  }

  // Completed state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <ExerciseHeader
        title="Londra Kulesi"
        onBack={onBack}
        showExitConfirmation={false}
        stats={{
          time: formatTime(gameState.currentTime),
          level: gameState.levelsCompleted,
          progress: `Tamamlandı`,
          score: gameState.score
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
        <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Tebrikler!
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Londra Kulesi egzersizini tamamladınız
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Seviye</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{gameState.levelsCompleted}/5</p>
                </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(gameState.currentTime)}</p>
          </div>
              <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Skor</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{gameState.score}</p>
          </div>
        </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
                onClick={resetGame}
            variant="outline" 
                size="lg"
                className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
          >
                <RotateCcw className="w-5 h-5 mr-2" />
                Tekrar Oyna
          </Button>
              <Button 
                onClick={onBack}
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Egzersizlere Dön
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LondraKulesiSayfasi
