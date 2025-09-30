import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) { }

  async getFinancialSummary(userId: string) {
    const invoices = await this.prisma.readReplica.invoice.findMany({
      where: {
        client: {
          agentId: userId,
        },
        status: 'PAID',
      },
    });

    const expenses = await this.prisma.readReplica.expense.findMany({
      where: { userId },
    });

    const totalRevenue = invoices.reduce((acc: number, invoice: { total: number }) => acc + invoice.total, 0);
    const totalExpenses = expenses.reduce((acc: number, expense: { amount: number }) => acc + expense.amount, 0);
    const profit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      profit,
    };
  }

  async getSalesAnalytics(userId: string) {
    const invoices = await this.prisma.readReplica.invoice.findMany({
      where: {
        client: {
          agentId: userId,
        },
        status: 'PAID',
      },
      include: {
        items: true,
        client: true,
      },
    });

    const monthlySales = invoices.reduce((acc: Record<string, number>, invoice: { issueDate: Date; total: number }) => {
      const month = invoice.issueDate.toLocaleString('default', { month: 'long' });
      acc[month] = (acc[month] || 0) + invoice.total;
      return acc;
    }, {});

    const topItems = invoices
      .flatMap((invoice: { items: { description: string; total: number }[] }) => invoice.items)
      .reduce((acc: Record<string, number>, item: { description: string; total: number }) => {
        acc[item.description] = (acc[item.description] || 0) + item.total;
        return acc;
      }, {});

    const salesByClient = invoices.reduce((acc: Record<string, number>, invoice: { client: { name: string }; total: number }) => {
      acc[invoice.client.name] = (acc[invoice.client.name] || 0) + invoice.total;
      return acc;
    }, {});

    return {
      monthlySales,
      topItems,
      salesByClient,
    };
  }
}
