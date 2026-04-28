import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateDmDto } from './dto/create-dm.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { MarkReadDto } from './dto/mark-read.dto';

@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  list(@Request() req: any) {
    return this.chatService.listConversations(BigInt(req.user.id));
  }

  @Post('dm')
  @HttpCode(HttpStatus.OK)
  openDm(@Request() req: any, @Body() dto: CreateDmDto) {
    return this.chatService.openDm(
      BigInt(req.user.id),
      this.parseId(dto.userId),
    );
  }

  @Post('group')
  createGroup(@Request() req: any, @Body() dto: CreateGroupDto) {
    return this.chatService.createGroup(
      BigInt(req.user.id),
      dto.name,
      dto.memberIds.map((id) => this.parseId(id)),
    );
  }

  @Get(':id')
  getOne(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversation(
      BigInt(req.user.id),
      this.parseId(id),
    );
  }

  @Post(':id/members')
  addMember(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.chatService.addMember(
      BigInt(req.user.id),
      this.parseId(id),
      this.parseId(dto.userId),
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.OK)
  removeMember(
    @Request() req: any,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.removeMember(
      BigInt(req.user.id),
      this.parseId(id),
      this.parseId(userId),
    );
  }

  @Get(':id/messages')
  listMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit
      ? Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100)
      : 30;
    const parsedCursor = cursor ? this.parseId(cursor) : null;
    return this.chatService.listMessages(
      BigInt(req.user.id),
      this.parseId(id),
      parsedCursor,
      parsedLimit,
    );
  }

  @Post(':id/messages')
  send(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      BigInt(req.user.id),
      this.parseId(id),
      dto.text,
    );
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  markRead(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.chatService.markRead(
      BigInt(req.user.id),
      this.parseId(id),
      this.parseId(dto.lastMessageId),
    );
  }

  private parseId(raw: string): bigint {
    try {
      return BigInt(raw);
    } catch {
      throw new BadRequestException('ID inválido.');
    }
  }
}
