import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { QuestionsService } from './questions.service';
import { GenerateQuestionsDto } from './dto/create-question.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Geração aciona o Gemini (custo/quota) — limite agressivo contra abuso.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  @UseInterceptors(
    FileInterceptor('file', {
      // PDF de material: teto de 5MB + só aceita application/pdf.
      // Sem isso o buffer inteiro ia direto pra pdf-parse/Gemini (DoS de memória).
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Apenas arquivos PDF são aceitos.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async generate(
    @Request() req: any,
    @Body() dto: GenerateQuestionsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const hostId = BigInt(req.user.id);
    return this.questionsService.generateAndStore(hostId, dto, file);
  }
}
