import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLearningDto } from './dto/create-learning.dto';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLearningDto, creatorId: string) {
    return this.prisma.learningContent.create({
      data: {
        ...dto,
        createdById: creatorId,
      },
    });
  }

  async findAll(language?: string, tags: string[] = []) {
    return this.prisma.learningContent.findMany({
      where: {
        language: language || undefined,
        tags: tags.length ? { hasSome: tags } : undefined,
      },
    });
  }

  async findByClientProfile(profile: any) {
    const { language, goals, income } = profile;
    return this.prisma.learningContent.findMany({
      where: {
        language: language || undefined,
        tags: goals ? { hasSome: goals } : undefined,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.learningContent.findUnique({
      where: { id },
    });
  }
}
