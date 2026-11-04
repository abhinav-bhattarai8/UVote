import { Alert, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import React, {useState} from 'react';
import { socket } from '@/socket';
import { router } from 'expo-router';

export default function CreateRoomScreen() {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['','']);

    const handleOptionChange = (text: string, index:number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    }

    const addOption = () => {
        setOptions([...options, '']);
    }

    const removeOption = (index: number) => {

        if (options.length <= 2) {
            Alert.alert('Error', 'Polls must have at least 2 options.');
            return;
        }
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);

    }

    const handleCreate = () => {
        if (!question || !(options.length >= 2)){
            Alert.alert('Error', 'Please fill out question and at least 2 options');
            return;
        }

        const payload = { question, options: options};

        socket.emit('createRoom', payload, (response: any) => {
            console.log('Received response from server:', response);
            if(response && response.data) {
                router.push({
                    pathname: '/room' as any,
                    params: {roomData: JSON.stringify(response.data), isHost: 'true' }
                })
            }
        });
    }

    return (
        <ScrollView contentContainerStyle = {styles.container}>
            <Text style = {styles.heading}>Create Poll</Text>
            <TextInput placeholder='Question' value={question} style = {styles.input} onChangeText={setQuestion}/>

            <Text style = {styles.subHeading}>Options</Text>

            {
                options.map((option,index) => (
                    <View key={index} style = {styles.optionRow}> 
                      <TextInput
                      style= {[styles.input, styles.optionInput]} 
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChangeText={(text) => handleOptionChange(text,index)}/>
                      { options.length >2 && (
                        <TouchableOpacity style = {styles.removeButton} onPress = { () => removeOption(index)} >
                            <Text style = {styles.removeButtonText}>X</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                ))
            }

            <TouchableOpacity style = {styles.addButton} onPress = {() => addOption()}>
                <Text style={styles.addButtonText}>Add Option</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress = {() => handleCreate()}>
                <Text style={styles.createButtonText}>Launch Poll</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress = {() => router.back()}>
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
        </ScrollView>
        
    );
    
}

const styles = StyleSheet.create({
    container: { padding: 20, flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' },
    heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subHeading: { fontSize: 16, fontWeight: '600', marginBottom: 10, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 16 },
    optionRow: { flexDirection: 'row', alignItems: 'center' },
    optionInput: { flex: 1, marginRight: 8 },
    removeButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12, height: 48, width: 48 },
    removeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    addButton: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
    addButtonText: { color: '#007AFF', fontWeight: '600' },
    createButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
    createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    backText: { color: '#007AFF', textAlign: 'center', marginTop: 20, fontSize: 16 },
});