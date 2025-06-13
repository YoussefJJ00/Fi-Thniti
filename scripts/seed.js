/**
 * seed.js
 *
 * Run this once to push your collections+docs into Firestore.
 */

const admin = require('firebase-admin');
const path  = require('path');

// 1) Initialize the Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// 2) Define your data below.
//    For each top-level collection, list documents with { id, data }.
//    Replace the placeholder IDs and field-values with your real data.

const seedData = {
  // Collection: Membre
  Membre: [
    {
      id: 'USER_UID_HERE',           // ← replace with the actual user's UID
      data: {
        nom: 'Dupont',
        prenom: 'Jean',
        tel: '+33600000000',
        email: 'jean.dupont@example.com',
        password: 'superSecret123',
        confirmpassword: 'superSecret123',
        genre: 'Homme',
        username: 'jdupont'
      }
    }
    // … add more members if needed
  ],

  // Collection: Reclamation
  Reclamation: [
    {
      id: 'RECLAM_1',
      data: {
        date_reclamation: '2023-10-05',
        sujet: 'Trajet annulé',
        titre: 'Annulation soudaine',
        reponseRec: 'Votre dossier est en cours de traitement'
      }
    }
    // … add more reclamations
  ],

  // Collection: Conducteur (driver profile for a Membre)
  Conducteur: [
    {
      id: 'USER_UID_HERE',           // same UID as the member above
      data: {
        cin: 'AB123456',
        permis: 'CD789012',
        note: 4.8,
        adresse: '123 Rue de la Paix, Paris'
      }
    }
  ],

  // Collection: Voiture
  Voiture: [
    {
      id: 'CAR_1',
      data: {
        plaque_imatriculation: 'AB-123-CD',
        model: 'Clio',
        marque: 'Renault',
        type: 'Berline',
        couleur: 'Bleu'
      }
    }
    // … add more cars
  ],

  // Collection: Annonce (ride announcement)
  Annonce: [
    {
      id: 'ANN_1',
      data: {
        datedepart: '2023-11-01',
        nbrplace: 3,
        lieuxdepart: 'Paris',
        lieuxdarrivee: 'Lyon',
        typetrajet: 'Aller simple',
        heuredepart: '08:00',
        description: 'Trajet convivial, petite pause café prévue',
        aller_retour: false,
        prix: 25
      }
    }
    // … add more announcements
  ],

  // Collection: Reservation
  Reservation: [
    {
      id: 'RES_1',
      data: {
        datereservation: '2023-10-20',
        nbrplace: 1,
        validité: '2023-11-01',
        etat: 'en attente'
      }
    }
    // … add more reservations
  ]
};

async function seed() {
  try {
    for (const [collectionName, docs] of Object.entries(seedData)) {
      console.log(`\nSeeding collection: ${collectionName}`);
      for (const { id, data } of docs) {
        await db.collection(collectionName).doc(id).set(data);
        console.log(` • Written ${collectionName}/${id}`);
      }
    }
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Firestore:', err);
    process.exit(1);
  }
}

seed();