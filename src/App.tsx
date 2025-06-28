import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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

// Initial loading screen component
const InitialLoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
    <div className="text-center space-y-6 animate-fade-in">
      {/* Main Logo */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse p-4">
          <img 
            src="/logo.png" 
            alt="PsikoEgzersiz Logo" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
        
        {/* Floating animation dots */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* App Name */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">PsikoEgzersiz</h1>
        <p className="text-lg text-muted-foreground">Beyin gücünüzü artıran platform</p>
      </div>
      
      {/* Loading indicator */}
      <div className="flex items-center justify-center space-x-2 text-primary">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      
      <p className="text-sm text-muted-foreground">Yükleniyor...</p>
    </div>
  </div>
);

// Network-aware app wrapper
const AppContent = () => {
  const { loading } = useAuth();
  // Initialize network status monitoring
  useNetworkStatus();

  // Show initial loading screen while auth is initializing
  if (loading) {
    return <InitialLoadingScreen />;
  }

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
