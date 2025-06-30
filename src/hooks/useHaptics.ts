import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const useHaptics = () => {
  const impact = async (style: ImpactStyle = ImpactStyle.Light) => {
    await Haptics.impact({ style });
  };

  const notification = async (type: NotificationType) => {
    await Haptics.notification({ type });
  };

  const selectionStart = async () => {
    await Haptics.selectionStart();
  };

  const selectionChanged = async () => {
     await Haptics.selectionChanged();
  };

  const selectionEnd = async () => {
     await Haptics.selectionEnd();
  };

  return {
    impact,
    notification,
    selectionStart,
    selectionChanged,
    selectionEnd
  };
}; 