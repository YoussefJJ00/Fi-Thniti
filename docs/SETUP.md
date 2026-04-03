# Fi'Thniti - Setup Guide

Complete step-by-step guide to configure Fi'Thniti for local development.

## 📋 Table of Contents

1. [Firebase Project Setup](#firebase-project-setup)
2. [Firestore Database & Collections](#firestore-database--collections)
3. [Firebase Authentication](#firebase-authentication)
4. [Google Maps & Places APIs](#google-maps--places-apis)
5. [Externalize Credentials (Recommended)](#externalize-credentials-recommended)
6. [Initial Data Seeding](#initial-data-seeding)
7. [Local Development](#local-development)
8. [Troubleshooting](#troubleshooting)

---

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `fi-thniti` (or your preferred name)
4. Disable "Google Analytics" (optional for development)
5. Click **"Create project"**
6. Wait for project initialization (~1 min)

### Step 2: Register Web App

1. In Firebase Console, click **"<>"** (Web icon)
2. App name: `fi-thniti-web`
3. Check "Also set up Firebase Hosting" (optional)
4. Click **"Register app"**
5. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "fi-thniti-xxx.firebaseapp.com",
  projectId: "fi-thniti-xxx",
  storageBucket: "fi-thniti-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**Where to use:**
- Copy these values to `firebaseConfig.js` or (better) to `.env.example` as shown below.

---

## 🗄️ Firestore Database & Collections

### Step 1: Enable Firestore

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose mode: **"Start in test mode"** (for development)
   - ⚠️ For production, use "Production mode" with security rules
4. Choose region: **"europe-west1"** (closest to Tunisia)
5. Click **"Create"**

Wait 1-2 minutes for initialization.

### Step 2: Create Collections & Documents

Firestore uses a **NoSQL structure**. Create these collections manually or programmatically:

#### Collection 1: `users`

Click **"Start collection"** and name it `users`.

**Document structure (auto-generated document ID = user UID from Firebase Auth):**

```javascript
{
  nom: "Jabeur",
  prenom: "Ahmed",
  email: "ahmed.jabeur@example.tn",
  tel: "+216 XX XXX XXX",
  date_birth: Timestamp (Date object),
  genre: "Male" | "Female",
  isDriver: false,
  role: "user" | "admin",
  preferences: {
    bavard: false,
    fumeur: false,
    animals: true,
    musicPreference: "Jazz"
  },
  vehicle: {
    marque: "Toyota",
    modele: "Corolla",
    type: "Sedan",
    couleur: "Silver",
    licensePlate: "123TN456",
    seats: 4,
    isDefault: true
  },
  profilePicture: "file:///data/user/0/com.example/.../image.jpg",
  createdAt: Timestamp
}
```

**Create a test user document:**
1. Click **"+ Add document"** in `users` collection
2. Document ID: `test-user-123` (or auto-generate)
3. Add fields as shown above
4. Click **"Save"**

---

#### Collection 2: `annonces`

Click **"Start collection"** and name it `annonces`.

**Document structure (auto-generated ID):**

```javascript
{
  userId: "test-user-123",
  description: "Voyage confortable et rapide",
  lieuxdepart: "Tunis",
  lieuxarrivee: "Sousse",
  datedepart: Timestamp (Date),
  heuredepart: "09:00",
  prix: 25,
  nbrplace: 3,
  aller_retour: false,
  climatise: true,
  confort: true,
  etat: "ACTIVE",
  reservedSeats: 0,
  passengerRequests: [],
  createdAt: Timestamp
}
```

**Create a test announcement:**
1. Click **"+ Add document"** in `annonces` collection
2. Add fields as shown above
3. Click **"Save"**

---

#### Collection 3: `reservations`

Click **"Start collection"** and name it `reservations`.

**Document structure (auto-generated ID):**

```javascript
{
  annonceId: "annonce-doc-id",
  userId: "passenger-uid",
  status: "pending" | "accepted" | "declined" | "canceled" | "completed",
  seatsRequested: 2,
  createdAt: Timestamp
}
```

---

#### Collection 4: `messages`

Click **"Start collection"** and name it `messages`.

**Document structure (auto-generated ID):**

```javascript
{
  participants: ["user-uid-1", "user-uid-2"],
  senderId: "user-uid-1",
  receiverId: "user-uid-2",
  message: "Bonjour, comment ça va?",
  timestamp: Timestamp
}
```

---

## 🔐 Firebase Authentication

### Step 1: Enable Email/Password Auth

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Click **"Sign-up method"**
4. Select **"Email/Password"**
5. Toggle **"Enable"** (OFF → ON)
6. Click **"Save"**

### Step 2: Create Test User (Optional)

1. Go to **Users** tab in Authentication
2. Click **"Add user"**
3. Email: `test@example.tn`
4. Password: `Test@123456`
5. Click **"Add user"**

This user will appear in Firebase Authentication and you can manually create a matching doc in `users` collection.

---

## 🗺️ Google Maps & Places APIs

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **"Create Project"**
3. Project name: `fi-thniti`
4. Click **"Create"**
5. Wait for initialization

### Step 2: Enable Required APIs

In the **API Library**, search for and **enable** these APIs:

1. **Maps SDK for Android**
   - Search → Enable

2. **Maps SDK for iOS**
   - Search → Enable

3. **Places API**
   - Search → Enable
   - Click **"Enable"**

4. **Directions API**
   - Search → Enable
   - Click **"Enable"**

5. **Geocoding API** (for reverse geocoding)
   - Search → Enable
   - Click **"Enable"**

### Step 3: Create API Key

1. Go to **Credentials**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key
4. (Optional) Restrict it:
   - Click on the key
   - Under "Application restrictions", select **"Android apps"** or **"iOS apps"**
   - Add your app's package name and signing certificate

### Step 4: Add to Your Project

**Currently hardcoded in:**
- `firebaseConfig.js` or `MapScreen.js`

**To use .env (recommended):**

```bash
cp .env.example .env
```

Then edit `.env`:

```env
GOOGLE_MAPS_API_KEY=AIzaSyD_xxxxxxxxxxxx
```

And update `MapScreen.js`:

```javascript
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "YOUR_KEY_HERE";
```

---

## 🔒 Externalize Credentials (Recommended)

### Step 1: Create `.env.example`

Already provided in the repo. Copy it:

```bash
cp .env.example .env
```

### Step 2: Fill `.env` with Your Credentials

```env
# Firebase Configuration
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=fi-thniti-xxx.firebaseapp.com
FIREBASE_PROJECT_ID=fi-thniti-xxx
FIREBASE_STORAGE_BUCKET=fi-thniti-xxx.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123...

# Google Maps & Places
GOOGLE_MAPS_API_KEY=AIzaSyD_...
GOOGLE_PLACES_API_KEY=AIzaSyD_...
GOOGLE_DIRECTIONS_API_KEY=AIzaSyD_...

# API Ninjas (for vehicle data)
API_NINJAS_KEY=your_api_ninjas_key

# App Config
FIREBASE_DATABASE_URL=https://fi-thniti-xxx.firebaseio.com
```

### Step 3: Install `expo-constants` (if not already)

```bash
npm install expo-constants
```

### Step 4: Modify `firebaseConfig.js`

**Before:**
```javascript
const firebaseConfig = {
  apiKey: "hardcoded_value",
  authDomain: "hardcoded_value",
  // ...
};
```

**After:**
```javascript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  // ...
};
```

### Step 5: Update `app.json`

Add to `app.json`:

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "YOUR_KEY",
      "firebaseAuthDomain": "YOUR_DOMAIN",
      "firebaseProjectId": "YOUR_PROJECT_ID",
      "firebaseStorageBucket": "YOUR_BUCKET",
      "firebaseMessagingSenderId": "YOUR_SENDER_ID",
      "firebaseAppId": "YOUR_APP_ID",
      "googleMapsApiKey": "YOUR_GOOGLE_MAPS_KEY",
      "googlePlacesApiKey": "YOUR_GOOGLE_PLACES_KEY"
    }
  }
}
```

### Step 6: .gitignore

Ensure `.env` is in `.gitignore`:

```
.env
.env.local
.env.*.local
```

---

## 🌱 Initial Data Seeding

### Option A: Manual Seeding (via Firebase Console)

1. Go to Firestore Database
2. For each collection (users, annonces, reservations), click **"+ Add document"**
3. Add test data as shown in "Firestore Database & Collections" section above

### Option B: Programmatic Seeding (Backend Script)

Create `scripts/seed.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedDatabase() {
  console.log('Seeding database...');

  // Add test user
  await db.collection('users').doc('test-user-123').set({
    nom: 'Test',
    prenom: 'User',
    email: 'test@fithniti.tn',
    tel: '+216 91234567',
    date_birth: new Date('1990-01-01'),
    genre: 'Male',
    isDriver: false,
    role: 'user',
    preferences: {
      bavard: false,
      fumeur: false,
      animals: true,
      musicPreference: 'Pop'
    },
    vehicle: {
      marque: 'Toyota',
      modele: 'Corolla',
      type: 'Sedan',
      couleur: 'White',
      licensePlate: '123TN456',
      seats: 4,
      isDefault: true
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Add test announcement
  await db.collection('annonces').add({
    userId: 'test-user-123',
    description: 'Voyage rapide et confortable',
    lieuxdepart: 'Tunis',
    lieuxarrivee: 'Sousse',
    datedepart: new Date('2025-05-15'),
    heuredepart: '09:00',
    prix: 25,
    nbrplace: 3,
    aller_retour: false,
    climatise: true,
    confort: true,
    etat: 'ACTIVE',
    reservedSeats: 0,
    passengerRequests: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Database seeded successfully!');
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
```

**To run:**

1. Download service account key from Firebase:
   - Firebase Console → Settings (⚙️) → Service Accounts
   - Click **"Generate new private key"**
   - Save as `scripts/serviceAccountKey.json`

2. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

3. Run seed script:
   ```bash
   node scripts/seed.js
   ```

---

## 💻 Local Development

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm start
# or
expo start
```

### Step 3: Run on Device/Emulator

- **Expo Go:** Scan QR code with Expo Go app
- **iOS Simulator:** Press `i`
- **Android Emulator:** Press `a`
- **Web:** Press `w`

### Step 4: Test Authentication

1. **Register:**
   - Open app → Click "Register"
   - Fill form (age ≥18)
   - User created in Firebase Auth + Firestore

2. **Login:**
   - Use registered email/password
   - Should redirect to MainTabs

3. **Publish Ride:**
   - Click "Publier"
   - Select locations via map
   - Fill details
   - Should appear in Firestore `annonces`

---

## 🔍 Troubleshooting

### Issue: Firebase Config Not Found

**Error:** `FirebaseError: Missing or invalid apiKey...`

**Solution:**
- Verify `firebaseConfig.js` exists and has correct values
- Check `.env` if using environment variables
- Restart dev server: `npm start -- --clear`

---

### Issue: Google Maps API Key Invalid

**Error:** `INVALID_REQUEST error: MissingKeyMapError`

**Solution:**
- Verify API key is correct in `MapScreen.js`
- Ensure Maps SDK is enabled in Google Cloud Console
- Check API restrictions (if set) allow your app
- Ensure Directions API and Geocoding API are enabled

---

### Issue: Firestore Rules Reject Reads/Writes

**Error:** `FirebaseError: Missing or insufficient permissions`

**Solution:**
- In Firestore Database → **Rules** tab
- Set to **test mode** (allow all) for development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

---

### Issue: Auth State Not Persisting

**Problem:** User logs in but is redirected to login after app restart

**Solution:**
- Check `RootNavigator.js` for proper auth state listener
- Ensure Firebase Auth initialization is awaited
- Check AsyncStorage for session tokens (if implemented)

---

### Issue: Image Picker Not Working (iOS)

**Error:** `Camera Roll access error`

**Solution:**
Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to select profile pictures.",
          "cameraPermission": "The app accesses your camera to take profile pictures."
        }
      ]
    ]
  }
}
```

---

### Issue: Vehicle Data API Fails

**Error:** `vpic.nhtsa.com` or `api-ninjas` returns 404/401

**Solution:**
- `vpic.nhtsa.com` is free but sometimes slow
- `api-ninjas` requires API key (check `.env`)
- Add error handling in `Profil.js` to fallback to manual input

---

## ✅ Verification Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized (test mode)
- [ ] Collections created: `users`, `annonces`, `reservations`, `messages`
- [ ] Authentication enabled (Email/Password)
- [ ] Google Cloud project created
- [ ] Google Maps, Places, Directions APIs enabled
- [ ] API key generated and added to code/`.env`
- [ ] `.env.example` copied to `.env`
- [ ] Dependencies installed: `npm install`
- [ ] Dev server starts: `npm start`
- [ ] Can register and login
- [ ] Can publish and search rides

---

## 🚀 Next Steps

1. Read [README.md](../README.md) for features overview
2. Read [QUICKSTART.md](./QUICKSTART.md) to run quickly
3. Explore `src/` (screens, navigation) to understand the app
4. Start developing features!

---

**Last Updated:** April 2026  
**Version:** 1.0.0

