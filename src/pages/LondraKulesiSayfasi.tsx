import React from 'react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { TOWER_OF_LONDON_CONFIG } from '../components/GameEngine/gameConfigs'
import { useTowerOfLondonGame, getDiskStyle } from '../hooks/useTowerOfLondon'
import { Target, Move, Building } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { useAudio } from '@/hooks/useAudio'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LondraKulesiSayfasiProps {
  onBack: () => void
}

// Tower Komponenti - Disk hizalaması düzeltildi
const Tower: React.FC<{
  index: number
  disks: number[]
  isSelected: boolean
  maxDiskCount: number
  onClick: () => void
  label: string
  isTarget?: boolean
}> = ({ index, disks, isSelected, maxDiskCount, onClick, label, isTarget = false }) => {
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Kule Etiketi */}
      <div className={`font-medium px-4 py-2 rounded-full transition-all duration-300 ${
        isTarget 
          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white text-base font-bold shadow-lg shadow-green-500/30 animate-pulse'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm'
      }`}>
        {label}
      </div>

      {/* Kule Tabanı - Geliştirilmiş */}
      <div 
        className={`
          relative transition-all duration-300 cursor-pointer flex flex-col items-center
          ${isSelected ? 'scale-105' : 'hover:scale-102'}
        `}
        onClick={onClick}
      >
        {/* Ana Çubuk - Çok daha güzel */}
        <div className={`
          w-4 h-40 rounded-t-lg transition-all duration-300 shadow-lg z-10
          ${isSelected 
            ? 'bg-gradient-to-t from-primary to-primary/80 shadow-primary/50' 
            : isTarget
            ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-green-500/50'
            : 'bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500 hover:from-gray-500 hover:to-gray-400'
          }
        `} />

        {/* Diskler - Stack container - MUTLAK ORTALANMIŞ */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
          {disks.map((diskSize, diskIndex) => {
            const diskStyle = getDiskStyle(diskSize, maxDiskCount, isSelected && diskIndex === disks.length - 1)
            return (
              <div
                key={diskIndex}
                className={`
                  h-7 flex items-center justify-center text-white font-bold text-sm mb-1
                  ${diskStyle.className}
                `}
                style={{ 
                  width: diskStyle.width,
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                {diskSize}
              </div>
            )
          })}
        </div>

        {/* Base Platform - Güzel platform */}
        <div className={`
          w-20 h-3 rounded-lg transition-all duration-300 -mt-1 z-5
          ${isSelected 
            ? 'bg-primary/20 shadow-lg shadow-primary/30' 
            : isTarget
            ? 'bg-green-400/30 shadow-lg shadow-green-400/30'
            : 'bg-gray-300 dark:bg-gray-600'
          }
        `} />

        {/* Selection Ring */}
        {isSelected && (
          <div className="absolute inset-0 rounded-lg border-4 border-primary/50 animate-pulse pointer-events-none z-30" />
        )}
      </div>
    </div>
  )
}

// Ana Oyun Komponenti
const TowerOfLondonGame: React.FC = () => {
  const [currentLevel, setCurrentLevel] = React.useState(1)
  const [towers, setTowers] = React.useState<string[][]>([[], [], []])
  const [selectedTower, setSelectedTower] = React.useState<number | null>(null)
  const [moves, setMoves] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)
  const { playSound } = useAudio()
  
  // Gerçek Londra Kulesi Level Configs
  const levelConfigs = React.useMemo(() => [
    // Seviye 1: Basit - 1 hamle
    { 
      initial: [['kırmızı'], ['yeşil'], ['mavi']], 
      target: [['kırmızı'], ['yeşil', 'mavi'], []], 
      minMoves: 1,
      description: "Mavi topu yeşilin üzerine koyun"
    },
    // Seviye 2: Kolay - 2 hamle  
    { 
      initial: [['kırmızı'], ['yeşil'], ['mavi']], 
      target: [['kırmızı', 'yeşil'], [], ['mavi']], 
      minMoves: 2,
      description: "Yeşili kırmızının üzerine, mavi sağa"
    },
    // Seviye 3: Orta - 3 hamle
    { 
      initial: [['kırmızı', 'yeşil'], ['mavi'], []], 
      target: [[], ['mavi'], ['kırmızı', 'yeşil']], 
      minMoves: 3,
      description: "Kırmızı-yeşil ikilisini sağa taşıyın"
    },
    // Seviye 4: Zor - 4 hamle
    { 
      initial: [['kırmızı'], ['yeşil', 'mavi'], []], 
      target: [[], ['kırmızı'], ['yeşil', 'mavi']], 
      minMoves: 4,
      description: "Yeşil-mavi ikilisini sağa, kırmızı ortaya"
    },
    // Seviye 5: Çok Zor - 5 hamle
    { 
      initial: [['kırmızı', 'yeşil', 'mavi'], [], []], 
      target: [[], [], ['kırmızı', 'yeşil', 'mavi']], 
      minMoves: 5,
      description: "Tüm topları sağa taşıyın"
    },
    // Seviye 6-10: Daha karmaşık kombinasyonlar
    { 
      initial: [['kırmızı'], ['yeşil'], ['mavi']], 
      target: [['mavi'], ['kırmızı'], ['yeşil']], 
      minMoves: 6,
      description: "Topları döngüsel olarak değiştirin"
    },
    { 
      initial: [['kırmızı', 'yeşil'], [], ['mavi']], 
      target: [[], ['kırmızı', 'mavi'], ['yeşil']], 
      minMoves: 5,
      description: "Karmaşık yeniden düzenleme"
    },
    { 
      initial: [[], ['kırmızı', 'yeşil'], ['mavi']], 
      target: [['yeşil'], ['mavi'], ['kırmızı']], 
      minMoves: 6,
      description: "Ters çevirme işlemi"
    },
    { 
      initial: [['kırmızı'], ['yeşil', 'mavi'], []], 
      target: [['mavi', 'kırmızı'], [], ['yeşil']], 
      minMoves: 7,
      description: "Stratejik planlama gerekli"
    },
    { 
      initial: [['kırmızı', 'yeşil'], ['mavi'], []], 
      target: [[], ['yeşil', 'mavi', 'kırmızı'], []], 
      minMoves: 8,
      description: "Hepsini ortada birleştirin"
    },
    // Seviye 11-15: Uzman seviye
    { 
      initial: [[], [], ['kırmızı', 'yeşil', 'mavi']], 
      target: [['mavi'], ['yeşil'], ['kırmızı']], 
      minMoves: 9,
      description: "Tam tersine çevirme"
    },
    { 
      initial: [['kırmızı'], ['yeşil'], ['mavi']], 
      target: [['yeşil', 'mavi'], [], ['kırmızı']], 
      minMoves: 7,
      description: "Çapraz geçiş"
    },
    { 
      initial: [['kırmızı', 'yeşil'], [], ['mavi']], 
      target: [['mavi'], ['yeşil'], ['kırmızı']], 
      minMoves: 8,
      description: "Tam ters sıralama"
    },
    { 
      initial: [[], ['kırmızı'], ['yeşil', 'mavi']], 
      target: [['kırmızı', 'yeşil'], ['mavi'], []], 
      minMoves: 6,
      description: "Dengeli dağılım"
    },
    { 
      initial: [['kırmızı'], ['yeşil', 'mavi'], []], 
      target: [[], ['mavi', 'yeşil'], ['kırmızı']], 
      minMoves: 9,
      description: "Maksimum karmaşıklık"
    },
    // Seviye 16-20: Grandmaster
    { 
      initial: [['kırmızı', 'yeşil'], ['mavi'], []], 
      target: [[], ['kırmızı'], ['yeşil', 'mavi']], 
      minMoves: 8,
      description: "Grandmaster Challenge 1"
    },
    { 
      initial: [[], ['kırmızı', 'yeşil', 'mavi'], []], 
      target: [['mavi'], [], ['kırmızı', 'yeşil']], 
      minMoves: 10,
      description: "Grandmaster Challenge 2"
    },
    { 
      initial: [['kırmızı'], [], ['yeşil', 'mavi']], 
      target: [['yeşil'], ['mavi', 'kırmızı'], []], 
      minMoves: 9,
      description: "Grandmaster Challenge 3"
    },
    { 
      initial: [['kırmızı', 'yeşil'], ['mavi'], []], 
      target: [['mavi', 'yeşil'], [], ['kırmızı']], 
      minMoves: 11,
      description: "Grandmaster Challenge 4"
    },
    { 
      initial: [[], ['kırmızı'], ['yeşil', 'mavi']], 
      target: [['kırmızı', 'mavi'], ['yeşil'], []], 
      minMoves: 12,
      description: "💎 ULTIMATE CHALLENGE 💎"
    },
    // Seviye 21-25: Legendary
    { 
      initial: [['kırmızı'], ['yeşil'], ['mavi']], 
      target: [['mavi', 'yeşil'], ['kırmızı'], []], 
      minMoves: 8,
      description: "Legendary Level 1"
    },
    { 
      initial: [['kırmızı', 'yeşil'], [], ['mavi']], 
      target: [[], ['mavi', 'kırmızı'], ['yeşil']], 
      minMoves: 10,
      description: "Legendary Level 2"
    },
    { 
      initial: [[], ['kırmızı', 'yeşil'], ['mavi']], 
      target: [['mavi', 'yeşil'], [], ['kırmızı']], 
      minMoves: 11,
      description: "Legendary Level 3"
    },
    { 
      initial: [['kırmızı'], ['yeşil', 'mavi'], []], 
      target: [['yeşil'], [], ['mavi', 'kırmızı']], 
      minMoves: 9,
      description: "Legendary Level 4"
    },
    { 
      initial: [[], [], ['kırmızı', 'yeşil', 'mavi']], 
      target: [['yeşil', 'mavi'], ['kırmızı'], []], 
      minMoves: 13,
      description: "🏆 LEGENDARY MASTER 🏆"
    }
  ], [])

  const currentConfig = levelConfigs[currentLevel - 1] || levelConfigs[0]

  // Seviye başlatma
  const initializeLevel = React.useCallback((level: number) => {
    const config = levelConfigs[level - 1] || levelConfigs[0]
    
    setCurrentLevel(level)
    setTowers(config.initial.map(tower => [...tower]))
    setSelectedTower(null)
    setMoves(0)
    setIsCompleted(false)
  }, [levelConfigs])

  // İlk seviyeyi başlat
  React.useEffect(() => {
    initializeLevel(1)
  }, [initializeLevel])

  // Seviye tamamlama kontrolü
  const checkCompletion = React.useCallback(() => {
    const target = currentConfig.target
    const isComplete = towers.every((tower, index) => 
      tower.length === target[index].length && 
      tower.every((ball, ballIndex) => ball === target[index][ballIndex])
    )
    return isComplete
  }, [towers, currentConfig.target])

  // Seviye tamamlama kontrolü - Otomatik seviye geçişi
  React.useEffect(() => {
    if (checkCompletion() && !isCompleted) {
      setIsCompleted(true)
      
      // Tamamlama sesi ve mesajı
      playSound('level-up')
      
      // Performans değerlendirmesi
      if (moves === currentConfig.minMoves) {
        toast.success('🏆 Mükemmel! Optimal çözüm!')
      } else if (moves <= currentConfig.minMoves + 2) {
        toast.success('👍 Harika! Çok iyi bir çözüm!')
      } else {
        toast.success('🎉 Tebrikler! Seviye tamamlandı!')
      }
      
      // 3 saniye sonra otomatik olarak sonraki seviyeye geç
      setTimeout(() => {
        if (currentLevel >= 25) {
          // Tüm seviyeler tamamlandı
          toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
        } else {
          // Sonraki seviyeye geç
          const nextLevelNum = currentLevel + 1
          toast.success(`🚀 Seviye ${nextLevelNum} başlıyor!`)
          initializeLevel(nextLevelNum)
        }
      }, 3000)
    }
  }, [towers, isCompleted, moves, currentConfig.minMoves, currentLevel, playSound, initializeLevel, checkCompletion])

  // Seviyeyi sıfırla
  const restartLevel = () => {
    initializeLevel(currentLevel)
  }

  // Top renk stillerini al
  const getBallStyle = (color: string) => {
    switch(color) {
      case 'kırmızı':
        return 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30'
      case 'yeşil':
        return 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30'
      case 'mavi':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30'
      default:
        return 'bg-gray-400'
    }
  }

  // Kule tıklama mantığı
  const handleTowerClick = (towerIndex: number) => {
    if (isCompleted) return // Oyun bitince tıklanmasın

    if (selectedTower === null) {
      // Kule seçimi - sadece top varsa seçilebilir
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex)
        playSound('button-click')
      }
    } else {
      // Top hareketi
      if (selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        setSelectedTower(null)
        playSound('button-click')
      } else {
        // Farklı kuleye tıklandı, top taşımaya çalış
        const from = towers[selectedTower]
        const to = towers[towerIndex]
        
        // Londra Kulesi kuralı: Her kuleye maksimum 3 top
        if (from.length > 0 && to.length < 3) {
          // Geçerli hamle
          const newTowers = towers.map(tower => [...tower])
          const ball = newTowers[selectedTower].pop()!
          newTowers[towerIndex].push(ball)
          
          setTowers(newTowers)
          setMoves(prev => prev + 1)
          setSelectedTower(null)
          playSound('correct-answer')
        } else {
          // Geçersiz hamle
          setSelectedTower(null)
          playSound('wrong-answer')
          if (to.length >= 3) {
            toast.error('Bu kulede zaten 3 top var!')
          }
        }
      }
    }
  }

  const towerLabels = ['Sol Kule', 'Orta Kule', 'Sağ Kule']

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Standart Oyun Başlığı */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
        <CardContent className="p-6 sm:p-8 text-center">
          
          {/* Level Badge - Standart Format */}
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
              <Building className="w-4 h-4 mr-1" />
              Seviye {currentLevel} - Londra Kulesi
            </Badge>
          </div>

          {/* Standart Başlık */}
          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            {currentConfig.description}
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
            Topları hedefteki konuma getirin. Her kuleye maksimum 3 top konabilir.
          </p>

          {/* İstatistik Bilgileri */}
          <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span>Hamle: <strong className="text-primary">{moves}</strong></span>
            <span>Optimal: <strong className="text-green-600">{currentConfig.minMoves}</strong></span>
            <span>Seviye: <strong className="text-blue-600">{currentLevel}/25</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Mevcut Durum */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <h4 className="text-center text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Mevcut Durum</h4>
          <div className="flex justify-center items-end space-x-8 sm:space-x-12 lg:space-x-16">
            {towers.map((tower, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                {/* Kule Etiketi */}
                <div className={`font-medium px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedTower === index
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm'
                }`}>
                  {towerLabels[index]}
                </div>

                {/* Kule ve Toplar */}
                <div 
                  className={`
                    relative transition-all duration-300 cursor-pointer flex flex-col items-center
                    ${selectedTower === index ? 'scale-105' : 'hover:scale-102'}
                  `}
                  onClick={() => handleTowerClick(index)}
                >
                  {/* Ana Çubuk */}
                  <div className={`
                    w-3 h-32 rounded-t-lg transition-all duration-300 shadow-lg z-10
                    ${selectedTower === index
                      ? 'bg-gradient-to-t from-primary to-primary/80 shadow-primary/50' 
                      : 'bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500 hover:from-gray-500 hover:to-gray-400'
                    }
                  `} />

                  {/* Toplar */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
                    {tower.map((ballColor, ballIndex) => (
                      <div
                        key={ballIndex}
                        className={`
                          w-8 h-8 rounded-full mb-1 border-2 border-white/50 transition-all duration-300
                          ${getBallStyle(ballColor)}
                          ${selectedTower === index && ballIndex === tower.length - 1 ? 'scale-110 animate-pulse' : ''}
                        `}
                      />
                    ))}
                  </div>

                  {/* Base Platform */}
                  <div className={`
                    w-16 h-3 rounded-lg transition-all duration-300 -mt-1 z-5
                    ${selectedTower === index
                      ? 'bg-primary/20 shadow-lg shadow-primary/30' 
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hedef Durum */}
      <Card className="bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm border-green-200/20 dark:border-green-800/20">
        <CardContent className="p-6 sm:p-8">
          <h4 className="text-center text-lg font-semibold mb-4 text-green-700 dark:text-green-300">🎯 Hedef</h4>
          <div className="flex justify-center items-end space-x-8 sm:space-x-12 lg:space-x-16">
            {currentConfig.target.map((tower, index) => (
              <div key={index} className="flex flex-col items-center space-y-3">
                {/* Kule Etiketi */}
                <div className="font-medium px-4 py-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm">
                  {towerLabels[index]}
                </div>

                {/* Kule ve Toplar */}
                <div className="relative flex flex-col items-center">
                  {/* Ana Çubuk */}
                  <div className="w-3 h-32 rounded-t-lg bg-gradient-to-t from-green-400 to-green-300 dark:from-green-600 dark:to-green-500 shadow-lg z-10" />

                  {/* Toplar */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
                    {tower.map((ballColor, ballIndex) => (
                      <div
                        key={ballIndex}
                        className={`
                          w-8 h-8 rounded-full mb-1 border-2 border-white/50 opacity-80
                          ${getBallStyle(ballColor)}
                        `}
                      />
                    ))}
                  </div>

                  {/* Base Platform */}
                  <div className="w-16 h-3 rounded-lg bg-green-300 dark:bg-green-600 -mt-1 z-5" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yardım İpuçları - Sadece seçim yapıldığında */}
      {selectedTower !== null && (
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm border-blue-200/20 dark:border-blue-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 text-base text-blue-700 dark:text-blue-300">
              <Move className="w-5 h-5" />
              <span>
                <strong>{towerLabels[selectedTower]}</strong> seçili. Topu başka kuleye taşıyın.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tamamlanma mesajı - 3 saniye gösterilir */}
      {isCompleted && (
        <Card className="bg-gradient-to-r from-yellow-100/80 to-orange-100/80 dark:from-yellow-900/40 dark:to-orange-900/40 backdrop-blur-sm border-2 border-yellow-400 dark:border-yellow-600">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                Seviye {currentLevel} Tamamlandı!
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                {moves} hamle ile tamamladınız (Optimal: {currentConfig.minMoves} hamle)
              </p>
              
              {/* Verimlilik gösterici */}
              <div className="mb-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  moves === currentConfig.minMoves 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : moves <= currentConfig.minMoves + 2
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {moves === currentConfig.minMoves ? '🏆 Mükemmel!' : moves <= currentConfig.minMoves + 2 ? '👍 İyi!' : '💪 Denemeye devam!'}
                </div>
              </div>

              {/* Seviye geçiş bilgisi */}
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                {currentLevel < 25 ? (
                  <p>3 saniye sonra Seviye {currentLevel + 1} başlayacak...</p>
                ) : (
                  <p>🏆 Tüm seviyeler tamamlandı!</p>
                )}
              </div>

              {/* Sadece yeniden oynama butonu */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={restartLevel}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  🔄 Bu Seviyeyi Tekrar Oyna
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const LondraKulesiSayfasiYeni: React.FC<LondraKulesiSayfasiProps> = ({ onBack }) => {
  return (
    <UniversalGameEngine
      gameConfig={TOWER_OF_LONDON_CONFIG}
      gameHook={useTowerOfLondonGame}
      onBack={onBack}
    >
      <TowerOfLondonGame />
    </UniversalGameEngine>
  )
}

export default LondraKulesiSayfasiYeni 