import { useState, useEffect, useCallback, lazy, Suspense } from "react";
// Logo-based loading, no card needed
import { Loader2 } from "lucide-react"
import BottomNavigation from "../components/BottomNavigation";
import ClientModeHandler from "../components/ClientModeHandler";
import SkipNavigation from "../components/SkipNavigation";
import { useClientMode } from "../hooks/useClientMode";
import { useAuth } from "../contexts/AuthContext";
import { syncPendingData } from "../lib/supabaseClient";
import { useAudio } from "../hooks/useAudio";

// 🚀 PERFORMANCE: Lazy load page components to reduce initial bundle size
const EgzersizlerSayfasi = lazy(() => import("./EgzersizlerSayfasi"));
const IstatistiklerSayfasi = lazy(() => import("./IstatistiklerSayfasi"));
const AyarlarSayfasi = lazy(() => import("./AyarlarSayfasi"));
const UzmanDashboardSayfasi = lazy(() => import("./UzmanDashboardSayfasi"));
const HafizaOyunuSayfasi = lazy(() => import("./HafizaOyunuSayfasi"));
const ResimKelimeEslestirmeSayfasi = lazy(() => import("./ResimKelimeEslestirmeSayfasi"));
const KelimeResimEslestirmeSayfasi = lazy(() => import("./KelimeResimEslestirmeSayfasi"));
const LondraKulesiSayfasi = lazy(() => import("./LondraKulesiSayfasi"));
const SayiDizisiTakibiSayfasi = lazy(() => import("./SayiDizisiTakibiSayfasi"));
const RenkDizisiTakibiSayfasi = lazy(() => import("./RenkDizisiTakibiSayfasi"));
const MantikDizileriSayfasi = lazy(() => import("./MantikDizileriSayfasi"));
const HanoiKuleleriSayfasi = lazy(() => import("./HanoiKuleleriSayfasi"));

// 🚀 PERFORMANCE: Loading fallback component with logo
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      {/* Logo */}
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg p-3">
        <img 
          src="/logo.png" 
          alt="PsikoEgzersiz Logo" 
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>
      
      {/* Loading spinner */}
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="absolute inset-0 h-8 w-8 mx-auto border-2 border-primary/20 rounded-full"></div>
      </div>
      
      {/* Loading text */}
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">PsikoEgzersiz</p>
        <p className="text-sm text-muted-foreground">Beyin gücünüzü artırın...</p>
      </div>
    </div>
  </div>
)

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

  // 🚀 PERFORMANCE: Memoized game state handlers to prevent re-renders
  const handleMemoryGameStart = useCallback(() => {
    playSound('button-click')
    setIsMemoryGameActive(true);
  }, [playSound]);

  const handleMemoryGameEnd = useCallback(() => {
    playSound('button-click')
    setIsMemoryGameActive(false);
  }, [playSound]);

  const handleImageWordMatchingStart = useCallback(() => {
    playSound('button-click')
    setIsImageWordMatchingActive(true);
  }, [playSound]);

  const handleImageWordMatchingEnd = useCallback(() => {
    playSound('button-click')
    setIsImageWordMatchingActive(false);
  }, [playSound]);

  const handleWordImageMatchingStart = useCallback(() => {
    playSound('button-click')
    setIsWordImageMatchingActive(true);
  }, [playSound]);

  const handleWordImageMatchingEnd = useCallback(() => {
    playSound('button-click')
    setIsWordImageMatchingActive(false);
  }, [playSound]);

  const handleTowerOfLondonStart = useCallback(() => {
    playSound('button-click')
    setIsTowerOfLondonActive(true);
  }, [playSound]);

  const handleTowerOfLondonEnd = useCallback(() => {
    playSound('button-click')
    setIsTowerOfLondonActive(false);
  }, [playSound]);

  const handleNumberSequenceStart = useCallback(() => {
    playSound('button-click')
    setIsNumberSequenceActive(true);
  }, [playSound]);

  const handleNumberSequenceEnd = useCallback(() => {
    playSound('button-click')
    setIsNumberSequenceActive(false);
  }, [playSound]);

  const handleColorSequenceStart = useCallback(() => {
    playSound('button-click')
    setIsColorSequenceActive(true);
  }, [playSound]);

  const handleColorSequenceEnd = useCallback(() => {
    playSound('button-click')
    setIsColorSequenceActive(false);
  }, [playSound]);

  const handleLogicSequencesStart = useCallback(() => {
    playSound('button-click')
    setIsLogicSequencesActive(true);
  }, [playSound]);

  const handleLogicSequencesEnd = useCallback(() => {
    playSound('button-click')
    setIsLogicSequencesActive(false);
  }, [playSound]);

  const handleHanoiTowersStart = useCallback(() => {
    playSound('button-click')
    setIsHanoiTowersActive(true);
  }, [playSound]);

  const handleHanoiTowersEnd = useCallback(() => {
    playSound('button-click')
    setIsHanoiTowersActive(false);
  }, [playSound]);

  // 🚀 PERFORMANCE: Optimized page change handler with useCallback
  const handlePageChange = useCallback((page: string) => {
    if (isClientMode && page !== "egzersizler") {
      console.log('Index - Page change blocked in client mode:', page)
      return;
    }
    
    // Use requestAnimationFrame to defer the heavy operation
    requestAnimationFrame(() => {
      playSound('button-click')
      console.log('Index - Page changed to:', page)
      setActivePage(page);
    });
  }, [isClientMode, playSound]);

  // 🚀 PERFORMANCE: Memoized page renderer to prevent unnecessary re-renders
  const renderActivePage = useCallback(() => {
    const commonProps = {
      onMemoryGameStart: handleMemoryGameStart,
      onImageWordMatchingStart: handleImageWordMatchingStart,
      onWordImageMatchingStart: handleWordImageMatchingStart,
      onTowerOfLondonStart: handleTowerOfLondonStart,
      onNumberSequenceStart: handleNumberSequenceStart,
      onColorSequenceStart: handleColorSequenceStart,
      onLogicSequencesStart: handleLogicSequencesStart,
      onHanoiTowersStart: handleHanoiTowersStart,
    };

    switch (activePage) {
      case "egzersizler":
        return <EgzersizlerSayfasi {...commonProps} />;
      case "istatistikler":
        return <IstatistiklerSayfasi />;
      case "ayarlar":
        return <AyarlarSayfasi />;
      case "uzman-dashboard":
        return <UzmanDashboardSayfasi />;
      default:
        return <EgzersizlerSayfasi {...commonProps} />;
    }
  }, [
    activePage,
    handleMemoryGameStart,
    handleImageWordMatchingStart,
    handleWordImageMatchingStart,
    handleTowerOfLondonStart,
    handleNumberSequenceStart,
    handleColorSequenceStart,
    handleLogicSequencesStart,
    handleHanoiTowersStart,
  ]);

  // Render memory game
  if (isMemoryGameActive) {
    return (
      <>
        <SkipNavigation />
        <Suspense fallback={<LoadingFallback />}>
          <HafizaOyunuSayfasi onBack={handleMemoryGameEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <ResimKelimeEslestirmeSayfasi onBack={handleImageWordMatchingEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <KelimeResimEslestirmeSayfasi onBack={handleWordImageMatchingEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <LondraKulesiSayfasi onBack={handleTowerOfLondonEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <SayiDizisiTakibiSayfasi onBack={handleNumberSequenceEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <RenkDizisiTakibiSayfasi onBack={handleColorSequenceEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <MantikDizileriSayfasi onBack={handleLogicSequencesEnd} />
        </Suspense>
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
        <Suspense fallback={<LoadingFallback />}>
          <HanoiKuleleriSayfasi onBack={handleHanoiTowersEnd} />
        </Suspense>
        <ClientModeHandler 
          isClientMode={isClientMode}
          onExitClientMode={exitClientMode}
        />
      </>
    );
  }

  return (
    <>
      <SkipNavigation />
      <main className="min-h-screen bg-background text-foreground">
        <Suspense fallback={<LoadingFallback />}>
          {renderActivePage()}
        </Suspense>
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
