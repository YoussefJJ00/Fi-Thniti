import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const Register = ({ navigation }) => {
  // Form state
  const [genre, setGenre] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [receivePromos, setReceivePromos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI state
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const scrollViewRef = useRef(null);
  const refs = {
    firstName: useRef(null),
    lastName: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    password: useRef(null),
  };

  // Reset scroll position on mount/focus
  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setShowDatePicker(Platform.OS === 'ios');
    setTempDate(currentDate);
    
    if (event.type === 'set' || Platform.OS === 'ios') {
      setDateOfBirth(currentDate);
    }
  };

  // Age calculation helper
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper to scroll to a field
  const handleFocus = (refName) => {
    setTimeout(() => {
      const ref = refs[refName]?.current;
      if (ref && scrollViewRef.current) {
        ref.measure((fx, fy, width, height, px, py) => {
          scrollViewRef.current.scrollTo({ y: py - 40, animated: true });
        });
      }
    }, 100);
  };

  const handleRegister = async () => {
    // Validate form
    if (!nom || !prenom || !email || !password) {
      Alert.alert('Input Error', 'Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
    if (!emailPattern.test(email)) {
      Alert.alert('Input Error', 'Please enter a valid email address');
      return;
    }

    if (!dateOfBirth) {
      Alert.alert('Input Error', 'Please select your date of birth');
      return;
    }

    if (!genre) {
      Alert.alert('Input Error', 'Please select your gender');
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      Alert.alert('Age Restriction', 'You must be at least 18 years old to register');
      return;
    }

    try {
      setIsLoading(true);

      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Get the user ID

      // Store user data in Firestore
      const userData = {
        date_birth: dateOfBirth.toISOString(), // Store date of birth
        prenom, // Store last name as prenom
        nom, // Store first name as nom
        email,
        genre, // Store gender
        tel: phone,
      };

      // Save user data to Firestore using userId as the document ID
      const userRef = doc(db, 'users', userId); // Use userId instead of email
      await setDoc(userRef, userData);

      // Show modern success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Registration error:', error.message);
      Alert.alert('Error', 'There was a problem saving your information: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <SafeAreaView style={styles.headerSafeArea}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
      </SafeAreaView>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
      <ScrollView contentContainerStyle={styles.scrollContent} ref={scrollViewRef}>
        {/* Main content */}
        <View style={styles.content}>
          {/* Header text */}
          <Text style={styles.headerText}>
            Let's start with your details...
          </Text>

          {/* Genre Selection */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity 
              style={styles.dropdownField}
              onPress={() => setShowGenreModal(true)}
              disabled={isLoading}
            >
              <Text style={genre ? styles.inputText : styles.placeholderText}>
                {genre || ''}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* First Name Input */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>First name</Text>
            <TextInput
              ref={refs.firstName}
              value={nom}
              onChangeText={setNom}
              style={styles.textInput}
              editable={!isLoading}
              onFocus={() => handleFocus('firstName')}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Last name</Text>
            <TextInput
              ref={refs.lastName}
              value={prenom}
              onChangeText={setPrenom}
              style={styles.textInput}
              editable={!isLoading}
              onFocus={() => handleFocus('lastName')}
            />
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput
              ref={refs.phone}
              value={phone}
              onChangeText={setPhone}
              style={styles.textInput}
              editable={!isLoading}
              keyboardType="phone-pad"
              onFocus={() => handleFocus('phone')}
            />
          </View>

          {/* Date of Birth Dropdown */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.dropdownField}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={dateOfBirth ? styles.inputText : styles.placeholderText}>
                {dateOfBirth ? formatDate(dateOfBirth) : ''}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Email Input */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              ref={refs.email}
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
              onFocus={() => handleFocus('email')}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              ref={refs.password}
              value={password}
              onChangeText={setPassword}
              style={styles.textInput}
              editable={!isLoading}
              secureTextEntry
              placeholderTextColor="#888"
              onFocus={() => handleFocus('password')}
            />
          </View>

          {/* Promotional Emails Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkbox} 
              onPress={() => setReceivePromos(!receivePromos)}
            >
              {receivePromos && (
                <View style={styles.checkboxInner} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I don't want to receive any special offers and personalised recommendations.
            </Text>
          </View>

          {/* Terms Text */}
          <Text style={styles.termsText}>
            By entering your email, you agree to receive promotional emails from Fi'thniti. Opt out now by checking the box above or at any time in your profile settings.
          </Text>
        </View>
      </ScrollView>

      {/* Next Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, isLoading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Genre Modal */}
      <Modal
        transparent={true}
        visible={showGenreModal}
        animationType="fade"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenreModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setGenre('Male');
                setShowGenreModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Male</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption}
              onPress={() => {
                setGenre('Female');
                setShowGenreModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Female</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowGenreModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <View>
          {Platform.OS === 'ios' ? (
            <Modal
              transparent={true}
              visible={showDatePicker}
              animationType="slide"
            >
              <View style={styles.datePickerModalContainer}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity 
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => {
                        setDateOfBirth(tempDate);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1930, 0, 1)}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1930, 0, 1)}
            />
          )}
        </View>
      )}

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', width: 300 }}>
            <Image source={require('../../assets/images/check.png')} style={{ width: 80, height: 80, marginBottom: 24 }} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' }}>Inscription réussie !</Text>
            <Text style={{ fontSize: 16, color: '#555', marginBottom: 28, textAlign: 'center' }}>Votre compte a été créé avec succès.</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#009fe3', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 32 }}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Let's go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSafeArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, // Extra padding at bottom for the fixed button
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 3,
    marginTop: 5,
  },
  backButtonText: {
    fontSize: 18,
    color: '#2DCCCD', // Updated to lighter turquoise color
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 25,
    color: '#1c5d5a', // Dark teal color
    marginTop: 5,
  },
  inputField: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8898a5',
    marginBottom: 6,
    fontWeight: '400',
  },
  textInput: {
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownField: {
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#999',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#2DCCCD', // Updated to match X button turquoise color
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: '#2DCCCD', // Updated to match X button turquoise color
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#8898a5',
    marginBottom: 15,
    lineHeight: 18,
    marginTop: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingVertical: 15,
  },
  nextButton: {
    backgroundColor: '#00b2ff',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
    borderRadius: 0,
  },
  disabledButton: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#00b2ff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Date picker styles
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerCancel: {
    color: '#999',
    fontSize: 16,
  },
  datePickerDone: {
    color: '#00b2ff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Register;
