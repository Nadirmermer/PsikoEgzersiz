import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on network errors, but retry on other errors up to 2 times
        if (!navigator.onLine) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    },
  },
});

// Network-aware app wrapper
const AppContent = () => {
  // Initialize network status monitoring
  useNetworkStatus();
  const { theme } = useTheme();

  useEffect(() => {
    // This code will only run on native mobile platforms
    if (Capacitor.isNativePlatform()) {
      const setStatusBarStyle = async () => {
        // Set the status bar style based on the current theme
        await StatusBar.setStyle({
          style: theme === 'dark' ? Style.Dark : Style.Light,
        });
      };
      setStatusBarStyle();
    }
  }, [theme]); // Rerun this effect when the theme changes

  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};

const App = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      // Custom error handling for production monitoring
      console.error('🚨 App-level Error:', { error, errorInfo });
      
      // You can add error reporting service here
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
