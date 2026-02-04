# Push Notifications Setup Guide

This app has push notification infrastructure set up, but requires additional configuration for production use.

## Current Implementation

The app includes:
- ✅ Database tables for device tokens and notification history
- ✅ Client-side push notification registration (Capacitor)
- ✅ Push notification hooks and utilities
- ✅ Edge functions for sending notifications
- ✅ Notification listeners for session updates and messages

## What Works Now

1. **Device Token Registration**: The app automatically registers device tokens when users log in on mobile devices
2. **Notification Storage**: All notifications are stored in the database
3. **In-App Notifications**: Users see toast notifications when the app is in foreground

## Production Setup Required

To enable actual push notifications (when app is in background or closed), you need to:

### For Android (Firebase Cloud Messaging)

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Add an Android app to your project

2. **Get FCM Server Key**
   - In Firebase Console, go to Project Settings → Cloud Messaging
   - Copy the Server Key

3. **Add Secret to Lovable**
   - In your Lovable project, add a secret named `FCM_SERVER_KEY`
   - Paste your Firebase Server Key

4. **Update android/app/google-services.json**
   - Download `google-services.json` from Firebase Console
   - Place it in `android/app/` directory of your project

5. **Uncomment FCM Code**
   - In `supabase/functions/send-notification/index.ts`
   - Uncomment the FCM implementation section (lines with FCM API calls)

### For iOS (Apple Push Notification Service)

1. **Configure APNs in Apple Developer**
   - Create an APNs certificate or key in Apple Developer portal
   - Download the certificate/key

2. **Upload to Firebase**
   - In Firebase Console, go to Project Settings → Cloud Messaging → iOS
   - Upload your APNs certificate or key

3. **Update iOS Configuration**
   - In Xcode, enable Push Notifications capability
   - Add your APNs certificate to the project

### Testing Push Notifications

1. **Build Native Apps**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios  # or android
   ```

2. **Run on Physical Device**
   - Push notifications don't work on iOS Simulator
   - Test on real devices for both platforms

3. **Trigger Notifications**
   - Create a new session request (photographer receives notification)
   - Send a message in a session (other party receives notification)
   - Complete a session (both parties receive notification)

## Notification Types

The app sends notifications for:
- **Session Request**: When a client requests a new session
- **Session Accepted**: When photographer accepts a session
- **Session Completed**: When a session is marked as completed
- **New Message**: When a new message is received (can be extended)

## Troubleshooting

### Tokens Not Saving
- Check that you're running on a physical device (not simulator)
- Verify push notification permissions are granted
- Check browser/app console for errors

### Notifications Not Received
- Ensure FCM_SERVER_KEY is set correctly
- Verify Firebase project configuration
- Check that device tokens are in the database
- Review edge function logs for errors

### iOS Specific Issues
- Verify APNs certificate is valid and uploaded to Firebase
- Check that Push Notifications capability is enabled in Xcode
- Ensure you're testing on a physical device

## Cost Considerations

- Firebase Cloud Messaging is free for unlimited notifications
- Apple Push Notification Service is free
- Supabase edge function calls are billed per invocation (check your plan)

## Future Enhancements

Consider adding:
- [ ] Notification preferences (allow users to enable/disable specific notification types)
- [ ] Scheduled notifications
- [ ] Rich notifications with images
- [ ] Notification sounds and badges
- [ ] Notification action buttons
