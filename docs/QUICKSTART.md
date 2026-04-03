# Fi'Thniti - Quick Start

⚡ **Get Fi'Thniti running in 5 minutes**

---

## 🚀 Ultra-Quick Start

```bash
# 1. Clone repo
git clone https://github.com/YoussefJJ00/Fi-Thniti.git
cd Fi-Thniti

# 2. Install dependencies
npm install

# 3. Start dev server
npm start

# 4. Open app
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Press 'w' for web
# - Or scan QR code with Expo Go app on your phone
```

**That's it!** 🎉

---

## 📋 Prerequisites Checklist

Before running, ensure you have:

- [ ] **Node.js 16+** → `node --version`
- [ ] **npm 7+** → `npm --version`
- [ ] **Expo CLI** → `npm install -g expo-cli`
- [ ] **Git** → `git --version`
- [ ] **API Keys** (Firebase, Google Maps) - see [SETUP.md](./SETUP.md)

Missing something? See [SETUP.md](./SETUP.md)

---

## 🔑 Important: API Keys

**⚠️ The app currently has hardcoded API keys.**

If you're starting fresh:

1. Get Firebase credentials from [Firebase Console](https://console.firebase.google.com)
2. Get Google Maps API key from [Google Cloud Console](https://console.cloud.google.com)
3. Update:
   - `firebaseConfig.js` (Firebase)
   - `MapScreen.js` (Google Maps/Places)
   - `app.json` (Expo config)

**Recommended:** Use `.env` for security (see [SETUP.md](./SETUP.md))

---

## 📱 Run on Your Phone (Easiest)

1. Install **Expo Go**:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Start dev server:
   ```bash
   npm start
   ```

3. Scan QR code with Expo Go
4. App loads instantly! ✨

---

## 🗂️ Project Structure at a Glance

```
.
├── App.js
├── firebaseConfig.js       (Firebase setup — keys often hardcoded today)
├── src/
│   ├── navigation/         (AuthStack, MainTabs, RootNavigator, …)
│   ├── screens/            (Login, Rechercher, MapScreen, …)
│   ├── components/
│   └── utils/
├── assets/
├── docs/                   (SETUP, QUICKSTART, DEPLOYMENT, index)
├── app.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🎯 Key Features to Try

1. **Register** → Create account with age verification
2. **Publish** → Create a ride with location picker
3. **Search** → Find rides and book seats
4. **Message** → Chat with driver/passenger
5. **Profile** → Edit info, add vehicle, upload photo

---

## 🔥 Firestore Collections (What to Know)

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles, vehicles, preferences |
| `annonces` | Ride announcements (driver's perspective) |
| `reservations` | Ride requests (passenger's perspective) |
| `messages` | Chat messages |

See [SETUP.md](./SETUP.md) for schema details.

---

## 📖 Navigation Overview

```
Login/Register
    ↓
MainTabs (5 tabs):
├─ Rechercher  (Search & book rides)
├─ Publier     (Publish new ride)
├─ VosTrajets  (My rides - driver or passenger view)
├─ Messages    (Chat conversations)
└─ Profil      (User settings, vehicle, password)

Stack screens:
├─ MapScreen   (Pick locations for search/publish)
├─ Messages    (Open chat with specific user)
└─ AdminUsers  (Admin only - not in tabs)
```

---

## 🔧 Available npm Commands

```bash
npm start              # Start dev server (main command)
npm run android       # Open Android emulator
npm run ios           # Open iOS simulator
npm run web           # Open web version
npm test              # Run tests (if configured)
npm run eject         # Eject from Expo (not recommended)
```

---

## ⚠️ Common Issues

| Problem | Fix |
|---------|-----|
| `npm install` fails | `npm cache clean --force && npm install` |
| Port 19000 in use | Kill process: `lsof -ti:19000 \| xargs kill -9` |
| Firebase config not found | Check `firebaseConfig.js` exists and has values |
| Maps not showing | Verify Google Maps API key in `MapScreen.js` |
| Expo Go won't connect | Restart dev server: `npm start -- --clear` |

More help? See [SETUP.md](./SETUP.md) troubleshooting section.

---

## 📚 Full Documentation

| Doc | Purpose |
|-----|---------|
| **[README.md](../README.md)** | Full project overview, features, tech stack |
| **[SETUP.md](./SETUP.md)** | Detailed Firebase, Google Maps, Firestore setup |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Deploy to App Store & Google Play |
| **[QUICKSTART.md](./QUICKSTART.md)** | This file - fast reference |

---

## 🚦 Development Workflow

1. **Clone & install:**
   ```bash
   git clone https://github.com/YoussefJJ00/Fi-Thniti.git
   cd Fi-Thniti
   npm install
   ```

2. **Configure API keys:**
   - Update `firebaseConfig.js`, `MapScreen.js`, `app.json`
   - Or use `.env` (recommended)

3. **Start dev server:**
   ```bash
   npm start
   ```

4. **Open on device/emulator:**
   - Scan QR with Expo Go, or press `i`/`a`/`w`

5. **Make changes:**
   - Edit code → app reloads automatically
   - Check terminal for errors

6. **Test features:**
   - Register, publish ride, search, book, message, edit profile

---

## 💡 Pro Tips

1. **Use physical device** - More realistic than emulator
2. **Check console logs** - `npm start` shows all errors
3. **Test with real addresses** - "Tunis", "Sousse", etc.
4. **Check Firestore in real-time** - Firebase Console shows updates live
5. **Use test user** - Create one in Firebase Auth for testing

---

## 🆘 Need Help?

- **Setup issues?** → See [SETUP.md](./SETUP.md)
- **Feature questions?** → Read [README.md](../README.md)
- **Deployment?** → Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Stuck?** → Check terminal errors or [GitHub Issues](https://github.com/YoussefJJ00/Fi-Thniti/issues)

---

## ✅ Validation Checklist (First Run)

- [ ] Code cloned successfully
- [ ] Dependencies installed (`npm install` completed)
- [ ] Dev server started (`npm start` shows QR code)
- [ ] App opens on device/emulator
- [ ] Can see Login screen
- [ ] Can navigate to Register
- [ ] No red error screens

If all ✅, you're ready to develop!

---

**Happy coding!** 🚗✨

---

*Last Updated:* April 2026  
*Version:* 1.0.0

