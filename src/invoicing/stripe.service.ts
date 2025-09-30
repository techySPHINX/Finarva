
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Stripe.MetadataParam,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
  }

  async constructEvent(body: any, sig: string, endpointSecret: string): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(body, sig, endpointSecret);
  }
}
