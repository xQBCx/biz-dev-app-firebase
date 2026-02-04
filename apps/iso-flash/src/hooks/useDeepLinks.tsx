import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { initDeepLinks, setDeepLinkHandler, cleanupDeepLinks } from '@/lib/deepLinks';

export function useDeepLinks() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Set up the handler that will process deep links
    setDeepLinkHandler((path, params) => {
      console.log('Deep link handler called:', { path, params: Object.fromEntries(params) });

      // Handle different deep link paths
      switch (true) {
        // Referral links: /?ref=CODE or /ref/CODE
        case path === '/' && params.has('ref'):
          const refCode = params.get('ref');
          if (refCode) {
            sessionStorage.setItem('referral_code', refCode);
          }
          navigate('/login');
          break;

        // Chat/session links: /chat?session=ID or /chat/ID
        case path.startsWith('/chat'):
          const sessionId = params.get('session') || path.split('/').pop();
          if (sessionId && sessionId !== 'chat') {
            navigate(`/chat/${sessionId}`);
          } else {
            navigate('/chats');
          }
          break;

        // Profile links: /profile?id=ID
        case path === '/profile':
          const profileId = params.get('id');
          if (profileId) {
            // Navigate to profile with ID param
            navigate(`/profile?id=${profileId}`);
          } else {
            navigate('/profile');
          }
          break;

        // Direct path navigation
        case path === '/home':
        case path === '/map':
        case path === '/chats':
        case path === '/editing':
        case path === '/privacy':
        case path === '/terms':
          navigate(path);
          break;

        // Login/signup
        case path === '/login':
          navigate('/login');
          break;

        // Default to home for authenticated users
        default:
          navigate('/home');
          break;
      }
    });

    // Initialize deep link listeners
    initDeepLinks();

    // Cleanup on unmount
    return () => {
      cleanupDeepLinks();
    };
  }, [navigate]);
}
