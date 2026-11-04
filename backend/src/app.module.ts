import { Module } from '@nestjs/common';
import { RoomsGateway } from './voting/rooms.gateway.js';
import { RoomsService } from './voting/rooms.service.js';

@Module({
  imports: [],
  controllers: [],
  providers: [RoomsGateway, RoomsService],
})
export class AppModule {}
