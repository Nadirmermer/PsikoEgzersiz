
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
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 z-40 shadow-lg"
      role="navigation"
      aria-label="Ana navigasyon menüsü"
    >
      <div className="max-w-4xl mx-auto px-2">
        <div 
          className="nav-tablet"
          role="tablist"
          aria-orientation="horizontal"
        >
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id, item.label)}
                className={cn(
                  "touch-target flex flex-col items-center px-3 py-3 rounded-xl transition-all duration-300 min-w-0 flex-1 mx-0.5 relative group focus-enhanced",
                  "hover:bg-accent/50 active:scale-95",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${item.id}`}
                aria-describedby={`desc-${item.id}`}
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    aria-hidden="true"
                  />
                )}
                
                <IconComponent 
                  className={cn(
                    "w-6 h-6 mb-1 transition-all duration-300",
                    isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                  )}
                  aria-hidden="true"
                />
                
                <span className={cn(
                  "text-xs font-medium text-center leading-tight transition-all duration-300",
                  isActive ? "font-semibold" : "font-normal"
                )}>
                  {item.label}
                </span>
                
                {/* Screen reader description */}
                <span 
                  id={`desc-${item.id}`}
                  className="sr-only"
                >
                  {item.description}
                </span>
                
                {/* Hover effect */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100",
                    "bg-gradient-to-br from-primary/5 to-primary/10"
                  )} 
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
      
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
