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
import { ExpensesModule } from './expenses/expenses.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { LoansModule } from './loans/loans.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportingModule } from './reporting/reporting.module';

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
    ExpensesModule,
    CashFlowModule,
    LoansModule,
    InventoryModule,
    ReportingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
