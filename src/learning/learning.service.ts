import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { UpdateLearningContentDto } from './dto/update-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';
import { LearningContent, LearningProgress } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(private prisma: PrismaService) { }

  async create(
    dto: CreateLearningContentDto,
    creatorId: string,
  ): Promise<LearningContent> {
    if (!dto.title || !dto.type || !dto.url) {
      throw new BadRequestException('Title, type, and URL are required');
    }

    try {
      return await this.prisma.primary.learningContent.create({
        data: { ...dto, createdById: creatorId },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'P2002') {
          throw new ConflictException('Content with this URL already exists');
        }
      }

      if (error instanceof Error) {
        this.logger.error(`Create failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Create failed: Unknown error');
      }
      throw new InternalServerErrorException(
        'Failed to create learning content',
      );
    }
  }

  async update(
    id: string,
    dto: UpdateLearningContentDto,
  ): Promise<LearningContent> {
    try {
      return await this.prisma.primary.learningContent.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Content with id ${id} not found`);
      }

      // Handle other errors
      if (error instanceof Error) {
        this.logger.error(`Update failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('Update failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to update content');
    }
  }

  async findAll(
    language?: string,
    tags: string[] = [],
  ): Promise<LearningContent[]> {
    try {
      return await this.prisma.readReplica.learningContent.findMany({
        where: {
          language: language || undefined,
          ...(tags.length ? { tags: { hasSome: tags } } : {}),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`FindAll failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('FindAll failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to retrieve content');
    }
  }

  async findOne(id: string): Promise<LearningContent> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid content ID format');
    }

    try {
      const content = await this.prisma.readReplica.learningContent.findUnique({
        where: { id },
      });
      if (!content) {
        throw new NotFoundException(`Learning content with id ${id} not found`);
      }
      return content;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Error) {
        this.logger.error(`FindOne failed: ${error.message}`, error.stack);
      } else {
        this.logger.error('FindOne failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to retrieve content');
    }
  }

  async findByClientProfile(profile: {
    preferredLanguage?: string;
    goals?: string[];
    occupation?: string;
    investmentExperience?: string;
  }): Promise<LearningContent[]> {
    try {
      const {
        preferredLanguage,
        goals = [],
        occupation,
        investmentExperience,
      } = profile;

      const orConditions = [
        ...(goals.length ? [{ tags: { hasSome: goals } }] : []),
        ...(occupation ? [{ tags: { has: occupation } }] : []),
        ...(investmentExperience
          ? [{ tags: { has: investmentExperience } }]
          : []),
      ];

      return await this.prisma.readReplica.learningContent.findMany({
        where: {
          ...(preferredLanguage ? { language: preferredLanguage } : {}),
          ...(orConditions.length ? { OR: orConditions } : {}),
        },
        take: 10, // Limit results for relevance
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Profile search failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Profile search failed: Unknown error');
      }
      throw new InternalServerErrorException(
        'Failed to find personalized content',
      );
    }
  }

  async recordProgress(
    clientId: string,
    dto: RecordProgressDto,
  ): Promise<LearningProgress> {
    // Validate completion percentage
    if (dto.completion < 0 || dto.completion > 100) {
      throw new BadRequestException('Completion must be between 0-100');
    }

    try {
      // Verify content exists
      const content = await this.prisma.readReplica.learningContent.findUnique({
        where: { id: dto.contentId },
      });
      if (!content) {
        throw new NotFoundException(
          `Content with id ${dto.contentId} not found`,
        );
      }

      return await this.prisma.primary.learningProgress.upsert({
        where: {
          clientId_contentId: {
            clientId,
            contentId: dto.contentId,
          },
        },
        update: {
          progress: dto.completion,
          lastAccessedAt: new Date(),
        },
        create: {
          clientId,
          contentId: dto.contentId,
          progress: dto.completion,
          lastAccessedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException('Client or content not found');
        }
      }
      this.logger.error(
        `Progress recording failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  async getClientProgress(
    clientId: string,
  ): Promise<(LearningProgress & { content: LearningContent })[]> {
    try {
      return await this.prisma.readReplica.learningProgress.findMany({
        where: { clientId },
        include: {
          content: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Progress retrieval failed: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Progress retrieval failed: Unknown error');
      }
      throw new InternalServerErrorException('Failed to retrieve progress');
    }
  }
}
