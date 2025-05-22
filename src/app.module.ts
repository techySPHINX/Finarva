import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InsuranceModule } from './insurance/insurance.module';
import { InvestmentModule } from './investment/investment.module';
import { LearningModule } from './learning/learning.module';
import { QuizModule } from './quiz/quiz.module';

// AI Modules
import { AiModule } from './ai/ai.module';
// import { ChatbotModule } from './ai/chatbot/chatbot.module';
// import { FinancialHealthModule } from './ai/financial-health/financial-health.module';

@Module({
  imports: [
    // Infrastructure
    PrismaModule,

    // Domain Modules
    AuthModule,
    ClientsModule,
    InsuranceModule,
    InvestmentModule,
    LearningModule,
    QuizModule,

    // AI Modules
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
