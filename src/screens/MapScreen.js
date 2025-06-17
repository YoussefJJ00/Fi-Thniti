import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const MapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type, context, currentDeparture, currentArrival } = route.params || {};
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 36.8065,  // Tunisia's center
    longitude: 10.1815,
    latitudeDelta: 5.0,  // Increased for faster initial load
    longitudeDelta: 5.0,
  });

  // Predefined locations
  const predefinedLocations = [
    { name: 'Rond Point Sahloul', latitude: 35.8339, longitude: 10.5896 }, // Location A
    { name: 'Kiosque Agil Covoiturage', latitude: 36.8002, longitude: 10.1884 }, // Location B
  ];

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [departureLocation, setDepartureLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [search, setSearch] = useState('');

  // Optimize location permission check
  useEffect(() => {
    let isMounted = true;

    const checkLocationPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
          if (newStatus !== 'granted' || !isMounted) return;
        }

        // Only get location if permission is granted
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Lower accuracy for faster response
        });

        if (!isMounted) return;

        // Only update if within Tunisia
        if (location.coords.latitude >= 30.0 && location.coords.latitude <= 38.0 && 
            location.coords.longitude >= 7.0 && location.coords.longitude <= 12.0) {
          setInitialRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      } catch (error) {
        console.error('Location permission error:', error);
      }
    };

    checkLocationPermission();
    return () => { isMounted = false };
  }, []);

  // Optimize Google Places Autocomplete
  const googlePlacesProps = {
    placeholder: "Rechercher une ville en Tunisie",
    minLength: 2,
    debounce: 400, // Increased debounce time
    enablePoweredByContainer: false, // Remove "Powered by Google" container
    fetchDetails: true,
    query: {
      key: 'AIzaSyD3RXZKBSMx_G2_80SaVMPafleHWDnLHF8',
      language: 'fr',
      components: 'country:tn',
      types: ['(cities)'],
    },
    textInputProps: {
      placeholderTextColor: '#666',
      returnKeyType: 'search',
      autoCorrect: false,
    }
  };

  const fetchRoute = async (origin, destination) => {
    if (!origin || !destination) return [];

    const originString = `${origin.latitude},${origin.longitude}`;
    const destinationString = `${destination.latitude},${destination.longitude}`;
    const apiKey = 'AIzaSyD3RXZKBSMx_G2_80SaVMPafleHWDnLHF8'; // Replace with your actual API key

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originString}&destination=${destinationString}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        return points;
      } else {
        console.error('Error fetching directions:', data.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      return [];
    }
  };

  const decodePolyline = (t) => {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result >> 1) ^ -(result & 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result >> 1) ^ -(result & 1));
      lng += dlng;

      points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
    }
    return points;
  };

  useEffect(() => {
    const getRoute = async () => {
      if (departureLocation && destinationLocation) {
        const points = await fetchRoute(departureLocation, destinationLocation);
        setRouteCoordinates(points);
      }
    };
    getRoute();
  }, [departureLocation, destinationLocation]);

  const handlePredefinedLocationSelect = (location) => {
    if (!departureLocation) {
      setDepartureLocation(location);
      Alert.alert('Départ sélectionné', `Départ: ${location.name}\n\nVeuillez maintenant sélectionner la destination.`);
    } else if (!destinationLocation) {
      setDestinationLocation(location);
      Alert.alert('Destination sélectionnée', `Destination: ${location.name}`);
    }
  };

  const handlePlaceSelect = (data, details) => {
    try {
      if (!details || !details.geometry) {
        Alert.alert('Erreur', 'Impossible d\'obtenir les détails de l\'emplacement');
        return;
      }

      const { geometry } = details;
      const location = {
        latitude: geometry.location.lat,
        longitude: geometry.location.lng,
        name: data.description,
      };

      // Handle selection of predefined locations
      handlePredefinedLocationSelect(location);

      setMarkerCoordinate(location);
      mapRef.current?.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 1000);
    } catch (error) {
      console.error('Error selecting place:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner cet emplacement. Veuillez réessayer.');
    }
  };

  const handleMapPress = (event) => {
    try {
      const { coordinate } = event.nativeEvent;
      const location = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name: `Selected location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`,
      };

      // If a departure location is already set, set the destination
      if (departureLocation && !destinationLocation) {
        setDestinationLocation(location);
        Alert.alert('Destination sélectionnée', `Destination: ${location.name}`);
      } else {
        Alert.alert('Erreur', 'Veuillez d\'abord sélectionner un point de départ.');
      }

      setMarkerCoordinate(location);
    } catch (error) {
      console.error('Error handling map press:', error);
      Alert.alert('Error', 'Could not select this location. Please try again.');
    }
  };

  const handleConfirmLocation = () => {
    if (!departureLocation && !destinationLocation) {
      Alert.alert('Erreur', 'Veuillez sélectionner le départ et la destination');
      return;
    }
    if (route.params?.onLocationSelected) {
      route.params.onLocationSelected(departureLocation, destinationLocation);
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map screen temporarily removed. Will be rebuilt from scratch.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    padding: 20,
  },
}); 