import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

export default function AdminUsers({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      // fetch all user docs
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => d.data()));
    })();
  }, []);

  // guard: redirect non-admins
  useEffect(() => {
    (async () => {
      const me = await getDoc(doc(db,'users',auth.currentUser.uid));
      if (me.data().role !== 'admin') {
        navigation.replace('Login'); // or some "Not Authorized" screen
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All app users</Text>
      <FlatList
        data={users}
        keyExtractor={u => u.uid}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#fff'},
  title:     { fontSize:24, marginBottom:12},
  row:       { flexDirection:'row', justifyContent:'space-between', paddingVertical:8 },
  email:     { fontSize:16 },
  role:      { fontSize:16, fontStyle:'italic' },
});
