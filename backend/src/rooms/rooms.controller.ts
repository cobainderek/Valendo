import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req: any, @Body() createRoomDto: CreateRoomDto) {
    const hostId = BigInt(req.user.id);
    return this.roomsService.create(hostId, createRoomDto);
  }

  @Get()
  getLobby() {
    return this.roomsService.getLobbyRooms();
  }
}
