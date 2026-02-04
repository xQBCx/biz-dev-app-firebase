import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export const initPushNotifications = async (userId: string) => {
  // Check if push notifications are supported
  if (!Capacitor.isNativePlatform()) {
    console.log('Push notifications are only supported on mobile devices');
    return false;
  }

  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    
    if (permResult.receive === 'granted') {
      // Register with Apple / Google to receive push notifications
      await PushNotifications.register();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
};

export const savePushToken = async (token: string, userId: string) => {
  try {
    const platform = Capacitor.getPlatform();
    
    // Save token to database
    const { error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: userId,
        token,
        platform: platform === 'ios' ? 'ios' : 'android',
      }, {
        onConflict: 'user_id,token'
      });

    if (error) throw error;
    console.log('Push token saved successfully');
  } catch (error) {
    console.error('Error saving push token:', error);
  }
};

export const removePushToken = async (token: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('token', token);

    if (error) throw error;
    console.log('Push token removed successfully');
  } catch (error) {
    console.error('Error removing push token:', error);
  }
};

export const setupPushListeners = (
  onNotificationReceived?: (notification: any) => void,
  onNotificationActionPerformed?: (notification: any) => void
) => {
  // Called when a notification is received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Called when user taps on a notification
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed:', notification);
    onNotificationActionPerformed?.(notification);
  });

  // Called when device successfully registers for push notifications
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success, token:', token.value);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await savePushToken(token.value, user.id);
    }
  });

  // Called when there's an error during registration
  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });
};

export const cleanupPushListeners = () => {
  PushNotifications.removeAllListeners();
};
