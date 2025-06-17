import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCaw3s_r7CdLs4XJOT8OpC5OXDjXNggag",
  authDomain: "fithniti-363c4.firebaseapp.com ",
  projectId: "fithniti-363c4",
  storageBucket: "fithniti-363c4.appspot.com",
  messagingSenderId: "26626554181",
  appId: "1:26626554181:android:b9e62ba967502ae2d5a62c"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Use the existing app
}

// Initialize Firebase Authentication with AsyncStorage for persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
