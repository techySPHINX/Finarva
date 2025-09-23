
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashFlowService {
  constructor(private readonly prisma: PrismaService) { }

  async analyze(userId: string) {
    const [expenseAggregation, incomeAggregation] = await Promise.all([
      this.prisma.readReplica.expense.aggregate({
        where: { userId },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.readReplica.investment.aggregate({
        where: { client: { agentId: userId }, status: 'matured' },
        _sum: {
          returns: true,
        },
      }),
    ]);

    const totalExpenses = expenseAggregation._sum.amount || 0;
    const totalIncome = incomeAggregation._sum.returns || 0;

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
