
import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}
