import { useState, useCallback } from 'react';

interface CapturedMedia {
  url: string;
  type: 'photo' | 'video';
  timestamp: Date;
}

export const useCameraCapture = () => {
  const [capturedMediaList, setCapturedMediaList] = useState<CapturedMedia[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const openCamera = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const addCapturedMedia = useCallback((url: string, type: 'photo' | 'video') => {
    setCapturedMediaList(prev => [
      ...prev,
      { url, type, timestamp: new Date() }
    ]);
  }, []);

  const removeCapturedMedia = useCallback((url: string) => {
    setCapturedMediaList(prev => prev.filter(m => m.url !== url));
  }, []);

  const clearAllMedia = useCallback(() => {
    setCapturedMediaList([]);
  }, []);

  return {
    capturedMediaList,
    isCameraOpen,
    openCamera,
    closeCamera,
    addCapturedMedia,
    removeCapturedMedia,
    clearAllMedia
  };
};
