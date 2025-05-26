import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningContentDto } from './dto/create-learning-content.dto';
import { UpdateLearningContentDto } from './dto/update-learning-content.dto';
import { RecordProgressDto } from './dto/record-progress.dto';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLearningContentDto, creatorId: string) {
    return this.prisma.learningContent.create({
      data: {
        ...dto,
        createdById: creatorId,
      },
    });
  }

  // Update existing content
  async update(id: string, dto: UpdateLearningContentDto) {
    return this.prisma.learningContent.update({
      where: { id },
      data: dto,
    });
  }

  // Get all content optionally filtered by language and tags
  async findAll(language?: string, tags: string[] = []) {
    return this.prisma.learningContent.findMany({
      where: {
        language: language || undefined,
        tags: tags.length ? { hasSome: tags } : undefined,
      },
    });
  }

  // Get one content by ID
  async findOne(id: string) {
    const content = await this.prisma.learningContent.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Learning content not found');
    return content;
  }

  // Personalized content for a client based on profile
  async findByClientProfile(profile: {
    preferredLanguage?: string;
    goals?: string[];
    occupation?: string;
    investmentExperience?: string;
  }) {
    const { preferredLanguage, goals, occupation, investmentExperience } = profile;

    return this.prisma.learningContent.findMany({
      where: {
        language: preferredLanguage || undefined,
        OR: [
          goals?.length ? { tags: { hasSome: goals } } : undefined,
          occupation ? { tags: { has: occupation } } : undefined,
          investmentExperience ? { tags: { has: investmentExperience } } : undefined,
        ].filter(Boolean),
      },
    });
  }

  // Track client's progress on learning content
  async recordProgress(clientId: string, dto: RecordProgressDto) {
    return this.prisma.learningProgress.upsert({
      where: {
        clientId_contentId: {
          clientId,
          contentId: dto.contentId,
        },
      },
      update: {
        progress: dto.progress,
        lastAccessedAt: new Date(),
      },
      create: {
        clientId,
        contentId: dto.contentId,
        progress: dto.progress,
        lastAccessedAt: new Date(),
      },
    });
  }

  // Get all progress records for a client
  async getClientProgress(clientId: string) {
    return this.prisma.learningProgress.findMany({
      where: { clientId },
      include: {
        content: true,
      },
    });
  }
}
