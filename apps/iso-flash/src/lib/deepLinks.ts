import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export type DeepLinkHandler = (path: string, params: URLSearchParams) => void;

let deepLinkHandler: DeepLinkHandler | null = null;

export const setDeepLinkHandler = (handler: DeepLinkHandler) => {
  deepLinkHandler = handler;
};

export const initDeepLinks = () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  // Handle app opened via deep link
  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    console.log('Deep link opened:', event.url);
    handleDeepLink(event.url);
  });

  // Check if app was opened with a URL (cold start)
  App.getLaunchUrl().then((result) => {
    if (result?.url) {
      console.log('App launched with URL:', result.url);
      handleDeepLink(result.url);
    }
  });
};

export const handleDeepLink = (url: string) => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const params = urlObj.searchParams;

    console.log('Processing deep link:', { path, params: Object.fromEntries(params) });

    if (deepLinkHandler) {
      deepLinkHandler(path, params);
    }
  } catch (error) {
    console.error('Error parsing deep link:', error);
  }
};

export const cleanupDeepLinks = () => {
  App.removeAllListeners();
};

// Generate shareable deep links
export const generateShareLink = (path: string, params?: Record<string, string>): string => {
  const baseUrl = 'https://isoflash.app';
  const url = new URL(path, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
};

// Generate specific share links
export const generateProfileShareLink = (userId: string): string => {
  return generateShareLink('/profile', { id: userId });
};

export const generateSessionShareLink = (sessionId: string): string => {
  return generateShareLink('/chat', { session: sessionId });
};

export const generateReferralLink = (referralCode: string): string => {
  return generateShareLink('/', { ref: referralCode });
};
