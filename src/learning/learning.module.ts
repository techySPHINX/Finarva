import { Module } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LearningController],
  providers: [LearningService, PrismaService],
})
export class LearningModule {}
