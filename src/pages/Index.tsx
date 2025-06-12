import { useState, useEffect } from "react";
import EgzersizlerSayfasi from "./EgzersizlerSayfasi";
import IstatistiklerSayfasi from "./IstatistiklerSayfasi";
import AyarlarSayfasi from "./AyarlarSayfasi";
import UzmanDashboardSayfasi from "./UzmanDashboardSayfasi";
import HafizaOyunuSayfasi from "./HafizaOyunuSayfasi";
import BottomNavigation from "../components/BottomNavigation";
import ClientModeHandler from "../components/ClientModeHandler";
import SkipNavigation from "../components/SkipNavigation";
import { useClientMode } from "../hooks/useClientMode";
import { useAuth } from "../contexts/AuthContext";
import { syncPendingData } from "../lib/supabaseClient";

const Index = () => {
  const [activePage, setActivePage] = useState("egzersizler");
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false);
  const { isClientMode, exitClientMode } = useClientMode();
  const { user, professional } = useAuth();

  // Sync pending data on load
  useEffect(() => {
    syncPendingData();
  }, []);

  // Client mode restrictions
  useEffect(() => {
    if (isClientMode && activePage !== "egzersizler") {
      setActivePage("egzersizler");
    }
  }, [isClientMode]);

  // If professional is logged in and not in client mode, default to dashboard
  useEffect(() => {
    if (professional && !isClientMode && activePage === "egzersizler") {
      setActivePage("uzman-dashboard");
    }
  }, [professional, isClientMode]);

  // Announce page changes to screen readers
  useEffect(() => {
    const pageNames: Record<string, string> = {
      egzersizler: "Egzersizler",
      istatistikler: "İstatistikler", 
      ayarlar: "Ayarlar",
      "uzman-dashboard": "Uzman Dashboard"
    };
    
    const pageName = pageNames[activePage] || "Bilinmeyen Sayfa";
    document.title = `${pageName} - Bilişsel Egzersiz Uygulaması`;
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${pageName} sayfasına geçildi`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [activePage]);

  const handleMemoryGameStart = () => {
    setIsMemoryGameActive(true);
    document.title = "Hafıza Oyunu - Bilişsel Egzersiz Uygulaması";
  };

  const handleMemoryGameEnd = () => {
    setIsMemoryGameActive(false);
    document.title = "Egzersizler - Bilişsel Egzersiz Uygulaması";
  };

  const getPageTitle = () => {
    if (isMemoryGameActive) return "Hafıza Oyunu";
    if (isClientMode) return "Danışan Modu - Egzersizler";
    
    const titles: Record<string, string> = {
      egzersizler: "Egzersizler",
      istatistikler: "İstatistikler",
      ayarlar: "Ayarlar",
      "uzman-dashboard": "Uzman Dashboard"
    };
    
    return titles[activePage] || "Egzersizler";
  };

  const renderPage = () => {
    if (isMemoryGameActive) {
      return <HafizaOyunuSayfasi onBack={handleMemoryGameEnd} />;
    }

    // Client mode'da sadece egzersizler sayfası
    if (isClientMode) {
      return <EgzersizlerSayfasi onMemoryGameStart={handleMemoryGameStart} />;
    }

    switch (activePage) {
      case "egzersizler":
        return <EgzersizlerSayfasi onMemoryGameStart={handleMemoryGameStart} />;
      case "istatistikler":
        return <IstatistiklerSayfasi />;
      case "ayarlar":
        return <AyarlarSayfasi />;
      case "uzman-dashboard":
        return <UzmanDashboardSayfasi />;
      default:
        return <EgzersizlerSayfasi onMemoryGameStart={handleMemoryGameStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SkipNavigation />
      
      {/* Screen reader friendly page structure */}
      <div className="sr-only">
        <h1>Bilişsel Egzersiz Uygulaması</h1>
        <p>Hafıza ve dikkat geliştirme egzersizleri uygulaması</p>
      </div>

      <ClientModeHandler 
        isClientMode={isClientMode} 
        onExitClientMode={exitClientMode}
      />
      
      <main 
        id="main-content"
        className={`transition-all duration-300 ${isClientMode ? "pt-12" : ""}`}
        role="main"
        aria-label={getPageTitle()}
        tabIndex={-1}
      >
        <div className="fade-in">
          {renderPage()}
        </div>
      </main>
      
      {!isClientMode && (
        <nav 
          id="navigation"
          role="navigation" 
          aria-label="Ana navigasyon"
          className="no-print"
        >
          <BottomNavigation 
            activePage={activePage} 
            setActivePage={setActivePage}
            showUzmanDashboard={!!user}
          />
        </nav>
      )}
    </div>
  );
};

export default Index;
