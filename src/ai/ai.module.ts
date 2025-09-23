import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { BullModule } from '@nestjs/bullmq';
import { AIProcessor } from './ai.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ai-queue',
    }),
  ],
  providers: [AiService, AIProcessor],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
