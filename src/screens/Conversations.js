import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function Conversations() {
  const currentUserId = auth.currentUser?.uid;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (!currentUserId) return;
    setLoading(true);
    // Query all messages where the user is a participant
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUserId),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Group messages by user (other participant)
      const convMap = {};
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const otherUserId = data.participants.find(id => id !== currentUserId);
        if (!otherUserId) continue;
        // Only keep the latest message per user
        if (!convMap[otherUserId] || data.timestamp?.toMillis() > convMap[otherUserId].timestamp?.toMillis()) {
          convMap[otherUserId] = { ...data, id: docSnap.id, otherUserId };
        }
      }
      // Fetch user profiles for display
      const convArr = await Promise.all(Object.values(convMap).map(async conv => {
        let profile = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', conv.otherUserId));
          if (userDoc.exists()) profile = userDoc.data();
        } catch {}
        return { ...conv, profile };
      }));
      setConversations(convArr);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUserId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        // Try navigating up two levels to reach the root stack
        navigation.getParent()?.getParent()?.navigate('Messages', {
          otherUserId: item.otherUserId,
        });
      }}
    >
      {item.profile?.profilePicture ? (
        <Image source={{ uri: item.profile.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}> 
          <Ionicons name="person" size={32} color="#bbb" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {(item.profile?.firstName || item.profile?.prenom || '') + ' ' + (item.profile?.lastName || item.profile?.nom || '') || 'Utilisateur inconnu'}
        </Text>
        <Text style={styles.message} numberOfLines={1}>{item.message || 'No messages yet.'}</Text>
      </View>
      <Text style={styles.time}>
        {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conversations</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#009fe3" style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#bbb" />
          <Text style={styles.emptyText}>Aucune conversation pour le moment.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: '#e0e0e0',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 16,
  },
}); 