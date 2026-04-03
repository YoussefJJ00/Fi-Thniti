# Fi'Thniti - Documentation Index

Complete guide to Fi'Thniti's documentation structure and when to use each file.

---

## 📚 Documentation Files Overview

### 1. **README.md** - Main Documentation
**Purpose:** Complete project overview and reference  
**Audience:** Everyone (starting point)  
**Read time:** 15-20 minutes  
**Contains:**
- Project description & key value proposition
- Complete feature list with detailed explanations
- Tech stack breakdown
- Project directory structure
- Complete Firestore database schema (users, annonces, reservations, messages)
- Navigation & routes documentation
- Prerequisites & installation
- Configuration notes (hardcoded keys warning)
- User flows & authentication details
- Admin features
- Known limitations & TODOs
- Deployment overview link

**When to read:**
- ✅ When onboarding to project
- ✅ To understand features & architecture
- ✅ To reference database schema
- ✅ To understand authentication flow

---

### 2. **QUICKSTART.md** - Fast Execution
**Purpose:** Clone and run app in 5 minutes  
**Audience:** Developers who want to start coding immediately  
**Read time:** 2-3 minutes  
**Contains:**
- Ultra-quick start commands (4 steps)
- Prerequisites checklist
- API keys note (important!)
- Run on phone (Expo Go)
- Project structure at a glance
- Key features to try
- Firestore collections overview
- Navigation overview
- npm commands reference
- Common issues & quick fixes
- Links to full docs

**When to read:**
- ✅ First time running the app
- ✅ Need to get started immediately
- ✅ Quick reference for commands
- ✅ Troubleshooting common issues

---

### 3. **SETUP.md** - Detailed Configuration
**Purpose:** Step-by-step setup for Firebase, Google Maps, Firestore  
**Audience:** Developers setting up backend services for the first time  
**Read time:** 30-45 minutes  
**Contains:**
- Firebase project creation
- Firestore database setup (create collections manually)
- Firestore document structure for all 4 collections
- Firebase Authentication setup
- Google Cloud project setup
- Google Maps & Places API enablement
- Externalizing credentials (.env best practices)
- Seed script example (optional)
- Local development checklist
- Detailed troubleshooting by error

**When to read:**
- ✅ First-time Firebase setup
- ✅ Creating Google Maps API keys
- ✅ Setting up Firestore collections & security rules
- ✅ Troubleshooting API/Firebase issues
- ✅ Implementing seeding script

---

### 4. **DEPLOYMENT.md** - App Store & Play Store Publishing
**Purpose:** Deploy to iOS App Store and Google Play Store  
**Audience:** Developers preparing for production release  
**Read time:** 45-60 minutes  
**Contains:**
- Pre-deployment checklist
- App icon & splash screen preparation
- Privacy policy & terms of service
- Expo EAS setup
- iOS deployment (App Store submission)
- Android deployment (Google Play submission)
- Version management
- Secrets management (EAS secrets)
- Post-launch monitoring
- Troubleshooting deployment issues
- Version release checklist

**When to read:**
- ✅ Ready to publish app to app stores
- ✅ Setting up EAS (Expo Build Service)
- ✅ Understanding App Store & Play Store submission process
- ✅ Managing secrets in production

---

### 5. **.env.example** - Configuration Template
**Purpose:** Template for environment variables (optional but recommended)  
**Audience:** Developers securing API keys  
**Status:** OPTIONAL - app has hardcoded keys but externalization is recommended  
**Contains:**
- Firebase credentials template
- Google Maps/Places API keys placeholders
- External API keys (API Ninjas)
- Application configuration variables
- Feature flags template
- Security notes & best practices
- Step-by-step usage instructions
- Environment-specific examples

**When to use:**
- ✅ Securing API keys (recommended for all deployments)
- ✅ Setting up development environment
- ✅ Preparing for production (using EAS secrets)
- ✅ Onboarding new team members

**IMPORTANT NOTE:**
- App currently works WITHOUT .env (keys hardcoded)
- Using .env is HIGHLY RECOMMENDED for security
- Requires modifying `firebaseConfig.js`, `MapScreen.js`, `app.json`

---

### 6. **.gitignore** - Git Safety Rules
**Purpose:** Prevent accidental commits of secrets and build artifacts  
**Audience:** Everyone (critical for team projects)  
**Contains:**
- Environment & secrets exclusions (.env, API keys, certificates)
- Dependencies (node_modules)
- Build artifacts (dist, build, .expo)
- IDE files (.vscode, .idea)
- OS files (.DS_Store, Thumbs.db)
- Logs & temporary files
- Platform-specific files (iOS, Android)
- Database files
- Complete explanations & safety measures

**When to use:**
- ✅ Initialize new repo
- ✅ Before first commit
- ✅ Onboard new developers
- ✅ Ensure secrets never committed

---

## 🗺️ Documentation Roadmap

```
START HERE
    ↓
README.md (understand project)
    ↓
    ├─→ QUICKSTART.md (clone & run)
    │       ↓
    │   Running locally? Proceed to SETUP if issues
    │
    ├─→ SETUP.md (configure Firebase, Google Maps)
    │       ↓
    │   Got errors? Check troubleshooting section
    │
    └─→ DEPLOYMENT.md (when ready to publish)
            ↓
        EAS Build → App Store / Play Store
```

---

## 📖 Reading Guide by Role

### 👨‍💻 **New Developer**
1. **README.md** - Understand project scope & features
2. **QUICKSTART.md** - Get app running
3. **SETUP.md** - If you need to configure services

### 🔧 **DevOps / Backend Developer**
1. **SETUP.md** - Firebase & database setup
2. **.env.example** - Environment management
3. **DEPLOYMENT.md** - Production deployment

### 🚀 **Release Manager**
1. **DEPLOYMENT.md** - Complete deployment process
2. **SETUP.md** (Secrets Management section) - EAS secrets
3. **README.md** (Known Limitations) - Release notes prep

### 👥 **Project Manager / Non-Technical**
1. **README.md** (Overview & Features sections) - Project scope
2. **DEPLOYMENT.md** (Pre-Deployment Checklist) - Release readiness

---

## 🔑 Key Information Quick Reference

### API Keys Required
- ✅ **Firebase** (credentials from Firebase Console)
- ✅ **Google Maps** (from Google Cloud Console)
- ✅ **Google Places** (same as above)
- ✅ **Google Directions** (same as above)
- ⚠️ **API Ninjas** (optional, for vehicle lookup)

### Current Status of Keys
| Service | Status | Location |
|---------|--------|----------|
| Firebase | Hardcoded | `firebaseConfig.js` |
| Google Maps | Hardcoded | `MapScreen.js` |
| Google Places | Hardcoded | `MapScreen.js` |
| Google Directions | Hardcoded | `MapScreen.js` |
| API Ninjas | Hardcoded | `Profil.js` |

**Recommendation:** Externalize using `.env` or EAS secrets

---

### Key Firestore Collections
| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `users` | User profiles | nom, prenom, email, tel, preferences, vehicle, isDriver |
| `annonces` | Ride announcements | userId, lieuxdepart, lieuxarrivee, prix, etat, nbrplace |
| `reservations` | Booking requests | annonceId, userId, status, seatsRequested |
| `messages` | Chat messages | participants, senderId, message, timestamp |

See **README.md** → "Database Schema (Firestore)" for complete schema details.

---

### Navigation Structure
```
AuthStack
├── Login
├── Register
└── Home (splash)

MainStack
├── MainTabs (Bottom Tabs)
│   ├── Rechercher (Search)
│   ├── Publier (Publish)
│   ├── VosTrajets (My Rides)
│   ├── Messages (Conversations)
│   └── Profil (Profile)
├── MapScreen (Location picker)
├── Messages (Chat interface)
└── AdminUsers (Admin only)
```

See **README.md** → "Navigation & Routes" for detailed route descriptions.

---

## ✅ Quick Checklist for Setup

**Before development:**
- [ ] Clone repo
- [ ] Read README.md overview
- [ ] Follow QUICKSTART.md to run app
- [ ] Read SETUP.md if API issues occur
- [ ] Add .env or configure firebaseConfig.js
- [ ] Test login/register flow

**Before deployment:**
- [ ] Read DEPLOYMENT.md
- [ ] Prepare app icon, splash screen
- [ ] Write privacy policy
- [ ] Create Apple Developer account ($99)
- [ ] Create Google Play Developer account ($25)
- [ ] Set up EAS for building
- [ ] Create app listings in both stores
- [ ] Submit for review

---

## 🆘 Troubleshooting Guide

### Can't Run App?
→ **QUICKSTART.md** → Common Issues section

### Errors with Firebase?
→ **SETUP.md** → Firebase Project Setup or Troubleshooting

### Google Maps Not Working?
→ **SETUP.md** → Google Maps & Places APIs or Troubleshooting

### Ready to Deploy?
→ **DEPLOYMENT.md** → Pre-Deployment Checklist

### Lost Track of What to Read?
→ You're here! Use this index to navigate.

---

## 📱 Features at a Glance

**Authentication**
- Register (age ≥18 validation)
- Login
- Logout
- Role system (user/admin)

**Driver Features**
- Publish ride with departure/arrival location picker
- Set price, seats, date/time
- Options: AC, comfort, round-trip
- View & manage passenger requests
- Accept/reject reservations
- Edit ride details
- Mark ride completed

**Passenger Features**
- Search rides with location & date filters
- View ride details & comfort badges
- Request reservation
- Message driver
- Cancel reservation
- Rate driver (if implemented)

**Messaging**
- Conversation list
- One-on-one chat
- User info modal
- Real-time messages

**Profile**
- Edit personal info
- Vehicle management
- Preferences (music, smoker, animals, talkative)
- Profile picture upload
- Password change

---

## 📞 Support

**Found an issue in the docs?**
- Create GitHub issue with "docs:" prefix
- Include which file/section needs improvement

**Want to contribute?**
- Follow docs format in existing files
- Use markdown formatting consistently
- Include code examples where applicable
- Keep it concise but complete

---

## 📊 Documentation Statistics

| File | Size | Read Time | Last Updated |
|------|------|-----------|--------------|
| README.md | ~15 KB | 15-20 min | April 2026 |
| QUICKSTART.md | ~3 KB | 2-3 min | April 2026 |
| SETUP.md | ~18 KB | 30-45 min | April 2026 |
| DEPLOYMENT.md | ~22 KB | 45-60 min | April 2026 |
| .env.example | ~4 KB | 5 min | April 2026 |
| .gitignore | ~8 KB | 5 min | April 2026 |
| **TOTAL** | **~70 KB** | **~2 hours total** | April 2026 |

---

## 🎯 Documentation Goals

✅ **Complete:** Covers all major features and setup processes  
✅ **Accurate:** Based on actual code structure, not assumptions  
✅ **Practical:** Includes step-by-step instructions with examples  
✅ **Honest:** Notes hardcoded keys and security recommendations  
✅ **Maintainable:** Well-organized with clear navigation  
✅ **Beginner-Friendly:** Minimal jargon, plenty of context  

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | April 2026 | Initial comprehensive documentation |

---

**Last Updated:** April 2026  
**Maintained by:** Fi'Thniti Development Team  
**Status:** Active & Current

