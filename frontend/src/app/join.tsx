import React, {useState} from 'react'
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { socket } from '../socket';

export default function JoinRoomScreen() {

    const [roomId, setRoomId] = useState('');

    const handleJoin = () => {
        if (!roomId.trim())
            Alert.alert('Error', 'Please enter a room code.');
            return;
    }

    socket.emit('joinRoom', {roomId: roomId.trim()}, (response:any) =>  {
        if (response && response.data) {
            router.push({
                pathname: '/room' as any,
                params: {roomData: JSON.stringify(response.data), isHost: 'false'}
            });
        }

        else {
            Alert.alert('Error', response?.error || 'Room not found');
        }
    })

    return (
        <View style={styles.container}>
            <Text style={styles.heading}> Join a Poll </Text>

            <TextInput
              style={styles.input} 
              placeholder="Enter Room Code" 
              value={roomId} 
              onChangeText={setRoomId} 
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress = {() => handleJoin}>
                <Text style={styles.buttonText}> Enter Room </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
        </View>
    );


}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#34C759', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 16 },
});