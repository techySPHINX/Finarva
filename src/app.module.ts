
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { RateLimiterGuard, RateLimiterModule } from 'nestjs-rate-limiter';
import { APP_GUARD } from '@nestjs/core';
import { InvoicingModule } from './invoicing/invoicing.module';
import { InvoicingService } from './invoicing/invoicing.service';
import { InvoicingController } from './invoicing/invoicing.controller';
import { TaxModule } from './tax/tax.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RateLimiterModule.register({
      points: 100,
      duration: 60,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: parseInt(config.get<string>('CACHE_TTL', '60'), 10),
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: parseInt(config.get<string>('REDIS_PORT', '6379'), 10),
        },
      }),
    }),
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
    InvoicingModule,
    TaxModule,
    AnalyticsModule,
  ],
  controllers: [AppController, InvoicingController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    InvoicingService,
  ],
})
export class AppModule { }
