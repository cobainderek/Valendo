import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
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

  @Get(':code')
  getRoom(@Param('code') code: string) {
    return this.roomsService.getRoomByCode(code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':code/join')
  join(@Request() req: any, @Param('code') code: string) {
    const userId = BigInt(req.user.id);
    return this.roomsService.joinRoom(userId, code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':code/start')
  start(@Request() req: any, @Param('code') code: string) {
    const userId = BigInt(req.user.id);
    return this.roomsService.startGame(userId, code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':code/answer')
  answer(
    @Request() req: any,
    @Param('code') code: string,
    @Body() body: { questionId: string; selectedAnswer: string },
  ) {
    const userId = BigInt(req.user.id);
    return this.roomsService.submitAnswer(userId, code, body.questionId, body.selectedAnswer);
  }
}
