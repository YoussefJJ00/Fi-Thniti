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
import { NativeWindStyleSheet } from "nativewind";
import { LogBox } from 'react-native';
import { enableScreens } from 'react-native-screens';
import MainTabs from './src/navigation/MainTabs';

NativeWindStyleSheet.setOutput({
  default: "native",
});

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
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#fff' }
            }}
          >
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="MapScreen" 
              component={MapScreen}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}