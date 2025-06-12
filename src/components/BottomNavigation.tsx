
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Brain, BarChart3, Settings, UserCheck, LogOut, Shield } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface BottomNavigationProps {
  activePage: string;
  setActivePage: (page: string) => void;
  showUzmanDashboard?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activePage, 
  setActivePage,
  showUzmanDashboard = false 
}) => {
  const [isClientMode, setIsClientMode] = useState(false)
  const [clientModeData, setClientModeData] = useState<any>(null)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitPassword, setExitPassword] = useState('')

  // Check client mode status
  useEffect(() => {
    const checkClientMode = () => {
      const clientModeActive = localStorage.getItem('clientMode') === 'true'
      const clientData = localStorage.getItem('clientModeData')
      
      setIsClientMode(clientModeActive)
      
      if (clientModeActive && clientData) {
        try {
          setClientModeData(JSON.parse(clientData))
        } catch (error) {
          console.error('Error parsing client mode data:', error)
        }
      }
    }

    checkClientMode()
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clientMode' || e.key === 'clientModeData') {
        checkClientMode()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically in case of same-tab changes
    const interval = setInterval(checkClientMode, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleExitClientMode = () => {
    if (exitPassword === '1923') {
      // Clear client mode
      localStorage.removeItem('clientMode')
      localStorage.removeItem('clientModeData')
      
      setIsClientMode(false)
      setClientModeData(null)
      setShowExitDialog(false)
      setExitPassword('')
      
      toast.success('Danışan modundan çıkıldı')
      
      // Redirect to dashboard
      setActivePage('uzman-dashboard')
    } else {
      toast.error('Hatalı şifre! Doğru şifre: 1923')
      setExitPassword('')
    }
  }
  const navigationItems = [
    {
      id: "egzersizler",
      label: "Egzersizler",
      icon: Brain,
      description: "Bilişsel egzersizlere erişim",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "istatistikler", 
      label: "İstatistikler",
      icon: BarChart3,
      description: "Performans istatistikleri ve grafikleri",
      color: "text-green-600 dark:text-green-400"
    },
    {
      id: "ayarlar",
      label: "Ayarlar", 
      icon: Settings,
      description: "Uygulama ayarları ve hesap yönetimi",
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  // Add uzman dashboard if user is logged in
  if (showUzmanDashboard) {
    navigationItems.splice(2, 0, {
      id: "uzman-dashboard",
      label: "Dashboard",
      icon: UserCheck,
      description: "Uzman dashboard ve danışan yönetimi",
      color: "text-orange-600 dark:text-orange-400"
    });
  }

  const handleNavigation = (pageId: string, pageName: string) => {
    setActivePage(pageId);
    
    // Announce navigation to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `${pageName} sayfasına geçiliyor`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-border/30 z-40 shadow-2xl"
        role="navigation"
        aria-label="Ana navigasyon menüsü"
      >
        {/* Client Mode Banner */}
        {isClientMode && clientModeData && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-center text-sm font-medium">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Danışan Modu: {clientModeData.clientIdentifier}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowExitDialog(true)}
                className="h-6 px-2 text-white hover:bg-white/20"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Çıkış
              </Button>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none" />
        
        <div className="relative max-w-md mx-auto px-4 py-2">
          <div 
            className="flex items-center justify-around gap-1"
            role="tablist"
            aria-orientation="horizontal"
          >
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.label)}
                className={cn(
                  "relative flex flex-col items-center px-3 py-2.5 rounded-2xl transition-all duration-300 min-w-0 group focus-enhanced",
                  "hover:bg-primary/5 active:scale-95 touch-target",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${item.id}`}
                aria-describedby={`desc-${item.id}`}
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                {/* Active background glow */}
                {isActive && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl animate-pulse"
                    aria-hidden="true"
                  />
                )}
                
                {/* Icon container */}
                <div className={cn(
                  "relative z-10 p-2 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white/20 backdrop-blur-sm" 
                    : "group-hover:bg-primary/10"
                )}>
                  <IconComponent 
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isActive 
                        ? "text-white drop-shadow-sm" 
                        : "group-hover:scale-110"
                    )}
                    aria-hidden="true"
                  />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "relative z-10 text-xs font-medium text-center leading-tight transition-all duration-300 mt-1",
                  isActive 
                    ? "text-white font-semibold drop-shadow-sm" 
                    : "group-hover:font-medium"
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div 
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                )}
                
                {/* Screen reader description */}
                <span 
                  id={`desc-${item.id}`}
                  className="sr-only"
                >
                  {item.description}
                </span>
                
                {/* Ripple effect on tap */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-active:opacity-100",
                    "bg-gradient-to-br from-white/10 to-white/5"
                  )} 
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Bottom safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom bg-transparent" />
      
      {/* Screen reader announcement area */}
      <div 
        id="nav-announcements" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />
    </nav>

    {/* Exit Client Mode Dialog */}
    <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Danışan Modundan Çıkış
          </DialogTitle>
          <DialogDescription>
            Danışan modundan çıkmak için uzman şifresini girin
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="exitPassword" className="text-sm font-medium">Uzman Şifresi</Label>
            <Input
              id="exitPassword"
              type="password"
              value={exitPassword}
              onChange={(e) => setExitPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              className="mt-1.5 rounded-lg"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && exitPassword.trim()) {
                  handleExitClientMode()
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Uzman şifresi: 1923
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleExitClientMode}
              disabled={!exitPassword.trim()}
              className="flex-1 rounded-lg"
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowExitDialog(false)
                setExitPassword('')
              }}
              className="rounded-lg"
            >
              İptal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default BottomNavigation;
