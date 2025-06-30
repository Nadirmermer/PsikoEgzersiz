import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface UseBackButtonProps {
  activePage: string;
  onNavigateBack: () => void;
  onExitApp: () => void;
}

export const useBackButton = ({ 
  activePage, 
  onNavigateBack, 
  onExitApp,
}: UseBackButtonProps) => {
  const exitToastRef = useRef<string | number | undefined>();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleBackButton = () => {
      // Eğer ana Egzersizler sayfasındaysa, çıkış için onayla
      if (activePage === 'egzersizler') {
        if (exitToastRef.current) {
          toast.dismiss(exitToastRef.current);
          onExitApp();
          return;
        }

        exitToastRef.current = toast.info('Uygulamadan çıkmak için tekrar geri tuşuna basın.', {
          duration: 2000,
          onDismiss: () => {
            exitToastRef.current = undefined;
          },
        });
      } else {
        // Diğer tüm sayfalarda sadece bir önceki sayfaya git
        onNavigateBack();
      }
    };

    const listener = App.addListener('backButton', handleBackButton);

    return () => {
      listener.then(l => l.remove());
      if (exitToastRef.current) {
        toast.dismiss(exitToastRef.current);
      }
    };
  }, [activePage, onNavigateBack, onExitApp]);
}; 