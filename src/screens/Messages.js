import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image, Keyboard } from 'react-native';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Messages({ route, navigation }) {
  const { annonceId, driverId, passengerId } = route.params || {};
  const currentUserId = auth.currentUser?.uid;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();

  // Determine the other user's ID
  const otherUserId = currentUserId === driverId ? passengerId : driverId;

  // Restriction: cannot message yourself
  if (currentUserId === otherUserId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Vous ne pouvez pas vous envoyer un message à vous-même.</Text>
      </View>
    );
  }

  // Fetch other user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } catch (e) {
        setProfile(null);
      }
    };
    if (otherUserId) fetchProfile();
  }, [otherUserId]);

  // Fetch messages
  useEffect(() => {
    if (!annonceId || !currentUserId || !otherUserId) return;
    setLoading(true);
    const q = query(
      collection(db, 'messages'),
      where('annonceId', '==', annonceId),
      where('participants', 'array-contains', currentUserId),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [annonceId, currentUserId, otherUserId]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!annonceId) {
      Alert.alert('Erreur', "Aucun trajet sélectionné pour la discussion.");
      setSending(false);
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        annonceId,
        senderId: currentUserId,
        receiverId: otherUserId,
        message: input.trim(),
        timestamp: serverTimestamp(),
        participants: [currentUserId, otherUserId],
      });
      setInput('');
      Keyboard.dismiss();
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (e) {
      console.log('Firestore error:', e);
      Alert.alert('Erreur', "Impossible d'envoyer le message.\n" + (e.message || e));
    } finally {
      setSending(false);
    }
  };

  // Message bubble
  const renderItem = ({ item }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[
        styles.bubble,
        isMe ? styles.bubbleMe : styles.bubbleOther
      ]}>
        <Text style={[styles.bubbleText, isMe && { color: '#fff' }]}>{item.message}</Text>
        <Text style={[styles.bubbleTime, isMe && { color: '#e0e0e0' }]}>
          {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        {profile?.profilePicture ? (
          <Image source={{ uri: profile.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="person" size={48} color="#bbb" />
          </View>
        )}
        <Text style={styles.headerName}>{profile?.firstName || ''} {profile?.lastName || ''}</Text>
        {/* Optional: Online status dot */}
        <View style={styles.statusDot} />
      </View>
      {/* Chat Area */}
      <View style={styles.chatArea}>
        {loading ? (
          <ActivityIndicator size="large" color="#009fe3" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()} // invert for Messenger style
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
            onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
          />
        )}
      </View>
      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={input}
          onChangeText={setInput}
          editable={!sending}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={sending || !input.trim()}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    right: 120, // adjust as needed
    top: 60,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMe: {
    backgroundColor: '#009fe3',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    color: '#222',
    fontSize: 16,
  },
  bubbleTime: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    color: '#222',
  },
  sendButton: {
    backgroundColor: '#009fe3',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
}); 