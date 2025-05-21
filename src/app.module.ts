import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InsuranceModule } from './insurance/insurance.module';
import { InvestmentModule } from './investment/investment.module';
import { LearningModule } from './learning/learning.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ChatbotModule } from './ai/chatbot/chatbot.module';
import { LeadScoringModule } from './ai/lead-scoring/lead-scoring.module';
import { FinancialHealthModule } from './ai/financial-health/financial-health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [DatabaseModule, AuthModule, ClientsModule, InsuranceModule, InvestmentModule, LearningModule, SchedulerModule, ChatbotModule, LeadScoringModule, FinancialHealthModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
