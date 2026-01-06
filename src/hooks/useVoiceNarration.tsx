import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export type VoicePersona = 'biz' | 'dev';

export const useVoiceNarration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const checkPermission = useCallback(async () => {
    if (!user) {
      setHasPermission(false);
      return false;
    }

    // Check if admin
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (adminRole) {
      setHasPermission(true);
      return true;
    }

    // Check feature toggle
    const { data: toggle } = await supabase
      .from('user_feature_toggles')
      .select('is_enabled')
      .eq('user_id', user.id)
      .eq('feature_name', 'elevenlabs_voice')
      .single();

    const enabled = toggle?.is_enabled ?? false;
    setHasPermission(enabled);
    return enabled;
  }, [user]);

  const speak = useCallback(async (text: string, persona: VoicePersona = 'biz') => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use voice narration.",
        variant: "destructive",
      });
      return;
    }

    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ text, persona }),
        }
      );

      if (response.status === 403) {
        setHasPermission(false);
        toast({
          title: "Voice feature not enabled",
          description: "Contact your administrator to enable voice narration.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      setCurrentAudio(audio);
      setIsPlaying(true);
      await audio.play();
    } catch (error) {
      console.error('Voice narration error:', error);
      toast({
        title: "Voice error",
        description: "Failed to play voice narration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentAudio, toast]);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    hasPermission,
    checkPermission,
  };
};
