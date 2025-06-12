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
import { ArrowLeft, RotateCcw, Target, Clock, Move, Trophy, Star, CheckCircle, Play, HelpCircle, ChevronDown, Mouse } from 'lucide-react'

interface LondraKulesiSayfasiProps {
  onBack: () => void
}

const LondraKulesiSayfasi: React.FC<LondraKulesiSayfasiProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<TowerGameState | null>(null)
  const [currentLevel, setCurrentLevel] = useState(1)
  const [gameStarted, setGameStarted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null)

  const currentLevelData = TOWER_LEVELS[currentLevel - 1]
  
  useEffect(() => {
    initializeGame()
  }, [currentLevel])

  // Timer effect
  useEffect(() => {
    if (gameState && !gameState.isCompleted) {
      const interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - gameState.timeStarted) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState])

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
      setCurrentTime(0)
    }
  }

  const resetLevel = () => {
    initializeGame()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handlePegClick = (pegIndex: number) => {
    if (!gameState || gameState.isCompleted) return

    if (gameState.selectedPeg === null) {
      const pegs = [gameState.currentConfig.peg1, gameState.currentConfig.peg2, gameState.currentConfig.peg3]
      if (pegs[pegIndex].length > 0) {
        setGameState({ ...gameState, selectedPeg: pegIndex })
      }
    } else {
      const fromPeg = gameState.selectedPeg
      const toPeg = pegIndex
      
      if (fromPeg === toPeg) {
        setGameState({ ...gameState, selectedPeg: null })
        return
      }
      
      if (isValidMove(gameState.currentConfig, fromPeg, toPeg)) {
        const newConfig = makeMove(gameState.currentConfig, fromPeg, toPeg)
        const newMoves = gameState.moves + 1
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
        setGameState({ ...gameState, selectedPeg: null })
      }
    }
  }

  const handleLevelComplete = async (completedGameState: TowerGameState) => {
    const timeSeconds = Math.floor((Date.now() - completedGameState.timeStarted) / 1000)
    const score = calculateScore(currentLevelData.minMoves, completedGameState.moves, timeSeconds)
    const efficiency = Math.round((currentLevelData.minMoves / completedGameState.moves) * 100)
    
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

    await LocalStorageManager.saveExerciseResult({
      exerciseName: 'Londra Kulesi Testi',
      score: score,
      duration: timeSeconds,
      date: new Date().toISOString(),
      details: details
    })

    setShowCelebration(true)
    
    setTimeout(() => {
      if (currentLevel < TOWER_LEVELS.length) {
        setCurrentLevel(currentLevel + 1)
      } else {
        setAllLevelsCompleted(true)
      }
    }, 2000)
  }

  const renderBead = (color: BeadColor, isHighlighted = false) => (
    <div className={`
      w-10 h-6 rounded-full border-2 shadow-md transition-all duration-200
      ${BEAD_COLORS[color].bgColor}
      ${isHighlighted ? 'border-primary ring-2 ring-primary/50 scale-110' : 'border-white'}
    `}>
      <div className="w-full h-full rounded-full opacity-80" />
    </div>
  )

  const renderPeg = (pegIndex: number, isInteractive = true) => {
    if (!gameState) return null
    
    const pegs = [gameState.currentConfig.peg1, gameState.currentConfig.peg2, gameState.currentConfig.peg3]
    const peg = pegs[pegIndex]
    const capacity = PEG_CAPACITIES[pegIndex]
    const isSelected = gameState.selectedPeg === pegIndex
    const isEmpty = peg.length === 0
    const canSelect = !isEmpty || gameState.selectedPeg !== null
    const canReceiveBead = gameState.selectedPeg !== null && gameState.selectedPeg !== pegIndex && peg.length < capacity
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs font-medium text-muted-foreground">
          {isInteractive ? `Çubuk ${pegIndex + 1}` : `Ç${pegIndex + 1}`}
        </div>
        
        <div 
          className={`
            relative w-16 h-24 border-2 rounded-lg transition-all duration-200 
            flex flex-col-reverse items-center justify-start p-1 space-y-1
            ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
            ${isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary/30' : 'border-border bg-muted/10'}
            ${canReceiveBead ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : ''}
            ${isInteractive && canSelect ? 'hover:border-primary/60 hover:bg-primary/5' : ''}
            ${isInteractive ? '' : 'opacity-75'}
          `}
          onClick={isInteractive ? () => handlePegClick(pegIndex) : undefined}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-full bg-amber-700 rounded-sm" />
          
          <div className="relative z-10 flex flex-col-reverse items-center space-y-1">
            {peg.map((color, index) => (
              <div key={index} className="mb-0.5">
                {renderBead(color as BeadColor, isSelected && index === peg.length - 1)}
              </div>
            ))}
          </div>
          
          {isInteractive && (
            <div className="absolute top-1 right-1 text-xs text-muted-foreground bg-background/80 rounded px-1">
              {peg.length}/{capacity}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderTargetPeg = (pegIndex: number) => {
    if (!currentLevelData) return null
    
    const pegs = [
      currentLevelData.targetConfig.peg1,
      currentLevelData.targetConfig.peg2,
      currentLevelData.targetConfig.peg3
    ]
    const peg = pegs[pegIndex]
    
    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="text-xs text-muted-foreground">Ç{pegIndex + 1}</div>
        <div className="relative w-12 h-16 border border-border/50 rounded bg-muted/5 flex flex-col-reverse items-center justify-start p-1">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-amber-700/30 rounded-sm" />
          <div className="relative z-10 flex flex-col-reverse items-center">
            {peg.map((color, index) => (
              <div key={index} className="mb-0.5">
                <div 
                  className={`w-6 h-4 rounded-full border ${BEAD_COLORS[color as BeadColor].bgColor} opacity-70`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isLevelCompleted = gameState && gameState.isCompleted

  const canPlaceBead = useCallback((pegIndex: number) => {
    if (!gameState) return false
    const peg = gameState.currentConfig.peg1[pegIndex]
    return peg !== undefined && peg !== null
  }, [gameState])

  const nextLevel = () => {
    if (currentLevel < TOWER_LEVELS.length) {
      setCurrentLevel(currentLevel + 1)
    } else {
      setAllLevelsCompleted(true)
    }
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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Londra Kulesi Testi</h1>
            <p className="text-sm text-muted-foreground">Planlama ve problem çözme becerilerinizi test edin</p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Kompakt Bilgi Paneli */}
        <Card className="card-enhanced mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              Seviye {currentLevel}/15 - Min. Hamle: {currentLevelData.minMoves}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3" />
                Hamle: {gameState.moves}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Süre: {formatTime(currentTime)}
              </span>
              <Badge className={getDifficultyColor(currentLevelData.difficulty)} variant="outline">
                {currentLevelData.difficulty}
              </Badge>
              {selectedPeg !== null && (
                <Badge variant="secondary">
                  Seçili: Çubuk {selectedPeg + 1}
                </Badge>
              )}
            </CardDescription>
            
            <Progress 
              value={(currentLevel / 15) * 100} 
              className="h-2 mt-3"
              aria-label={`Seviye ilerlemesi: ${currentLevel}/15`}
            />
          </CardHeader>
        </Card>

        {/* Nasıl Oynanır - Açılır Kapanır */}
        <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium">Nasıl Oynanır?</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHelpOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-0 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <Card className="border-dashed">
              <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Temel Kurallar
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Çubukların kapasitesi sınırlıdır</li>
                    <li>• Her seferinde sadece en üstteki top alınabilir</li>
                    <li>• Hedef düzenini minimum hamle ile oluşturun</li>
                    <li>• Stratejik düşünme gerektirir</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Mouse className="w-4 h-4" />
                    Nasıl Oynanır
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• İlk önce kaynak çubuğa tıklayın</li>
                    <li>• Sonra hedef çubuğa tıklayın</li>
                    <li>• Geçersiz hamleler engellenecektir</li>
                    <li>• Hamle sayınızı minimize etmeye çalışın</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Ana Oyun Alanı - Responsive Grid */}
        <div className="grid lg:grid-cols-4 gap-4 mb-6">
          {/* Hedef Düzeni - Kompakt Referans */}
          <div className="lg:col-span-1">
            <Card className="bg-muted/30 border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Hedef</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 justify-items-center">
                  {currentLevelData.targetConfig.map((pegConfig, pegIndex) => (
                    <div key={pegIndex} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Ç{pegIndex + 1}</div>
                      <div className="relative w-12 h-16 border border-border/50 rounded bg-muted/5">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col-reverse gap-0.5">
                          {pegConfig.map((color, beadIndex) => (
                            <div 
                              key={beadIndex} 
                              className={`w-8 h-4 rounded-full border ${BEAD_COLORS[color].bgColor} opacity-70`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mevcut Durum - Ana Oyun Alanı */}
          <div className="lg:col-span-3">
            <Card className="card-enhanced border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Mevcut Durum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-8 justify-items-center">
                  {gameState.pegs.map((peg, pegIndex) => (
                    <div key={pegIndex} className="text-center">
                      <div className="text-sm font-medium mb-2">Çubuk {pegIndex + 1}</div>
                      <div 
                        className={`
                          relative w-16 h-24 border-2 rounded-lg cursor-pointer transition-all duration-200
                          ${selectedPeg === pegIndex 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                            : canPlaceBead(pegIndex) && selectedPeg !== null
                              ? 'border-green-400 bg-green-50 hover:bg-green-100'
                              : 'border-border hover:border-primary/60 hover:bg-primary/5'
                          }
                        `}
                        onClick={() => handlePegClick(pegIndex)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Çubuk ${pegIndex + 1}, kapasite ${peg.length}/${PEG_CAPACITIES[pegIndex]}`}
                      >
                        {/* Kapasite göstergesi */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
                          {peg.length}/{PEG_CAPACITIES[pegIndex]}
                        </div>
                        
                        {/* Toplar */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex flex-col-reverse gap-1">
                          {peg.map((color, beadIndex) => (
                            <div key={beadIndex}>
                              {renderBead(color, selectedPeg === pegIndex && beadIndex === peg.length - 1)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kontroller */}
        <div className="text-center space-y-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetLevel}
            className="mr-4"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Seviyeyi Sıfırla
          </Button>

          {isLevelCompleted && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-success mb-2">🎉 Seviye Tamamlandı!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {gameState.moves} hamle ile tamamladınız (En az: {currentLevelData.minMoves})
              </p>
              <div className="space-x-2">
                <Button onClick={nextLevel} className="font-semibold">
                  {currentLevel < 15 ? 'Sonraki Seviye' : 'Testi Tamamla'}
                </Button>
                <Button variant="outline" onClick={resetLevel}>
                  Tekrar Dene
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LondraKulesiSayfasi
