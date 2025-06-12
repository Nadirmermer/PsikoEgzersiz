import { useState, useEffect } from "react";
import EgzersizlerSayfasi from "./EgzersizlerSayfasi";
import IstatistiklerSayfasi from "./IstatistiklerSayfasi";
import AyarlarSayfasi from "./AyarlarSayfasi";
import UzmanDashboardSayfasi from "./UzmanDashboardSayfasi";
import HafizaOyunuSayfasi from "./HafizaOyunuSayfasi";
import BottomNavigation from "../components/BottomNavigation";
import ClientModeHandler from "../components/ClientModeHandler";
import { useClientMode } from "../hooks/useClientMode";
import { useAuth } from "../contexts/AuthContext";
import { syncPendingData } from "../lib/supabaseClient";

const Index = () => {
  const [activePage, setActivePage] = useState("egzersizler");
  const [isMemoryGameActive, setIsMemoryGameActive] = useState(false);
  const { isClientMode, exitClientMode } = useClientMode();
  const { user } = useAuth();

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

  const handleMemoryGameStart = () => {
    setIsMemoryGameActive(true);
  };

  const handleMemoryGameEnd = () => {
    setIsMemoryGameActive(false);
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
      <ClientModeHandler 
        isClientMode={isClientMode} 
        onExitClientMode={exitClientMode}
      />
      
      <main className={`transition-all duration-300 ${isClientMode ? "pt-12" : ""}`}>
        <div className="fade-in">
          {renderPage()}
        </div>
      </main>
      
      {!isClientMode && (
        <BottomNavigation 
          activePage={activePage} 
          setActivePage={setActivePage}
          showUzmanDashboard={!!user}
        />
      )}
    </div>
  );
};

export default Index;
