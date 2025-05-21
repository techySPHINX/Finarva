import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';

@Injectable()
export class InvestmentService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateInvestmentDto) {
    return this.prisma.investment.create({ data });
  }

  findAllByClient(clientId: string) {
    return this.prisma.investment.findMany({ where: { clientId } });
  }

  findOne(id: string) {
    return this.prisma.investment.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateInvestmentDto) {
    return this.prisma.investment.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.investment.delete({ where: { id } });
  }
}
