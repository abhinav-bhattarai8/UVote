import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {router} from 'expo-router';

export default function HomeScreen() {
  return(
    <View style={styles.container}>
      <Text style={styles.title}>UVote</Text>

      <TouchableOpacity style= {styles.button}onPress={() => router.push('/create')}>
         <Text style={styles.buttonText}> Create Room</Text>
      </TouchableOpacity>

      <TouchableOpacity style = {[styles.button, styles.joinButton]} onPress={() => router.push('/join')}>
         <Text style={styles.buttonText}>Join Room</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center', marginBottom: 15 },
  joinButton: { backgroundColor: '#34C759' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});