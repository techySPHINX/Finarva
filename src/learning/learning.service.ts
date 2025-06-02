import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { UpdateLearningContentDto } from './dto/update-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';
import { LearningContent, LearningProgress } from '@prisma/client';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateLearningContentDto,
    creatorId: string,
  ): Promise<LearningContent> {
    return await this.prisma.learningContent.create({
      data: {
        ...dto,
        createdById: creatorId,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateLearningContentDto,
  ): Promise<LearningContent> {
    return await this.prisma.learningContent.update({
      where: { id },
      data: dto,
    });
  }

  async findAll(
    language?: string,
    tags: string[] = [],
  ): Promise<LearningContent[]> {
    return await this.prisma.learningContent.findMany({
      where: {
        language: language || undefined,
        ...(tags.length ? { tags: { hasSome: tags } } : {}),
      },
    });
  }

  async findOne(id: string): Promise<LearningContent> {
    const content = await this.prisma.learningContent.findUnique({
      where: { id },
    });
    if (!content) throw new NotFoundException('Learning content not found');
    return content;
  }

  async findByClientProfile(profile: {
    preferredLanguage?: string;
    goals?: string[];
    occupation?: string;
    investmentExperience?: string;
  }): Promise<LearningContent[]> {
    const { preferredLanguage, goals, occupation, investmentExperience } =
      profile;

    const orConditions = [
      ...(goals?.length ? [{ tags: { hasSome: goals } }] : []),
      ...(occupation ? [{ tags: { has: occupation } }] : []),
      ...(investmentExperience
        ? [{ tags: { has: investmentExperience } }]
        : []),
    ];

    return await this.prisma.learningContent.findMany({
      where: {
        ...(preferredLanguage ? { language: preferredLanguage } : {}),
        ...(orConditions.length ? { OR: orConditions } : {}),
      },
    });
  }

  async recordProgress(
    clientId: string,
    dto: RecordProgressDto,
  ): Promise<LearningProgress> {
    return await this.prisma.learningProgress.upsert({
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
  }

  async getClientProgress(
    clientId: string,
  ): Promise<(LearningProgress & { content: LearningContent })[]> {
    return await this.prisma.learningProgress.findMany({
      where: { clientId },
      include: {
        content: true,
      },
    });
  }
}
