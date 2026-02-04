import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { generateProfileShareLink, generateSessionShareLink } from '@/lib/deepLinks';

export const useShare = () => {
  const canShare = async (): Promise<boolean> => {
    if (Capacitor.isNativePlatform()) {
      const result = await Share.canShare();
      return result.value;
    }
    return !!navigator.share;
  };

  const shareContent = async (options: {
    title: string;
    text: string;
    url: string;
  }): Promise<boolean> => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.title,
        });
        return true;
      } else if (navigator.share) {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(options.url);
        toast.success('Link copied to clipboard!');
        return true;
      }
    } catch (error: any) {
      // User cancelled share - not an error
      if (error?.message?.includes('cancel') || error?.name === 'AbortError') {
        return false;
      }
      console.error('Share failed:', error);
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(options.url);
        toast.success('Link copied to clipboard!');
        return true;
      } catch {
        toast.error('Unable to share');
        return false;
      }
    }
  };

  const sharePhotographerProfile = async (photographer: {
    id: string;
    full_name?: string;
    rating?: number;
    hourly_rate?: number;
  }): Promise<boolean> => {
    const url = generateProfileShareLink(photographer.id);
    const name = photographer.full_name || 'This photographer';
    const rating = photographer.rating?.toFixed(1) || '5.0';
    const rate = photographer.hourly_rate || 25;

    return shareContent({
      title: `${name} on IsoFlash`,
      text: `Check out ${name} - ${rating}★ rated photographer on IsoFlash! Book a session for $${rate}/hr.`,
      url,
    });
  };

  const shareSession = async (session: {
    id: string;
    photographer?: { full_name?: string };
    location_name?: string;
  }): Promise<boolean> => {
    const url = generateSessionShareLink(session.id);
    const photographerName = session.photographer?.full_name || 'a photographer';
    const location = session.location_name || 'a photo session';

    return shareContent({
      title: 'Photo Session on IsoFlash',
      text: `I'm having a photo session with ${photographerName} at ${location}! 📸`,
      url,
    });
  };

  return {
    canShare,
    shareContent,
    sharePhotographerProfile,
    shareSession,
  };
};
