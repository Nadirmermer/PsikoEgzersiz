
import React from 'react'
import { cn } from '@/lib/utils'

interface BottomNavigationProps {
  activeTab: 'exercises' | 'statistics' | 'settings'
  onTabChange: (tab: 'exercises' | 'statistics' | 'settings') => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'exercises' as const, 
      label: 'Egzersizler', 
      icon: '🧠',
      description: 'Bilişsel egzersizler'
    },
    { 
      id: 'statistics' as const, 
      label: 'İstatistikler', 
      icon: '📊',
      description: 'Performans takibi'
    },
    { 
      id: 'settings' as const, 
      label: 'Ayarlar', 
      icon: '⚙️',
      description: 'Uygulama ayarları'
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center px-4 py-3 rounded-lg transition-all duration-200 min-w-0 flex-1 mx-1",
                "hover:bg-accent/50 active:scale-95",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-xl mb-1" role="img" aria-label={tab.description}>
                {tab.icon}
              </span>
              <span className="text-xs font-medium text-center leading-tight">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation
