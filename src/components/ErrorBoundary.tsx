import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

interface ErrorReportData {
  error: {
    message: string
    stack?: string
    name: string
  }
  errorInfo: {
    componentStack: string
  }
  timestamp: string
  userAgent: string
  url: string
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = Date.now().toString()
    
    const errorData: ErrorReportData = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Log to console for development
    console.error('🚨 Error Boundary Caught Error:', errorData)

    // Save error to localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      existingErrors.push(errorData)
      
      // Keep only last 10 errors to prevent storage bloat
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10)
      }
      
      localStorage.setItem('app_errors', JSON.stringify(existingErrors))
    } catch (storageError) {
      console.error('Failed to save error to localStorage:', storageError)
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(errorData)
    }
  }

  private reportErrorToService = async (errorDetails: ErrorReportData) => {
    try {
      // Here you would send to your error monitoring service
      // For now, just log it
      console.error('Production Error Report:', errorDetails)
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      })
    } else {
      // Force page reload after max retries
      window.location.reload()
    }
  }

  private handleReportBug = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }

    const mailtoLink = `mailto:support@psikoegzersiz.com?subject=Bug Report - ${this.state.errorId}&body=${encodeURIComponent(
      `Hata Raporu:\n\n` +
      `Hata ID: ${errorDetails.errorId}\n` +
      `Zaman: ${errorDetails.timestamp}\n` +
      `Mesaj: ${errorDetails.message}\n` +
      `Cihaz: ${errorDetails.userAgent}\n\n` +
      `Lütfen hatanın nasıl oluştuğunu detaylı olarak açıklayın:\n\n`
    )}`

    window.open(mailtoLink)
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl text-red-800 dark:text-red-200">
                Beklenmeyen Bir Hata Oluştu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  <strong>Hata ID:</strong> {this.state.errorId}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {this.state.error?.message || 'Bilinmeyen hata'}
                </p>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>
                  Bu hata otomatik olarak kaydedildi. Aşağıdaki seçenekleri deneyebilirsiniz:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Sayfayı yeniden yüklemek</li>
                  <li>Ana sayfaya dönmek</li>
                  <li>Hata raporunu göndermek</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={this.retryCount >= this.maxRetries}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.retryCount >= this.maxRetries ? 'Sayfa Yenileniyor...' : 'Tekrar Dene'}
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </div>

              <Button 
                onClick={this.handleReportBug}
                variant="ghost"
                size="sm"
                className="w-full text-gray-600 dark:text-gray-400"
              >
                <Bug className="w-4 h-4 mr-2" />
                Hata Bildir
              </Button>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                    Geliştirici Detayları
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                    {this.state.error?.stack}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryConfig?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for manually triggering error boundary
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    // This will trigger the error boundary
    throw new Error(`${error.message}${errorInfo ? ` - ${errorInfo}` : ''}`)
  }
} 