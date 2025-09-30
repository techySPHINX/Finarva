
import { Controller, Post, Headers, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { InvoicingService } from './invoicing.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly invoicingService: InvoicingService,
    private readonly configService: ConfigService,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  async handleWebhook(@Headers('stripe-signature') sig: string, @Req() req: Request) {
    const event = await this.stripeService.constructEvent(
      req.body,
      sig,
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET'),
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      await this.invoicingService.handlePaymentIntentSucceeded(paymentIntent);
    }

    return { received: true };
  }
}
