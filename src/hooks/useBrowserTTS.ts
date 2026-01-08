import { useState, useCallback, useEffect, useRef } from 'react';

export type TTSPersona = 'biz' | 'dev';

interface UseBrowserTTSReturn {
  speak: (text: string, persona?: TTSPersona) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

// Voice preferences for each persona
const PERSONA_VOICE_PREFERENCES: Record<TTSPersona, { gender: 'male' | 'female'; pitchMod: number; rateMod: number }> = {
  biz: { gender: 'female', pitchMod: 1.05, rateMod: 1.0 },  // Slightly higher pitch, normal speed
  dev: { gender: 'male', pitchMod: 0.95, rateMod: 1.05 },   // Slightly lower pitch, slightly faster
};

export function useBrowserTTS(): UseBrowserTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  useEffect(() => {
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      // Load voices - they may not be available immediately
      const loadVoices = () => {
        voicesLoadedRef.current = true;
      };

      // Chrome loads voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Try loading immediately (works in Firefox/Safari)
      if (speechSynthesis.getVoices().length > 0) {
        voicesLoadedRef.current = true;
      }
    }

    return () => {
      if (supported) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const getVoiceForPersona = useCallback((persona: TTSPersona): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    const prefs = PERSONA_VOICE_PREFERENCES[persona];
    
    // Prefer English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const targetVoices = englishVoices.length > 0 ? englishVoices : voices;

    // Try to find a voice matching gender preference
    // Female voices often contain words like "female", "woman", "Samantha", "Victoria", "Karen"
    // Male voices often contain words like "male", "man", "Daniel", "Alex", "David"
    const femalePatterns = /female|woman|samantha|victoria|karen|allison|susan|fiona|moira|veena|tessa|kate|emily|ellen|amy/i;
    const malePatterns = /male|man|daniel|alex|david|james|thomas|tom|lee|rishi|aaron|albert|bruce|charles|diego|fender|gordon|jorge|juan|martin|reed|rocko|sandy/i;

    const patternToMatch = prefs.gender === 'female' ? femalePatterns : malePatterns;
    
    // First try to find a voice matching the pattern
    let voice = targetVoices.find(v => patternToMatch.test(v.name));
    
    // If not found, use the first available voice
    if (!voice) {
      voice = targetVoices[0];
    }

    return voice;
  }, []);

  const speak = useCallback((text: string, persona: TTSPersona = 'biz') => {
    if (!isSupported) return;

    // Stop any current speech
    speechSynthesis.cancel();

    // Clean text for better speech (remove markdown, etc.)
    const cleanText = text
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic
      .replace(/`([^`]+)`/g, '$1') // Remove code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/[•\-]\s*/g, '') // Remove bullets
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with pause
      .replace(/\n/g, ' ') // Replace single newlines with space
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const voice = getVoiceForPersona(persona);
    if (voice) {
      utterance.voice = voice;
    }

    const prefs = PERSONA_VOICE_PREFERENCES[persona];
    utterance.pitch = prefs.pitchMod;
    utterance.rate = prefs.rateMod;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [isSupported, getVoiceForPersona]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
