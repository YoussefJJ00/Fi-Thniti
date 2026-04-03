# Fi'Thniti 🚗

> A modern carpooling marketplace application for Tunisia, built with Expo and React Native.

![Expo](https://img.shields.io/badge/Expo-v52-000.svg?style=flat-square)
![React Native](https://img.shields.io/badge/React%20Native-Latest-61dafb.svg?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20%26%20Firestore-FFA500.svg?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema (Firestore)](#database-schema-firestore)
- [Navigation & Routes](#navigation--routes)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Configuration Notes](#configuration-notes)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Fi'Thniti** is a carpooling platform designed specifically for the Tunisian market. It connects drivers and passengers, enabling them to share rides, save costs, and reduce environmental impact.

### Key Concept
- **Drivers** publish ride announcements with departure/arrival locations, date, time, price, and comfort options.
- **Passengers** search for available rides, book seats, and communicate with drivers in real-time.
- **User-centric**: Built-in messaging, profile management, vehicle preferences, and driver/passenger reviews.

---

## ✨ Features

### 1. **Authentication**
- Email/password registration via Firebase Auth
- Age verification (≥18 years mandatory)
- User document auto-creation in Firestore on registration
- Secure login/logout
- User role system (standard user / admin)

### 2. **Publish a Ride (Driver)**
- Interactive map-based selection of departure and arrival locations
- Date/time picker
- Seat availability (1–4 seats)
- Price per seat
- Comfort options:
  - Air conditioning
  - Comfort rating
  - Round-trip option
- Real-time Firestore updates
- Automatic driver status tracking

### 3. **Search & Book Rides (Passenger)**
- Advanced search with:
  - Departure and arrival location selection (map-based)
  - Date/time filtering
  - Seat count filtering
- Browse active ride listings
- Real-time status badges:
  - `ACTIVE` (seats available)
  - `FULL` (no seats)
  - `CANCELED` (cancelled)
  - `COMPLETED` (finished)
- Comfort filters (AC, comfort, round-trip)
- Request reservation with seat count selection
- Seat management via Firestore transactions

### 4. **My Rides (VosTrajets)**
- **For Drivers:**
  - View published announcements
  - Real-time passenger request counter
  - Accept/reject passenger reservations
  - Edit ride details (price, seats, description)
  - Cancel rides or mark as completed
  - View passenger information and preferences

- **For Passengers:**
  - View all reservations with status
  - Message drivers
  - Cancel reservations
  - Mark rides as completed

### 5. **Real-Time Messaging**
- Conversations list (grouped by contact)
- One-on-one chat interface
- Last message preview
- User info modal (name, phone, vehicle details, preferences)
- Prevents self-messaging
- Firestore-backed messages with timestamps

### 6. **User Profile & Preferences**
- Edit profile:
  - Name, first name, email (read-only)
  - Phone number
  - Password change
  - Travel preferences (talkative, smoker, animals, music preferences)
- Vehicle management:
  - Add/edit vehicle details (brand, model, type, color, license plate, seat count)
  - Tunisian license plate format support
  - Set default vehicle
  - External API integration for vehicle data (vpic.nhtsa.com, api-ninjas)
- Profile picture upload (via camera/gallery)

### 7. **Admin Dashboard (Optional)**
- User management and verification
- Role-based access control (`role='admin'` in Firestore)
- Accessible only to users with admin role

---

## 🛠️ Tech Stack

### Frontend & Framework
- **Expo** (~v52) - Managed React Native environment
- **React Native** - Cross-platform mobile development
- **React Navigation** - Routing and navigation
  - Stack Navigator
  - Bottom Tabs Navigator
  - Material Bottom Tabs (custom)

### Backend & Services
- **Firebase Authentication** - User auth management
- **Firestore** - Real-time database
- **Google Maps SDK** - Map display and navigation
  - `react-native-maps` - Map component
  - `react-native-google-places-autocomplete` - Location search autocomplete
  - Google Places API - Address lookup
  - Google Directions API - Route calculation
- **Expo Location** - Geolocation and reverse geocoding

### UI & Styling
- **@gluestack-ui/themed** - Modern component library
- **react-native-paper** - Material Design components
- **NativeWind** - Tailwind CSS for React Native (if configured)
- **Lucide React Native** - Icon library

### Additional Libraries
- **expo-image-picker** - Photo/camera access
- **react-native-gesture-handler** - Gesture support
- **react-native-reanimated** - Animations (splash screen fade effect)
- **@react-native-async-storage** - Local data persistence

---

## 📁 Project Structure

```
.
├── App.js                        # Entry (splash + NavigationContainer)
├── firebaseConfig.js             # Firebase init (Auth + Firestore)
├── app.json
├── package.json
├── src/
│   ├── navigation/
│   │   ├── AuthStack.js          # Login, Register, Home (tabs)
│   │   ├── MainTabs.js         # Bottom tabs
│   │   ├── RootNavigator.js
│   │   └── RechercherStack.js
│   ├── screens/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── SplashScreen.js
│   │   ├── Rechercher.js
│   │   ├── Publier.js
│   │   ├── VosTrajets.js
│   │   ├── Conversations.js      # Tab "Messages" (chat list)
│   │   ├── Messages.js           # Stack chat screen
│   │   ├── MapScreen.js
│   │   ├── Profil.js
│   │   └── AdminUsers.js         # Optional; not wired in tabs
│   ├── components/
│   │   └── ModernAlert.js
│   └── utils/
│       ├── annonceStatus.js
│       └── LocationSelectionContext.js
├── assets/
│   └── (images, icons, fonts)
├── docs/
│   ├── SETUP.md
│   ├── QUICKSTART.md
│   ├── DEPLOYMENT.md
│   └── DOCUMENTATION_INDEX.md
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema (Firestore)

### Collection: `users`
**Document ID:** User UID (from Firebase Auth)

| Field | Type | Description |
|-------|------|-------------|
| `nom` | string | Last name |
| `prenom` | string | First name |
| `email` | string | Email address |
| `tel` | string | Phone number |
| `date_birth` | date | Birth date (for age verification) |
| `genre` | string | Gender |
| `isDriver` | boolean | Whether user has published rides |
| `role` | string | User role (`'user'` or `'admin'`) |
| `preferences` | object | Travel preferences |
| `vehicle` | object | Default vehicle details |
| `profilePicture` | string | URI to profile picture |
| `createdAt` | timestamp | Account creation date |

**`preferences` sub-object:**
```javascript
{
  bavard: boolean,           // Talkative
  fumeur: boolean,           // Smoker
  animals: boolean,          // Allows animals
  musicPreference: string    // Music preference
}
```

**`vehicle` sub-object:**
```javascript
{
  marque: string,           // Brand (e.g., "Toyota")
  modele: string,           // Model (e.g., "Corolla")
  type: string,             // Type (e.g., "Sedan")
  couleur: string,          // Color
  licensePlate: string,     // Tunisian format (e.g., "123TN456")
  seats: number,            // Number of seats (1-4)
  isDefault: boolean        // Is default vehicle
}
```

---

### Collection: `annonces`
**Document ID:** Auto-generated

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Driver's UID |
| `description` | string | Ride description/notes |
| `lieuxdepart` | string | Departure location name |
| `lieuxarrivee` | string | Arrival location name |
| `datedepart` | date | Departure date |
| `heuredepart` | string | Departure time (HH:mm format) |
| `prix` | number | Price per seat (TND) |
| `nbrplace` | number | Seats available (1-4) |
| `aller_retour` | boolean | Is round-trip |
| `climatise` | boolean | Has AC |
| `confort` | boolean | Comfort rating |
| `etat` | string | Status (`ACTIVE`, `FULL`, `CANCELED`, `COMPLETED`) |
| `reservedSeats` | number | Total reserved seats |
| `passengerRequests` | array | IDs of passengers requesting |
| `createdAt` | timestamp | When announced |

**Example Document:**
```javascript
{
  userId: "user123",
  description: "Voyage confortable Tunis → Sousse",
  lieuxdepart: "Tunis",
  lieuxarrivee: "Sousse",
  datedepart: Date(2025-04-10),
  heuredepart: "09:00",
  prix: 25,
  nbrplace: 3,
  aller_retour: false,
  climatise: true,
  confort: true,
  etat: "ACTIVE",
  reservedSeats: 1,
  passengerRequests: [],
  createdAt: Timestamp(...)
}
```

---

### Collection: `reservations`
**Document ID:** Auto-generated

| Field | Type | Description |
|-------|------|-------------|
| `annonceId` | string | Related announcement ID |
| `userId` | string | Passenger's UID |
| `status` | string | Reservation status (`pending`, `accepted`, `declined`, `canceled`, `completed`) |
| `seatsRequested` | number | Number of seats reserved |
| `createdAt` | timestamp | When requested |

**Example Document:**
```javascript
{
  annonceId: "annonce456",
  userId: "passenger789",
  status: "pending",
  seatsRequested: 2,
  createdAt: Timestamp(...)
}
```

---

### Collection: `messages`
**Document ID:** Auto-generated

| Field | Type | Description |
|-------|------|-------------|
| `participants` | array | Array of two user UIDs involved in chat |
| `senderId` | string | Message sender's UID |
| `receiverId` | string | Message receiver's UID |
| `message` | string | Message text |
| `timestamp` | timestamp | Message timestamp |

**Example Document:**
```javascript
{
  participants: ["user123", "passenger789"],
  senderId: "user123",
  receiverId: "passenger789",
  message: "Bonjour, peux-tu me chercher à la gare?",
  timestamp: Timestamp(...)
}
```

---

## 🗺️ Navigation & Routes

### Root Structure
```
RootNavigator
├── AuthStack
│   ├── Login
│   ├── Register
│   └── Home (splash + redirect)
└── MainStack
    ├── MainTabs (Bottom Tabs)
    │   ├── Rechercher (Search rides)
    │   ├── Publier (Publish ride)
    │   ├── VosTrajets (My rides)
    │   ├── Messages (Conversations)
    │   └── Profil (Profile)
    ├── MapScreen (Stack route)
    │   └── Used by:
    │       - Publier (pick departure/arrival)
    │       - Rechercher (pick departure/arrival)
    │       - Location selection context-driven
    ├── Messages (Chat interface - Stack route)
    │   └── Params: { otherUserId, otherUserName }
    └── AdminUsers (Stack route - admin only)
```

### Screen Navigation Details

| Screen | Route | Type | Purpose |
|--------|-------|------|---------|
| **Login** | `AuthStack/Login` | Stack | Email/password authentication |
| **Register** | `AuthStack/Register` | Stack | User registration + age validation |
| **Home** | `AuthStack/Home` | Stack | Splash screen + redirect logic |
| **Rechercher** | `MainTabs/Rechercher` | Tab | Search & book rides |
| **Publier** | `MainTabs/Publier` | Tab | Publish new ride announcement |
| **VosTrajets** | `MainTabs/VosTrajets` | Tab | View my rides (driver/passenger) |
| **Conversations** | `MainTabs/Messages/Conversations` | Tab | List of chats |
| **Profil** | `MainTabs/Profil` | Tab | User profile & settings |
| **MapScreen** | `MainStack/MapScreen` | Stack | Location picker (modal-like) |
| **Messages (Chat)** | `MainStack/Messages` | Stack | One-on-one chat interface |
| **AdminUsers** | `MainStack/AdminUsers` | Stack | Admin panel (role-based) |

### Navigation Flow Example
```
Login → Register → Home (splash) → MainTabs
                                   ├─→ Rechercher → MapScreen → Book → Messages (Chat)
                                   ├─→ Publier → MapScreen → Publish
                                   ├─→ VosTrajets (view rides & message drivers)
                                   ├─→ Conversations (chat list)
                                   └─→ Profil (settings, vehicle, password)
```

---

## 📋 Prerequisites

### System Requirements
- **Node.js** (v16 or higher) with npm or yarn
- **Expo CLI** (`npm install -g expo-cli`)
- **Git**

### Platform-Specific
- **iOS:** Xcode 14+ (macOS)
- **Android:** Android Studio or Android SDK

### Services Required (Currently Hardcoded)
- **Firebase Project** - Get credentials from Firebase Console
- **Google Maps API Key** - Enable Maps, Places, Directions APIs
- **Google Places API Key** - For autocomplete
- **Google Directions API Key** - For route calculation

**Note:** Currently, these keys are hardcoded in:
- `firebaseConfig.js` (Firebase credentials)
- `MapScreen.js` (Google Maps/Places/Directions keys)
- `app.json` (Expo native plugin config)

---

## 📥 Installation

### 1. Clone Repository
```bash
git clone https://github.com/YoussefJJ00/Fi-Thniti.git
cd Fi-Thniti
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. (Recommended) Set Up Environment Variables
While the app works without `.env`, it's **best practice to externalize secrets**:

```bash
cp .env.example .env
```

Then edit `.env` with your keys (requires code modifications - see Configuration Notes).

### 4. Start Development Server
```bash
npm start
# or
expo start
```

---

## 🚀 Running the App

### Option A: Expo Go (Recommended for Development)
1. Install **Expo Go** app on your phone
2. Run `npm start` in terminal
3. Scan the QR code with Expo Go
4. App loads on your phone

### Option B: iOS Simulator (macOS)
```bash
npm start -- --ios
```

### Option C: Android Emulator
```bash
npm start -- --android
```

### Option D: Web Browser
```bash
npm start -- --web
```

---

## ⚙️ Configuration Notes

### Important: Hardcoded Credentials
**This app currently has API keys and Firebase credentials hardcoded.** This is NOT recommended for production.

#### Files with Hardcoded Secrets:
1. **`firebaseConfig.js`**
   - Contains: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
   - To externalize: Load from `.env` and refactor initialization

2. **`MapScreen.js`**
   - Contains: Google Places API key, Google Directions API key
   - To externalize: Add to `.env` and import in component

3. **`app.json`**
   - Contains: `expo.plugins[...].googleMaps.apiKey`
   - To externalize: Build-time configuration or EAS secrets

4. **Vehicle API Integration** (`Profil.js`)
   - Uses external APIs: `vpic.nhtsa.com` (free), `api-ninjas` (hardcoded key)
   - To externalize: Move API key to `.env` or backend service

### To Secure the App (Recommended):

1. **Copy `.env.example`:**
   ```bash
   cp .env.example .env
   ```

2. **Add your actual credentials to `.env`:**
   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   # ... etc
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

3. **Modify `firebaseConfig.js`:**
   ```javascript
   // Before
   const firebaseConfig = {
     apiKey: "hardcoded_key",
     // ...
   };

   // After
   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     // ...
   };
   ```

4. **Modify `MapScreen.js`, `Publier.js`, etc.** similarly for Google Maps keys.

5. **For EAS deployment**, use EAS secrets:
   ```bash
   eas secret:create FIREBASE_API_KEY
   eas secret:create GOOGLE_MAPS_API_KEY
   # ... then reference in eas.json
   ```

---

## 🔐 Firestore Security Rules (Recommended)

While developing, use **test mode** (allow all). For production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: own profile + public profile data
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId;
    }

    // Announcements: public read, own write
    match /annonces/{annonceId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Reservations: own + driver's ride
    match /reservations/{reservationId} {
      allow read: if request.auth.uid == resource.data.userId 
                  || request.auth.uid == resource.data.driverId;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId 
                           || request.auth.uid == resource.data.driverId;
    }

    // Messages: participants only
    match /messages/{messageId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid == request.resource.data.senderId
                   && request.auth.uid in request.resource.data.participants;
    }
  }
}
```

---

## 🛣️ Key User Flows

### Flow 1: Register → Publish Ride → Receive Booking Request
1. User registers (email, password, personal info)
2. Firebase Auth creates user
3. Firestore `users/` doc created with role='user'
4. User opens "Publier"
5. Selects departure/arrival via MapScreen
6. Fills details (date, time, seats, price, options)
7. Submits → `annonces/` doc created + `users/{uid}.isDriver = true`
8. Passenger books → `reservations/` doc created + modal in driver's VosTrajets
9. Driver accepts → `reservations.status = 'accepted'` + `annonces.nbrplace` decremented

### Flow 2: Search → Book → Message Driver
1. User opens "Rechercher"
2. Selects departure/arrival via MapScreen
3. Picks date, seats
4. Submits → queries `annonces` with filters
5. Taps ride → sees details + badges (AC, confort, round-trip)
6. Clicks "Réserver" → modal "How many seats?"
7. Confirms → `reservations/` doc created + status='pending'
8. Clicks "Message" → navigates to Messages (Chat)
9. Types message → saved to `messages/` collection with participants

### Flow 3: User Profile → Edit Vehicle → Upload Photo
1. Opens Profil tab
2. Edits name, phone, preferences
3. Section "Mon Véhicule" → add/edit vehicle
4. Selects profile picture via camera/gallery
5. Saves → `users/{uid}` updated

---

## 🔄 Admin Features

**Note:** AdminUsers screen exists but is NOT wired into the main tab navigation.

### How to Access (for development):
- User must have `role='admin'` in Firestore `users/{uid}` document
- Manually navigate via deep link or code modification

### Admin Capabilities:
- View all users
- Verify user information
- (Potentially manage rides/reports - depends on current code)

---

## 📝 Authentication & Authorization

### User Registration Flow
1. Email validation (format check)
2. Password strength check
3. Age verification (must be ≥18)
4. Firebase Auth user creation
5. Firestore `users/` doc creation with:
   - Personal info
   - `role='user'` (default)
   - Empty preferences/vehicle
   - `isDriver=false`

### Roles
- **`'user'`** (default) - Standard user (driver or passenger)
- **`'admin'`** - Admin access to AdminUsers screen

### Session Management
- Firebase Auth manages session tokens
- Auto-logout on auth errors
- Logout button in Profil tab

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:
- Expo EAS Build setup
- App Store submission
- Google Play Store submission
- Managing secrets in production

---

## 📚 Additional Documentation

- **[docs/SETUP.md](./docs/SETUP.md)** - Detailed Firebase, Google Maps setup
- **[docs/QUICKSTART.md](./docs/QUICKSTART.md)** - Clone to run in 5 min
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deploy to stores
- **[docs/DOCUMENTATION_INDEX.md](./docs/DOCUMENTATION_INDEX.md)** - Index of all docs

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/your-feature`
4. Open Pull Request

### Code Style
- Use functional components + Hooks
- Follow React Native naming conventions
- Comment complex logic

---

## 📄 License

This project is proprietary software for the Tunisian market.

---

## 📞 Support

For issues or questions:
- **GitHub Issues:** [Create an issue](https://github.com/YoussefJJ00/Fi-Thniti/issues)
- **Email:** support@fithniti.tn

---

## ⚠️ Known Limitations & TODOs

- [ ] Refactor hardcoded keys to `.env`
- [ ] Implement backend API for vehicle data (currently external APIs)
- [ ] Add payment integration (currently no actual payment flow)
- [ ] Implement ride ratings/reviews
- [ ] Add push notifications
- [ ] Implement email verification
- [ ] Rate limiting on search queries

---

**Last Updated:** April 2026  
**Version:** 1.0.0  
**Status:** Active Development

