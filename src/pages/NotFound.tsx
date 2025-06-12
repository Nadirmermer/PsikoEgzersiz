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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-900/30 dark:to-purple-900/40">
      <div className="text-center p-8 rounded-2xl shadow-lg bg-white/80 dark:bg-gray-900/80 border border-primary/20">
        <img src="/logo.png" alt="Maskot Beyin" className="mx-auto w-28 h-28 mb-4 animate-bounce" />
        <h1 className="text-5xl font-extrabold text-primary mb-2">404</h1>
        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Sayfa Bulunamadı!</p>
        <p className="text-md text-gray-500 dark:text-gray-400 mb-6">Üzgünüz, aradığınız sayfa burada yok.<br/>Ama maskotumuz seni ana sayfaya götürebilir! 😊</p>
        <a href="/" className="inline-block px-6 py-3 rounded-lg bg-primary text-white font-bold shadow hover:bg-primary/90 transition">Ana Sayfaya Dön</a>
      </div>
    </div>
  );
};

export default NotFound;
