import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { socket } from '../socket';

export default function RoomScreen() {

    const params = useLocalSearchParams();
    const parsedRoom = params.roomData ? JSON.parse(params.roomData as string) : null ;
    const isHost = params.isHost == 'true';
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const [roomData, setRoomData] = useState(parsedRoom);

    useEffect(() => {

        if(!roomData?.roomId) return;

        const handleRoomUpdate = (updatedRoom: any) => {
            if (updatedRoom && updatedRoom.roomId == roomData.roomId) {
                
                setRoomData(updatedRoom);
            
            }
        }

        const handleRoomClosed = (data: {message: string}) => {
            Alert.alert('Notice', data.message, [{text: 'OK', onPress: () => router.replace('/')}]);
        }

        socket.on('roomUpdated', handleRoomUpdate);
        socket.on('roomClosed', handleRoomClosed);

        return() => {
            socket.off('roomUpdated', handleRoomUpdate);
            socket.off('roomClosed', handleRoomClosed);
        }

    }, [roomData?.roomId]);

    const handleLeave = () => {
        socket.emit('leaveRoom', { roomId: roomData.roomId });
        router.back();
    };

    const handleVote = (optionIndex : number) => {
        socket.emit('vote', {
            roomId: roomData.roomId, dto: {voteOption: optionIndex}
        });
        setSelectedOption(optionIndex);
        setHasVoted(true);
    }

    const handleStatusChange = (roomId: string, status: 'OPEN' | 'ONVOTE' | 'CLOSED') => {
        socket.emit('changeStatus', {roomId: roomId, status:status});
    }

    if (!roomData) return (<View><Text>Loading....</Text></View>);

    return(
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.roomCode}>Room Code: {roomData.roomId}</Text>
            <Text style={styles.participants}> Participants: {roomData.participants}</Text>
            <Text style={styles.status}> Staus: {roomData.status}</Text>

            <Text style={styles.question}>{roomData.question}</Text>

            {
                roomData.options.map((option: any, index: number) => {
                    const isSelected = selectedOption === index;

                    return(
                     <TouchableOpacity style={[styles.optionButton, isSelected && styles.selectedOptionButton]} key = {index} onPress = {() => handleVote(index)} disabled={roomData.status!== 'ONVOTE' || hasVoted}>
                         <Text style={styles.optionText}>{option.text}</Text>
                         {(roomData.status === 'CLOSED') && (
                            <Text style={[styles.voteCount, isSelected && styles.selectedOptionText]}>{option.votes} votes</Text>
                         )}
                    </TouchableOpacity>
                    );
                })
            }

            {isHost && (
                <View style={styles.adminContainer}>

                    <Text style={styles.adminLabel}>Admin Controls</Text>
                    
                    <TouchableOpacity style={styles.startButton}  onPress = {() => handleStatusChange(roomData.roomId, 'ONVOTE')}>
                        <Text> Start Voting </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress = {() => handleStatusChange(roomData.roomId, 'CLOSED')}>
                        <Text> Stop Voting </Text>
                    </TouchableOpacity>
                    
                </View>
            )}

            <TouchableOpacity style={styles.leaveButton} onPress={() => handleLeave()}>
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
  selectedOptionButton: { backgroundColor: '#28a745', borderColor: '#1e7e34', borderWidth: 1 }, 
selectedOptionText: { color: '#fff', fontWeight: 'bold' },
  adminContainer: { marginTop: 30, padding: 15, backgroundColor: '#fff3cd', borderRadius: 8 },
  adminLabel: { fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#856404' },
  startButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  closeButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  leaveButton: { marginTop: 20, alignItems: 'center' },
  leaveText: { color: '#dc3545', fontSize: 16 },
});