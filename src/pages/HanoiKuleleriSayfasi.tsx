import React from 'react'
import UniversalGameEngine from '../components/GameEngine/UniversalGameEngine'
import { useHanoiTowersGame } from '../hooks/useHanoiTowers'
import { HANOI_TOWERS_CONFIG } from '../components/GameEngine/gameConfigs'
import { Building2, Target, Timer, Trophy, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/sonner'
import { useAudio } from '@/hooks/useAudio'

interface HanoiKuleleriSayfasiProps {
  onBack: () => void
}

// Disk renklerini Londra Kulesi topları gibi tasarlama
const getDiskColor = (size: number, maxSize: number, isSelected: boolean = false) => {
  const colors = [
    'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/30', // En küçük - Mavi
    'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/30', // Yeşil
    'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/30', // Sarı
    'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/30', // Turuncu
    'bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-red-500/30', // Kırmızı
    'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 shadow-purple-500/30', // Mor
    'bg-gradient-to-br from-pink-400 to-pink-600 border-pink-300 shadow-pink-500/30', // Pembe
    'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300 shadow-indigo-500/30', // İndigo
  ]
  
  const colorIndex = size - 1
  const baseColor = colors[colorIndex] || colors[0]
  
  return isSelected 
    ? `${baseColor} scale-110 ring-4 ring-primary/50 ring-offset-2`
    : baseColor
}

// Tower Component - Londra Kulesi stilinde
const Tower: React.FC<{
  index: number
  disks: number[]
  isSelected: boolean
  onClick: () => void
  label: string
  isTarget?: boolean
}> = ({ index, disks, isSelected, onClick, label, isTarget = false }) => {
  const kubeHeight = disks.length <= 3 ? 'h-40' : disks.length <= 5 ? 'h-48' : 'h-56' // Azaltıldı
  const kubeWidth = disks.length <= 3 ? 'w-4' : disks.length <= 5 ? 'w-5' : 'w-6' // Azaltıldı
  const platformWidth = disks.length <= 3 ? 'w-20' : disks.length <= 5 ? 'w-24' : 'w-28' // Azaltıldı

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
        {label}
      </div>
      
      <div 
        className={`
          relative ${kubeHeight} ${platformWidth} cursor-pointer transition-all duration-300
          ${isSelected ? 'scale-105' : 'hover:scale-102'}
        `}
        onClick={onClick}
        title={`${label} - ${disks.length} disk`}
      >
        {/* Platform */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${platformWidth} h-3 bg-gradient-to-t from-amber-600 to-amber-500 rounded-lg shadow-lg border border-amber-700`} />
        
        {/* Kule direği */}
        <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 ${kubeWidth} ${kubeHeight} bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg shadow-inner`} />

        {/* Diskler - En büyük altta, küçük üstte - Azaltılmış boyutlar */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex flex-col-reverse items-center z-20">
          {disks.map((diskSize, diskIndex) => {
            const isTopDisk = diskIndex === disks.length - 1
            const isSelectedDisk = isSelected && isTopDisk
            const diskWidth = 24 + diskSize * 14 // Azaltıldı: 24px base + 14px per size
            
            return (
              <div
                key={`${index}-${diskIndex}`}
                className={`
                  h-6 sm:h-7 md:h-8 rounded-full mb-1 border-2 border-white/50 transition-all duration-300 
                  flex items-center justify-center shadow-lg
                  ${getDiskColor(diskSize, 8, isSelectedDisk)}
                `}
                style={{ width: `${diskWidth}px` }}
                title={`Disk ${diskSize}`}
              >
                <span className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">
                  {diskSize}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

Tower.displayName = 'Tower'

const HanoiTowersGame: React.FC = () => {
  const gameEngine = useHanoiTowersGame({ maxLevel: 18 })
  const { gameData: hanoiGame } = gameEngine
  const { playSound } = useAudio()

  const levelData = hanoiGame.getCurrentLevelData()
  const towerLabels = ['Kule A', 'Kule B', 'Kule C']

  // Seviye tamamlama kontrolü - Londra Kulesi stilinde
  React.useEffect(() => {
    if (hanoiGame.levelsCompleted > 0) {
      const efficiency = Math.round((levelData.minMoves / hanoiGame.moves) * 100)
      
      // Performans değerlendirmesi
      if (hanoiGame.moves === levelData.minMoves) {
        toast.success('🏆 Mükemmel! Optimal çözüm!')
      } else if (hanoiGame.moves <= levelData.minMoves + 2) {
        toast.success('👍 Harika! Çok iyi bir çözüm!')
      } else if (hanoiGame.moves <= levelData.minMoves + 4) {
        toast.success('💪 İyi! Gelişmeye devam!')
      } else {
        toast.success('🎉 Tebrikler! Seviye tamamlandı!')
      }

      // 3 saniye sonra otomatik seviye geçişi
      setTimeout(() => {
        if (hanoiGame.currentLevel >= 18) {
          toast.success('🏆 Tebrikler! Tüm seviyeleri tamamladınız!')
        } else {
          hanoiGame.nextLevel()
        }
      }, 3000)
    }
  }, [hanoiGame.levelsCompleted])

  // Önizleme ekranı - 3 saniye hedef gösterimi
  if (hanoiGame.showingPreview) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4">
        {/* Seviye Badge'ı */}
        <div className="text-center mb-4">
          <Badge variant="secondary" className="text-sm sm:text-base px-3 py-2 sm:px-4 bg-primary/10 text-primary border-primary/20">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Seviye {hanoiGame.currentLevel} - {levelData.difficulty}
          </Badge>
        </div>

        {/* Hedef Durum Önizlemesi */}
        <Card className="bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm border-green-200/20 dark:border-green-800/20">
          <CardContent className="p-4 sm:p-6">
            <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-700 dark:text-green-300">
              🎯 Hedef - {levelData.name}
            </h4>
            <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
              {hanoiGame.targetConfig.towers.map((tower, index) => (
                <Tower
                  key={index}
                  index={index}
                  disks={tower}
                  isSelected={false}
                  onClick={() => {}}
                  label={towerLabels[index]}
                  isTarget={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bekleme Göstergesi */}
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Timer className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Seviye Hazırlanıyor...</h3>
              <p className="text-gray-600">Hedef düzenlemeyi inceleyin. Oyun 3 saniye içinde başlayacak.</p>
              <div className="animate-pulse">
                <div className="h-2 bg-blue-200 rounded-full w-32 mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4">
      
      {/* Sadece Seviye Badge'ı - Temiz tasarım */}
      <div className="text-center mb-4">
        <Badge variant="secondary" className="text-sm sm:text-base px-3 py-2 sm:px-4 bg-primary/10 text-primary border-primary/20">
          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Seviye {hanoiGame.currentLevel} - {levelData.difficulty}
        </Badge>
      </div>

      {/* Mevcut Durum */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/30 dark:border-gray-800/30 shadow-xl">
        <CardContent className="p-4 sm:p-6">
          <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700 dark:text-gray-300">
            Mevcut Durum
          </h4>
          <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
            {hanoiGame.currentConfig.towers.map((tower, index) => (
              <Tower
                key={index}
                index={index}
                disks={tower}
                isSelected={hanoiGame.selectedTower === index}
                onClick={() => {
                  if (!hanoiGame.timeStarted) {
                    hanoiGame.startGame()
                  }
                  hanoiGame.handleTowerClick(index)
                }}
                label={towerLabels[index]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hedef Durum */}
      <Card className="bg-green-50/50 dark:bg-green-950/20 backdrop-blur-sm border-green-200/20 dark:border-green-800/20">
        <CardContent className="p-4 sm:p-6">
          <h4 className="text-center text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-green-700 dark:text-green-300">
            🎯 Hedef
          </h4>
          <div className="flex justify-center items-end space-x-4 sm:space-x-8 md:space-x-12">
            {hanoiGame.targetConfig.towers.map((tower, index) => (
              <Tower
                key={index}
                index={index}
                disks={tower}
                isSelected={false}
                onClick={() => {}}
                label={towerLabels[index]}
                isTarget={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yardım İpuçları - Kule seçiliyken */}
      {hanoiGame.selectedTower !== null && (
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm border-blue-200/20 dark:border-blue-800/20">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-blue-700 dark:text-blue-300">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium">
                <strong>{towerLabels[hanoiGame.selectedTower]}</strong> seçildi - Hedef kuleye tıklayın
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const HanoiKuleleriSayfasi: React.FC<HanoiKuleleriSayfasiProps> = ({ onBack }) => {
  return (
    <UniversalGameEngine
      gameConfig={HANOI_TOWERS_CONFIG}
      gameHook={useHanoiTowersGame}
      onBack={onBack}
    >
      <HanoiTowersGame />
    </UniversalGameEngine>
  )
}

export default HanoiKuleleriSayfasi