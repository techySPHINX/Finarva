
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) { }

  create(createItemDto: CreateItemDto) {
    return this.prisma.primary.inventoryItem.create({ data: createItemDto });
  }

  findAll(userId: string) {
    return this.prisma.readReplica.inventoryItem.findMany({ where: { userId } });
  }

  findOne(id: string) {
    return this.prisma.readReplica.inventoryItem.findUnique({ where: { id } });
  }

  update(id: string, updateItemDto: UpdateItemDto) {
    return this.prisma.primary.inventoryItem.update({
      where: { id },
      data: updateItemDto,
    });
  }

  remove(id: string) {
    return this.prisma.primary.inventoryItem.delete({ where: { id } });
  }
}
