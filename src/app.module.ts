import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InsuranceModule } from './insurance/insurance.module';
import { InvestmentModule } from './investment/investment.module';
import { LearningModule } from './learning/learning.module';
import { QuizModule } from './quiz/quiz.module';

import { AiModule } from './ai/ai.module';
import { MerchantAssistantModule } from './merchant-assistant/merchant-assistant.module';

@Module({
  imports: [
    PrismaModule,

    AuthModule,
    ClientsModule,
    InsuranceModule,
    InvestmentModule,
    LearningModule,
    QuizModule,

    AiModule,
    MerchantAssistantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
