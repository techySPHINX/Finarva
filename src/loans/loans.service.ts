import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { LoanStatus } from './enums/loan-status.enum';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) { }


  create(createLoanDto: CreateLoanDto) {
    return this.prisma.primary.loan.create({ data: createLoanDto });
  }


  findAll(userId: string) {
    return this.prisma.readReplica.loan.findMany();
  }


  async findOne(id: string) {
    const loan = await this.prisma.readReplica.loan.findUnique({ where: { id } });
    if (!loan) {
      throw new NotFoundException(`Loan with ID "${id}" not found`);
    }
    return loan;
  }


  async update(id: string, updateLoanDto: UpdateLoanDto) {
    await this.findOne(id);
    return this.prisma.primary.loan.update({
      where: { id },
      data: updateLoanDto,
    });
  }


  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.primary.loan.delete({ where: { id } });
  }


  findAllByClientId(clientId: string) {
    return this.prisma.readReplica.loan.findMany({ where: { clientId } });
  }

  async getRemainingBalance(id: string): Promise<number> {
    const loan = await this.findOne(id);
    const monthlyInterestRate = loan.interestRate / 12 / 100;
    const numberOfPayments = loan.term * 12;

    if (monthlyInterestRate === 0) {
      return loan.amount;
    }

    const monthlyPayment = (loan.amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    const remainingBalance = (monthlyPayment / monthlyInterestRate) * (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
    return remainingBalance;
  }


  async approveLoan(id: string) {
    await this.findOne(id);
    return this.prisma.primary.loan.update({
      where: { id },
      data: { status: LoanStatus.APPROVED },
    });
  }


  async rejectLoan(id: string) {
    await this.findOne(id);
    return this.prisma.primary.loan.update({
      where: { id },
      data: { status: LoanStatus.REJECTED },
    });
  }
}
