
import { Module } from '@nestjs/common';
import { MerchantAssistantController } from './merchant-assistant.controller';
import { MerchantAssistantService } from './merchant-assistant.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';

@Module({
  imports: [PrismaModule, AiModule, VectorStoreModule],
  controllers: [MerchantAssistantController],
  providers: [MerchantAssistantService],
})
export class MerchantAssistantModule {}
