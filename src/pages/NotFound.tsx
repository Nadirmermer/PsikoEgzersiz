import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/50 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative text-center p-8 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 shadow-xl max-w-md mx-4">
        {/* Animated Mascot */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-full shadow-lg border-2 border-primary/20 flex items-center justify-center animate-bounce">
            <img src="/logo.png" alt="Maskot Beyin" className="w-16 h-16 object-contain drop-shadow-sm" />
          </div>
        </div>
        
        {/* Error Content */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold text-foreground">
            Sayfa Bulunamadı!
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Üzgünüz, aradığınız sayfa burada yok.<br/>
            Ama maskotumuz sizi ana sayfaya götürebilir! 🧠✨
          </p>
          
          {/* Action Button */}
          <div className="pt-4">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <span>Ana Sayfaya Dön</span>
              <span className="text-lg">🏠</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
