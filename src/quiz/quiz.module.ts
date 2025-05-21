import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [QuizController],
  providers: [QuizService, PrismaService],
})
export class QuizModule {}
