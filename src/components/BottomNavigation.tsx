
import React from 'react'
import { cn } from '@/lib/utils'
import { Brain, BarChart3, Settings, UserCheck } from 'lucide-react'

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
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-border/30 z-40 shadow-2xl"
      role="navigation"
      aria-label="Ana navigasyon menüsü"
    >
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
  );
};

export default BottomNavigation;
