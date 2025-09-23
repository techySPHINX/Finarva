
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) { }

  create(createExpenseDto: CreateExpenseDto) {
    return this.prisma.primary.expense.create({ data: createExpenseDto });
  }

  async findAll(userId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [expenses, total] = await this.prisma.primary.$transaction([
      this.prisma.readReplica.expense.findMany({
        where: { userId },
        skip,
        take: limit,
      }),
      this.prisma.readReplica.expense.count({ where: { userId } }),
    ]);

    return {
      data: expenses,
      total,
      page,
      limit,
    };
  }

  findOne(id: string) {
    return this.prisma.readReplica.expense.findUnique({ where: { id } });
  }

  update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return this.prisma.primary.expense.update({
      where: { id },
      data: updateExpenseDto,
    });
  }

  remove(id: string) {
    return this.prisma.primary.expense.delete({ where: { id } });
  }
}
