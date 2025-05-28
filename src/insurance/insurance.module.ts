// src/insurance/insurance.module.ts

import { Module } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Module({
  controllers: [InsuranceController],
  providers: [InsuranceService, PrismaService, AiService],
})
export class InsuranceModule {}
