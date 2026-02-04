import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const useHaptics = () => {
  const isNative = Capacitor.isNativePlatform();

  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isNative) return;
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptic impact failed:', error);
    }
  };

  const notification = async (type: NotificationType = NotificationType.Success) => {
    if (!isNative) return;
    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.warn('Haptic notification failed:', error);
    }
  };

  const vibrate = async (duration: number = 300) => {
    if (!isNative) return;
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.warn('Haptic vibrate failed:', error);
    }
  };

  const selectionStart = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionStart();
    } catch (error) {
      console.warn('Haptic selection start failed:', error);
    }
  };

  const selectionChanged = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.warn('Haptic selection changed failed:', error);
    }
  };

  const selectionEnd = async () => {
    if (!isNative) return;
    try {
      await Haptics.selectionEnd();
    } catch (error) {
      console.warn('Haptic selection end failed:', error);
    }
  };

  // Convenience methods
  const lightTap = () => impact(ImpactStyle.Light);
  const mediumTap = () => impact(ImpactStyle.Medium);
  const heavyTap = () => impact(ImpactStyle.Heavy);
  const success = () => notification(NotificationType.Success);
  const warning = () => notification(NotificationType.Warning);
  const error = () => notification(NotificationType.Error);

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
    isNative,
  };
};

// Export types for convenience
export { ImpactStyle, NotificationType };
