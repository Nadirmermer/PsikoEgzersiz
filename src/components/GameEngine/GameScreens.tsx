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

// Ana menü ekranı (oyun başlangıcı)
interface ReadyScreenProps {
  config: GameConfig
  onStart: () => void
}

export const ReadyScreen: React.FC<ReadyScreenProps> = ({ config, onStart }) => {
  return (
    <div className="container mx-auto px-4 py-8 pb-28 max-w-4xl">
      <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {config.title}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {config.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {config.stats.map((stat, index) => (
              <div key={index} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-primary">
                  {getStatValue(stat.key, config)}
                </p>
              </div>
            ))}
          </div>

          {/* Oyun Talimatları */}
          <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm rounded-xl p-6 border border-blue-200/20 dark:border-blue-800/20">
            <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Lightbulb className="w-5 h-5 text-primary" />
              Nasıl Oynanır?
            </h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              {config.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">
                    {instruction.step}
                  </span>
                  <div>
                    <span className="font-medium">{instruction.title}: </span>
                    <span>{instruction.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Başlat Butonu */}
          <div className="text-center pt-4">
            <Button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                onStart()
              }}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20 shadow-2xl max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Pause className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Oyun Duraklatıldı
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Devam etmek için butona tıklayın
          </p>
          
          {/* Mevcut İstatistikler */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Skor</h4>
              <p className="text-xl font-bold text-primary">{stats.score}</p>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20 dark:border-gray-700/20">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h4>
              <p className="text-xl font-bold text-primary">{stats.time || '00:00'}</p>
            </div>
          </div>
          
          {/* Aksiyon Butonları */}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={onResume} 
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Devam Et
            </Button>
            <Button onClick={onRestart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Yeniden Başla
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
            {config.title} egzersizini tamamladınız
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Sonuç İstatistikleri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Skor</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.score}</p>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Süre</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.time || '00:00'}</p>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 dark:border-gray-700/20">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">İlerleme</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.progress}</p>
            </div>
          </div>

          {/* Başarı Oranı */}
          {stats.accuracy && (
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 dark:border-gray-700/20">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Başarı Oranı</h3>
              <div className="text-4xl font-bold text-primary mb-2">
                {Math.round(stats.accuracy)}%
              </div>
              <Progress 
                value={stats.accuracy} 
                className="h-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm"
              />
            </div>
          )}
          
          {/* Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:bg-white/60 dark:hover:bg-gray-800/60"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Tekrar Oyna
            </Button>
            {showNextLevel && onNextLevel && (
              <Button 
                onClick={onNextLevel}
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Star className="w-5 h-5 mr-2" />
                Sonraki Seviye
              </Button>
            )}
            <Button 
              onClick={onBack}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ana Menüye Dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
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