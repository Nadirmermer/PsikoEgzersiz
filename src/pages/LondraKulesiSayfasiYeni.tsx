import React from 'react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { TOWER_OF_LONDON_CONFIG } from '../components/GameEngine/gameConfigs'
import { useTowerOfLondonGame, getDiskStyle } from '../hooks/useTowerOfLondon'
import { Target, Move } from 'lucide-react'

interface LondraKulesiSayfasiProps {
  onBack: () => void
}

// Tower Komponenti - Çok daha güzel tasarım
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
      <div className={`text-sm font-medium px-3 py-1 rounded-full ${
        isTarget 
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }`}>
        {label}
      </div>

      {/* Kule Tabanı - Geliştirilmiş */}
      <div 
        className={`
          relative transition-all duration-300 cursor-pointer
          ${isSelected ? 'scale-105' : 'hover:scale-102'}
        `}
        onClick={onClick}
      >
        {/* Ana Çubuk - Çok daha güzel */}
        <div className={`
          w-4 h-40 rounded-t-lg transition-all duration-300 shadow-lg
          ${isSelected 
            ? 'bg-gradient-to-t from-primary to-primary/80 shadow-primary/50' 
            : 'bg-gradient-to-t from-gray-400 to-gray-300 dark:from-gray-600 dark:to-gray-500 hover:from-gray-500 hover:to-gray-400'
          }
        `} />

        {/* Diskler - Stack container */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center space-y-reverse space-y-1">
          {disks.map((diskSize, diskIndex) => {
            const diskStyle = getDiskStyle(diskSize, maxDiskCount, isSelected && diskIndex === disks.length - 1)
            return (
              <div
                key={diskIndex}
                className={`
                  h-6 flex items-center justify-center text-white font-bold text-xs
                  ${diskStyle.className}
                `}
                style={{ width: diskStyle.width }}
              >
                {diskSize}
              </div>
            )
          })}
        </div>

        {/* Base Platform - Güzel platform */}
        <div className={`
          w-20 h-3 rounded-lg mx-auto -mt-1 transition-all duration-300
          ${isSelected 
            ? 'bg-primary/20 shadow-lg shadow-primary/30' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
        `} />

        {/* Selection Ring */}
        {isSelected && (
          <div className="absolute inset-0 rounded-lg border-4 border-primary/50 animate-pulse pointer-events-none" />
        )}
      </div>
    </div>
  )
}

// Ana Oyun Komponenti
const TowerOfLondonGame: React.FC = () => {
  // Şimdilik basit state kullanıyorum
  const [towers, setTowers] = React.useState<number[][]>([[3, 2, 1], [], []])
  const [selectedTower, setSelectedTower] = React.useState<number | null>(null)
  const [moves, setMoves] = React.useState(0)
  const minMoves = 7 // 3 disk için minimum hamle
  const diskCount = 3
  const currentLevel = 1

  // Kule tıklama mantığı
  const handleTowerClick = (towerIndex: number) => {
    if (selectedTower === null) {
      // Kule seçimi - sadece disk varsa seçilebilir
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex)
      }
    } else {
      // Disk hareketi
      if (selectedTower === towerIndex) {
        // Aynı kuleye tıklandı, seçimi iptal et
        setSelectedTower(null)
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
        } else {
          // Geçersiz hamle
          setSelectedTower(null)
        }
      }
    }
  }

  const towerLabels = ['Başlangıç', 'Yardımcı', 'Hedef 🎯']
  const efficiency = moves > 0 ? Math.round((minMoves / moves) * 100) : 100

  return (
    <div className="space-y-6">
      {/* Oyun İstatistikleri */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Hamle</div>
          <div className="text-lg font-bold text-blue-600">{moves}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Min</div>
          <div className="text-lg font-bold text-green-600">{minMoves}</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Verim</div>
          <div className="text-lg font-bold text-purple-600">{efficiency}%</div>
        </div>
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Disk</div>
          <div className="text-lg font-bold text-orange-600">{diskCount}</div>
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

      {/* Hedef Gösterici */}
      <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm rounded-xl p-4 border border-green-200/20 dark:border-green-800/20">
        <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-300">
          <Target className="w-4 h-4" />
          <span>Tüm diskleri <strong>Hedef</strong> kulesine taşıyın</span>
        </div>
      </div>

      {/* Yardım İpuçları */}
      {selectedTower !== null && (
        <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 backdrop-blur-sm rounded-xl p-4 border border-blue-200/20 dark:border-blue-800/20">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Move className="w-4 h-4" />
            <span>
              <strong>{towerLabels[selectedTower]}</strong> kulesi seçili. Diski taşımak için başka bir kuleye tıklayın.
            </span>
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