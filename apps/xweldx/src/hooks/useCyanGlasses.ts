import { useState, useEffect, useCallback } from 'react';
import { cyanGlassesService, CyanGlassesState, CyanGlassesEvent } from '@/services/cyanGlassesService';
import { useDeviceStore } from '@/stores/deviceStore';
import { toast } from 'sonner';

export interface UseCyanGlassesResult {
  // Connection state
  isSupported: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Device state
  state: CyanGlassesState;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  capturePhoto: () => Promise<void>;
  toggleVideoRecording: () => Promise<void>;
  toggleAudioRecording: () => Promise<void>;
  refreshState: () => Promise<void>;
}

export function useCyanGlasses(): UseCyanGlassesResult {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<CyanGlassesState>({
    batteryLevel: 0,
    isCharging: false,
    isRecordingVideo: false,
    isRecordingAudio: false,
    photoCount: 0,
    videoCount: 0,
    audioCount: 0,
    firmwareVersion: 'Unknown',
  });
  
  const { connectDevice, disconnectDevice, setSelectedDevice } = useDeviceStore();
  
  const isSupported = cyanGlassesService.isSupported();

  // Subscribe to service events
  useEffect(() => {
    const unsubscribe = cyanGlassesService.addEventListener((event: CyanGlassesEvent) => {
      switch (event.type) {
        case 'connected':
          setIsConnected(true);
          setIsConnecting(false);
          connectDevice('cyan');
          setSelectedDevice('cyan');
          toast.success('Cyan M02S connected', {
            description: 'Smart glasses paired successfully',
          });
          break;
          
        case 'disconnected':
          setIsConnected(false);
          setIsConnecting(false);
          disconnectDevice('cyan');
          setState({
            batteryLevel: 0,
            isCharging: false,
            isRecordingVideo: false,
            isRecordingAudio: false,
            photoCount: 0,
            videoCount: 0,
            audioCount: 0,
            firmwareVersion: 'Unknown',
          });
          toast.info('Cyan M02S disconnected');
          break;
          
        case 'batteryUpdate':
          setState(prev => ({
            ...prev,
            batteryLevel: (event.data as { batteryLevel: number }).batteryLevel,
            isCharging: (event.data as { isCharging: boolean }).isCharging,
          }));
          break;
          
        case 'mediaCountsUpdate':
          const counts = event.data as { photoCount: number; videoCount: number; audioCount: number };
          setState(prev => ({
            ...prev,
            photoCount: counts.photoCount,
            videoCount: counts.videoCount,
            audioCount: counts.audioCount,
          }));
          break;
          
        case 'photoCaptured':
          setState(prev => ({ ...prev, photoCount: prev.photoCount + 1 }));
          toast.success('Photo captured');
          break;
          
        case 'videoStarted':
          setState(prev => ({ ...prev, isRecordingVideo: true }));
          toast.info('Video recording started');
          break;
          
        case 'videoStopped':
          setState(prev => ({ ...prev, isRecordingVideo: false, videoCount: prev.videoCount + 1 }));
          toast.success('Video recording saved');
          break;
          
        case 'audioStarted':
          setState(prev => ({ ...prev, isRecordingAudio: true }));
          toast.info('Audio recording started');
          break;
          
        case 'audioStopped':
          setState(prev => ({ ...prev, isRecordingAudio: false, audioCount: prev.audioCount + 1 }));
          toast.success('Audio recording saved');
          break;
          
        case 'error':
          toast.error('Glasses error', {
            description: event.data as string,
          });
          setIsConnecting(false);
          break;
      }
    });

    // Check initial connection state
    setIsConnected(cyanGlassesService.isConnected());
    if (cyanGlassesService.isConnected()) {
      setState(cyanGlassesService.getState());
    }

    return unsubscribe;
  }, [connectDevice, disconnectDevice, setSelectedDevice]);

  const connect = useCallback(async () => {
    if (!isSupported) {
      const platform = cyanGlassesService.getPlatform();
      toast.error('Bluetooth not supported', {
        description: platform === 'web' 
          ? 'Please use Chrome, Edge, or Opera browser on desktop, or install the native app for iOS/Android'
          : 'Bluetooth is not available on this device',
      });
      return;
    }
    
    setIsConnecting(true);
    const success = await cyanGlassesService.connect();
    if (!success) {
      setIsConnecting(false);
    }
  }, [isSupported]);

  const disconnect = useCallback(async () => {
    await cyanGlassesService.disconnect();
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!isConnected) {
      toast.error('Glasses not connected');
      return;
    }
    
    try {
      await cyanGlassesService.capturePhoto();
    } catch (error) {
      toast.error('Failed to capture photo');
    }
  }, [isConnected]);

  const toggleVideoRecording = useCallback(async () => {
    if (!isConnected) {
      toast.error('Glasses not connected');
      return;
    }
    
    try {
      if (state.isRecordingVideo) {
        await cyanGlassesService.stopVideoRecording();
      } else {
        await cyanGlassesService.startVideoRecording();
      }
    } catch (error) {
      toast.error('Failed to toggle video recording');
    }
  }, [isConnected, state.isRecordingVideo]);

  const toggleAudioRecording = useCallback(async () => {
    if (!isConnected) {
      toast.error('Glasses not connected');
      return;
    }
    
    try {
      if (state.isRecordingAudio) {
        await cyanGlassesService.stopAudioRecording();
      } else {
        await cyanGlassesService.startAudioRecording();
      }
    } catch (error) {
      toast.error('Failed to toggle audio recording');
    }
  }, [isConnected, state.isRecordingAudio]);

  const refreshState = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      await cyanGlassesService.getBatteryStatus();
      await cyanGlassesService.getMediaCounts();
    } catch (error) {
      console.error('Failed to refresh state:', error);
    }
  }, [isConnected]);

  return {
    isSupported,
    isConnected,
    isConnecting,
    state,
    connect,
    disconnect,
    capturePhoto,
    toggleVideoRecording,
    toggleAudioRecording,
    refreshState,
  };
}
