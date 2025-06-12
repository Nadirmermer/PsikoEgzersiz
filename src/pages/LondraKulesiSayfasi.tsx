
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import { ArrowLeft, RotateCcw, Target, Clock, Move, Trophy, Star, CheckCircle, Play } from 'lucide-react'

interface LondraKulesiSayfasiProps {
  onBack: () => void
}

const LondraKulesiSayfasi: React.FC<LondraKulesiSayfasiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<TowerGameState | null>(null)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false)

  const currentLevelData = TOWER_LEVELS[currentLevel - 1]
  
  useEffect(() => {
    // Oyunu başlat
    initializeGame()
  }, [currentLevel])

  const initializeGame = () => {
    if (currentLevelData) {
      setGameState({
        currentConfig: JSON.parse(JSON.stringify(currentLevelData.initialConfig)),
        targetConfig: currentLevelData.targetConfig,
        moves: 0,
        timeStarted: Date.now(),
        selectedPeg: null,
        isCompleted: false,
        level: currentLevel
      })
      setGameStarted(true)
      setShowCelebration(false)
    }
  }

  const resetLevel = () => {
    initializeGame()
  }

  const handlePegClick = (pegIndex: number) => {
    if (!gameState || gameState.isCompleted) return

    if (gameState.selectedPeg === null) {
      // Çubuk seçimi - sadece boş olmayan çubuklar seçilebilir
      const pegs = [gameState.currentConfig.peg1, gameState.currentConfig.peg2, gameState.currentConfig.peg3]
      if (pegs[pegIndex].length > 0) {
        setGameState({ ...gameState, selectedPeg: pegIndex })
      }
    } else {
      // Hamle yapımı
      const fromPeg = gameState.selectedPeg
      const toPeg = pegIndex
      
      if (fromPeg === toPeg) {
        // Aynı çubuğa tıklama - seçimi kaldır
        setGameState({ ...gameState, selectedPeg: null })
        return
      }
      
      if (isValidMove(gameState.currentConfig, fromPeg, toPeg)) {
        const newConfig = makeMove(gameState.currentConfig, fromPeg, toPeg)
        const newMoves = gameState.moves + 1
        
        // Hedef kontrolü
        const isCompleted = isConfigEqual(newConfig, gameState.targetConfig)
        
        const newGameState = {
          ...gameState,
          currentConfig: newConfig,
          moves: newMoves,
          selectedPeg: null,
          isCompleted
        }
        
        setGameState(newGameState)
        
        if (isCompleted) {
          handleLevelComplete(newGameState)
        }
      } else {
        // Geçersiz hamle - seçimi kaldır
        setGameState({ ...gameState, selectedPeg: null })
      }
    }
  }

  const handleLevelComplete = async (completedGameState: TowerGameState) => {
    const timeSeconds = Math.floor((Date.now() - completedGameState.timeStarted) / 1000)
    const score = calculateScore(currentLevelData.minMoves, completedGameState.moves, timeSeconds)
    const efficiency = Math.round((currentLevelData.minMoves / completedGameState.moves) * 100)
    
    // Detaylı sonuç objesi oluştur
    const details: TowerOfLondonDetails = {
      level_identifier: `Seviye ${currentLevel}`,
      level_number: currentLevel,
      initial_config: currentLevelData.initialConfig,
      target_config: currentLevelData.targetConfig,
      min_moves_required: currentLevelData.minMoves,
      user_moves_taken: completedGameState.moves,
      time_seconds: timeSeconds,
      score: score,
      completed_optimally: completedGameState.moves <= currentLevelData.minMoves,
      efficiency_percentage: efficiency
    }

    // LocalStorage'a kaydet
    await LocalStorageManager.saveExerciseResult({
      exerciseName: 'Londra Kulesi Testi',
      score: score,
      duration: timeSeconds,
      date: new Date().toISOString(),
      details: details
    })

    setShowCelebration(true)
    
    // 2 saniye sonra bir sonraki seviyeye geç
    setTimeout(() => {
      if (currentLevel < TOWER_LEVELS.length) {
        setCurrentLevel(currentLevel + 1)
      } else {
        setAllLevelsCompleted(true)
      }
    }, 2000)
  }

  const renderBead = (color: BeadColor) => (
    <div 
      className={`
        w-12 h-8 rounded-full border-2 border-white shadow-lg
        ${BEAD_COLORS[color].bgColor}
        transition-all duration-200
      `}
      style={{ 
        background: `linear-gradient(135deg, ${BEAD_COLORS[color].color}, ${BEAD_COLORS[color].color}dd)`
      }}
    />
  )

  const renderPeg = (pegIndex: number) => {
    if (!gameState) return null
    
    const pegs = [gameState.currentConfig.peg1, gameState.currentConfig.peg2, gameState.currentConfig.peg3]
    const peg = pegs[pegIndex]
    const capacity = PEG_CAPACITIES[pegIndex]
    const isSelected = gameState.selectedPeg === pegIndex
    const isEmpty = peg.length === 0
    const canSelect = !isEmpty || gameState.selectedPeg !== null
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm font-medium text-muted-foreground">
          {capacity} Top Kapasiteli
        </div>
        
        <div 
          className={`
            relative w-20 h-32 border-2 rounded-lg transition-all duration-200 cursor-pointer
            ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-muted/20'}
            ${canSelect ? 'hover:border-primary/60 hover:bg-primary/5' : ''}
            flex flex-col-reverse items-center justify-start p-2 space-y-1
          `}
          onClick={() => handlePegClick(pegIndex)}
        >
          {/* Çubuk görselik */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-full bg-amber-700 rounded-sm" />
          
          {/* Toplar */}
          <div className="relative z-10 flex flex-col-reverse items-center space-y-1">
            {peg.map((color, index) => (
              <div key={index} className="mb-1">
                {renderBead(color as BeadColor)}
              </div>
            ))}
          </div>
          
          {/* Kapasite göstergesi */}
          <div className="absolute top-1 right-1 text-xs text-muted-foreground">
            {peg.length}/{capacity}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Çubuk {pegIndex + 1}
        </div>
      </div>
    )
  }

  const renderTargetConfig = () => {
    if (!currentLevelData) return null
    
    const pegs = [
      currentLevelData.targetConfig.peg1,
      currentLevelData.targetConfig.peg2,
      currentLevelData.targetConfig.peg3
    ]
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-center">Hedef Düzeni</h4>
        <div className="grid grid-cols-3 gap-4">
          {pegs.map((peg, pegIndex) => (
            <div key={pegIndex} className="flex flex-col items-center space-y-2">
              <div className="relative w-12 h-20 border border-border rounded bg-muted/10 flex flex-col-reverse items-center justify-start p-1">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-amber-700/50 rounded-sm" />
                <div className="relative z-10 flex flex-col-reverse items-center">
                  {peg.map((color, index) => (
                    <div key={index} className="mb-0.5">
                      <div 
                        className={`w-8 h-5 rounded-full border ${BEAD_COLORS[color as BeadColor].bgColor} opacity-80`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Ç{pegIndex + 1}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (allLevelsCompleted) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="card-enhanced text-center">
          <CardHeader>
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-primary">Tebrikler!</CardTitle>
            <CardDescription className="text-lg">
              Tüm Londra Kulesi seviyelerini başarıyla tamamladınız!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-base">
                <Star className="w-4 h-4 mr-2" />
                15 Seviye Tamamlandı
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Button onClick={() => setCurrentLevel(1)} className="font-semibold">
                <Play className="w-4 h-4 mr-2" />
                Tekrar Başla
              </Button>
              <Button variant="outline" onClick={onBack} className="font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Menü
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gameStarted || !gameState) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              Londra Kulesi Testi
            </CardTitle>
            <CardDescription>Oyun yükleniyor...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const progressPercentage = ((currentLevel - 1) / TOWER_LEVELS.length) * 100

  return (
    <div className="container mx-auto px-4 py-6 pb-24 max-w-6xl">
      {/* Header */}
      <Card className="card-enhanced mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl">Londra Kulesi Testi</CardTitle>
                <CardDescription className="text-base">
                  {currentLevelData.name} - {currentLevelData.description}
                </CardDescription>
              </div>
            </div>
            <Badge className={getDifficultyColor(currentLevelData.difficulty)}>
              {currentLevelData.difficulty}
            </Badge>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Seviye İlerlemesi</span>
              <span>{currentLevel}/{TOWER_LEVELS.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Move className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{gameState.moves}</div>
            <div className="text-sm text-muted-foreground">Hamle</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
            <div className="text-2xl font-bold">{currentLevelData.minMoves}</div>
            <div className="text-sm text-muted-foreground">Min. Hamle</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-violet-600" />
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - gameState.timeStarted) / 1000)}
            </div>
            <div className="text-sm text-muted-foreground">Saniye</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <div className="text-2xl font-bold">{currentLevel}</div>
            <div className="text-sm text-muted-foreground">Seviye</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ana Oyun Alanı */}
        <div className="lg:col-span-2">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-center">Mevcut Durum</CardTitle>
              {gameState.selectedPeg !== null && (
                <div className="text-center">
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Çubuk {gameState.selectedPeg + 1} seçildi - Hedef çubuğu seçin
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-8">
                {[0, 1, 2].map(pegIndex => renderPeg(pegIndex))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Hedef Düzeni */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-lg">Hedef</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTargetConfig()}
            </CardContent>
          </Card>

          {/* Kontroller */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-lg">Kontroller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                onClick={resetLevel}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Seviyeyi Sıfırla
              </Button>
              
              <div className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg">
                <strong>Nasıl Oynanır:</strong><br/>
                1. Bir çubuktan top seçin<br/>
                2. Hedef çubuğu seçin<br/>
                3. Kapasitelere dikkat edin<br/>
                4. En az hamlede hedefe ulaşın
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tebrik Modalı */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full animate-scale-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-emerald-600">Seviye Tamamlandı!</CardTitle>
              <CardDescription>
                {gameState.moves <= currentLevelData.minMoves ? 'Mükemmel performans!' : 'Tebrikler!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Hamle Sayısı</div>
                  <div className="text-2xl font-bold text-primary">{gameState.moves}</div>
                </div>
                <div>
                  <div className="font-semibold">Verimlilik</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {Math.round((currentLevelData.minMoves / gameState.moves) * 100)}%
                  </div>
                </div>
              </div>
              
              {gameState.moves <= currentLevelData.minMoves && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  <Star className="w-3 h-3 mr-1" />
                  Optimal Çözüm!
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default LondraKulesiSayfasi
