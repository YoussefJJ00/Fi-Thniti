# Fi'Thniti - Deployment Guide

Complete guide to deploying Fi'Thniti to iOS App Store and Google Play Store using Expo EAS.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Prepare for Deployment](#prepare-for-deployment)
3. [Expo EAS Setup](#expo-eas-setup)
4. [iOS Deployment](#ios-deployment)
5. [Android Deployment](#android-deployment)
6. [Post-Deployment](#post-deployment)
7. [Secrets Management](#secrets-management)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Code reviewed
- [ ] Hardcoded API keys removed (use .env or EAS secrets)
- [ ] Sensitive data not in `app.json`

### Firebase & Google APIs
- [ ] Firebase project configured
- [ ] Firestore security rules set appropriately
- [ ] Google Maps/Places API keys secured
- [ ] All APIs enabled in Google Cloud Console

### App Store Readiness
- [ ] App name finalized
- [ ] App icon (1024x1024 PNG) prepared
- [ ] Splash screen finalized
- [ ] Privacy policy written and hosted
- [ ] Terms of service written (optional)
- [ ] App description & screenshots prepared
- [ ] Contact email & support URL ready

### Version Management
- [ ] Version number bumped in `package.json` and `app.json`
- [ ] Changelog prepared
- [ ] Git tag created for release

### Accounts
- [ ] Apple Developer Account (€99/year)
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Expo account created

---

## 🔧 Prepare for Deployment

### Step 1: Update Version Numbers

**In `package.json`:**
```json
{
  "version": "1.0.0"
}
```

**In `app.json`:**
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

**Version Format:** `MAJOR.MINOR.PATCH`
- `1.0.0` = Initial release
- `1.0.1` = Bug fix
- `1.1.0` = New features
- `2.0.0` = Major overhaul

### Step 2: Prepare App Icon & Splash Screen

**App Icon:**
- Size: **1024 × 1024 pixels** (PNG)
- No transparency for solid icons
- Save as `assets/icon.png`

**Splash Screen:**
- Size: **1242 × 2436 pixels** (iPhone size, will scale)
- PNG format
- Save as `assets/splash.png`

**Update `app.json`:**
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

### Step 3: Write Privacy Policy & Terms

Create a hosted privacy policy (e.g., on GitHub, Vercel, or your website):

**Privacy Policy should cover:**
- Data collected (email, phone, location, ride info)
- How data is used (matching drivers/passengers)
- Third-party services (Firebase, Google Maps)
- User rights (data deletion, opt-out)

**Save URL (e.g., `https://yourdomain.com/privacy`)**

### Step 4: Externalize Secrets (Highly Recommended)

**Never commit real API keys to Git.**

**Option A: Use EAS Secrets (Recommended)**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create secrets
eas secret:create FIREBASE_API_KEY
eas secret:create GOOGLE_MAPS_API_KEY
# ... add all sensitive keys
```

Then reference in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "FIREBASE_API_KEY": "@FIREBASE_API_KEY",
        "GOOGLE_MAPS_API_KEY": "@GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**Option B: Use Local `.env`** (for development only)
```bash
cp .env.example .env
# Fill with your values
# Add .env to .gitignore
```

---

## 📱 Expo EAS Setup

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
# Enter email and password
```

### Step 3: Initialize EAS in Project

```bash
eas build:configure
```

This creates `eas.json` with build profiles.

### Step 4: Configure `eas.json`

Example structure:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  }
}
```

---

## 🍎 iOS Deployment

### Prerequisites

- **Apple Developer Account** ($99/year)
- **Mac** with Xcode 14+ (optional if using EAS Build)

### Step 1: Set Up Apple Credentials

**If using EAS (recommended):**

```bash
eas credentials:configure --platform ios
```

Follow prompts:
- Use Apple ID
- Create app identifier (e.g., `com.fithniti.app`)
- Generate certificates

**Alternatively, create manually:**
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Create App ID: `com.fithniti.app`
3. Create provisioning profile
4. Create signing certificate

### Step 2: Update `app.json`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.fithniti.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to find nearby rides",
        "NSCameraUsageDescription": "Used for taking profile pictures",
        "NSPhotoLibraryUsageDescription": "Used for selecting profile pictures"
      }
    }
  }
}
```

### Step 3: Build for iOS

```bash
# Create production build
eas build --platform ios --profile production

# Monitor build
eas build:list

# Once complete, download .ipa file
```

**First build takes 10-20 minutes.**

### Step 4: Create App Store Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"My Apps"**
3. Click **"+"** → **"New App"**
4. Fill in:
   - **Name:** Fi'Thniti
   - **Bundle ID:** com.fithniti.app
   - **SKU:** fithniti-001
   - **Platform:** iOS

### Step 5: Add App Information

In App Store Connect:

**General Information:**
- Category: Travel / Maps & Navigation
- Subtitle: "Tunisian carpooling marketplace"
- Privacy Policy: `https://yourdomain.com/privacy`
- Support URL: `https://yourdomain.com/support`

**Pricing and Availability:**
- Set to "Free"
- Select territories (if restricting to Tunisia, note app review requirement)

**Screenshots & Preview:**
- Add 5-8 screenshots (recommended sizes: 1170×2532 for iPhone)
- Portrait orientation required
- No promotional text on screenshots (Apple rejects these)
- Optional: 15-30 second preview video

**App Description:**
```
Fi'Thniti - Le meilleur moyen de covoiturer en Tunisie!

Partagez vos trajets avec d'autres tunisiens:
- Publiez vos annonces de covoiturage
- Trouvez des trajets aux meilleurs prix
- Communiquez directement avec les conducteurs
- Profitez d'une plateforme sécurisée et fiable

À bientôt sur Fi'Thniti! 🚗
```

**Review Information:**
- **Demo Account:** 
  - Email: `test@fithniti.tn`
  - Password: `TestPass@123`
- **Notes:** "Test ride publication and booking flow"

### Step 6: Submit for Review

1. In App Store Connect, go to your app
2. Click **"Version"** tab
3. Click **"Add for Review"**
4. Select the build to review
5. Answer compliance questions
6. **Submit for Review**

**Apple's review process: 1-3 days (can be up to 1 week)**

### Step 7: Monitor Review Status

Check App Store Connect daily for:
- **Approved** - App is live! 🎉
- **Rejected** - Read feedback and fix issues
- **In Review** - Waiting on Apple

**Common rejection reasons:**
- Broken links
- Misleading screenshots
- Missing privacy policy
- Requires user login but demo account not functional
- Metadata doesn't match app functionality

---

## 🤖 Android Deployment

### Prerequisites

- **Google Play Developer Account** ($25 one-time)
- **Google Cloud Project** with Maps/Places APIs enabled

### Step 1: Set Up Google Play Credentials

**Create signed APK/AAB via EAS:**

```bash
eas credentials:configure --platform android
```

EAS will:
- Create keystore (for signing)
- Store credentials securely
- Auto-sign builds

**Or manually:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project
3. Enable Play Billing API
4. Create OAuth 2.0 credentials

### Step 2: Update `app.json`

```json
{
  "expo": {
    "android": {
      "package": "com.fithniti.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### Step 3: Build for Android

```bash
# Create production build (AAB for Play Store)
eas build --platform android --profile production

# Monitor build
eas build:list

# Download .aab file when complete
```

**First build takes 10-20 minutes.**

### Step 4: Create Google Play Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name:** Fi'Thniti
   - **Default language:** French or English
   - **App type:** Application

### Step 5: Complete App Details

**App details section:**
- Category: Travel
- Tagline: "Covoiturage en Tunisie"
- Short description (80 chars)
- Full description
- Features list

**Graphics:**
- App icon (512×512 PNG)
- Feature graphic (1024×500 PNG)
- Screenshots (4-8 images, 1080×1920 JPG/PNG)
- Promotional graphic (180×120 PNG)

**Content rating:**
- Fill questionnaire
- Get age rating (usually 3+ or 7+)

### Step 6: Upload Build & Test

**Internal Testing:**
1. Go to **Testing** → **Internal Testing**
2. Click **"Create new release"**
3. Upload `.aab` file
4. Add release notes
5. Invite testers (email addresses)
6. Test on devices for 1-2 weeks

**Closed Testing:**
After internal testing passes:
1. Go to **Testing** → **Closed Testing**
2. Create new release
3. Add same `.aab`
4. Add same release notes
5. Invite external testers (friends, beta users)

### Step 7: Submit to Production

1. Go to **Releases** → **Production**
2. Click **"Create new release"**
3. Upload final `.aab`
4. Add release notes:
   ```
   Version 1.0.0 - Initial Launch
   - Publish and search rides
   - Real-time messaging
   - Secure payments
   ```
5. **Review store listing** (make sure everything is correct)
6. **Submit for review**

**Google Play's review process: Usually < 2 hours (sometimes same day)**

### Step 8: Manage Rollout

After approval:
1. Start with **10% rollout** (to 10% of users)
2. Monitor crashes & reviews for 24 hours
3. Increase to **25%**, then **50%**, then **100%**

If critical issues found:
- Click **"Pause rollout"**
- Fix issues
- Re-build and re-submit

---

## ✅ Post-Deployment

### Launch Day

- [ ] App is live on both stores
- [ ] Announce launch (social media, email)
- [ ] Share download links
- [ ] Monitor reviews & ratings

### First Week

- [ ] Check App Store Connect & Google Play Console daily
- [ ] Monitor crash reports
- [ ] Respond to user reviews professionally
- [ ] Fix critical bugs immediately

### Ongoing

- [ ] Version 1.0.1 - Bug fixes (within 1-2 weeks if needed)
- [ ] Version 1.1.0 - New features (bi-weekly or monthly)
- [ ] Monitor user feedback
- [ ] Update screenshots/description as needed

---

## 🔐 Secrets Management

### Production Secrets

Never commit to Git:
- `.env` files
- Firebase keys
- API keys
- Signing certificates

### Using EAS Secrets (Recommended)

```bash
# Create secret
eas secret:create FIREBASE_API_KEY

# Reference in eas.json
{
  "build": {
    "production": {
      "env": {
        "FIREBASE_API_KEY": "@FIREBASE_API_KEY"
      }
    }
  }
}
```

### Using Environment Variables in Code

```javascript
// firebaseConfig.js
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.FIREBASE_API_KEY,
  // ...
};
```

### .gitignore (Protect Secrets)

```
.env
.env.local
.env.production
*.keystore
serviceAccountKey.json
```

---

## 🐛 Troubleshooting

### iOS Issues

**Issue: "Invalid Signature"**
```bash
eas credentials:configure --platform ios
# Regenerate certificate
```

**Issue: "App thinning failed"**
- Ensure no invalid file extensions in `assets/`
- Remove any `.DS_Store` files

**Issue: Long App Store review times**
- Check for common rejection reasons
- Ensure all links work (privacy, support)
- Add demo account + instructions for reviewers

### Android Issues

**Issue: "Certificate fingerprint mismatch"**
```bash
eas credentials:configure --platform android
# Regenerate keystore
```

**Issue: "APK signature invalid"**
- Rebuild with EAS: `eas build --platform android --profile production`

### General Issues

**Issue: Build fails with "Out of memory"**
```bash
export NODE_OPTIONS=--max-old-space-size=4096
eas build --platform ios
```

**Issue: Git tags interfering with versioning**
```bash
git tag -l  # List tags
git tag -d v1.0.0  # Delete tag if needed
```

---

## 📊 Version Release Checklist

For each new version:

- [ ] Feature complete & tested
- [ ] Version number updated (app.json, package.json)
- [ ] Git tag created: `git tag -a v1.0.0 -m "Release 1.0.0"`
- [ ] Release notes prepared
- [ ] Screenshots/description updated if needed
- [ ] EAS build created
- [ ] iOS submitted to App Store
- [ ] Android submitted to Google Play
- [ ] Monitored for crashes/reviews
- [ ] Post-launch comms sent

---

## 📞 Support Resources

- **Expo EAS:** https://docs.expo.dev/eas/introduction/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies:** https://support.google.com/googleplay/android-developer
- **Firebase Security:** https://firebase.google.com/docs/rules

---

## 🎉 Launching Successfully

**Pre-launch day:**
- ✅ All tests passing
- ✅ API keys secured
- ✅ Privacy policy live
- ✅ Screenshots ready
- ✅ Support email ready

**Launch day:**
- ✅ Both stores submission
- ✅ Team notified
- ✅ Social media posts scheduled
- ✅ Monitoring tools active

**Post-launch:**
- ✅ Monitor crashes
- ✅ Respond to reviews
- ✅ Plan next version

---

**Last Updated:** April 2026  
**Version:** 1.0.0

