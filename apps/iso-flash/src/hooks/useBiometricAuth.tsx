import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { BiometricAuth, BiometryType, CheckBiometryResult } from '@aparajita/capacitor-biometric-auth';

export interface BiometricState {
  isAvailable: boolean;
  biometryType: BiometryType;
  reason: string;
  isChecking: boolean;
}

export const useBiometricAuth = () => {
  const isNative = Capacitor.isNativePlatform();
  const [biometryInfo, setBiometryInfo] = useState<BiometricState>({
    isAvailable: false,
    biometryType: BiometryType.none,
    reason: '',
    isChecking: true,
  });

  const updateBiometryInfo = useCallback((info: CheckBiometryResult) => {
    setBiometryInfo({
      isAvailable: info.isAvailable,
      biometryType: info.biometryType,
      reason: info.reason || '',
      isChecking: false,
    });
  }, []);

  useEffect(() => {
    if (!isNative) {
      setBiometryInfo(prev => ({ ...prev, isChecking: false }));
      return;
    }

    const checkBiometry = async () => {
      try {
        const result = await BiometricAuth.checkBiometry();
        updateBiometryInfo(result);
      } catch (error) {
        console.warn('Biometry check failed:', error);
        setBiometryInfo(prev => ({ ...prev, isChecking: false }));
      }
    };

    checkBiometry();

    // Listen for app resume to update biometry status
    let listener: any;
    const setupListener = async () => {
      try {
        listener = await BiometricAuth.addResumeListener(updateBiometryInfo);
      } catch (error) {
        console.warn('Failed to add resume listener:', error);
      }
    };

    setupListener();

    return () => {
      listener?.remove();
    };
  }, [isNative, updateBiometryInfo]);

  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    if (!isNative || !biometryInfo.isAvailable) {
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason: reason || 'Please authenticate to continue',
        cancelTitle: 'Cancel',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Use Passcode',
        androidTitle: 'Authentication Required',
        androidSubtitle: 'Use biometrics to unlock',
        androidConfirmationRequired: false,
      });
      return true;
    } catch (error) {
      console.warn('Biometric authentication failed:', error);
      return false;
    }
  }, [isNative, biometryInfo.isAvailable]);

  const getBiometryName = useCallback((): string => {
    switch (biometryInfo.biometryType) {
      case BiometryType.faceId:
        return 'Face ID';
      case BiometryType.touchId:
        return 'Touch ID';
      case BiometryType.faceAuthentication:
        return 'Face Unlock';
      case BiometryType.fingerprintAuthentication:
        return 'Fingerprint';
      case BiometryType.irisAuthentication:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }, [biometryInfo.biometryType]);

  const getBiometryIcon = useCallback((): string => {
    switch (biometryInfo.biometryType) {
      case BiometryType.faceId:
      case BiometryType.faceAuthentication:
        return '👤';
      case BiometryType.touchId:
      case BiometryType.fingerprintAuthentication:
        return '👆';
      case BiometryType.irisAuthentication:
        return '👁️';
      default:
        return '🔐';
    }
  }, [biometryInfo.biometryType]);

  // Store and retrieve biometric preference
  const isBiometricEnabled = useCallback((): boolean => {
    return localStorage.getItem('biometric_enabled') === 'true';
  }, []);

  const setBiometricEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem('biometric_enabled', enabled ? 'true' : 'false');
  }, []);

  // Store credential indicator (not actual credentials for security)
  const hasStoredCredentials = useCallback((): boolean => {
    return localStorage.getItem('biometric_credentials_stored') === 'true';
  }, []);

  const setCredentialsStored = useCallback((stored: boolean) => {
    localStorage.setItem('biometric_credentials_stored', stored ? 'true' : 'false');
  }, []);

  return {
    isNative,
    isAvailable: biometryInfo.isAvailable,
    biometryType: biometryInfo.biometryType,
    isChecking: biometryInfo.isChecking,
    reason: biometryInfo.reason,
    authenticate,
    getBiometryName,
    getBiometryIcon,
    isBiometricEnabled,
    setBiometricEnabled,
    hasStoredCredentials,
    setCredentialsStored,
  };
};

export { BiometryType };
