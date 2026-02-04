import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c2cbdc2ca0db453b9a184c72187c6aa8',
  appName: 'ISO Flash',
  webDir: 'dist',
  server: {
    url: 'https://c2cbdc2c-a0db-453b-9a18-4c72187c6aa8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      saveToGallery: true,
      presentationStyle: 'fullscreen'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a1a',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'isoflash'
  },
  android: {
    backgroundColor: '#1a1a1a',
    allowMixedContent: true
  }
};

export default config;
