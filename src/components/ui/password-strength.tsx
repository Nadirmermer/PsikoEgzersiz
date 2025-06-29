import React from 'react'
import { cn } from '@/lib/utils'
import { validatePasswordStrength, PasswordStrengthLevel } from '@/utils/validation'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
  showFeedback?: boolean
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className,
  showFeedback = true
}) => {
  const strength = validatePasswordStrength(password)
  
  if (!password) return null

  const getColorClasses = (level: PasswordStrengthLevel) => {
    switch (level) {
      case 'weak':
        return 'bg-red-500 text-red-50'
      case 'fair':
        return 'bg-orange-500 text-orange-50'
      case 'good':
        return 'bg-yellow-500 text-yellow-50'
      case 'strong':
        return 'bg-green-500 text-green-50'
      default:
        return 'bg-gray-300 text-gray-600'
    }
  }

  const getProgressWidth = (score: number) => {
    return `${(score / 4) * 100}%`
  }

  const getLevelText = (level: PasswordStrengthLevel) => {
    switch (level) {
      case 'weak':
        return 'Zayıf'
      case 'fair':
        return 'Orta'
      case 'good':
        return 'İyi'
      case 'strong':
        return 'Güçlü'
      default:
        return ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">
            Şifre Güçlü
          </span>
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            getColorClasses(strength.level)
          )}>
            {getLevelText(strength.level)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              strength.level === 'weak' && 'bg-red-500',
              strength.level === 'fair' && 'bg-orange-500',
              strength.level === 'good' && 'bg-yellow-500',
              strength.level === 'strong' && 'bg-green-500'
            )}
            style={{ width: getProgressWidth(strength.score) }}
          />
        </div>
      </div>

      {/* Feedback List */}
      {showFeedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Şifre gereksinimleri:
          </p>
          <ul className="space-y-1">
            {/* Show requirements */}
            <li className="flex items-center gap-2 text-xs">
              {password.length >= 8 ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span className={password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                En az 8 karakter
              </span>
            </li>
            
            <li className="flex items-center gap-2 text-xs">
              {/[a-z]/.test(password) ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                Küçük harf (a-z)
              </span>
            </li>
            
            <li className="flex items-center gap-2 text-xs">
              {/[A-Z]/.test(password) ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                Büyük harf (A-Z)
              </span>
            </li>
            
            <li className="flex items-center gap-2 text-xs">
              {/\d/.test(password) ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span className={/\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                Rakam (0-9)
              </span>
            </li>
            
            <li className="flex items-center gap-2 text-xs">
              {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                Özel karakter (!@#$%^&*)
              </span>
            </li>
          </ul>
        </div>
      )}
      
      {/* Success Message */}
      {strength.isValid && (
        <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            Şifre güçlü ve gereksinimlerini karşılıyor
          </span>
        </div>
      )}
    </div>
  )
}

export { PasswordStrengthIndicator } 