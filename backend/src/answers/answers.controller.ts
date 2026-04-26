import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnswersService } from './answers.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  submit(@Request() req: any, @Body() dto: SubmitAnswerDto) {
    const userId = BigInt(req.user.id);
    return this.answersService.submit(userId, dto);
  }
}
