
import React, { useState } from 'react'
import BottomNavigation from '../components/BottomNavigation'
import EgzersizlerSayfasi from './EgzersizlerSayfasi'
import IstatistiklerSayfasi from './IstatistiklerSayfasi'
import AyarlarSayfasi from './AyarlarSayfasi'

type ActiveTab = 'exercises' | 'statistics' | 'settings'

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('exercises')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'exercises':
        return <EgzersizlerSayfasi />
      case 'statistics':
        return <IstatistiklerSayfasi />
      case 'settings':
        return <AyarlarSayfasi />
      default:
        return <EgzersizlerSayfasi />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen">
        {renderActiveTab()}
      </main>
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  )
}

export default Index
