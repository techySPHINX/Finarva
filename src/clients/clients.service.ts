import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from '@prisma/client';
import { ClientProfileDto } from './dto/client-profile.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClientDto, agentId: string): Promise<Client> {
    return this.prisma.client.create({
      data: {
        ...data,
        agentId,
      },
    });
  }

  async findAllByAgent(agentId: string): Promise<Client[]> {
    return this.prisma.client.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
    return client;
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    return this.prisma.client.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Client> {
    const existing = await this.prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }

    return this.prisma.client.delete({ where: { id } });
  }

  async getClientProfile(id: string): Promise<ClientProfileDto> {
    const client = await this.findOne(id);
    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      language: client.language,
      age: client.age ?? undefined,
      gender: client.gender ?? undefined,
      income: client.income ?? undefined,
      goals: client.goals,
      agentId: client.agentId,
    };
  }
}
