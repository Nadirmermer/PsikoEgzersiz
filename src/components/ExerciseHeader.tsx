import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { ArrowLeft, Clock, Target, Star, Pause, RotateCcw, PlayCircle, Trophy, Brain } from 'lucide-react'

interface ExerciseHeaderProps {
  title: string
  onBack: () => void
  onPause?: () => void
  onRestart?: () => void
  onResume?: () => void
  isPaused?: boolean
  isPlaying?: boolean
  stats?: {
    time?: string
    level?: number | string
    score?: number
    progress?: string
  }
  showExitConfirmation?: boolean
}

const ExerciseHeader: React.FC<ExerciseHeaderProps> = ({
  title,
  onBack,
  onPause,
  onRestart,
  onResume,
  isPaused = false,
  isPlaying = false,
  stats,
  showExitConfirmation = true
}) => {
  const [showExitDialog, setShowExitDialog] = useState(false)

  const handleBackClick = () => {
    if (showExitConfirmation && isPlaying) {
      setShowExitDialog(true)
    } else {
      onBack()
    }
  }

  const handleConfirmExit = () => {
    setShowExitDialog(false)
    onBack()
  }

  return (
    <>
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-white/20 dark:border-gray-800/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          {/* Single Row Layout - Her zaman tek sıra, mobile optimized */}
          <div className="flex items-center justify-between gap-2 min-h-0">
            {/* Sol taraf - Back button ve title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackClick}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shrink-0 h-8 w-8 p-0 sm:w-auto sm:px-3"
                title="Geri"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline sm:ml-2">Geri</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block shrink-0" />
              <h1 className="text-sm sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent truncate min-w-0">
                {title}
              </h1>
            </div>

            {/* Sağ taraf - Stats ve controls (mobile'da horizontal scroll) */}
            <div className="flex items-center gap-1 overflow-x-auto shrink-0 max-w-[60%] sm:max-w-none">
              {/* Stats - Kompakt mobile görünüm */}
              {stats && (
                <div className="flex items-center gap-1 shrink-0">
                  {stats.time && (
                    <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-xs whitespace-nowrap h-6">
                      <Clock className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">{stats.time}</span>
                    </Badge>
                  )}
                  {stats.level && (
                    <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-xs whitespace-nowrap h-6">
                      <Target className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">
                        {typeof stats.level === 'number' ? `Seviye ${stats.level}` : stats.level}
                      </span>
                    </Badge>
                  )}
                  {stats.score !== undefined && (
                    <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-xs whitespace-nowrap h-6">
                      <Star className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">{stats.score}</span>
                    </Badge>
                  )}
                  {stats.progress && (
                    <Badge variant="secondary" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-xs whitespace-nowrap h-6 max-w-16 sm:max-w-none">
                      <Trophy className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline truncate">{stats.progress}</span>
                    </Badge>
                  )}
                  {isPaused && (
                    <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 backdrop-blur-sm text-xs whitespace-nowrap h-6">
                      <Pause className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Duraklatıldı</span>
                    </Badge>
                  )}
                </div>
              )}

              {/* Control buttons - Kompakt */}
              {isPlaying && (
                <div className="flex items-center gap-1 shrink-0">
                  {!isPaused && onPause && (
                    <Button 
                      onClick={onPause}
                      variant="ghost"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 h-6 w-6 p-0"
                      title="Duraklat"
                    >
                      <Pause className="w-3 h-3" />
                    </Button>
                  )}
                  {isPaused && onResume && (
                    <Button 
                      onClick={onResume}
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 h-6 w-6 p-0"
                      title="Devam Et"
                    >
                      <PlayCircle className="w-3 h-3" />
                    </Button>
                  )}
                  {onRestart && (
                    <Button 
                      onClick={onRestart}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-6 w-6 p-0"
                      title="Yeniden Başlat"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-white/20 dark:border-gray-800/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Egzersizden Çık
            </AlertDialogTitle>
            <AlertDialogDescription>
              Egzersizi şimdi bırakırsanız, mevcut ilerlemeniz kaydedilecek ancak egzersiz tamamlanmamış olarak işaretlenecek. Çıkmak istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit} className="bg-red-600 hover:bg-red-700">
              Evet, Çık
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ExerciseHeader 