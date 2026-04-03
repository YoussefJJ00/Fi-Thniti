import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, Image, ImageBackground, TouchableOpacity, StyleSheet, TextInput as RNTextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { auth, db } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast, Toast } from "@gluestack-ui/themed";
import ModernAlert from '../components/ModernAlert';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifyingUser, setVerifyingUser] = useState(false);
  const toast = useToast();

  const logoScale = useRef(new Animated.Value(1.5)).current;
  useEffect(() => {
    Animated.timing(logoScale, {
      toValue: 2,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [logoScale]);

  // ModernAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertImage, setAlertImage] = useState(null);
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

  const checkUserProfile = async (userId) => {
    try {
      setVerifyingUser(true);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log('User profile found:', userDoc.data());
        return userDoc.data();
      } else {
        console.log('No user profile found, creating one...');
        // Create a new user profile in Firestore
        const userData = {
          email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        await setDoc(userDocRef, userData);
        console.log('New user profile created');
        return userData;
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      showAlert('Database Error', 'Could not verify user profile', 'error');
      return null;
    } finally {
      setVerifyingUser(false);
    }
  };

  const verifyFirestoreConnection = async (userId) => {
    try {
      // Try to get collection count - now with authentication
      const usersSnapshot = await getDocs(collection(db, 'users'));
      console.log(`Firestore connection successful! Found ${usersSnapshot.size} users.`);
      return true;
    } catch (error) {
      console.error('Error verifying Firestore connection:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Input Error', 'Please enter both email and password', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully');
      
      // Now verify Firestore connection AFTER authentication
      const connectionOk = await verifyFirestoreConnection(userCredential.user.uid);
      if (!connectionOk) {
        showAlert('Database Warning', 'Connected to authentication but database access may be limited', 'warning');
      }
      
      // Check/create user profile in Firestore
      const userProfile = await checkUserProfile(userCredential.user.uid);
      
      if (userProfile) {
        navigation.replace('Home');
      }

      // Example of showing a toast
      toast.show({
        placement: "top",
        render: ({ id }) => {
          return (
            <Toast nativeID={"toast-" + id} action="attention" variant="solid">
              <Toast.Title>Login Successful</Toast.Title>
            </Toast>
          );
        },
      });
    } catch (error) {
      console.error('Error logging in:', error.message);
      
      let errorMessage = 'Authentication failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      }
      
      showAlert('Login Error', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google Sign In
    showAlert('Coming Soon', 'Google Sign In will be available in a future update', 'info');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top image section */}
      <View style={styles.imageContainer}>
        <Animated.Image
          source={require('../../assets/images/fi_thniitit.png')}
          style={[styles.logoImage, { transform: [{ scale: logoScale }] }]}
          resizeMode="cover"
        />
      </View>

      {/* Content container */}
      <View style={styles.contentContainer}>
        {/* Welcome text */}
        <Text style={styles.welcomeText}>
          Bienvenue <Text></Text>
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icons/email.png')}
            style={styles.inputIcon}
          />
          <RNTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.textInput}
            placeholderTextColor="#888"
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/icons/lock.png')}
            style={styles.inputIcon}
          />
          <RNTextInput
            placeholder="Entrer votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            style={styles.textInput}
            placeholderTextColor="#888"
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} disabled={isLoading}>
            <Image
              source={require('../../assets/icons/eyecross.png')}
              style={styles.visibilityIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading || verifyingUser ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.signUpButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Or divider */}
        <View style={styles.orContainer}>
          <Text style={styles.orText}>Or</Text>
        </View>

        {/* Google Sign In */}
        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.disabledButton]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Image
            source={require('../../assets/icons/google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Se connecter via google</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Pas de compte? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
            <Text style={styles.logInButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: '30%',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: 220,
    maxHeight: 320,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    paddingBottom: 8,
    marginBottom: 24,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#888',
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  visibilityIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
  },
  signUpButton: {
    backgroundColor: '#0D8BFF',
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  orText: {
    color: '#888',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 30,
    height: 50,
    marginBottom: 32,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  logInButtonText: {
    color: '#0D8BFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;
