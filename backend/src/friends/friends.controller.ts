import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FriendsService } from './friends.service';
import { SendFriendRequestDto } from './dto/send-request.dto';

@Controller('friends')
@UseGuards(AuthGuard('jwt'))
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('search')
  search(
    @Request() req: any,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10) || 10, 20) : 10;
    return this.friendsService.searchByTag(BigInt(req.user.id), q ?? '', parsedLimit);
  }

  @Get()
  list(@Request() req: any) {
    return this.friendsService.listFriends(BigInt(req.user.id));
  }

  @Post('requests')
  send(@Request() req: any, @Body() dto: SendFriendRequestDto) {
    return this.friendsService.sendRequest(BigInt(req.user.id), dto.tag);
  }

  @Get('requests/incoming')
  incoming(@Request() req: any) {
    return this.friendsService.listIncoming(BigInt(req.user.id));
  }

  @Get('requests/outgoing')
  outgoing(@Request() req: any) {
    return this.friendsService.listOutgoing(BigInt(req.user.id));
  }

  @Post('requests/:id/accept')
  @HttpCode(HttpStatus.OK)
  accept(@Request() req: any, @Param('id') id: string) {
    return this.friendsService.respondToRequest(
      BigInt(req.user.id),
      this.parseId(id),
      true,
    );
  }

  @Post('requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@Request() req: any, @Param('id') id: string) {
    return this.friendsService.respondToRequest(
      BigInt(req.user.id),
      this.parseId(id),
      false,
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  remove(@Request() req: any, @Param('userId') userId: string) {
    return this.friendsService.removeFriend(
      BigInt(req.user.id),
      this.parseId(userId),
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
