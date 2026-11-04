import {ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import { RoomsService } from './rooms.service.js';
import { CreateRoomDto } from './dtos/create-room.dto.js';
import { VoteDto } from './dtos/vote.dto.js';

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})

export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly roomsService: RoomsService) {}

    handleConnection(client: Socket){
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        const closedRoomId = this.roomsService.removeRoomByHostId(client.id);

        if(closedRoomId){
            this.server.to(closedRoomId).emit('roomClosed', {message: 'Host disconnected. The poll has been closed.'});
        }

    }

    @SubscribeMessage('createRoom')
    handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() dto: CreateRoomDto) {
        const room = this.roomsService.createRoom(client.id, dto);
        client.join(room.roomId);
        return {data: room};
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string}) {
        
        const room = this.roomsService.getRoom(data.roomId);
        if (!room) {
            return {error: 'Failed to join room'};
        }

        client.join(data.roomId);
        room.participants +=1;
        this.server.to(data.roomId).emit('roomUpdated', room);
        return {data: room}
        
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
        client.leave(data.roomId);
        
        const room = this.roomsService.getRoom(data.roomId);
        if (!room) return;

        if (room.hostSocketId === client.id) {
            this.roomsService.removeRoomByHostId(client.id);
            this.server.to(data.roomId).emit('roomClosed', { 
                message: 'Host left the room. The poll has been closed.' 
            });
        } else {
            const updatedRoom = this.roomsService.removeParticipant(data.roomId);
            if (updatedRoom) {
                this.server.to(data.roomId).emit('roomUpdated', updatedRoom);
            }
        }
    }

    @SubscribeMessage('vote')
    handleVote(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, dto: VoteDto}) {
        this.roomsService.vote(data.roomId, data.dto);
        const updatedRoom = this.roomsService.getRoom(data.roomId);

        if(updatedRoom) {
            this.server.to(data.roomId).emit('roomUpdated', updatedRoom);
        }

    }

    @SubscribeMessage('changeStatus')
    handleStatus(@ConnectedSocket() client: Socket, @MessageBody() data: {roomId: string, status: 'OPEN' | 'ONVOTE' | 'CLOSED'}){
        this.roomsService.changeStatus(data.roomId, data.status);
        const updatedRoom = this.roomsService.getRoom(data.roomId);
        if (updatedRoom) {
            this.server.to(data.roomId).emit('roomUpdated', updatedRoom);
        }
    }
}


