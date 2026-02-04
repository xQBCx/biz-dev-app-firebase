# ISO Flash - Native Mobile App Deployment Guide

This guide will help you deploy ISO Flash to the Apple App Store and Google Play Store.

## 🚀 Quick Start

ISO Flash is now configured as a native mobile application using Capacitor. The app includes:

- ✅ Neon-dark design system with electric yellow/blue accents
- ✅ Core MVP features (Flash signal, Map, Chats, Profile)
- ✅ Lovable Cloud backend (ready for auth, database, storage)
- ✅ Capacitor configuration for iOS & Android
- ✅ Camera, location, and push notification capabilities

## 📋 Prerequisites

Before deploying to app stores, you'll need:

### For iOS (Apple App Store):
- Mac computer with macOS
- Xcode 14+ installed
- Apple Developer Program membership ($99/year)
- iOS device or simulator for testing

### For Android (Google Play Store):
- Android Studio installed (works on Mac, Windows, Linux)
- Google Play Developer account ($25 one-time fee)
- Android device or emulator for testing

## 🔧 Setup Steps

### 1. Export to GitHub

First, export your project to GitHub:
1. Click the **GitHub** button in Lovable
2. Connect your GitHub account
3. Create a new repository
4. Clone the repository to your local machine:

```bash
git clone <your-repo-url>
cd <your-project-name>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Capacitor

Capacitor is already configured, but you need to sync it:

```bash
# Build the web app
npm run build

# Initialize iOS platform
npx cap add ios

# Initialize Android platform  
npx cap add android

# Sync the web build to native platforms
npx cap sync
```

## 📱 iOS Deployment

### Step 1: Open in Xcode

```bash
npx cap open ios
```

### Step 2: Configure Project Settings

In Xcode:
1. Select the project in the navigator
2. Under **General** tab:
   - Set your **Team** (requires Apple Developer account)
   - Update **Bundle Identifier**: `app.isoflash.mobile` (must be unique)
   - Set **Version**: 1.0.0
   - Set **Build**: 1

### Step 3: Configure Capabilities

In Xcode, under **Signing & Capabilities**:
- Enable **Camera** usage
- Enable **Location When In Use**
- Enable **Push Notifications**

### Step 4: Add Privacy Descriptions

In `ios/App/Info.plist`, add:

```xml
<key>NSCameraUsageDescription</key>
<string>ISO Flash needs camera access to capture photos for you</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>ISO Flash needs your location to find nearby photographers</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>ISO Flash needs access to save photos to your library</string>
```

### Step 5: Test on Device

1. Connect your iPhone via USB
2. Select your device in Xcode
3. Click **Run** (▶️ button)
4. Test all features thoroughly

### Step 6: Create App Store Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app:
   - **Name**: ISO Flash
   - **Bundle ID**: app.isoflash.mobile
   - **Primary Language**: English
   - **Category**: Photo & Video / Social Networking

3. Add screenshots (required sizes: 6.7", 6.5", 5.5")
4. Write app description following the roadmap's messaging
5. Add app icon (1024x1024px)

### Step 7: Submit for Review

1. In Xcode, select **Product > Archive**
2. Once archived, click **Distribute App**
3. Choose **App Store Connect**
4. Upload the build
5. In App Store Connect, select the build and submit for review

**Review time**: Typically 24-48 hours

## 🤖 Android Deployment

### Step 1: Open in Android Studio

```bash
npx cap open android
```

### Step 2: Configure Project

In Android Studio:
1. Open `android/app/build.gradle`
2. Update:
   - `applicationId`: "app.isoflash.mobile"
   - `versionCode`: 1
   - `versionName`: "1.0.0"

### Step 3: Configure Permissions

In `android/app/src/main/AndroidManifest.xml`, ensure these permissions:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Step 4: Create Signing Key

```bash
keytool -genkey -v -keystore iso-flash-release.keystore -alias iso-flash -keyalg RSA -keysize 2048 -validity 10000
```

Save this keystore file securely - you'll need it for all future updates!

### Step 5: Configure Signing

Create `android/keystore.properties`:

```properties
storeFile=../iso-flash-release.keystore
storePassword=<your-password>
keyAlias=iso-flash
keyPassword=<your-password>
```

Update `android/app/build.gradle`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

android {
    ...
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Step 6: Build Release APK/AAB

```bash
cd android
./gradlew bundleRelease
```

The signed AAB file will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 7: Create Google Play Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app:
   - **App name**: ISO Flash
   - **Default language**: English (US)
   - **App or game**: App
   - **Free or paid**: Free

3. Complete the store listing:
   - Upload screenshots (Phone, 7-inch tablet, 10-inch tablet)
   - App icon (512x512px)
   - Feature graphic (1024x500px)
   - Short description (80 chars)
   - Full description (4000 chars max)

4. Set up content rating and target audience
5. Upload the AAB file in **Production > Create new release**

### Step 8: Submit for Review

1. Complete all required sections
2. Submit for review
3. Wait for approval (typically 1-3 days)

## 🔄 Continuous Updates

After each update in Lovable:

1. Pull latest changes from GitHub:
```bash
git pull origin main
```

2. Rebuild and sync:
```bash
npm run build
npx cap sync
```

3. Increment version numbers in both platforms

4. Test thoroughly on devices

5. Submit new builds to app stores

## 🎯 Next Steps for Full MVP

To complete the MVP, you'll need to implement:

1. **Authentication**: 
   - Apple Sign-In integration
   - User profile creation

2. **Database Schema**:
   - Users/Profiles table
   - Sessions table
   - Messages table
   - Ratings table

3. **Real-time Features**:
   - Live location tracking
   - Real-time chat
   - Push notifications

4. **Payment Integration**:
   - Stripe setup
   - Transaction handling
   - Payout system

5. **Native Features**:
   - Camera integration
   - Location services
   - Push notifications

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [ISO Flash Roadmap](./ISO_Flash_Full-Stack_Mobile_App_Development_Roadmap.pdf)

## 🆘 Common Issues

### iOS Build Fails
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`
- Clean build folder: **Product > Clean Build Folder** in Xcode

### Android Build Fails
- Invalidate caches: **File > Invalidate Caches** in Android Studio
- Ensure Java 11 or higher is installed

### Hot Reload Not Working
- Make sure the server URL in `capacitor.config.ts` matches your Lovable preview URL
- Restart the app after making changes

## 💡 Tips for Success

1. **Test on real devices** - Simulators don't have all native features
2. **Follow store guidelines** - Read and follow all app store policies
3. **Professional screenshots** - Invest time in quality app store screenshots
4. **Beta testing** - Use TestFlight (iOS) and Internal Testing (Android) before release
5. **Monitor reviews** - Respond to user feedback promptly

Good luck with your launch! 🚀
