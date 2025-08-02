
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReport(userId: string) {
    const expenses = await this.prisma.expense.findMany({ where: { userId } });
    const investments = await this.prisma.investment.findMany({ where: { client: { agentId: userId } } });
    const loans = await this.prisma.loan.findMany({ where: { userId } });
    const inventory = await this.prisma.inventoryItem.findMany({ where: { userId } });

    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const totalInvestments = investments.reduce((acc, investment) => acc + investment.amount, 0);
    const totalLoans = loans.reduce((acc, loan) => acc + loan.amount, 0);
    const totalInventoryValue = inventory.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return {
      totalExpenses,
      totalInvestments,
      totalLoans,
      totalInventoryValue,
    };
  }
}
