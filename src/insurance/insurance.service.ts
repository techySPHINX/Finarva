import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { AiService } from '../ai/ai.service';
import { AiInsuranceInputDto } from './dto/ai-insurance-input.dto';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';
import { AnalyzeProfileDto } from '../ai/dto/analyze-profile.dto';
import { Insurance, Client } from '@prisma/client';

@Injectable()
export class InsuranceService {
  private readonly logger = new Logger(InsuranceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) { }

  private mapAnalyzeToClientProfile(
    analyze: AnalyzeProfileDto,
  ): ClientProfileDto {
    return {
      id: 'unknown-id',
      name: 'unknown-name',
      phone: 'unknown-phone',
      agentId: 'unknown-agent',
      language: analyze.language || 'unknown-language',
      goals: analyze.goals || [],
    };
  }

  async create(data: CreateInsuranceDto): Promise<Insurance> {
    const insuranceData = {
      ...data,
      status: data.status ?? 'pending',
    };

    try {
      return await this.prisma.primary.insurance.create({ data: insuranceData });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Unique constraint violation');
      }
      if (error?.code === 'P2003') {
        throw new BadRequestException('Invalid foreign key reference');
      }

      this.logger.error(`Create failed: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Database operation failed');
    }
  }

  async findAll(): Promise<(Insurance & { client: Client })[]> {
    try {
      return await this.prisma.readReplica.insurance.findMany({
        include: { client: true },
      });
    } catch (error: any) {
      this.logger.error(`FindAll failed: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve insurance entries',
      );
    }
  }

  async findAllByClient(clientId: string): Promise<Insurance[]> {
    try {
      const entries = await this.prisma.readReplica.insurance.findMany({
        where: { clientId },
      });
      if (!entries || entries.length === 0) {
        throw new NotFoundException(
          `No insurance entries found for client ${clientId}`,
        );
      }
      return entries;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(
        `FindAllByClient failed: ${error?.message}`,
        error?.stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve client insurance entries',
      );
    }
  }

  async findOne(id: string): Promise<Insurance | null> {
    try {
      const insurance = await this.prisma.readReplica.insurance.findUnique({
        where: { id },
      });
      if (!insurance) {
        throw new NotFoundException(`Insurance with id ${id} not found`);
      }
      return insurance;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`FindOne failed: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException(
        'Failed to retrieve insurance entry',
      );
    }
  }

  async update(id: string, data: UpdateInsuranceDto): Promise<Insurance> {
    try {
      return await this.prisma.primary.insurance.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Insurance with id ${id} not found`);
      }
      if (error?.code === 'P2002') {
        throw new ConflictException('Unique constraint violation');
      }

      this.logger.error(`Update failed: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to update insurance');
    }
  }

  async remove(id: string): Promise<Insurance> {
    try {
      return await this.prisma.primary.insurance.delete({
        where: { id },
      });
    } catch (error) {
      const err: any = error;
      if (err?.code === 'P2025') {
        throw new NotFoundException(`Insurance with id ${id} not found`);
      }

      this.logger.error(`Remove failed: ${err?.message}`, err?.stack);
      throw new InternalServerErrorException('Failed to delete insurance');
    }
  }

  async suggestInsurance(dto: AiInsuranceInputDto): Promise<string> {
    if (!dto.clientProfile) {
      throw new BadRequestException('clientProfile is required');
    }

    try {
      const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
      return await this.aiService.suggestInsurance(clientProfile);
    } catch (error: any) {
      const errMsg = error?.message || 'Unknown error';
      this.logger.error(`AI suggestion failed: ${errMsg}`, error?.stack);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('AI service unavailable');
    }
  }
}
