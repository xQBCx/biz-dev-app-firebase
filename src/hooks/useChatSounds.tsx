import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'chat-sounds-enabled';

export function useChatSounds() {
  const [soundsEnabled, setSoundsEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(soundsEnabled));
  }, [soundsEnabled]);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled(prev => !prev);
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType) => {
    if (!soundsEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      // Audio not supported
    }
  }, [soundsEnabled]);

  const sounds = {
    dropIn: () => playSound(440, 0.1, 'sine'),
    processing: () => playSound(660, 0.15, 'triangle'),
    success: () => { 
      playSound(523, 0.1, 'sine'); 
      setTimeout(() => playSound(659, 0.1, 'sine'), 100); 
      setTimeout(() => playSound(784, 0.15, 'sine'), 200); 
    },
    thinking: () => playSound(330, 0.05, 'sine'),
    route: () => { 
      playSound(392, 0.08, 'sine'); 
      setTimeout(() => playSound(523, 0.12, 'sine'), 80); 
    },
  };

  return {
    soundsEnabled,
    toggleSounds,
    sounds,
  };
}
