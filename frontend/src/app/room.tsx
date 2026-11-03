import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { socket } from '../socket';

export default function RoomScreen() {

    const params = useLocalSearchParams();
    const parsedRoom = params.roomData ? JSON.parse(params.roomData as string) : null ;
    const isHost = params.isHost == 'true';

    const [roomData, setRoomData] = useState(parsedRoom);

    useEffect(() => {
        socket.on('roomUpdated', (updatedRoom)=> {
            if(updatedRoom.roomId == roomData?.roomId) {
                setRoomData(updatedRoom);
            }
        });

        return() => {
            socket.off('roomUpdated');
        }
    }, [roomData?.roomId]);

    const handleVote = (optionIndex : number) => {
        if(roomData.status != 'OPEN') return;

        socket.emit('vote', {
            roomId: roomData.roomId, voteDto: {voteOption: optionIndex}
        });
    }

    if (!roomData) return <View><Text>Loading....</Text></View>

    return(
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.roomCode}>Room Code: {roomData.roomId}</Text>
            <Text style={styles.participants}> Participants: {roomData.participants}</Text>
            <Text style={styles.status}> Staus: {roomData.status}</Text>

            <Text style={styles.question}>{roomData.question}</Text>

            {
                roomData.options.map((option: any, index: number) => (
                    <TouchableOpacity style={styles.optionButton} key = {index} onPress = {() => handleVote(index)} disabled={roomData.status!== 'OPEN'}>
                        <Text style={styles.optionText}>{option.text}</Text>
                        <Text style={styles.voteCount}>{option.votes} votes</Text>
                    </TouchableOpacity>
                ))
            }

            {isHost && (
                <View style={styles.adminContainer}>
                    <Text style={styles.adminLabel}>Admin Controls</Text>
                    <TouchableOpacity style={styles.closeButton} onPress = {() => setRoomData({...roomData, status: 'CLOSED'})}>
                        <Text style={styles.buttonText}>Close Voting</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity style={styles.leaveButton} onPress={() => router.back()}>
                <Text style={styles.leaveText}>Leave Room</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' },
  roomCode: { fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 5 },
  participants: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 5 },
  status: { fontSize: 14, color: '#007AFF', textAlign: 'center', marginBottom: 20 },
  question: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  optionButton: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: '500' },
  voteCount: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  adminContainer: { marginTop: 30, padding: 15, backgroundColor: '#fff3cd', borderRadius: 8 },
  adminLabel: { fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#856404' },
  closeButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  leaveButton: { marginTop: 20, alignItems: 'center' },
  leaveText: { color: '#dc3545', fontSize: 16 },
});