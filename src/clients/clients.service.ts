import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateClientDto, agentId: string): Promise<Client> {
    if (!data.name || !data.phone) {
      throw new BadRequestException('Name and phone are required');
    }

    try {
      return await this.prisma.primary.client.create({
        data: {
          ...data,
          agentId,
          preferredLanguage: data.language || '',
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Phone number already exists');
        }
      }
      this.logError('Create', error);
      throw new InternalServerErrorException('Failed to create client');
    }
  }

  async findAllByAgent(agentId: string, paginationDto: PaginationDto): Promise<{ data: Client[], total: number, page: number, limit: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [clients, total] = await this.prisma.primary.$transaction([
        this.prisma.readReplica.client.findMany({
          where: { agentId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.readReplica.client.count({
          where: { agentId },
        }),
      ]);

      return {
        data: clients,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logError('FindAllByAgent', error);
      throw new InternalServerErrorException('Failed to retrieve clients');
    }
  }

  async findOne(id: string): Promise<Client> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      const client = await this.prisma.readReplica.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new NotFoundException(`Client with id ${id} not found`);
      }
      return client;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logError('FindOne', error);
      throw new InternalServerErrorException('Failed to retrieve client');
    }
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      return await this.prisma.primary.client.update({
        where: { id },
        data: {
          ...data,
          preferredLanguage: data.language || undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Client with id ${id} not found`);
        } else if (error.code === 'P2002') {
          throw new BadRequestException('Phone number already exists');
        }
      }
      this.logError('Update', error);
      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async remove(id: string): Promise<Client> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      return await this.prisma.primary.client.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Client with id ${id} not found`);
        }
      }
      this.logError('Remove', error);
      throw new InternalServerErrorException('Failed to delete client');
    }
  }

  async getClientProfile(id: string): Promise<{
    id: string;
    name: string;
    phone: string;
    language: string;
    age?: number;
    gender?: string;
    income?: number;
    goals: string[];
    agentId: string;
  }> {
    try {
      const client = await this.prisma.readReplica.client.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          phone: true,
          preferredLanguage: true,
          age: true,
          gender: true,
          income: true,
          goals: true,
          agentId: true,
        },
      });

      if (!client) {
        throw new NotFoundException(`Client with id ${id} not found`);
      }

      return {
        ...client,
        language: client.preferredLanguage ?? 'en',
        age: client.age ?? undefined,
        gender: client.gender ?? undefined,
        income: client.income ?? undefined,
        goals: client.goals ?? [],
      };
    } catch (error) {
      this.logError('Profile retrieval', error);
      throw error;
    }
  }

  private logError(method: string, error: unknown) {
    if (error instanceof Error) {
      this.logger.error(`${method} failed: ${error.message}`, error.stack);
    } else {
      this.logger.error(`${method} failed: Unknown error`, '');
    }
  }
}
