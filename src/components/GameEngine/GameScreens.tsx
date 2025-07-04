import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Play, Pause, PlayCircle, RotateCcw, Trophy, Clock, Target, Star, Brain, 
  Lightbulb, CheckCircle, ArrowLeft, Eye
} from 'lucide-react'
import { GameConfig, GameStats, GameState } from './types'
import { useAudio } from '@/hooks/useAudio'

// Ana menü ekranı (oyun başlangıcı)
interface ReadyScreenProps {
  config: GameConfig
  onStart: () => void
}

export const ReadyScreen: React.FC<ReadyScreenProps> = ({ config, onStart }) => {
  const { playSound } = useAudio()

  const handleStart = () => {
    playSound('exercise-start')
    onStart()
  }

  const getStatValue = (key: string, config: GameConfig) => {
    return '0' // Placeholder değer, artık gösterilmeyecek
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl w-full max-w-2xl">
      <CardContent className="space-y-6 p-6">
        {/* Oyun Talimatları - Kompakt */}
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {config.title}
          </h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300 leading-relaxed">
            {config.instructions.map((instruction, index) => (
              <p key={index} className="text-sm">
                <span className="font-medium">{instruction.title}: </span>
                {instruction.description}
              </p>
            ))}
          </div>
        </div>

        {/* Başlat Butonu - Kompakt */}
        <div className="text-center pt-4">
          <Button 
            onClick={handleStart}
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold px-6 py-2 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Star className="w-4 h-4 mr-2" />
            Egzersizi Başlat
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Duraklatma ekranı
interface PauseScreenProps {
  config: GameConfig
  stats: GameStats
  onResume: () => void
  onRestart: () => void
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ config, stats, onResume, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl max-w-md mx-4">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pause className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
            Oyun Duraklatıldı
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Devam etmek için butona tıklayın
          </p>
          
          {/* Aksiyon Butonları - Kompakt */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={onResume} 
              size="default"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Devam Et
            </Button>
            <Button 
              onClick={onRestart}
              variant="outline"
              size="default"
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Yeniden Başlat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tamamlanma ekranı
interface CompletedScreenProps {
  config: GameConfig
  stats: GameStats
  onRestart: () => void
  onBack: () => void
  showNextLevel?: boolean
  onNextLevel?: () => void
}

export const CompletedScreen: React.FC<CompletedScreenProps> = ({ 
  config, 
  stats, 
  onRestart, 
  onBack, 
  showNextLevel, 
  onNextLevel 
}) => {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl w-full max-w-2xl">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl sm:text-2xl mb-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Tebrikler!
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
          {config.title} egzersizini tamamladınız
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sonuç İstatistikleri - Kompakt */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20 dark:border-gray-700/20">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Skor</h3>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.score}</p>
          </div>
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20 dark:border-gray-700/20">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.time || '00:00'}</p>
          </div>
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20 dark:border-gray-700/20">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">İlerleme</h3>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.progress}</p>
          </div>
        </div>

        {/* Başarı Oranı - Kompakt */}
        {stats.accuracy && (
          <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20 dark:border-gray-700/20">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Başarı Oranı</h3>
            <div className="text-2xl font-bold text-primary mb-2">
              {Math.round(stats.accuracy)}%
            </div>
            <Progress 
              value={stats.accuracy} 
              className="h-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
            />
          </div>
        )}
        
        {/* Aksiyon Butonları - Kompakt */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button 
            onClick={onRestart}
            variant="outline"
            size="default"
            className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Tekrar Oyna
          </Button>
          {showNextLevel && onNextLevel && (
            <Button 
              onClick={onNextLevel}
              size="default"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Star className="w-4 h-4 mr-2" />
              Sonraki Seviye
            </Button>
          )}
          <Button 
            onClick={onBack}
            size="default"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Menüye Dön
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Yardımcı fonksiyonlar
const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    'target': <Target className="w-6 h-6" />,
    'clock': <Clock className="w-6 h-6" />,
    'trophy': <Trophy className="w-6 h-6" />,
    'star': <Star className="w-6 h-6" />,
    'brain': <Brain className="w-6 h-6" />,
    'eye': <Eye className="w-6 h-6" />,
    'lightbulb': <Lightbulb className="w-6 h-6" />,
    'check': <CheckCircle className="w-6 h-6" />
  }
  return icons[iconName] || <Target className="w-6 h-6" />
}

const getStatValue = (key: string, config: GameConfig): string | number => {
  const values: { [key: string]: string | number } = {
    'totalQuestions': config.totalQuestions || 'N/A',
    'estimatedTime': config.estimatedTime,
    'difficulty': config.difficulty,
    'maxLevel': config.maxLevel || 'N/A',
    'hasLevels': config.hasLevels ? 'Var' : 'Yok'
  }
  return values[key] || 'N/A'
} 