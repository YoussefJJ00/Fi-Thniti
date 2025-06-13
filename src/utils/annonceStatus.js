import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const ANNONCE_STATUS = {
  ACTIVE: 'active',
  FULL: 'full',
  CANCELED: 'canceled',
  COMPLETED: 'completed'
};

export const checkAnnonceStatus = (annonce) => {
  if (!annonce) return ANNONCE_STATUS.CANCELED;
  
  // Check if trip date has passed
  const tripDate = annonce.datedepart?.seconds ? 
    new Date(annonce.datedepart.seconds * 1000) : 
    null;
  
  if (tripDate && tripDate < new Date()) {
    return ANNONCE_STATUS.COMPLETED;
  }

  // Check if all seats are taken
  if (annonce.nbrplace <= (annonce.reservedSeats || 0)) {
    return ANNONCE_STATUS.FULL;
  }

  // If manually canceled
  if (annonce.etat === ANNONCE_STATUS.CANCELED) {
    return ANNONCE_STATUS.CANCELED;
  }

  return ANNONCE_STATUS.ACTIVE;
};

export const updateAnnonceStatus = async (annonceId, newStatus) => {
  try {
    const annonceRef = doc(db, 'annonces', annonceId);
    await updateDoc(annonceRef, {
      etat: newStatus
    });
    return true;
  } catch (error) {
    console.error('Error updating annonce status:', error);
    return false;
  }
};

export const checkAndUpdateDriverStatus = async (userId) => {
  try {
    const annoncesRef = collection(db, 'annonces');
    const q = query(
      annoncesRef, 
      where('driverId', '==', userId),
      where('etat', '==', ANNONCE_STATUS.ACTIVE)
    );
    
    const snapshot = await getDocs(q);
    const hasActiveTrips = !snapshot.empty;

    // Update user's driver status
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isDriver: hasActiveTrips
    });

    return hasActiveTrips;
  } catch (error) {
    console.error('Error checking driver status:', error);
    return false;
  }
};