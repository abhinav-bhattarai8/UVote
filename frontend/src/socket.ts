import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const RENDER_BACKEND_URL = 'https://uvote-uwrz.onrender.com';

export const socket = io(RENDER_BACKEND_URL, {
    transports: ['websocket'], 
    autoConnect: true,
});