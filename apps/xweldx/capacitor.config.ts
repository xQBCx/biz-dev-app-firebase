import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2502680435cf41a1bb028648ffdace6c',
  appName: 'pipe-guard-vision',
  webDir: 'dist',
  server: {
    url: 'https://25026804-35cf-41a1-bb02-8648ffdace6c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'Scanning for Cyan M02S glasses...',
        cancel: 'Cancel',
        availableDevices: 'Available Devices',
        noDeviceFound: 'No devices found'
      }
    }
  }
};

export default config;
