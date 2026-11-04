import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RoomsGateway } from './voting/rooms.gateway.js';
import { RoomsService } from './voting/rooms.service.js';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RoomsGateway, RoomsService],
})
export class AppModule {}
