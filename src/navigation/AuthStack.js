import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login     from '../screens/Login';
import Register  from '../screens/Register';
import MainTabs  from './MainTabs';
import { House, Search, PlusCircle, Car, MessageCircle, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"    component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home"     component={MainTabs} />
    </Stack.Navigator>
  );
}
