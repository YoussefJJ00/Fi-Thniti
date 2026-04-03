// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Rechercher from './src/screens/Rechercher';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Publier from './src/screens/Publier';
import VosTrajets from './src/screens/VosTrajets';
import Messages from './src/screens/Messages';
import Profil from './src/screens/Profil';
import MapScreen from './src/screens/MapScreen';
import 'react-native-get-random-values';
import Icon from 'react-native-vector-icons/Ionicons';
import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider } from "react-native-paper";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { LogBox } from 'react-native';
import { enableScreens } from 'react-native-screens';
import MainTabs from './src/navigation/MainTabs';
import { LocationSelectionProvider } from './src/utils/LocationSelectionContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { useState } from 'react';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Enable screen optimization
enableScreens();

// Ignore non-critical warnings
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state',
]);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && (
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}