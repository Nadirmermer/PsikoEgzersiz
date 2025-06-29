import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card"
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

// 🚀 PERFORMANCE: Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Card className="w-full max-w-md mx-4">
      <CardContent className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Sayfa yükleniyor...</p>
      </CardContent>
    </Card>
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

  // 🚀 İYİLEŞTİRME: URL parameter handling ve custom event listener
  useEffect(() => {
    const handleUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      
      if (pageParam === 'uzman-dashboard') {
        // Professional varsa veya auth loading bitmişse dashboard'a git
        if (professional || (!authLoading && user)) {
          console.log('Index - Navigating to dashboard from URL parameter')
          setActivePage('uzman-dashboard');
          // URL'i temizle
          window.history.replaceState({}, '', '/');
        } else if (!authLoading && !user) {
          // Auth loading bitti ama user yok - URL'i temizle
          console.log('Index - No user found, clearing URL parameter')
          window.history.replaceState({}, '', '/');
          setActivePage('egzersizler');
        }
      }
    }

    // İlk load'da kontrol et
    handleUrlParams()

    // Custom event listener - ClientModeHandler'dan gelen navigasyon için
    const handleNavigateEvent = (event: CustomEvent<{ page: string }>) => {
      console.log('Index - Custom navigation event received:', event.detail.page)
      if (event.detail.page === 'uzman-dashboard' && (professional || user)) {
        setActivePage('uzman-dashboard')
      }
    }

    // Event listener ekle
    window.addEventListener('navigateToPage', handleNavigateEvent as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('navigateToPage', handleNavigateEvent as EventListener)
    }
  }, [professional, authLoading, user])

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

  // 🚀 İYİLEŞTİRME: ClientModeHandler navigation callback
  const handleNavigateToDashboard = useCallback(() => {
    console.log('Index - Navigating to dashboard via callback')
    if (professional || user) {
      setActivePage('uzman-dashboard')
    } else {
      console.warn('Index - Cannot navigate to dashboard: no professional/user data')
      // Fallback to egzersizler
      setActivePage('egzersizler')
    }
  }, [professional, user])

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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
          onNavigateToDashboard={handleNavigateToDashboard}
          showHeader={false}
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
      
      {/* 🚀 İYİLEŞTİRME: Danışan modunda bottom navigation gizli */}
      {!isClientMode && (
        <BottomNavigation 
          activePage={activePage} 
          setActivePage={handlePageChange}
          showUzmanDashboard={!!professional}
        />
      )}
      
      {/* Ana sayfalarda header gösterilir (showHeader default true) */}
      <ClientModeHandler 
        isClientMode={isClientMode}
        onExitClientMode={exitClientMode}
        onNavigateToDashboard={handleNavigateToDashboard}
      />
    </>
  );
};

export default Index;
