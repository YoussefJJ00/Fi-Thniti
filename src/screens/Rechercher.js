import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, limit, onSnapshot, orderBy, doc, runTransaction, updateDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { ANNONCE_STATUS } from '../utils/annonceStatus';
import { auth } from '../../firebaseConfig';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ModernAlert from '../components/ModernAlert';

const Rechercher = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [seats, setSeats] = useState('1');
  const [results, setResults] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState(null);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [selectedAnnonce, setSelectedAnnonce] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState('1');
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(date);
  const [tempTime, setTempTime] = useState(date);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertImage, setAlertImage] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  const currentUserId = auth.currentUser?.uid;
  const route = useRoute();

  const handleSearch = async () => {
    if (!origin || !destination) {
      showAlert('Erreur', 'Veuillez sélectionner départ et destination.', 'error');
      return;
    }

    try {
      const annonceCollection = collection(db, 'annonces');
      const q = query(
        annonceCollection,
        where('etat', 'in', [ANNONCE_STATUS.ACTIVE, ANNONCE_STATUS.FULL])
      );
      const annonceSnapshot = await getDocs(q);
      
      const foundResults = annonceSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(annonce => {
          if (annonce.userId === currentUserId) return false;
          if (annonce.id === 'annonceId') return false;

          // Debug logging
          console.log('origin:', origin, 'destination:', destination);
          console.log('annonce.lieuxdepart?.name:', annonce.lieuxdepart?.name, 'annonce.lieuxarrivee?.name:', annonce.lieuxarrivee?.name);
          const matchesLocations =
            !!annonce.lieuxdepart?.name && !!origin?.name &&
            !!annonce.lieuxarrivee?.name && !!destination?.name &&
            annonce.lieuxdepart.name.toLowerCase().includes(origin.name.toLowerCase()) &&
            annonce.lieuxarrivee.name.toLowerCase().includes(destination.name.toLowerCase());

          let matchesSeats = true;
          let matchesDate = true;

          // Only filter by seats if user changed it from default
          if (seats && seats !== '1') {
            matchesSeats = annonce.nbrplace >= Number(seats);
          }

          // Only filter by date if user picked a date different from today
          const today = new Date();
          const isDateFilterActive = date && (
            date.getDate() !== today.getDate() ||
            date.getMonth() !== today.getMonth() ||
            date.getFullYear() !== today.getFullYear()
          );
          if (isDateFilterActive) {
            const annonceDate = annonce.datedepart?.seconds ?
              new Date(annonce.datedepart.seconds * 1000) : null;
            if (annonceDate) {
              matchesDate =
                annonceDate.getDate() === date.getDate() &&
                annonceDate.getMonth() === date.getMonth() &&
                annonceDate.getFullYear() === date.getFullYear();
            }
          }

          return matchesLocations && matchesSeats && matchesDate;
        });

      setResults(foundResults);
      setSearchActive(true);
      if (foundResults.length === 0) {
        showAlert(
          'Info', 
          'Aucun trajet trouvé pour ce trajet.\nEssayez sans la date ou le nombre de places pour voir plus de résultats.',
          'info'
        );
      }
    } catch (err) {
      console.error('Error searching annonces:', err);
      showAlert('Erreur', 'Impossible de rechercher. Veuillez réessayer.', 'error');
    }
  };

  const handleClearSearch = () => {
    setOrigin(null);
    setDestination(null);
    setResults([]);
    setSearchActive(false);
  };

  const handleLocationSelect = (type) => {
    navigation.navigate('MapScreen', { 
      type, 
      context: 'search',
      onLocationSelected: (departure, arrival) => {
        setOrigin(departure);
        setDestination(arrival);
      }
    });
  };
  
  useEffect(() => {
    let isMounted = true;

    const fetchAnnonces = async () => {
      try {
        const annonceCollection = collection(db, 'annonces');
        // Add a limit to query
        const q = query(annonceCollection, limit(20)); // Only fetch first 20 annonces
        const annonceSnapshot = await getDocs(q);
        
        if (!isMounted) return;

        const annonceList = annonceSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(item => {
            if (
              !item ||
              item.id === 'annonceId' ||
              !item.lieuxdepart?.name ||
              !item.lieuxarrivee?.name ||
              !item.datedepart ||
              !item.heuredepart ||
              !item.prix ||
              !item.nbrplace ||
              item.prix <= 0 ||
              item.nbrplace <= 0
            ) {
              return false;
            }
            return true;
          });

        setAnnonces(annonceList);
      } catch (err) {
        console.error('Error fetching annonces:', err);
        if (isMounted) {
          setError('Impossible de récupérer les annonces.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnnonces();
    return () => { isMounted = false };
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      if (route.params?.departureLocation) {
        setOrigin(route.params.departureLocation);
      }
      if (route.params?.arrivalLocation) {
        setDestination(route.params.arrivalLocation);
      }
    }, [route.params?.timestamp])
  );

  useEffect(() => {
    // Real-time Firestore listener
    const q = query(collection(db, 'annonces'), orderBy('datedepart', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const annonceList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => {
          if (
            !item ||
            item.id === 'annonceId' ||
            !item.lieuxdepart?.name ||
            !item.lieuxarrivee?.name ||
            !item.datedepart ||
            !item.heuredepart ||
            !item.prix ||
            !item.nbrplace ||
            item.prix <= 0 ||
            item.nbrplace <= 0
          ) {
            return false;
          }
          return true;
        });
      setAnnonces(annonceList);
    });

    return () => unsubscribe();
  }, []);

  // Optional: Pull-to-refresh (in case you want to allow manual refresh)
  const onRefresh = () => {
    setRefreshing(true);
    // The real-time listener will update the data, so just end refreshing
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleReserver = async (annonce, seatsToReserve) => {
    try {
      if (!auth.currentUser) {
        showAlert('Erreur', 'Vous devez être connecté pour réserver.', 'error');
        return;
      }
      if (annonce.userId === auth.currentUser.uid) {
        showAlert('Erreur', 'Vous ne pouvez pas réserver votre propre trajet.', 'error');
        return;
      }
      if (seatsToReserve < 1) {
        showAlert('Erreur', 'Veuillez choisir au moins une place.', 'error');
        return;
      }
      if (seatsToReserve > annonce.nbrplace) {
        showAlert('Erreur', `Il n'y a que ${annonce.nbrplace} places disponibles.`, 'error');
        return;
      }

      // Prevent duplicate reservation for the same annonce by the same user
      const q = query(
        collection(db, 'reservations'),
        where('annonceId', '==', annonce.id),
        where('userId', '==', auth.currentUser.uid),
        where('status', 'in', ['pending', 'accepted'])
      );
      const existing = await getDocs(q);
      if (!existing.empty) {
        showAlert('Erreur', 'Vous avez déjà une réservation en attente ou acceptée pour ce trajet.', 'error');
        return;
      }

      await addDoc(collection(db, 'reservations'), {
        annonceId: annonce.id,
        userId: auth.currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        seatsRequested: seatsToReserve,
      });

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { isDriver: false });

      showAlert('Succès', 'Votre demande de réservation a été envoyée au conducteur.', 'success');
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      showAlert('Erreur', 'Impossible de réserver ce trajet. Veuillez réessayer.', 'error');
    }
  };

  const handleAccept = async (reservation) => {
    try {
      const annonceRef = doc(db, 'annonces', reservation.annonceId);
      const reservationRef = doc(db, 'reservations', reservation.id);

      await runTransaction(db, async (transaction) => {
        const annonceDoc = await transaction.get(annonceRef);
        if (!annonceDoc.exists()) throw new Error('Annonce introuvable');
        const annonceData = annonceDoc.data();
        if (annonceData.nbrplace < reservation.seatsRequested) throw new Error('Plus assez de places disponibles');

        // Decrement seats by seatsRequested
        transaction.update(annonceRef, { nbrplace: annonceData.nbrplace - reservation.seatsRequested });
        // Accept reservation
        transaction.update(reservationRef, { status: 'accepted' });
      });

      showAlert('Succès', 'Réservation acceptée et places réservées.', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Erreur', err.message || 'Impossible d\'accepter la réservation.', 'error');
    }
  };

  const renderAnnonce = ({ item }) => {
    const formattedDate = item.datedepart
      ? new Date(item.datedepart.seconds * 1000).toLocaleDateString()
      : 'Date inconnue';
    const formattedTime = item.heuredepart
      ? new Date(item.heuredepart.seconds * 1000).toLocaleTimeString()
      : 'Heure inconnue';

    const getStatusBadge = (etat) => {
      switch (etat) {
        case 'active':
          return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', marginRight: 6 }} />;
        case 'full':
          return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#bbb', marginRight: 6 }} />;
        case 'canceled':
          return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#d32f2f', marginRight: 6 }} />;
        case 'completed':
          return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#2196F3', marginRight: 6 }} />;
        default:
          return <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#aaa', marginRight: 6 }} />;
      }
    };

    const getStatusText = (etat) => {
      switch (etat) {
        case 'active':
          return 'Actif';
        case 'full':
          return 'Complet';
        case 'canceled':
          return 'Annulé';
        case 'completed':
          return 'Terminé';
        default:
          return 'Inconnu';
      }
    };

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>{item.lieuxdepart?.name} {'>'} {item.lieuxarrivee?.name}</Text>
        </View>
        <View style={[styles.cardStatusRow, { alignSelf: 'flex-start', marginBottom: 4, marginTop: 2 }]}> 
          {getStatusBadge(item.etat)}
          <Text style={styles.cardStatusText}>{getStatusText(item.etat)}</Text>
        </View>
        {/* Comfort, AC, and Aller-Retour badges */}
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {item.confort && (
            <View style={{ backgroundColor: '#e0f7fa', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 }}>
              <Text style={{ color: '#009fe3', fontWeight: 'bold', fontSize: 13 }}>Confortable</Text>
            </View>
          )}
          {item.climatise && (
            <View style={{ backgroundColor: '#e3fcec', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 }}>
              <Text style={{ color: '#00b894', fontWeight: 'bold', fontSize: 13 }}>Climatisé</Text>
            </View>
          )}
          {item.aller_retour && (
            <View style={{ backgroundColor: '#fce4ec', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: '#d81b60', fontWeight: 'bold', fontSize: 13 }}>Aller-Retour</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardDescription}>Description: {item.description}</Text>
        <Text style={styles.cardSubText}>
          Date: {formattedDate} | Heure: {formattedTime}
        </Text>
        <Text style={styles.cardSubText}>
          Prix: {item.prix} dt | Places disponibles: {item.nbrplace - (item.reservedSeats || 0)}
        </Text>
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.infoIconButton}
            onPress={() => showAlert('Info', 'Plus d\'informations à venir.', 'info')}
          >
            <Ionicons name="information-circle-outline" size={24} color="#009fe3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={async () => {
              setStartingChat(true);
              console.log('Message button pressed');
              try {
                console.log('About to get currentUserId and otherUserId');
                const currentUserId = auth.currentUser?.uid;
                const otherUserId = item.userId;
                console.log('currentUserId:', currentUserId, 'otherUserId:', otherUserId);
                if (!currentUserId || !otherUserId) {
                  console.log('Missing userId(s)', { currentUserId, otherUserId });
                  throw new Error('Utilisateur non trouvé');
                }
                // Always use sorted order for participants
                const participants = [currentUserId, otherUserId].sort();
                const q = query(
                  collection(db, 'messages'),
                  where('participants', '==', participants)
                );
                const snap = await getDocs(q);
                const exists = !snap.empty;
                if (!exists) {
                  // Create a new conversation by sending a welcome message
                  await addDoc(collection(db, 'messages'), {
                    senderId: currentUserId,
                    receiverId: otherUserId,
                    message: 'Bonjour !',
                    timestamp: serverTimestamp(),
                    participants,
                  });
                }
                navigation.getParent()?.getParent()?.navigate('Messages', {
                  annonceId: item.id,
                  otherUserId: item.userId
                });
              } catch (e) {
                console.log('Error creating or navigating to conversation:', e);
                showAlert('Erreur', "Impossible de démarrer la conversation.");
              } finally {
                setStartingChat(false);
              }
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#009fe3" />
          </TouchableOpacity>
          {startingChat && <ActivityIndicator size="small" color="#009fe3" style={{ marginLeft: 8 }} />}
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={async () => {
              if (item.userId === currentUserId) {
                showAlert('Erreur', 'Vous ne pouvez pas réserver votre propre trajet.', 'error');
                return;
              }
              const q = query(
                collection(db, 'reservations'),
                where('annonceId', '==', item.id),
                where('userId', '==', currentUserId),
                where('status', 'in', ['pending', 'accepted'])
              );
              const existing = await getDocs(q);
              if (!existing.empty) {
                showAlert('Erreur', 'Vous avez déjà une réservation en attente ou acceptée pour ce trajet.', 'error');
                return;
              }
              setSelectedAnnonce(item);
              setSelectedSeats('1');
              setReserveModalVisible(true);
            }}
          >
            <Text style={styles.reserveButtonText}>Réserver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    setDate(date);
    hideDatePicker();
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Card-style Search Form */}
      <View style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        marginTop: 32,
      }}>
        {/* Departure & Destination with Flip Button and Clear Search (X) Button on the right */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            {/* Departure */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
              onPress={() => handleLocationSelect('departure')}
            >
              <Ionicons name="radio-button-off-outline" size={22} color="#7a7a7a" style={{ marginRight: 16 }} />
              <Text style={{ color: '#7a7a7a', fontSize: 16 }}>
                {origin ? origin.name : 'Départ'}
              </Text>
            </TouchableOpacity>
            {/* Destination */}
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
              onPress={() => handleLocationSelect('arrival')}
            >
              <Ionicons name="radio-button-off-outline" size={22} color="#7a7a7a" style={{ marginRight: 16 }} />
              <Text style={{ color: '#7a7a7a', fontSize: 16 }}>
                {destination ? destination.name : 'Destination'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Flip Button and Clear Search (X) Button on the right, centered */}
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 80, marginLeft: 20 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 8,
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 4,
                marginRight: 8,
              }}
              onPress={() => {
                if (origin && destination) {
                  const temp = origin;
                  setOrigin(destination);
                  setDestination(temp);
                }
              }}
              accessibilityLabel="Inverser départ et destination"
            >
              <Ionicons name="sync" size={24} color="#009fe3" />
            </TouchableOpacity>
            {searchActive && (
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
                onPress={handleClearSearch}
                accessibilityLabel="Effacer la recherche"
              >
                <Ionicons name="close" size={24} color="#d32f2f" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={showDatePicker}
          >
            <Ionicons name="calendar-outline" size={22} color="#7a7a7a" style={{ marginRight: 16 }} />
            <Text style={{ color: '#7a7a7a', fontSize: 16 }}>
              {date ? `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Aujourd'hui"}
            </Text>
          </TouchableOpacity>
          {date && (
            <TouchableOpacity onPress={() => setDate(null)} style={styles.clearButton}>
              <View style={styles.clearButtonIconWrap}>
                <Ionicons name="close-circle" size={24} color="#d32f2f" />
              </View>
            </TouchableOpacity>
          )}
        </View>
        {/* Date & Time Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={new Date()}
        />
        {/* Number of seats */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
          <Ionicons name="person-outline" size={22} color="#7a7a7a" style={{ marginRight: 16 }} />
          <Text style={{ color: '#7a7a7a', fontSize: 16, flex: 1 }}>{seats}</Text>
          <TouchableOpacity
            style={{ marginHorizontal: 8 }}
            onPress={() => setSeats(prev => (parseInt(prev, 10) > 1 ? (parseInt(prev, 10) - 1).toString() : '1'))}
          >
            <Ionicons name="remove-circle-outline" size={24} color="#009fe3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginHorizontal: 8 }}
            onPress={() => setSeats(prev => (parseInt(prev, 10) < 5 ? (parseInt(prev, 10) + 1).toString() : '5'))}
          >
            <Ionicons name="add-circle-outline" size={24} color="#009fe3" />
          </TouchableOpacity>
        </View>
        {/* Search Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#009fe3',
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 18,
          }}
          onPress={handleSearch}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchActive ? (
        <FlatList
          style={styles.list}
          data={results}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun résultat trouvé.</Text>}
          renderItem={renderAnnonce}
        />
      ) : (
        <>
          <Text style={styles.title}>Annonces en cours</Text>
          <FlatList
            data={annonces}
            renderItem={renderAnnonce}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune annonce en cours.</Text>}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}

      <Modal
        visible={reserveModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReserveModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Choisir le nombre de places
            </Text>
            <Text>
              Places disponibles: {selectedAnnonce?.nbrplace}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#eee',
                  borderRadius: 20,
                  padding: 8,
                  marginRight: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                }}
                onPress={() => setSelectedSeats(prev => {
                  const num = parseInt(prev, 10);
                  return num > 1 ? (num - 1).toString() : '1';
                })}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{selectedSeats}</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#eee',
                  borderRadius: 20,
                  padding: 8,
                  marginLeft: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                }}
                onPress={() => setSelectedSeats(prev => {
                  const num = parseInt(prev, 10);
                  const max = selectedAnnonce?.nbrplace || 1;
                  return num < max ? (num + 1).toString() : max.toString();
                })}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#009fe3',
                  padding: 10,
                  borderRadius: 5,
                  marginRight: 10,
                  minWidth: 80
                }}
                onPress={async () => {
                  await handleReserver(selectedAnnonce, parseInt(selectedSeats, 10));
                  setReserveModalVisible(false);
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>Confirmer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 5,
                  minWidth: 80
                }}
                onPress={() => setReserveModalVisible(false)}
              >
                <Text style={{ color: '#333', textAlign: 'center' }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ModernAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        image={alertImage}
        buttonText="OK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  list: { marginTop: 16 },
  item: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardStatusText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardSubText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  allerRetourLink: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
    fontSize: 14,
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },
  messageButton: {
    backgroundColor: '#E3F0FB',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveButton: {
    backgroundColor: '#009fe3',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
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
  cardDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  infoIconButton: {
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextBelow: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
    marginLeft: 2,
  },
});

export default Rechercher;
