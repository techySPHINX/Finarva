import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import { AiService } from '../ai/ai.service';
import { AiInsuranceInputDto } from './dto/ai-insurance-input.dto';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';
import { AnalyzeProfileDto } from '../ai/dto/analyze-profile.dto';

@Injectable()
export class InsuranceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  private mapAnalyzeToClientProfile(analyze: AnalyzeProfileDto): ClientProfileDto {
    return {
      id: 'unknown-id',
      name: 'unknown-name',
      phone: 'unknown-phone',
      agentId: 'unknown-agent',
      language: analyze.language || 'unknown-language',
      goals: analyze.goals || [],
    };
  }

  create(data: CreateInsuranceDto): Promise<any> {
    const insuranceData = {
      ...data,
      status: data.status ?? 'pending',
    };
    return this.prisma.insurance.create({ data: insuranceData });
  }

  findAll(): Promise<any[]> {
    return this.prisma.insurance.findMany({ include: { client: true } });
  }

  findAllByClient(clientId: string): Promise<any[]> {
    return this.prisma.insurance.findMany({ where: { clientId } });
  }

  findOne(id: string): Promise<any | null> {
    return this.prisma.insurance.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateInsuranceDto): Promise<any> {
    return this.prisma.insurance.update({ where: { id }, data });
  }

  remove(id: string): Promise<any> {
    return this.prisma.insurance.delete({ where: { id } });
  }

  async suggestInsurance(dto: AiInsuranceInputDto): Promise<string> {
  if (!dto.clientProfile) {
    throw new Error('clientProfile is required');
  }
  const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
  return this.aiService.suggestInsurance(clientProfile);
}
}
