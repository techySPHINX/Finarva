
import { Module } from '@nestjs/common';
import { InvoicingService } from './invoicing.service';
import { InvoicingController } from './invoicing.controller';
import { StripeService } from './stripe.service';
import { ConfigModule } from '@nestjs/config';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule],
  controllers: [InvoicingController, StripeController],
  providers: [InvoicingService, StripeService],
})
export class InvoicingModule {}
