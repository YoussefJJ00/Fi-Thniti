import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  ScrollView, 
  StatusBar, 
  ActivityIndicator, 
  Switch,
  Modal
} from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker'; // Importing expo-image-picker
import Icon from 'react-native-vector-icons/Feather'; // Ensure you have this package installed
import firebase from 'firebase/app'; // Ensure you have Firebase initialized
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferences, setPreferences] = useState({
    hasAnimals: false,
    isSmoker: false,
    musicPreference: '',
    isTalkative: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get the current user's ID
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [editPreferences, setEditPreferences] = useState(preferences);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicle, setVehicle] = useState({
    brand: '',
    model: '',
    type: '',
    seats: '',
    color: '',
    licensePlate: '',
    isDefault: false,
  });
  const [brands] = useState(['Toyota', 'Citroën', 'Renault', 'Peugeot', 'Ford', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'Nissan', 'Opel', 'Seat', 'Skoda', 'Suzuki', 'Fiat', 'Chevrolet']);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [seatsOptions, setSeatsOptions] = useState(['2','3','4','5','6','7']);
  const [colors] = useState(['Black', 'White', 'Blue', 'Red', 'Silver', 'Gray', 'Green', 'Yellow']);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTypeSeats, setLoadingTypeSeats] = useState(false);
  const [licensePlate, setLicensePlate] = useState('');

  const API_KEY = 'pNQEiaCh3YTD2L4oBo4qhA==AMXUJZqejCUPKdmS';

  const popularBrands = [
    'Audi', 'BMW', 'Renault', 'Kia', 'Toyota', 'Peugeot', 'Volkswagen', 'Mercedes-Benz', 'Ford', 'Hyundai'
  ];

  const popularModels = {
    'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5'],
    'BMW': ['1 Series', '3 Series', '5 Series', 'X1', 'X3'],
    'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Twingo'],
    'Kia': ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Sorento'],
    'Toyota': ['Yaris', 'Corolla', 'Auris', 'RAV4', 'C-HR'],
    'Peugeot': ['208', '308', '2008', '3008', '5008'],
    'Volkswagen': ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC'],
    'Ford': ['Fiesta', 'Focus', 'Kuga', 'Puma', 'EcoSport'],
    'Hyundai': ['i10', 'i20', 'i30', 'Tucson', 'Kona']
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      setIsLoading(false);
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setFirstName(data.nom || '');
        setLastName(data.prenom || '');
        setEmail(data.email || '');
        setPhoneNumber(data.tel || '');
        setPreferences(data.preferences || preferences); // Load preferences if available
        setVehicle(data.vehicle || vehicle); // Load vehicle data if available
      } else {
        Alert.alert('Error', 'User data not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const selectProfilePicture = async () => {
    console.log("Selecting profile picture...");
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("Permission Result: ", permissionResult);
  
    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    console.log("Image Picker Result: ", result);
  
    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      console.log("Selected Image URI:", selectedUri);
      await uploadImageToStorage(selectedUri);  // Proceed with uploading the image
    } else {
      console.log("Image selection was canceled.");
    }
  };
  
  const uploadImageToStorage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = firebase.storage().ref().child(`profilePictures/${userId}`);
    await storageRef.put(blob);
    const downloadURL = await storageRef.getDownloadURL();
    await updateProfilePicture(downloadURL);
  };

  const updateProfilePicture = async (imageUrl) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { profilePicture: imageUrl }, { merge: true }); // Use profilePicture field
    Alert.alert('Success', 'Profile picture updated successfully');
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = async () => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { preferences }, { merge: true });
    Alert.alert('Success', 'Preferences updated successfully');
  };

  const handleSaveVehicle = async () => {
    const formattedPlate = formatTunisianPlate(licensePlate);
    // Save formattedPlate to Firestore or your state
    setShowVehicleModal(false);
  };

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const res = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json');
      const data = await res.json();
      const brands = data.Results.map(item => item.Make_Name);
      setBrands(brands);
    } catch (e) {
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModels = async (brand) => {
    setLoadingModels(true);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${brand}?format=json`);
      const data = await res.json();
      const models = data.Results.map(item => item.Model_Name);
      setModels(models);
    } catch (e) {
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchTypeAndSeats = async (brand, model) => {
    setLoadingTypeSeats(true);
    try {
      const res = await fetch(`https://api.api-ninjas.com/v1/cars?make=${brand}&model=${model}&limit=1`, {
        headers: { 'X-Api-Key': API_KEY }
      });
      const data = await res.json();
      if (data.length > 0) {
        setVehicle(v => ({ ...v, type: data[0].class || data[0].body_type || '', seats: data[0].seats ? String(data[0].seats) : '' }));
      }
    } catch (e) {
      // fallback
    } finally {
      setLoadingTypeSeats(false);
    }
  };

  // Fetch brands when modal opens
  useEffect(() => {
    if (showVehicleModal) {
      fetchBrands();
    }
  }, [showVehicleModal]);

  // Fetch models when brand changes
  useEffect(() => {
    if (vehicle.brand) {
      fetchModels(vehicle.brand);
    } else {
      setModels([]);
    }
  }, [vehicle.brand]);

  // Fetch type and seats when model changes
  useEffect(() => {
    if (vehicle.brand && vehicle.model) {
      fetchTypeAndSeats(vehicle.brand, vehicle.model);
    }
  }, [vehicle.model]);

  function formatTunisianPlate(plate) {
    // Expecting input like "1234567"
    const cleaned = plate.replace(/\D/g, '');
    if (cleaned.length < 4) return plate;
    const first = cleaned.slice(0, 3).padStart(3, '0');
    const last = cleaned.slice(3, 7).padStart(4, '0');
    return `${last} تونس ${first}`;
  }

  const saveVehicle = async (vehicleData) => {
    try {
      const userId = auth.currentUser.uid;
      await updateDoc(doc(db, 'users', userId), {
        vehicle: {
          brand: vehicleData.brand,
          model: vehicleData.model,
          type: vehicleData.type,
          color: vehicleData.color,
          licensePlate: vehicleData.licensePlate,
          seats: vehicleData.seats,
        }
      });
      Alert.alert('Succès', 'Véhicule sauvegardé avec succès !');
    } catch (e) {
      console.log('Error saving vehicle:', e);
      Alert.alert('Erreur', "Impossible de sauvegarder le véhicule.\n" + (e.message || e));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#141414" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Image and Title */}
        <View style={styles.profileHeaderContainer}>
          <TouchableOpacity onPress={selectProfilePicture} style={styles.profileImageContainer}> 
            {userData?.profilePicture ? (
              <Image
                source={{ uri: userData.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}> 
                <Icon name="user" size={64} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profileHeaderText}>Your Profile</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>First name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
            />
            <Icon name="edit-2" size={20} color="#BDBDBD" style={styles.inputIcon} />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Last name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
            />
            <Icon name="edit-2" size={20} color="#BDBDBD" style={styles.inputIcon} />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={email}
              editable={false}
              placeholder="Email"
            />
            <Icon name="edit-2" size={20} color="#BDBDBD" style={styles.inputIcon} />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone number</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone number"
            />
            <Icon name="edit-2" size={20} color="#BDBDBD" style={styles.inputIcon} />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionRow}>
          <View style={styles.checkboxLabel}>
            <Icon name="check-circle" size={24} color="#212121" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <Text style={styles.sectionDesc}>Bavard, Fumeur, Animals</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => {
            setEditPreferences(preferences);
            setShowPrefModal(true);
          }}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Voiture Section */}
        <View style={styles.sectionRow}>
          <View style={styles.checkboxLabel}>
            <Icon name="check-circle" size={24} color="#212121" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.sectionTitle}>Voiture</Text>
              <Text style={styles.sectionDesc}>Marque, Model, Type</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => setShowVehicleModal(true)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Preferences Modal */}
      <Modal
        visible={showPrefModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrefModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Preferences</Text>
            {/* Checkboxes */}
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setEditPreferences(prev => ({ ...prev, isTalkative: !prev.isTalkative }))}
              >
                <Icon name={editPreferences.isTalkative ? "check-square" : "square"} size={24} color="#009fe3" />
                <Text style={styles.checkboxLabel}>Bavard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setEditPreferences(prev => ({ ...prev, isSmoker: !prev.isSmoker }))}
              >
                <Icon name={editPreferences.isSmoker ? "check-square" : "square"} size={24} color="#009fe3" />
                <Text style={styles.checkboxLabel}>Fumeur</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setEditPreferences(prev => ({ ...prev, hasAnimals: !prev.hasAnimals }))}
              >
                <Icon name={editPreferences.hasAnimals ? "check-square" : "square"} size={24} color="#009fe3" />
                <Text style={styles.checkboxLabel}>Animals</Text>
              </TouchableOpacity>
            </View>
            {/* Music Preference Input */}
            <TextInput
              style={styles.modalInput}
              placeholder="Music Preference"
              value={editPreferences.musicPreference}
              onChangeText={text => setEditPreferences(prev => ({ ...prev, musicPreference: text }))}
            />
            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                setPreferences(editPreferences);
                setShowPrefModal(false);
                await handleSavePreferences();
              }}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Vehicle Modal */}
      <Modal
        visible={showVehicleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.vehicleModalContent}>
            <TouchableOpacity onPress={() => setShowVehicleModal(false)} style={{ alignSelf: 'flex-end' }}>
              <Icon name="x" size={24} color="#009fe3" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            {/* Brand Dropdown */}
            {loadingBrands ? <ActivityIndicator size="small" color="#009fe3" /> : (
              <View style={styles.modalInput}>
                <Picker
                  selectedValue={vehicle.brand}
                  onValueChange={(itemValue) => setVehicle({ ...vehicle, brand: itemValue })}
                >
                  <Picker.Item label="Select brand" value="" />
                  {brands.map((b, i) => <Picker.Item key={i} label={b} value={b} />)}
                </Picker>
              </View>
            )}
            {/* Model Dropdown */}
            {loadingModels ? <ActivityIndicator size="small" color="#009fe3" /> : (
              <View style={styles.modalInput}>
                <Picker
                  selectedValue={vehicle.model}
                  onValueChange={(itemValue) => setVehicle(v => ({ ...v, model: itemValue }))}
                  enabled={!!vehicle.brand}
                >
                  <Picker.Item label="Vehicle Model" value="" />
                  {(models || []).map((m, i) => <Picker.Item key={i} label={m} value={m} />)}
                </Picker>
              </View>
            )}
            {/* Type Dropdown (auto-filled) */}
            <View style={styles.modalInput}>
              <Picker
                selectedValue={vehicle.type}
                onValueChange={(itemValue) => setVehicle(v => ({ ...v, type: itemValue }))}
                enabled={!!vehicle.type}
              >
                <Picker.Item label="Vehicle Type (ex - Hatchback)" value="" />
                {vehicle.type ? <Picker.Item label={vehicle.type} value={vehicle.type} /> : null}
              </Picker>
            </View>
            {/* Seats Dropdown (auto-filled or selectable) */}
            <View style={styles.modalInput}>
              <Picker
                selectedValue={vehicle.seats}
                onValueChange={(itemValue) => setVehicle(v => ({ ...v, seats: itemValue }))}
              >
                <Picker.Item label="No. of seats" value="" />
                {seatsOptions.map((s, i) => <Picker.Item key={i} label={s} value={s} />)}
              </Picker>
            </View>
            {/* Color Dropdown */}
            <View style={styles.modalInput}>
              <Picker
                selectedValue={vehicle.color}
                onValueChange={(itemValue) => setVehicle(v => ({ ...v, color: itemValue }))}
              >
                <Picker.Item label="Colour of vehicle" value="" />
                {colors.map((c, i) => <Picker.Item key={i} label={c} value={c} />)}
              </Picker>
            </View>
            {/* License Plate Input */}
            <TextInput
              style={styles.modalInput}
              placeholder="License plate number (e.g. 123 تونس 4567)"
              value={licensePlate}
              onChangeText={text => setLicensePlate(text.replace(/[^0-9]/g, '').slice(0, 7))}
              keyboardType="numeric"
            />
            {licensePlate.length >= 5 && (
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 18, letterSpacing: 2, backgroundColor: '#222', color: '#fff', padding: 6, borderRadius: 6 }}>
                  {formatTunisianPlate(licensePlate)}
                </Text>
                <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                  Example: 1234567 → 123 تونس 4567
                </Text>
              </View>
            )}
            {/* Preview */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8, alignSelf: 'flex-start' }}>
              <TouchableOpacity onPress={() => setVehicle(v => ({ ...v, isDefault: !v.isDefault }))}>
                <Icon name={vehicle.isDefault ? 'check-square' : 'square'} size={22} color="#009fe3" />
              </TouchableOpacity>
              <Text style={{ marginLeft: 8 }}>Save this as My Vehicle</Text>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => saveVehicle(vehicle)}>
              <Text style={styles.saveButtonText}>Save Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  profileHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginTop: 8,
  },
  inputGroup: {
    width: '88%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    color: '#212121',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#212121',
  },
  inputIcon: {
    marginLeft: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checkboxLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  sectionDesc: {
    fontSize: 13,
    color: '#757575',
  },
  editBtn: {
    backgroundColor: '#009fe3',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 22,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    marginLeft: 6,
    fontSize: 15,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 18,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#009fe3',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  vehicleModalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
});

export default Profile;
