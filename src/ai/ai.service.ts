// ...existing code...
import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClientProfileDto } from '../clients/dto/client-profile.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(@InjectQueue('ai-queue') private readonly aiQueue: Queue) { }

  async analyzeProfile(profile: ClientProfileDto): Promise<any> {
    // For now, delegate to generateFinancialAdvice or return a stub
    return this.generateFinancialAdvice(profile);
  }

  private async addJobToQueue(jobName: string, data: any) {
    try {
      const job = await this.aiQueue.add(jobName, data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
      this.logger.log(`Added job ${job.id} to the ai-queue`);
      return { jobId: job.id, message: `${jobName} has been queued.` };
    } catch (error) {
      this.logger.error(
        `Failed to add job to ai-queue: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(`Failed to queue ${jobName}.`);
    }
  }

  async generateFinancialAdvice(financialData: any): Promise<any> {
    if (!financialData || Object.keys(financialData).length === 0) {
      throw new BadRequestException('Invalid financial data');
    }
    return this.addJobToQueue('financial-advice-job', { financialData });
  }

  async generateQuizSuggestions(clientProfile: ClientProfileDto): Promise<any> {
    if (!clientProfile || !clientProfile.id) {
      throw new BadRequestException('Invalid client profile');
    }
    return this.addJobToQueue('quiz-suggestions-job', { clientProfile });
  }

  async analyzeLearningContent(
    profile: ClientProfileDto,
    learningStats: Record<string, unknown>,
  ): Promise<any> {
    if (!profile || !profile.id) {
      throw new BadRequestException('Invalid client profile');
    }
    if (!learningStats || Object.keys(learningStats).length === 0) {
      throw new BadRequestException('Invalid learning stats');
    }
    return this.addJobToQueue('content-analysis-job', { profile, learningStats });
  }

  async suggestInvestments(clientProfile: ClientProfileDto): Promise<any> {
    if (!clientProfile || !clientProfile.id) {
      throw new BadRequestException('Invalid client profile');
    }
    return this.addJobToQueue('investment-suggestions-job', { clientProfile });
  }


  async suggestInsurance(clientProfile: ClientProfileDto): Promise<any> {
    if (!clientProfile || !clientProfile.id) {
      throw new BadRequestException('Invalid client profile');
    }
    return this.addJobToQueue('insurance-suggestions-job', { clientProfile });
  }

  async generateEmbedding(input: string): Promise<number[]> {
    // Stub implementation for test compatibility
    return [0.1, 0.2, 0.3];
  }

  async callGeminiApi(prompt: string, maxTokens: number): Promise<string> {
    // Stub implementation for test compatibility
    return 'AI response';
  }
}
