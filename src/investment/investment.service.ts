import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { BulkCreateInvestmentDto } from './dto/bulk-create-investment.dto';

@Injectable()
export class InvestmentService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInvestmentDto) {
    return this.prisma.investment.create({ data });
  }

  async bulkCreate(dto: BulkCreateInvestmentDto) {
    const investments = dto.investments ?? [];
    const createPromises = investments.map((investment) =>
      this.prisma.investment.create({ data: investment }),
    );
    return Promise.all(createPromises);
  }

  async findAllByClient(clientId: string, status?: string) {
    return this.prisma.investment.findMany({
      where: {
        clientId,
        status: status || undefined,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.investment.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateInvestmentDto) {
    return this.prisma.investment.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.investment.delete({ where: { id } });
  }

  async findByClientAndTypes(clientId: string, types: string[]) {
    return this.prisma.investment.findMany({
      where: {
        clientId,
        type: { in: types },
      },
    });
  }
}
