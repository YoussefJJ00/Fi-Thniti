import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Rechercher from '../screens/Rechercher'; // Ensure this path is correct

const Stack = createNativeStackNavigator();

const RechercherStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Rechercher" component={Rechercher} options={{ headerShown: false }} />
    {/* Add other screens as needed */}
  </Stack.Navigator>
);

export default RechercherStack;
