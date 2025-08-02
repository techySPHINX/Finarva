
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLoanDto: CreateLoanDto) {
    return this.prisma.loan.create({ data: createLoanDto });
  }

  findAll(userId: string) {
    return this.prisma.loan.findMany({ where: { userId } });
  }

  findOne(id: string) {
    return this.prisma.loan.findUnique({ where: { id } });
  }
}
