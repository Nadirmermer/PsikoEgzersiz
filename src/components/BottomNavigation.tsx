import React from 'react'
import { cn } from '@/lib/utils'

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
      icon: "💪"
    },
    {
      id: "istatistikler", 
      label: "İstatistikler",
      icon: "📊"
    },
    {
      id: "ayarlar",
      label: "Ayarlar", 
      icon: "⚙️"
    }
  ];

  // Add uzman dashboard if user is logged in
  if (showUzmanDashboard) {
    navigationItems.splice(2, 0, {
      id: "uzman-dashboard",
      label: "Dashboard",
      icon: "👨‍⚕️"
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex flex-col items-center px-4 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1 mx-1",
                "hover:bg-accent/50 active:scale-95",
                activePage === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xl mb-1" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <span className="text-xs font-medium text-center leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
