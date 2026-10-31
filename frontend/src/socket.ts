import {io} from 'socket.io-client';

export const socket = io( 'https://192.168.0.5:3000', {
    autoConnect: true
});
