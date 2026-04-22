import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { GenerateQuestionsDto } from './dto/create-question.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  @UseInterceptors(FileInterceptor('file'))
  async generate(
    @Request() req: any,
    @Body() dto: GenerateQuestionsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const hostId = BigInt(req.user.id);
    return this.questionsService.generateAndStore(hostId, dto, file);
  }
}
