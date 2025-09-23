
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) { }

  async generateReport(userId: string) {
    const expenses = await this.prisma.primary.expense.findMany({ where: { userId } });
    const investments = await this.prisma.primary.investment.findMany({ where: { clientId: userId } });
    const inventory = await this.prisma.primary.inventoryItem.findMany({ where: { userId } });
    const loans = await this.prisma.primary.loan.findMany({ where: { clientId: userId } });

    const totalExpenses = expenses.reduce((acc: number, expense: { amount: number }) => acc + expense.amount, 0);
    const totalInvestments = investments.reduce((acc: number, investment: { amount: number }) => acc + investment.amount, 0);
    const totalLoans = loans.reduce((acc: number, loan: { amount: number }) => acc + loan.amount, 0);
    const totalInventoryValue = inventory.reduce((acc: number, item: { price: number, quantity: number }) => acc + item.price * item.quantity, 0);

    return {
      totalExpenses,
      totalInvestments,
      totalLoans,
      totalInventoryValue,
    };
  }
}
