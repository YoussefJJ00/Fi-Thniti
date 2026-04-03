import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Menu, Button as PaperButton, Checkbox } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ANNONCE_STATUS } from '../utils/annonceStatus';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocationSelection } from '../utils/LocationSelectionContext';
import ModernAlert from '../components/ModernAlert';

const GOOGLE_MAPS_API_KEY = 'AIzaSyD3RXZKBSMx_G2_80SaVMPafleHWDnLHF8';

const Publier = () => {
  const [allerRetour, setAllerRetour] = useState(false);
  const [dateTime, setDateTime] = useState(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showTimePickerStep, setShowTimePickerStep] = useState(false);
  const [description, setDescription] = useState('');
  const [etat, setEtat] = useState('ready');
  const [departureLocation, setDepartureLocation] = useState(null);
  const [arrivalLocation, setArrivalLocation] = useState(null);
  const [nbrPlace, setNbrPlace] = useState('');
  const [prix, setPrix] = useState('');
  const [visible, setVisible] = useState(false);
  const [climatise, setClimatise] = useState(false);
  const [confort, setConfort] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertImage, setAlertImage] = useState(null);

  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const navigation = useNavigation();
  const route = useRoute();
  const { departureLocation: routeDepartureLocation, arrivalLocation: routeArrivalLocation } = route.params || {};
  const { setOnLocationSelected } = useLocationSelection();

  const handlePublish = async () => {
    if (!validateForm()) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        showAlert('Erreur', 'Vous devez être connecté pour publier une annonce.', 'error');
        return;
      }

      const newAnnonce = {
        userId: user.uid,
        description,
        lieuxdepart: departureLocation,
        lieuxarrivee: arrivalLocation,
        datedepart: dateTime,
        heuredepart: dateTime,
        prix: Number(prix),
        nbrplace: Number(nbrPlace),
        aller_retour: allerRetour,
        climatise,
        confort,
        etat: ANNONCE_STATUS.ACTIVE,
        reservedSeats: 0,
        passengerRequests: [],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'annonces'), newAnnonce);

      // Set user as driver
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isDriver: true
      });

      showAlert('Succès', 'Votre annonce a été publiée avec succès!', 'success');
      setDescription('');
      setDepartureLocation(null);
      setArrivalLocation(null);
      setNbrPlace('');
      setPrix('');
      setAllerRetour(false);
      setClimatise(false);
      setConfort(false);
      setDateTime(null);
    } catch (error) {
      console.error('Error publishing annonce:', error);
      showAlert('Erreur', 'Impossible de publier l\'annonce. Veuillez réessayer.', 'error');
    }
  };

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleLocationSelect = (type) => {
    navigation.navigate('MapScreen', {
      type,
      context: 'publish',
      onLocationSelected: (departure, arrival) => {
        setDepartureLocation(departure);
      setArrivalLocation(arrival);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const params = navigation.getState().routes.find(r => r.name === 'Publier')?.params;
      if (params?.departureLocation) {
        setDepartureLocation(params.departureLocation);
      }
      if (params?.arrivalLocation) {
        setArrivalLocation(params.arrivalLocation);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (routeDepartureLocation) {
      setDepartureLocation(routeDepartureLocation);
    }
    if (routeArrivalLocation) {
      setArrivalLocation(routeArrivalLocation);
    }
  }, [routeDepartureLocation, routeArrivalLocation]);

  const validateForm = () => {
    if (!departureLocation) {
      showAlert('Erreur', 'Veuillez sélectionner un lieu de départ', 'error');
      return false;
    }

    if (!arrivalLocation) {
      showAlert('Erreur', 'Veuillez sélectionner un lieu d\'arrivée', 'error');
      return false;
    }

    if (!description.trim()) {
      showAlert('Erreur', 'Veuillez ajouter une description', 'error');
      return false;
    }

    if (!nbrPlace || parseInt(nbrPlace) <= 0 || parseInt(nbrPlace) > 4) {
      showAlert('Erreur', 'Le nombre de places doit être entre 1 et 4', 'error');
      return false;
    }

    if (!prix || parseFloat(prix) <= 0) {
      showAlert('Erreur', 'Veuillez entrer un prix valide', 'error');
      return false;
    }

    const now = new Date();
    if (dateTime < now) {
      showAlert('Erreur', 'La date de départ doit être dans le futur', 'error');
      return false;
    }

    return true;
  };

  const showAlert = (title, message, type = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    if (type === 'success') {
      setAlertImage(require('../../assets/images/check.png'));
    } else {
      setAlertImage(null);
    }
    setAlertVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Publier une annonce</Text>

          {/* Departure & Destination with Flip Button on the right */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              {/* Departure */}
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => handleLocationSelect('departure')}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="radio-button-off-outline" size={22} color="#7a7a7a" />
                </View>
                <Text style={styles.inputText}>
                  {departureLocation ? departureLocation.name : 'Départ'}
                </Text>
              </TouchableOpacity>
              {/* Destination */}
              <TouchableOpacity
                style={styles.inputRow}
                onPress={() => handleLocationSelect('arrival')}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="radio-button-off-outline" size={22} color="#7a7a7a" />
                </View>
                <Text style={styles.inputText}>
                  {arrivalLocation ? arrivalLocation.name : 'Destination'}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Flip Button on the right, centered */}
            <View style={{ justifyContent: 'center', alignItems: 'center', height: 80, marginLeft: 20 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 8,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                }}
                onPress={() => {
                  setDepartureLocation(arrivalLocation);
                  setArrivalLocation(departureLocation);
                }}
                accessibilityLabel="Inverser départ et destination"
              >
                <Ionicons name="sync" size={24} color="#009fe3" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Combined Date & Time */}
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[styles.inputRow, { flex: 1 }]}
              onPress={() => setShowDateTimePicker(true)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={22} color="#7a7a7a" />
              </View>
              <Text style={styles.inputText}>
                {dateTime
                  ? `${dateTime.toLocaleDateString()} ${dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Date et heure de départ'}
              </Text>
            </TouchableOpacity>
            {dateTime && (
              <TouchableOpacity onPress={() => setDateTime(null)} style={styles.clearButton}>
                <View style={styles.clearButtonIconWrap}>
                  <Ionicons name="close-circle" size={24} color="#d32f2f" />
                </View>
              </TouchableOpacity>
            )}
          </View>
          {/* DateTime Picker logic */}
          {showDateTimePicker && (
            <DateTimePicker
              minimumDate={new Date()}
              value={dateTime || new Date()}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDateTimePicker(false);
                if (selectedDate) {
                  // Save the date, then show time picker
                  const baseDate = new Date(selectedDate.setHours(0, 0, 0, 0));
                  setDateTime(baseDate);
                  setShowTimePickerStep(true);
                }
              }}
            />
          )}
          {showTimePickerStep && (
            <DateTimePicker
              value={dateTime || new Date()}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePickerStep(false);
                if (selectedTime) {
                  // Combine date and time
                  const newDate = new Date(dateTime);
                  newDate.setHours(selectedTime.getHours());
                  newDate.setMinutes(selectedTime.getMinutes());
                  setDateTime(newDate);
                }
              }}
            />
          )}

          {/* Number of seats */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={22} color="#7a7a7a" />
            </View>
            <Text style={styles.inputText}>{nbrPlace || '1'}</Text>
            <TouchableOpacity
              style={styles.seatButton}
              onPress={() => setNbrPlace(prev => (parseInt(prev || '1', 10) > 1 ? (parseInt(prev, 10) - 1).toString() : '1'))}
            >
              <Ionicons name="remove-circle-outline" size={24} color="#009fe3" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.seatButton}
              onPress={() => setNbrPlace(prev => (parseInt(prev || '1', 10) < 4 ? (parseInt(prev || '1', 10) + 1).toString() : '4'))}
            >
              <Ionicons name="add-circle-outline" size={24} color="#009fe3" />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.inputRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="pricetag-outline" size={22} color="#7a7a7a" />
            </View>
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="Prix"
              value={prix}
              onChangeText={setPrix}
              keyboardType="numeric"
              placeholderTextColor="#bbb"
            />
          </View>

          {/* Description */}
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#bbb"
          />

          {/* Aller-Retour */}
          <View style={styles.checkboxRow}>
            <Checkbox
              status={allerRetour ? 'checked' : 'unchecked'}
              onPress={() => setAllerRetour(!allerRetour)}
            />
            <Text style={styles.checkboxLabel}>Aller-Retour</Text>
            <Checkbox
              status={climatise ? 'checked' : 'unchecked'}
              onPress={() => setClimatise(!climatise)}
            />
            <Text style={styles.checkboxLabel}>Climatisé</Text>
            <Checkbox
              status={confort ? 'checked' : 'unchecked'}
              onPress={() => setConfort(!confort)}
            />
            <Text style={styles.checkboxLabel}>Confort</Text>
          </View>

          {/* Publish Button */}
          <TouchableOpacity
            style={styles.publishButton}
            onPress={handlePublish}
          >
            <Text style={styles.publishButtonText}>Publier l'annonce</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ModernAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        image={alertImage}
        buttonText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 0,
  },
  iconContainer: {
    marginRight: 16,
    width: 28,
    alignItems: 'center',
  },
  inputText: {
    color: '#7a7a7a',
    fontSize: 16,
    flex: 1,
  },
  seatButton: {
    marginHorizontal: 8,
  },
  descriptionInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafbfc',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  publishButton: {
    backgroundColor: '#009fe3',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonIconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Publier;
