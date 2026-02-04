import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ARDeviceType = 'phone' | 'realwear' | 'vuzix' | 'xreal' | 'cyan' | 'none';

export interface ARDevice {
  id: string;
  type: ARDeviceType;
  name: string;
  description: string;
  icon: string;
  features: string[];
  recommended?: boolean;
}

export interface CyanDeviceState {
  batteryLevel: number;
  isCharging: boolean;
  isRecordingVideo: boolean;
  isRecordingAudio: boolean;
  photoCount: number;
  videoCount: number;
  audioCount: number;
  firmwareVersion: string;
}

export const AR_DEVICES: ARDevice[] = [
  {
    id: 'phone',
    type: 'phone',
    name: 'Phone Camera',
    description: 'Use your smartphone as a camera fallback',
    icon: 'smartphone',
    features: ['Built-in camera', 'No additional hardware', 'PWA support'],
  },
  {
    id: 'cyan',
    type: 'cyan',
    name: 'Cyan M02S Smart Glasses',
    description: 'Consumer smart glasses with camera, voice assistant, and AI features',
    icon: 'glasses',
    features: ['Photo/Video capture', 'HeyCyan voice assistant', 'AI recognition', 'Bluetooth LE', 'Wi-Fi transfer'],
    recommended: true,
  },
  {
    id: 'realwear',
    type: 'realwear',
    name: 'RealWear Navigator',
    description: 'Enterprise-grade industrial AR headset',
    icon: 'glasses',
    features: ['Hands-free operation', 'Voice commands', 'Rugged design', 'HD camera'],
  },
  {
    id: 'vuzix',
    type: 'vuzix',
    name: 'Vuzix M400/Blade',
    description: 'Professional AR smart glasses with OEM program',
    icon: 'glasses',
    features: ['Android-based', 'Full SDK', 'White-label available', 'Lightweight'],
  },
  {
    id: 'xreal',
    type: 'xreal',
    name: 'XREAL Air 2',
    description: 'Consumer AR glasses with good SDK support',
    icon: 'glasses',
    features: ['Budget-friendly', 'Good display', 'SDK available'],
  },
];

interface DeviceStore {
  selectedDevice: ARDeviceType;
  connectedDevices: string[];
  isConnecting: boolean;
  
  setSelectedDevice: (device: ARDeviceType) => void;
  connectDevice: (deviceId: string) => void;
  disconnectDevice: (deviceId: string) => void;
  setConnecting: (connecting: boolean) => void;
}

export const useDeviceStore = create<DeviceStore>()(
  persist(
    (set, get) => ({
      selectedDevice: 'phone',
      connectedDevices: [],
      isConnecting: false,

      setSelectedDevice: (device) => set({ selectedDevice: device }),
      
      connectDevice: (deviceId) => {
        const { connectedDevices } = get();
        if (!connectedDevices.includes(deviceId)) {
          set({ connectedDevices: [...connectedDevices, deviceId] });
        }
      },
      
      disconnectDevice: (deviceId) => {
        set({
          connectedDevices: get().connectedDevices.filter(id => id !== deviceId)
        });
      },
      
      setConnecting: (isConnecting) => set({ isConnecting }),
    }),
    {
      name: 'xweldx-devices',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
