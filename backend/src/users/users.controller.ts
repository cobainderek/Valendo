import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Request() req: any) {
    return this.usersService.getProfileWithStats(BigInt(req.user.id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateMe(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(BigInt(req.user.id), dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/history')
  async myHistory(
    @Request() req: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit
      ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50)
      : 20;

    let parsedCursor: bigint | null = null;
    if (cursor) {
      try {
        parsedCursor = BigInt(cursor);
      } catch {
        throw new BadRequestException('Cursor inválido.');
      }
    }

    return this.usersService.getHistory(
      BigInt(req.user.id),
      parsedCursor,
      parsedLimit,
    );
  }
}
