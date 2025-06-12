
import React, { useState } from 'react'
import BottomNavigation from '../components/BottomNavigation'
import EgzersizlerSayfasi from './EgzersizlerSayfasi'
import IstatistiklerSayfasi from './IstatistiklerSayfasi'
import AyarlarSayfasi from './AyarlarSayfasi'
import HafizaOyunuSayfasi from './HafizaOyunuSayfasi'

type ActiveTab = 'exercises' | 'statistics' | 'settings' | 'memory-game'

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('exercises')

  const handleMemoryGameStart = () => {
    setActiveTab('memory-game')
  }

  const handleBackToExercises = () => {
    setActiveTab('exercises')
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'exercises':
        return <EgzersizlerSayfasi onMemoryGameStart={handleMemoryGameStart} />
      case 'statistics':
        return <IstatistiklerSayfasi />
      case 'settings':
        return <AyarlarSayfasi />
      case 'memory-game':
        return <HafizaOyunuSayfasi onBack={handleBackToExercises} />
      default:
        return <EgzersizlerSayfasi onMemoryGameStart={handleMemoryGameStart} />
    }
  }

  const showBottomNavigation = activeTab !== 'memory-game'

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen">
        {renderActiveTab()}
      </main>
      {showBottomNavigation && (
        <BottomNavigation 
          activeTab={activeTab as Exclude<ActiveTab, 'memory-game'>} 
          onTabChange={setActiveTab} 
        />
      )}
    </div>
  )
}

export default Index
