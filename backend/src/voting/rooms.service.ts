import {Injectable} from '@nestjs/common';
import {Room, Option} from './interfaces/room.interface.js'
import { CreateRoomDto} from './dtos/create-room.dto.js';
import * as crypto from 'node:crypto';
import { VoteDto } from './dtos/vote.dto.js';

@Injectable()
export class RoomsService{
    private readonly rooms = new Map<string, Room>();

    createRoom(hostSocketId: string, dto:CreateRoomDto): Room {
        const code = this.generateRoomId(10);
        const optionsMap: Option[] = dto.options.map((optionText, index) => ({
            id: index,
            text: optionText,
            votes: 0
        }))

        const newRoom: Room = {
            roomId: code,
            hostSocketId: hostSocketId ,
            participants:1,
            question: dto.question,
            options: optionsMap,
            status: 'OPEN'

        };

        this.rooms.set(code, newRoom);

        return newRoom;
    };

    generateRoomId(length:number): string {
        const code = crypto.randomBytes(length).toString('hex');
        return code;
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    vote(roomId: string, dto: VoteDto) {
        const room = this.getRoom(roomId);
        
        if (!room) {
            return
        }

        if(room.status!='ONVOTE') {
            return
        }

        room.options[dto.voteOption].votes+=1;
    }

    changeStatus(roomId: string, status: 'OPEN' | 'ONVOTE' | 'CLOSED') {
        const room = this.getRoom(roomId);
        if(!room) return
        room.status = status;
    }
}