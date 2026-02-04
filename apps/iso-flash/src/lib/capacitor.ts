import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';

export const requestCameraPermissions = async () => {
  const permissions = await Camera.requestPermissions();
  return permissions.camera === 'granted';
};

export const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    return image.webPath;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
};

export const requestLocationPermissions = async () => {
  const permissions = await Geolocation.requestPermissions();
  return permissions.location === 'granted';
};

export const getCurrentPosition = async () => {
  try {
    const position = await Geolocation.getCurrentPosition();
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

export const requestPushPermissions = async () => {
  const result = await PushNotifications.requestPermissions();
  if (result.receive === 'granted') {
    await PushNotifications.register();
  }
  return result.receive === 'granted';
};

export const addPushListener = (callback: (notification: any) => void) => {
  PushNotifications.addListener('pushNotificationReceived', callback);
  
  return () => {
    PushNotifications.removeAllListeners();
  };
};

let torchStream: MediaStream | null = null;
let torchTrack: MediaStreamTrack | null = null;

export const toggleTorch = async (enabled: boolean) => {
  try {
    if (enabled) {
      // Request camera with torch capability
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          // @ts-ignore - torch is not in the types but supported on mobile
          advanced: [{ torch: true }]
        }
      });
      
      torchStream = stream;
      torchTrack = stream.getVideoTracks()[0];
      
      // @ts-ignore - imageCapture API for torch control
      const imageCapture = new ImageCapture(torchTrack);
      await imageCapture.getPhotoCapabilities().then((capabilities: any) => {
        if (capabilities.torch) {
          // @ts-ignore
          torchTrack?.applyConstraints({ advanced: [{ torch: true }] });
        }
      }).catch(() => {
        console.log('Torch not supported on this device');
      });
    } else {
      // Turn off torch
      if (torchTrack) {
        // @ts-ignore
        torchTrack.applyConstraints({ advanced: [{ torch: false }] });
        torchTrack.stop();
      }
      if (torchStream) {
        torchStream.getTracks().forEach(track => track.stop());
        torchStream = null;
      }
      torchTrack = null;
    }
  } catch (error) {
    console.error('Error toggling torch:', error);
  }
};

export const isTorchAvailable = () => {
  return 'ImageCapture' in window && 'mediaDevices' in navigator;
};
