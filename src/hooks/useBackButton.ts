import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

interface UseBackButtonProps {
  activePage: string;
  isInGame: boolean;
  isGamePlaying?: boolean;
  onNavigateBack: () => void;
  onExitApp: () => void;
  onExitGame?: () => void;
}

export const useBackButton = ({ 
  activePage, 
  isInGame, 
  isGamePlaying = false,
  onNavigateBack, 
  onExitApp,
  onExitGame
}: UseBackButtonProps) => {
  
  useEffect(() => {
    // Sadece mobil platformlarda çalışsın
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let exitToast: string | number | undefined;
    let gameExitToast: string | number | undefined;

    const handleBackButton = () => {
      // Eğer oyun/egzersiz modundaysa
      if (isInGame) {
        // Oyun oynanıyorsa onay iste (üst buton gibi)
        if (isGamePlaying) {
          // Eğer zaten bir oyun çıkış toast'ı gösteriliyorsa, çık
          if (gameExitToast) {
            toast.dismiss(gameExitToast);
            if (onExitGame) {
              onExitGame();
            }
            return;
          }

          // Oyun çıkış onayı toast'ı göster
          gameExitToast = toast.warning('Egzersizden çıkmak için tekrar geri tuşuna basın', {
            duration: 3000,
            action: {
              label: 'Çık',
              onClick: () => {
                if (onExitGame) {
                  onExitGame();
                }
              }
            },
            onDismiss: () => {
              gameExitToast = undefined;
            }
          });

          // 3 saniye sonra toast'ı temizle
          setTimeout(() => {
            gameExitToast = undefined;
          }, 3000);

        } else {
          // Oyun oynanmıyorsa (hazırlık, tamamlanma ekranı) direkt çık
          if (onExitGame) {
            onExitGame();
          }
        }
        return;
      }

      // Eğer ana sayfadaysa (egzersizler) → Çıkış onayı
      if (activePage === 'egzersizler') {
        // Eğer zaten bir çıkış toast'ı gösteriliyorsa, uygulamadan çık
        if (exitToast) {
          toast.dismiss(exitToast);
          onExitApp();
          return;
        }

        // Çıkış onayı toast'ı göster
        exitToast = toast.info('Uygulamadan çıkmak için tekrar geri tuşuna basın', {
          duration: 3000,
          action: {
            label: 'Çık',
            onClick: onExitApp
          },
          onDismiss: () => {
            exitToast = undefined;
          }
        });

        // 3 saniye sonra toast'ı temizle
        setTimeout(() => {
          exitToast = undefined;
        }, 3000);

      } else {
        // Diğer sayfalardaysa → Önceki sayfaya git
        onNavigateBack();
      }
    };

    // Back button listener'ı ekle
    let backButtonListener: any;
    
    const addListener = async () => {
      backButtonListener = await App.addListener('backButton', handleBackButton);
    };
    
    addListener();

    // Cleanup
    return () => {
      if (backButtonListener?.remove) {
        backButtonListener.remove();
      }
      if (exitToast) {
        toast.dismiss(exitToast);
      }
      if (gameExitToast) {
        toast.dismiss(gameExitToast);
      }
    };
  }, [activePage, isInGame, isGamePlaying, onNavigateBack, onExitApp, onExitGame]);
}; 