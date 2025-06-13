import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RechercherStack from './RechercherStack';
import Publier         from '../screens/Publier';
import VosTrajets      from '../screens/VosTrajets';
import Messages        from '../screens/Messages';
import Profil          from '../screens/Profil';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  return (
    <Tab.Navigator
      initialRouteName="Rechercher"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Rechercher') {
            return <Ionicons name="search-outline" size={size} color={color} />;
          } else if (route.name === 'Publier') {
            return <Ionicons name="add-circle-outline" size={size} color={color} />;
          } else if (route.name === 'VosTrajets') {
            return <Ionicons name="car-outline" size={size} color={color} />;
          } else if (route.name === 'Messages') {
            return <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />;
          } else if (route.name === 'Profil') {
            return <Ionicons name="person-outline" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen  name="Rechercher" component={RechercherStack} />
      <Tab.Screen  name="Publier"     component={Publier} />
      <Tab.Screen  name="VosTrajets"  component={VosTrajets} />
      <Tab.Screen  name="Messages"    component={Messages} />
      <Tab.Screen  name="Profil"      component={Profil} />
      
    </Tab.Navigator>
  );
}
