import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, deleteDoc, onSnapshot, runTransaction } from 'firebase/firestore';
import { ANNONCE_STATUS } from '../utils/annonceStatus';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ModernAlert from '../components/ModernAlert';

const VosTrajets = () => {
  const [annonces, setAnnonces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAnnonce, setEditAnnonce] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editPrix, setEditPrix] = useState('');
  const [editNbrPlace, setEditNbrPlace] = useState('');
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [passengerInfos, setPassengerInfos] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reservationAnnonces, setReservationAnnonces] = useState({});
  const [driverReservations, setDriverReservations] = useState([]);
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertImage, setAlertImage] = useState(null);
  const [pendingEndAnnonce, setPendingEndAnnonce] = useState(null);
  const [pendingEndReservation, setPendingEndReservation] = useState(null);
  const [pendingCancelAnnonce, setPendingCancelAnnonce] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    // Listen for annonces
    const qAnnonces = query(collection(db, 'annonces'), where('userId', '==', userId));
    const unsubscribeAnnonces = onSnapshot(qAnnonces, (snapshot) => {
      setAnnonces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const annonceIds = snapshot.docs.map(doc => doc.id);
      if (annonceIds.length > 0) {
        const chunks = [];
        for (let i = 0; i < annonceIds.length; i += 10) {
          chunks.push(annonceIds.slice(i, i + 10));
        }
        Promise.all(chunks.map(async (ids) => {
          const q = query(collection(db, 'reservations'), where('annonceId', 'in', ids));
          const snap = await getDocs(q);
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        })).then(results => {
          setDriverReservations([].concat(...results));
        });
      } else {
        setDriverReservations([]);
      }
      setLoading(false);
    });

    // Listen for reservations
    const qReservations = query(collection(db, 'reservations'), where('userId', '==', userId));
    const unsubscribeReservations = onSnapshot(qReservations, async (snapshot) => {
      setReservations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const annonceIds = snapshot.docs.map(doc => doc.data().annonceId);
      const uniqueAnnonceIds = [...new Set(annonceIds)];
      const annonceMap = {};
      await Promise.all(uniqueAnnonceIds.map(async (id) => {
        const annonceRef = doc(db, 'annonces', id);
        const annonceSnap = await getDoc(annonceRef);
        if (annonceSnap.exists()) {
          annonceMap[id] = { id, ...annonceSnap.data() };
        }
      }));
      setReservationAnnonces(annonceMap);
      setLoading(false);
    });

    return () => {
      unsubscribeAnnonces();
      unsubscribeReservations();
    };
  }, [userId]);

  // Handle passenger request (accept/reject)
  const handleRequest = async (annonceId, passengerId, action) => {
    const annonceRef = doc(db, 'annonces', annonceId);
    const annonceSnap = await getDoc(annonceRef);
    if (!annonceSnap.exists()) return;

    const annonce = annonceSnap.data();
    const updatedRequests = annonce.passengerRequests.map(req =>
      req.userId === passengerId ? { ...req, status: action } : req
    );
    await updateDoc(annonceRef, { passengerRequests: updatedRequests });
    showAlert('Succès', `Demande ${action === 'accepted' ? 'acceptée' : 'refusée'}.`);
    // Refresh
    setAnnonces(prev =>
      prev.map(a =>
        a.id === annonceId ? { ...a, passengerRequests: updatedRequests } : a
      )
    );
  };

  // Cancel trip
  const handleEndTrip = async (annonceId) => {
    try {
      // Delete all reservations for this annonce
      const reservationsRef = collection(db, 'reservations');
      const q = query(reservationsRef, where('annonceId', '==', annonceId));
      const snap = await getDocs(q);
      const batchDeletes = snap.docs.map(docSnap => deleteDoc(doc(db, 'reservations', docSnap.id)));
      await Promise.all(batchDeletes);
      // Delete the annonce
      await deleteDoc(doc(db, 'annonces', annonceId));
      showAlert('Succès', 'Trajet terminé et supprimé.');
      setAnnonces(prev => prev.filter(a => a.id !== annonceId));
    } catch (error) {
      showAlert('Erreur', "Impossible de terminer le trajet.", 'error');
    }
    setPendingEndAnnonce(null);
  };

  const handleEndReservation = async (reservationId) => {
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
      showAlert('Succès', 'Trajet marqué comme terminé et supprimé.');
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    } catch (error) {
      showAlert('Erreur', "Impossible de terminer le trajet.", 'error');
    }
    setPendingEndReservation(null);
  };

  const handleEditAnnonce = (annonce) => {
    console.log('Modifier pressed for annonce:', annonce.id);
    setEditAnnonce(annonce);
    setEditDescription(annonce.description);
    setEditPrix(String(annonce.prix));
    setEditNbrPlace(String(annonce.nbrplace));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editAnnonce) return;
    const annonceRef = doc(db, 'annonces', editAnnonce.id);
    await updateDoc(annonceRef, {
      description: editDescription,
      prix: Number(editPrix),
      nbrplace: Number(editNbrPlace),
    });
    setAnnonces(prev =>
      prev.map(a =>
        a.id === editAnnonce.id
          ? { ...a, description: editDescription, prix: Number(editPrix), nbrplace: Number(editNbrPlace) }
          : a
      )
    );
    setEditModalVisible(false);
    setEditAnnonce(null);
    showAlert('Succès', 'Annonce modifiée.');
  };

  const handleAccept = async (reservation) => {
    try {
      const annonceRef = doc(db, 'annonces', reservation.annonceId);
      const reservationRef = doc(db, 'reservations', reservation.id);

      await runTransaction(db, async (transaction) => {
        const annonceDoc = await transaction.get(annonceRef);
        if (!annonceDoc.exists()) throw new Error('Annonce introuvable');
        const annonceData = annonceDoc.data();
        if (annonceData.nbrplace <= 0) throw new Error('Plus de places disponibles');

        // Decrement seats
        transaction.update(annonceRef, { nbrplace: annonceData.nbrplace - 1 });
        // Accept reservation
        transaction.update(reservationRef, { status: 'accepted' });
      });

      showAlert('Succès', 'Réservation acceptée et place réservée.');
    } catch (err) {
      console.error(err);
      showAlert('Erreur', err.message || 'Impossible d\'accepter la réservation.');
    }
  };

  const handleDecline = async (reservation) => {
    try {
      const reservationRef = doc(db, 'reservations', reservation.id);
      await updateDoc(reservationRef, { status: 'declined' });
      showAlert('Réservation refusée', 'Le passager sera notifié.');
    } catch (err) {
      console.error(err);
      showAlert('Erreur', 'Impossible de refuser la réservation.');
    }
  };

  const fetchPassengerInfo = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Re-fetch user profile
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setAnnonces(annonces);
      }
    }
    // Re-fetch annonces or reservations
    if (annonces.length > 0) {
      const q = query(collection(db, 'annonces'), where('userId', '==', userId));
      const snap = await getDocs(q);
      setAnnonces(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } else {
      const q = query(collection(db, 'reservations'), where('userId', '==', userId));
      const snap = await getDocs(q);
      setReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    setRefreshing(false);
  };

  const showAlert = (title, message, type = 'success') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertImage(type === 'success' ? require('../../assets/images/check.png') : null);
    setAlertVisible(true);
  };

  // Render for driver
  const renderDriverAnnonce = ({ item }) => {
    console.log('Reservations for annonce', item.id, driverReservations.filter(r => r.annonceId === item.id));
    const pendingReservationCount = driverReservations.filter(r => r.annonceId === item.id && r.status === 'pending').length;
    const acceptedReservationCount = driverReservations.filter(r => r.annonceId === item.id && r.status === 'accepted').length;

    let passagerMessage = '';
    if (acceptedReservationCount > 0) {
      passagerMessage += `Vous avez ${acceptedReservationCount} passager${acceptedReservationCount > 1 ? 's' : ''} à bord\n`;
    }
    if (pendingReservationCount > 0) {
      passagerMessage += `Vous avez ${pendingReservationCount} réservation${pendingReservationCount > 1 ? 's' : ''} en attente`;
    }
    if (!passagerMessage) {
      passagerMessage = 'Aucune demande';
    }

    return (
      <View style={styles.annonceContainer}>
        <Text style={styles.annonceTitle}>{item.lieuxdepart?.name} {'>'} {item.lieuxarrivee?.name}</Text>
        <Text style={styles.annonceDescription}>Description: {item.description}</Text>
        <Text>Status: {item.etat}</Text>
        <Text>Passagers: {passagerMessage.split('\n').map((line, idx) => <Text key={idx}>{line}{'\n'}</Text>)}</Text>
        {/* Custom styled action buttons */}
        <View style={styles.actionButtonGroup}>
          {/* Always show Annuler le trajet button */}
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#e53935', marginBottom: 10 }]}
            onPress={() => {
              console.log('Annuler le trajet button pressed for', item.id);
              setPendingCancelAnnonce(item.id);
            }}
          >
            <Text style={[styles.cancelButtonText, { color: '#fff' }]}>ANNULER LE TRAJET</Text>
          </TouchableOpacity>
          {driverReservations.filter(r => r.annonceId === item.id && r.status === 'accepted').length > 0 && (
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: '#4CAF50', marginBottom: 10 }]}
              onPress={() => setPendingEndAnnonce(item.id)}
            >
              <Text style={[styles.cancelButtonText, { color: '#fff' }]}>TERMINER LE TRAJET</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditAnnonce(item)}
          >
            <Text style={styles.editButtonText}>MODIFIER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.textButton}
            onPress={async () => {
              const relevantReservations = driverReservations.filter(
                r => r.annonceId === item.id && ['pending', 'accepted'].includes(r.status)
              );
              setSelectedReservations(relevantReservations);
              const infos = await Promise.all(
                relevantReservations.map(async (reservation) => {
                  const passenger = await fetchPassengerInfo(reservation.userId);
                  return { ...reservation, passenger };
                })
              );
              setPassengerInfos(infos);
              setReservationModalVisible(true);
            }}
          >
            <Text style={styles.textButtonText}>VOIR RÉSERVATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render for passenger
  const renderPassengerReservation = ({ item }) => {
    const annonce = reservationAnnonces[item.annonceId];
    if (!annonce) return null;
    const formattedDate = annonce.datedepart?.seconds
      ? new Date(annonce.datedepart.seconds * 1000).toLocaleDateString()
      : 'Date inconnue';
    const formattedTime = annonce.heuredepart?.seconds
      ? new Date(annonce.heuredepart.seconds * 1000).toLocaleTimeString()
      : 'Heure inconnue';

    return (
      <View style={styles.annonceContainer}>
        <Text style={styles.annonceTitle}>
          {annonce.lieuxdepart?.name} → {annonce.lieuxarrivee?.name}
        </Text>
        <Text>Date: {formattedDate} | Heure: {formattedTime}</Text>
        <Text>Places réservées: {item.seatsRequested || 1}</Text>
        <Text>
          Statut: {item.status === 'pending' ? 'En attente' : item.status === 'accepted' ? 'Acceptée' : item.status === 'declined' ? 'Refusée' : item.status === 'canceled' ? 'Annulé' : item.status}
        </Text>
        {/* End ride for passenger */}
        {item.status === 'accepted' && (
          <TouchableOpacity
            style={{
              backgroundColor: '#4CAF50',
              padding: 10,
              borderRadius: 6,
              marginTop: 10,
              alignItems: 'center',
            }}
            onPress={() => setPendingEndReservation(item.id)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Trajet terminé</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: '#2196F3',
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
            alignItems: 'center',
          }}
          onPress={() => navigation.getParent()?.getParent()?.navigate('Messages', {
            annonceId: item.annonceId,
            otherUserId: reservationAnnonces[item.annonceId]?.userId
          })}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Message Driver</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleCancelTrip = async (annonceId) => {
    console.log('handleCancelTrip called for', annonceId);
    try {
      console.log('Attempting to delete reservations for annonce:', annonceId);
      // Delete all reservations for this annonce
      const reservationsRef = collection(db, 'reservations');
      const q = query(reservationsRef, where('annonceId', '==', annonceId));
      const snap = await getDocs(q);
      const batchDeletes = snap.docs.map(docSnap => deleteDoc(doc(db, 'reservations', docSnap.id)));
      await Promise.all(batchDeletes);
      console.log('Reservations deleted, now deleting annonce:', annonceId);
      // Delete the annonce
      await deleteDoc(doc(db, 'annonces', annonceId));
      showAlert('Succès', 'Trajet annulé et supprimé.');
      setAnnonces(prev => prev.filter(a => a.id !== annonceId));
    } catch (error) {
      console.log('Error deleting trajet:', error);
      showAlert('Erreur', "Impossible d'annuler le trajet.", 'error');
    }
    setPendingCancelAnnonce(null);
  };

  if (loading) return <ActivityIndicator size="large" color="#2196F3" style={{ flex: 1, justifyContent: 'center' }} />;

  let mainContent;
  if (annonces.length > 0) {
    // Driver view
    mainContent = (
      <View style={styles.container}>
        <Text style={styles.title}>Vos annonces (conducteur)</Text>
        <FlatList
          data={annonces}
          keyExtractor={item => item.id}
          renderItem={renderDriverAnnonce}
          ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Aucune annonce publiée.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
  } else if (reservations.length > 0) {
    // Passenger view
    mainContent = (
      <View style={styles.container}>
        <Text style={styles.title}>Vos réservations (passager)</Text>
        <FlatList
          data={reservations}
          keyExtractor={item => item.id}
          renderItem={renderPassengerReservation}
          ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Aucune réservation.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
  } else {
    // No annonces or reservations
    mainContent = (
      <View style={styles.container}>
        <Text style={styles.title}>Aucune annonce ou réservation.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {mainContent}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Modifier l'annonce</Text>
            <TextInput
              style={styles.input}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Description"
            />
            <TextInput
              style={styles.input}
              value={editPrix}
              onChangeText={setEditPrix}
              placeholder="Prix"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editNbrPlace}
              onChangeText={setEditNbrPlace}
              placeholder="Nombre de places"
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Button title="Annuler" onPress={() => setEditModalVisible(false)} />
              <Button title="Enregistrer" onPress={async () => {
                await handleSaveEdit();
                setEditModalVisible(false);
              }} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={reservationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReservationModalVisible(false)}
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
            width: '90%',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Détails des réservations
            </Text>
            {passengerInfos.length === 0 ? (
              <Text>Chargement...</Text>
            ) : (
              passengerInfos.map((info, idx) => (
                <View key={info.id} style={{ marginBottom: 20, width: '100%' }}>
                  <Text>Nom: {info.passenger?.nom || 'Inconnu'}</Text>
                  <Text>Prénom: {info.passenger?.prenom || 'Inconnu'}</Text>
                  <Text>Téléphone: {info.passenger?.tel || 'Inconnu'}</Text>
                  <Text>Statut: {info.status === 'pending' ? 'En attente' : info.status === 'accepted' ? 'Acceptée' : info.status === 'declined' ? 'Refusée' : info.status === 'canceled' ? 'Annulé' : info.status}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
                    {/* Message button (always shown) */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2196F3',
                        padding: 10,
                        borderRadius: 5,
                        marginRight: 10,
                        minWidth: 80
                      }}
                      onPress={() => {
                        setReservationModalVisible(false);
                        navigation.getParent()?.getParent()?.navigate('Messages', {
                          annonceId: info.annonceId,
                          otherUserId: info.userId
                        });
                      }}
                    >
                      <Text style={{ color: 'white', textAlign: 'center' }}>Message</Text>
                    </TouchableOpacity>
                    {/* Accept/Refuse only for pending */}
                    {info.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={{
                            backgroundColor: 'green',
                            padding: 10,
                            borderRadius: 5,
                            marginRight: 10,
                            minWidth: 80
                          }}
                          onPress={async () => {
                            await handleAccept(info);
                            setReservationModalVisible(false);
                          }}
                        >
                          <Text style={{ color: 'white', textAlign: 'center' }}>Accepter</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: 'red',
                            padding: 10,
                            borderRadius: 5,
                            minWidth: 80
                          }}
                          onPress={async () => {
                            await handleDecline(info);
                            setReservationModalVisible(false);
                          }}
                        >
                          <Text style={{ color: 'white', textAlign: 'center' }}>Refuser</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))
            )}
            <TouchableOpacity
              style={{ marginTop: 15 }}
              onPress={() => setReservationModalVisible(false)}
            >
              <Text style={{ color: '#2196F3' }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ModernAlert for confirmations and success */}
      <ModernAlert
        visible={!!pendingEndAnnonce}
        onClose={() => setPendingEndAnnonce(null)}
        title="Terminer le trajet ?"
        message="Êtes-vous sûr de vouloir terminer et supprimer ce trajet pour tous les passagers ?"
        buttonText="Oui, terminer"
        image={null}
        onPress={() => handleEndTrip(pendingEndAnnonce)}
      />
      <ModernAlert
        visible={!!pendingEndReservation}
        onClose={() => setPendingEndReservation(null)}
        title="Trajet terminé ?"
        message="Êtes-vous sûr de vouloir marquer ce trajet comme terminé et le supprimer ?"
        buttonText="Oui, terminer"
        image={null}
        onPress={() => handleEndReservation(pendingEndReservation)}
      />
      <ModernAlert
        visible={alertVisible}
        onClose={() => setAlertVisible(false)}
        title={alertTitle}
        message={alertMessage}
        image={alertImage}
        buttonText="OK"
      />
      {/* ModernAlert for Annuler le trajet confirmation */}
      <ModernAlert
        visible={!!pendingCancelAnnonce}
        onClose={() => setPendingCancelAnnonce(null)}
        title="Annuler le trajet ?"
        message="Êtes-vous sûr de vouloir annuler et supprimer ce trajet ?"
        buttonText="Oui, annuler"
        image={null}
        onPress={() => {
          console.log('ModernAlert confirm pressed, annonceId:', pendingCancelAnnonce);
          handleCancelTrip(pendingCancelAnnonce);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  annonceContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  annonceTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  annonceDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  requestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  actionButtonGroup: {
    marginTop: 18,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#009fe3',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  editButton: {
    backgroundColor: '#f5f7fa',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  editButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  textButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default VosTrajets;
