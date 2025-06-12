import { useState, useEffect } from "react";
import EgzersizlerSayfasi from "./EgzersizlerSayfasi";
import IstatistiklerSayfasi from "./IstatistiklerSayfasi";
import AyarlarSayfasi from "./AyarlarSayfasi";
import UzmanDashboardSayfasi from "./UzmanDashboardSayfasi";
import HafizaOyunuSayfasi from "./HafizaOyunuSayfasi";
import ResimKelimeEslestirmeSayfasi from "./ResimKelimeEslestirmeSayfasi";
import KelimeResimEslestirmeSayfasi from "./KelimeResimEslestirmeSayfasi";
import LondraKulesiSayfasi from "./LondraKulesiSayfasi";
import BottomNavigation from "../components/BottomNavigation";
import ClientModeHandler from "../components/ClientModeHandler";
import SkipNavigation from "../components/SkipNavigation";
import { useClientMode } from "../hooks/useClientMode";
import { useAuth } from "../contexts/AuthContext";
import { syncPendingData } from "../lib/supabaseClient";

const Index = () => {
  const [activePage, setActivePage] = useState("egzersizler");
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false);
  const [isImageWordMatchingActive, setIsImageWordMatchingActive] = useState(false);
  const [isWordImageMatchingActive, setIsWordImageMatchingActive] = useState(false);
  const [isTowerOfLondonActive, setIsTowerOfLondonActive] = useState(false);
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
    setIsMemoryGameActive(true);
  };

  const handleMemoryGameEnd = () => {
    setIsMemoryGameActive(false);
  };

  const handleImageWordMatchingStart = () => {
    setIsImageWordMatchingActive(true);
  };

  const handleImageWordMatchingEnd = () => {
    setIsImageWordMatchingActive(false);
  };

  const handleWordImageMatchingStart = () => {
    setIsWordImageMatchingActive(true);
  };

  const handleWordImageMatchingEnd = () => {
    setIsWordImageMatchingActive(false);
  };

  const handleTowerOfLondonStart = () => {
    setIsTowerOfLondonActive(true);
  };

  const handleTowerOfLondonEnd = () => {
    setIsTowerOfLondonActive(false);
  };

  const handlePageChange = (page: string) => {
    if (isClientMode && page !== "egzersizler") {
      console.log('Index - Page change blocked in client mode:', page)
      return;
    }
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

  const renderActivePage = () => {
    switch (activePage) {
      case "egzersizler":
        return (
          <EgzersizlerSayfasi 
            onMemoryGameStart={handleMemoryGameStart}
            onImageWordMatchingStart={handleImageWordMatchingStart}
            onWordImageMatchingStart={handleWordImageMatchingStart}
            onTowerOfLondonStart={handleTowerOfLondonStart}
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
        isClientMode={isClientMode}
      />
      
      <ClientModeHandler 
        isClientMode={isClientMode}
        onExitClientMode={exitClientMode}
      />
    </>
  );
};

export default Index;
