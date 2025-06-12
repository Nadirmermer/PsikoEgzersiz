
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
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "istatistikler", 
      label: "İstatistikler",
      icon: BarChart3,
      color: "text-green-600 dark:text-green-400"
    },
    {
      id: "ayarlar",
      label: "Ayarlar", 
      icon: Settings,
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  // Add uzman dashboard if user is logged in
  if (showUzmanDashboard) {
    navigationItems.splice(2, 0, {
      id: "uzman-dashboard",
      label: "Dashboard",
      icon: UserCheck,
      color: "text-orange-600 dark:text-orange-400"
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 z-40 shadow-lg">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex justify-around items-center py-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={cn(
                  "flex flex-col items-center px-3 py-3 rounded-xl transition-all duration-300 min-w-0 flex-1 mx-0.5 relative group",
                  "hover:bg-accent/50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
                
                <IconComponent 
                  className={cn(
                    "w-6 h-6 mb-1 transition-all duration-300",
                    isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                  )}
                />
                
                <span className={cn(
                  "text-xs font-medium text-center leading-tight transition-all duration-300",
                  isActive ? "font-semibold" : "font-normal"
                )}>
                  {item.label}
                </span>
                
                {/* Hover effect */}
                <div className={cn(
                  "absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100",
                  "bg-gradient-to-br from-primary/5 to-primary/10"
                )} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
