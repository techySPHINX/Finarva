
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashFlowService {
  constructor(private readonly prisma: PrismaService) {}

  async analyze(userId: string) {
    const expenses = await this.prisma.expense.findMany({ where: { userId } });
    const income = await this.prisma.investment.findMany({ where: { client: { agentId: userId }, status: 'matured' } });

    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const totalIncome = income.reduce((acc, investment) => acc + (investment.returns || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      netCashFlow: totalIncome - totalExpenses,
    };
  }

  async forecast(userId: string) {
    // Basic forecasting logic
    const analysis = await this.analyze(userId);
    const monthlyNetCashFlow = analysis.netCashFlow / 12;

    const forecast = [];
    for (let i = 1; i <= 12; i++) {
      forecast.push({
        month: i,
        projectedNetCashFlow: monthlyNetCashFlow * i,
      });
    }

    return forecast;
  }
}
