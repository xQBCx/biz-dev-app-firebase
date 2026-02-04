import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import {
  initPushNotifications,
  setupPushListeners,
  cleanupPushListeners,
} from '@/lib/pushNotifications';
import { toast } from 'sonner';

export function usePushNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Initialize push notifications
    const initNotifications = async () => {
      const success = await initPushNotifications(user.id);
      if (success) {
        console.log('Push notifications initialized successfully');
      }
    };

    initNotifications();

    // Setup listeners
    setupPushListeners(
      // On notification received (foreground)
      (notification) => {
        const data = notification.data;
        
        toast.info(notification.title, {
          description: notification.body,
          action: data?.sessionId ? {
            label: 'View',
            onClick: () => navigate(`/chat/${data.sessionId}`)
          } : undefined
        });
      },
      // On notification action performed (user tapped)
      (notification) => {
        const data = notification.notification.data;
        
        // Navigate based on notification type and deep link
        if (data?.deepLink) {
          // Handle custom deep link from notification
          const path = data.deepLink.replace('isoflash://', '/');
          navigate(path);
        } else if (data?.type === 'session_request') {
          navigate('/chats');
        } else if (data?.type === 'new_message' && data?.sessionId) {
          navigate(`/chat/${data.sessionId}`);
        } else if (data?.type === 'session_completed' && data?.sessionId) {
          navigate(`/chat/${data.sessionId}`);
        } else if (data?.type === 'session_accepted' && data?.sessionId) {
          navigate(`/chat/${data.sessionId}`);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      cleanupPushListeners();
    };
  }, [user, navigate]);
}
