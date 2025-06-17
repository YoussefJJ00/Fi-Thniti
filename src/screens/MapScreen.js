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
    placeholder: "Rechercher un lieu en Tunisie",
    minLength: 2,
    debounce: 400, // Increased debounce time
    enablePoweredByContainer: false, // Remove "Powered by Google" container
    fetchDetails: true,
    query: {
      key: 'AIzaSyD3RXZKBSMx_G2_80SaVMPafleHWDnLHF8',
      language: 'fr',
      components: 'country:tn',
      // Remove or broaden types to allow all places
      // types: '(establishment)',
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

      // Only zoom to the searched location, do not set marker or select
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

  const handleMapPress = async (event) => {
    try {
      const { coordinate } = event.nativeEvent;
      let locationName = '';
      let foundPlace = null;
      const apiKey = 'AIzaSyD3RXZKBSMx_G2_80SaVMPafleHWDnLHF8';
      // 1. Try Google Places Nearby Search for place types
      try {
        const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinate.latitude},${coordinate.longitude}&radius=50&types=airport|restaurant|hotel|point_of_interest&key=${apiKey}&language=fr`;
        const response = await fetch(nearbyUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Find the first relevant place
          foundPlace = data.results.find(place =>
            place.types.some(type => ['airport', 'restaurant', 'hotel', 'point_of_interest'].includes(type))
          ) || data.results[0];
        }
      } catch (err) {
        // Ignore, fallback to reverse geocode
      }
      if (foundPlace) {
        locationName = foundPlace.name;
      } else {
        // 2. Fallback to reverse geocode
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          });
          if (geocode && geocode.length > 0) {
            const place = geocode[0];
            const city = place.city || '';
            const region = place.region || '';
            const street = place.street || '';
            console.log({
              place,
              city,
              region,
              street, 
            })
            if (!city && !region && !street) {
              Alert.alert('Erreur', 'Emplacement inconnu, veuillez sélectionner un autre point.');
              return;
            }
            locationName = [street, city, region].filter(Boolean).join(', ');
          } else {
            Alert.alert('Erreur', 'Emplacement inconnu, veuillez sélectionner un autre point.');
            return;
          }
        } catch (geoError) {
          Alert.alert('Erreur', 'Emplacement inconnu, veuillez sélectionner un autre point.');
          return;
        }
      }
      if (!locationName) {
        Alert.alert('Erreur', 'Aucun lieu d\'intérêt trouvé à cet endroit.');
        return;
      }
      const location = {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        name: locationName,
      };

      if (!departureLocation) {
        setDepartureLocation(location);
        Alert.alert('Départ sélectionné', `Départ: ${location.name}\n\nVeuillez maintenant sélectionner la destination.`);
      } else if (!destinationLocation) {
        setDestinationLocation(location);
        Alert.alert('Destination sélectionnée', `Destination: ${location.name}`);
      } else {
        Alert.alert('Erreur', 'Les deux emplacements sont déjà sélectionnés.');
      }

      setMarkerCoordinate(location);
    } catch (error) {
      console.error('Error handling map press:', error);
      Alert.alert('Error', 'Could not select this location. Please try again.');
    }
  };

  // Handle POI (Point of Interest) click
  const handlePoiClick = async (event) => {
    const poi = event.nativeEvent;
    let locationName = poi.name;
    // Try to get city and region from reverse geocode
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude: poi.coordinate.latitude,
        longitude: poi.coordinate.longitude,
      });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const city = place.city || '';
        const region = place.region || '';
        const extra = [city, region].filter(Boolean).join(', ');
        if (extra) {
          locationName = `${poi.name}, ${extra}`;
        }
      }
    } catch (err) {
      // Ignore, fallback to POI name only
    }
    const location = {
      latitude: poi.coordinate.latitude,
      longitude: poi.coordinate.longitude,
      name: locationName,
    };
    if (!departureLocation) {
      setDepartureLocation(location);
      Alert.alert('Départ sélectionné', `Départ: ${location.name}\n\nVeuillez maintenant sélectionner la destination.`);
    } else if (!destinationLocation) {
      setDestinationLocation(location);
      Alert.alert('Destination sélectionnée', `Destination: ${location.name}`);
    } else {
      Alert.alert('Erreur', 'Les deux emplacements sont déjà sélectionnés.');
    }
    setMarkerCoordinate(location);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      {/* Search Bar */}
      <View style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        zIndex: 20,
        paddingHorizontal: 16,
      }}>
        <GooglePlacesAutocomplete
          ref={searchRef}
          onPress={handlePlaceSelect}
          {...googlePlacesProps}
          styles={{
            textInput: {
              height: 44,
              borderRadius: 22,
              backgroundColor: '#fff',
              fontSize: 16,
              paddingHorizontal: 16,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
            },
            listView: {
              backgroundColor: '#fff',
              borderRadius: 12,
              marginTop: 4,
              elevation: 3,
              zIndex: 30,
            },
          }}
        />
      </View>
      {/* Map */}
      <View style={{ flex: 1, marginTop: 12, marginHorizontal: 8, borderRadius: 24, overflow: 'hidden' }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          region={initialRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onPoiClick={handlePoiClick}
        >
          {predefinedLocations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={location.name}
              onPress={() => handlePredefinedLocationSelect(location)}
            >
              {/* No plain text children here, only use JSX or leave empty */}
            </Marker>
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#FF5733"
              strokeWidth={4}
              lineDashPattern={[10, 5]}
            />
          )}

          {markerCoordinate && (
            <Marker
              coordinate={markerCoordinate}
              title={selectedLocation?.name || 'Emplacement sélectionné'}
            >
              {/* No plain text children here, only use JSX or leave empty */}
            </Marker>
          )}
        </MapView>
      </View>
      {/* Go Back Button - above the search bar */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          zIndex: 30,
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 8,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 4,
        }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={22} color="#222" />
      </TouchableOpacity>
      {/* Floating Action Button (suggestions) */}
      <TouchableOpacity
        style={[styles.floatingButton, { top: undefined, bottom: 90, alignSelf: 'center' }]}
        onPress={() => Alert.alert('Suggestions', 'Voir les suggestions')}
      >
        <Text style={{ color: '#009fe3', fontWeight: 'bold', fontSize: 16 }}>Voir les suggestions</Text>
      </TouchableOpacity>
      {departureLocation && destinationLocation && (
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
        >
          <Text style={styles.confirmButtonText}>
            Confirmer les emplacements
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 40,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  headerBackBtn: {
    position: 'absolute',
    left: 16,
    top: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    flex: 1,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 2,
  },
  mapContainer: {
    flex: 1,
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  map: {
    flex: 1,
  },
  floatingButton: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapScreen; 