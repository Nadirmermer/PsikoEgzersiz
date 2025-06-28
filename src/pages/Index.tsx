import { useState, useEffect } from "react";
import EgzersizlerSayfasi from "./EgzersizlerSayfasi";
import IstatistiklerSayfasi from "./IstatistiklerSayfasi";
import AyarlarSayfasi from "./AyarlarSayfasi";
import UzmanDashboardSayfasi from "./UzmanDashboardSayfasi";
import HafizaOyunuSayfasi from "./HafizaOyunuSayfasi";
import ResimKelimeEslestirmeSayfasi from "./ResimKelimeEslestirmeSayfasi";
import KelimeResimEslestirmeSayfasi from "./KelimeResimEslestirmeSayfasi";
import LondraKulesiSayfasi from "./LondraKulesiSayfasi";
import SayiDizisiTakibiSayfasi from "./SayiDizisiTakibiSayfasi";
import RenkDizisiTakibiSayfasi from "./RenkDizisiTakibiSayfasi";

import MantikDizileriSayfasi from "./MantikDizileriSayfasi";
import HanoiKuleleriSayfasi from "./HanoiKuleleriSayfasi";
import BottomNavigation from "../components/BottomNavigation";
import ClientModeHandler from "../components/ClientModeHandler";
import SkipNavigation from "../components/SkipNavigation";
import { useClientMode } from "../hooks/useClientMode";
import { useAuth } from "../contexts/AuthContext";
import { syncPendingData } from "../lib/supabaseClient";
import { useAudio } from "../hooks/useAudio";

const Index = () => {
  const { playSound } = useAudio()
  const [activePage, setActivePage] = useState("egzersizler");
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false);
  const [isImageWordMatchingActive, setIsImageWordMatchingActive] = useState(false);
  const [isWordImageMatchingActive, setIsWordImageMatchingActive] = useState(false);
  const [isTowerOfLondonActive, setIsTowerOfLondonActive] = useState(false);
  const [isNumberSequenceActive, setIsNumberSequenceActive] = useState(false);
  const [isColorSequenceActive, setIsColorSequenceActive] = useState(false);

  const [isLogicSequencesActive, setIsLogicSequencesActive] = useState(false);
  const [isHanoiTowersActive, setIsHanoiTowersActive] = useState(false);
  const { isClientMode, exitClientMode } = useClientMode();
  const { user, professional, loading: authLoading } = useAuth();

  // Handle URL parameters for navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam === 'uzman-dashboard' && professional) {
      setActivePage('uzman-dashboard');
      // Clean URL
      window.history.replaceState({}, '', '/');
    }
  }, [professional]);

  // Sync pending data on load
  useEffect(() => {
    console.log('Index - Syncing pending data on app load')
    syncPendingData();
  }, []);

  // Client mode restrictions
  useEffect(() => {
    if (isClientMode && activePage !== "egzersizler") {
      console.log('Index - Client mode active, redirecting to exercises')
      setActivePage("egzersizler");
    }
  }, [isClientMode, activePage]);

  const handleMemoryGameStart = () => {
    playSound('button-click')
    setIsMemoryGameActive(true);
  };

  const handleMemoryGameEnd = () => {
    playSound('button-click')
    setIsMemoryGameActive(false);
  };

  const handleImageWordMatchingStart = () => {
    playSound('button-click')
    setIsImageWordMatchingActive(true);
  };

  const handleImageWordMatchingEnd = () => {
    playSound('button-click')
    setIsImageWordMatchingActive(false);
  };

  const handleWordImageMatchingStart = () => {
    playSound('button-click')
    setIsWordImageMatchingActive(true);
  };

  const handleWordImageMatchingEnd = () => {
    playSound('button-click')
    setIsWordImageMatchingActive(false);
  };

  const handleTowerOfLondonStart = () => {
    playSound('button-click')
    setIsTowerOfLondonActive(true);
  };

  const handleTowerOfLondonEnd = () => {
    playSound('button-click')
    setIsTowerOfLondonActive(false);
  };

  const handleNumberSequenceStart = () => {
    playSound('button-click')
    setIsNumberSequenceActive(true);
  };

  const handleNumberSequenceEnd = () => {
    playSound('button-click')
    setIsNumberSequenceActive(false);
  };

  const handleColorSequenceStart = () => {
    playSound('button-click')
    setIsColorSequenceActive(true);
  };

  const handleColorSequenceEnd = () => {
    playSound('button-click')
    setIsColorSequenceActive(false);
  };



  const handleLogicSequencesStart = () => {
    playSound('button-click')
    setIsLogicSequencesActive(true);
  };

  const handleLogicSequencesEnd = () => {
    playSound('button-click')
    setIsLogicSequencesActive(false);
  };

  const handleHanoiTowersStart = () => {
    playSound('button-click')
    setIsHanoiTowersActive(true);
  };

  const handleHanoiTowersEnd = () => {
    playSound('button-click')
    setIsHanoiTowersActive(false);
  };

  const handlePageChange = (page: string) => {
    if (isClientMode && page !== "egzersizler") {
      console.log('Index - Page change blocked in client mode:', page)
      return;
    }
    playSound('button-click')
    console.log('Index - Page changed to:', page)
    setActivePage(page);
  };

  // Render memory game
  if (isMemoryGameActive) {
    return (
      <>
        <SkipNavigation />
        <HafizaOyunuSayfasi onBack={handleMemoryGameEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  // Render image-word matching game
  if (isImageWordMatchingActive) {
    return (
      <>
        <SkipNavigation />
        <ResimKelimeEslestirmeSayfasi onBack={handleImageWordMatchingEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  // Render word-image matching game
  if (isWordImageMatchingActive) {
    return (
      <>
        <SkipNavigation />
        <KelimeResimEslestirmeSayfasi onBack={handleWordImageMatchingEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  // Render Tower of London game
  if (isTowerOfLondonActive) {
    return (
      <>
        <SkipNavigation />
        <LondraKulesiSayfasi onBack={handleTowerOfLondonEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  // Render Number Sequence game
  if (isNumberSequenceActive) {
    return (
      <>
        <SkipNavigation />
        <SayiDizisiTakibiSayfasi onBack={handleNumberSequenceEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  // Render Color Sequence game
  if (isColorSequenceActive) {
    return (
      <>
        <SkipNavigation />
        <RenkDizisiTakibiSayfasi onBack={handleColorSequenceEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }



  // Render Logic Sequences game
  if (isLogicSequencesActive) {
    return (
      <>
        <SkipNavigation />
        <MantikDizileriSayfasi onBack={handleLogicSequencesEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  // Render Hanoi Towers game
  if (isHanoiTowersActive) {
    return (
      <>
        <SkipNavigation />
        <HanoiKuleleriSayfasi onBack={handleHanoiTowersEnd} />
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case "egzersizler":
        return (
          <EgzersizlerSayfasi 
            onMemoryGameStart={handleMemoryGameStart}
            onImageWordMatchingStart={handleImageWordMatchingStart}
            onWordImageMatchingStart={handleWordImageMatchingStart}
            onTowerOfLondonStart={handleTowerOfLondonStart}
            onNumberSequenceStart={handleNumberSequenceStart}
            onColorSequenceStart={handleColorSequenceStart}
            onLogicSequencesStart={handleLogicSequencesStart}
            onHanoiTowersStart={handleHanoiTowersStart}
          />
        );
      case "istatistikler":
        return <IstatistiklerSayfasi />;
      case "ayarlar":
        return <AyarlarSayfasi />;
      case "uzman-dashboard":
        return <UzmanDashboardSayfasi />;
      default:
        return (
          <EgzersizlerSayfasi 
            onMemoryGameStart={handleMemoryGameStart}
            onImageWordMatchingStart={handleImageWordMatchingStart}
            onWordImageMatchingStart={handleWordImageMatchingStart}
            onTowerOfLondonStart={handleTowerOfLondonStart}
            onNumberSequenceStart={handleNumberSequenceStart}
            onColorSequenceStart={handleColorSequenceStart}
            onLogicSequencesStart={handleLogicSequencesStart}
            onHanoiTowersStart={handleHanoiTowersStart}
          />
        );
    }
  };

  return (
    <>
      <SkipNavigation />
      <main className="min-h-screen bg-background text-foreground">
        {renderActivePage()}
      </main>
      
      <BottomNavigation 
        activePage={activePage} 
        setActivePage={handlePageChange}
        showUzmanDashboard={!!professional}
      />
      
      <ClientModeHandler 
        isClientMode={isClientMode}
        onExitClientMode={exitClientMode}
      />
    </>
  );
};

export default Index;
