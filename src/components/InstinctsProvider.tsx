/**
 * Unity Meridian: Instincts Provider
 * 
 * This component automatically tracks page views and provides
 * context for the Instincts system throughout the app.
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useInstincts, getModuleFromRoute } from '@/hooks/useInstincts';
import { useAuth } from '@/hooks/useAuth';

export function InstinctsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const { trackPageView, emit } = useInstincts();
  const hasTrackedSession = useRef(false);
  const previousPath = useRef<string | null>(null);

  // Track session start
  useEffect(() => {
    if (user?.id && !hasTrackedSession.current) {
      emit({
        category: 'system',
        module: 'core',
        action: 'session_started',
        context: {
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      hasTrackedSession.current = true;
    }
  }, [user?.id, emit]);

  // Track page views on route change
  useEffect(() => {
    if (user?.id && previousPath.current !== location.pathname) {
      const module = getModuleFromRoute(location.pathname);
      trackPageView(module, location.pathname);
      previousPath.current = location.pathname;
    }
  }, [location.pathname, user?.id, trackPageView]);

  // Track session end on unload
  useEffect(() => {
    const handleUnload = () => {
      if (user?.id) {
        // Use sendBeacon for reliable tracking on page unload
        const event = {
          user_id: user.id,
          category: 'system',
          module: 'core',
          action: 'session_ended',
          source_url: window.location.pathname,
          context: {},
        };
        
        // sendBeacon is more reliable for unload events
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/instincts_events`,
          JSON.stringify(event)
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user?.id]);

  return <>{children}</>;
}
