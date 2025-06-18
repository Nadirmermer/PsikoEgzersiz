import React from 'react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { TOWER_OF_LONDON_CONFIG } from '../components/GameEngine/gameConfigs'
import { useTowerOfLondonGame, getDiskStyle } from '../hooks/useTowerOfLondon'
import { Target, Move } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { useAudio } from '@/hooks/useAudio'

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
  const [towers, setTowers] = React.useState<number[][]>([[], [], []])
  const [selectedTower, setSelectedTower] = React.useState<number | null>(null)
  const [moves, setMoves] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)
  const { playSound } = useAudio()
  
  // Seviye bazlı hesaplamalar
  const diskCount = Math.min(2 + currentLevel, 6) // Seviye 1: 3 disk, Seviye 4: 6 disk
  const minMoves = Math.pow(2, diskCount) - 1 // Hanoi Tower minimum hamle formülü

  // Seviye başlatma
  const initializeLevel = React.useCallback((level: number) => {
    const newDiskCount = Math.min(2 + level, 6)
    const initialTower = Array.from({ length: newDiskCount }, (_, i) => newDiskCount - i) // En büyük disk altta
    
    setCurrentLevel(level)
    setTowers([initialTower, [], []])
    setSelectedTower(null)
    setMoves(0)
    setIsCompleted(false)
  }, [])

  // İlk seviyeyi başlat
  React.useEffect(() => {
    initializeLevel(1)
  }, [initializeLevel])

  // Seviye tamamlama kontrolü - Otomatik seviye geçişi
  React.useEffect(() => {
    if (towers[2].length === diskCount && diskCount > 0 && !isCompleted) {
      setIsCompleted(true)
      
      // Tamamlama sesi ve mesajı
      playSound('level-up')
      
      // Performans değerlendirmesi
      if (moves === minMoves) {
        toast.success('🏆 Mükemmel! Optimal çözüm!')
      } else if (moves <= minMoves + 2) {
        toast.success('👍 Harika! Çok iyi bir çözüm!')
      } else {
        toast.success('🎉 Tebrikler! Seviye tamamlandı!')
      }
      
      // 3 saniye sonra otomatik olarak sonraki seviyeye geç
      setTimeout(() => {
        if (currentLevel >= 10) {
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
  }, [towers, diskCount, isCompleted, moves, minMoves, currentLevel, playSound, initializeLevel])

  // Seviyeyi sıfırla
  const restartLevel = () => {
    initializeLevel(currentLevel)
  }

  // Kule tıklama mantığı
  const handleTowerClick = (towerIndex: number) => {
    if (isCompleted) return // Oyun bitince tıklanmasın

    if (selectedTower === null) {
      // Kule seçimi - sadece disk varsa seçilebilir
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex)
        playSound('button-click')
      }
    } else {
      // Disk hareketi
      if (selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        setSelectedTower(null)
        playSound('button-click')
      } else {
        // Farklı kuleye tıklandı, disk taşımaya çalış
        const from = towers[selectedTower]
        const to = towers[towerIndex]
        
        if (from.length > 0 && (to.length === 0 || from[from.length - 1] < to[to.length - 1])) {
          // Geçerli hamle
          const newTowers = towers.map(tower => [...tower])
          const disk = newTowers[selectedTower].pop()!
          newTowers[towerIndex].push(disk)
          
          setTowers(newTowers)
          setMoves(prev => prev + 1)
          setSelectedTower(null)
          playSound('correct-answer')
        } else {
          // Geçersiz hamle
          setSelectedTower(null)
          playSound('wrong-answer')
          toast.error('Büyük disk küçük diskin üzerine konulamaz!')
        }
      }
    }
  }

  const towerLabels = ['Başlangıç', 'Yardımcı', '🎯 HEDEF 🎯']

  return (
    <div className="space-y-6">
      {/* Büyük ve net hedef açıklaması */}
      <div className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-300 dark:border-green-700">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-green-800 dark:text-green-200">
            🎯 HEDEFİNİZ
          </h2>
          <p className="text-lg font-semibold text-green-700 dark:text-green-300">
            Tüm renkli diskleri <strong>SAĞDAKİ (Hedef)</strong> kuleye taşıyın
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            ⚠️ Büyük disk küçük diskin üzerine konulamaz
          </p>
        </div>
      </div>

      {/* Ana Oyun Alanı */}
      <div className="bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20">
        <div className="flex justify-center items-end space-x-8 sm:space-x-12 lg:space-x-16">
          {towers.map((tower, index) => (
            <Tower
              key={index}
              index={index}
              disks={tower}
              isSelected={selectedTower === index}
              maxDiskCount={diskCount}
              onClick={() => handleTowerClick(index)}
              label={towerLabels[index]}
              isTarget={index === 2}
            />
          ))}
        </div>
      </div>

      {/* Yardım İpuçları - Sadece seçim yapıldığında */}
      {selectedTower !== null && (
        <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 backdrop-blur-sm rounded-xl p-4 border border-blue-200/20 dark:border-blue-800/20">
          <div className="flex items-center justify-center gap-2 text-base text-blue-700 dark:text-blue-300">
            <Move className="w-5 h-5" />
            <span>
              <strong>{towerLabels[selectedTower]}</strong> kulesi seçili. Diski başka kuleye taşıyın.
            </span>
          </div>
        </div>
      )}

      {/* Tamamlanma mesajı - 3 saniye gösterilir */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-yellow-100/80 to-orange-100/80 dark:from-yellow-900/40 dark:to-orange-900/40 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-400 dark:border-yellow-600">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              Seviye {currentLevel} Tamamlandı!
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {moves} hamle ile tamamladınız (Optimal: {minMoves} hamle)
            </p>
            
            {/* Verimlilik gösterici */}
            <div className="mb-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                moves === minMoves 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : moves <= minMoves + 2
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}>
                {moves === minMoves ? '🏆 Mükemmel!' : moves <= minMoves + 2 ? '👍 İyi!' : '💪 Denemeye devam!'}
              </div>
            </div>

            {/* Seviye geçiş bilgisi */}
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              {currentLevel < 10 ? (
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
        </div>
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