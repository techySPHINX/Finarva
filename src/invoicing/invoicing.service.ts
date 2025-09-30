
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { StripeService } from './stripe.service';

@Injectable()
export class InvoicingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { clientId, issueDate, dueDate, items } = createInvoiceDto;

    const total = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const invoice = await this.prisma.invoice.create({
      data: {
        client: { connect: { id: clientId } },
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        total,
        invoiceNumber: this.generateInvoiceNumber(),
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return invoice;
  }

  findAll() {
    return this.prisma.invoice.findMany({ include: { items: true } });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const { items, ...rest } = updateInvoiceDto;

    let total = 0;
    if (items) {
      total = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    }

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...rest,
        total,
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return invoice;
  }

  remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  private generateInvoiceNumber(): string {
    // This is a simple invoice number generator. 
    // In a real application, you would want a more robust solution.
    const prefix = 'INV';
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString().slice(2, 8);

    return `${prefix}-${year}${month}-${random}`;
  }

  async createPaymentIntent(invoiceId: string) {
    const invoice = await this.findOne(invoiceId);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // The amount should be in the smallest currency unit (e.g., cents)
    const amount = Math.round(invoice.total * 100);

    return this.stripeService.createPaymentIntent(amount, 'usd', { invoiceId });
  }

  async handlePaymentIntentSucceeded(paymentIntent: any) {
    const invoiceId = paymentIntent.metadata.invoiceId;
    if (!invoiceId) {
      throw new Error('Invoice ID not found in payment intent metadata');
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' },
    });
  }
}
