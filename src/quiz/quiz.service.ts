import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AiService } from '../ai/ai.service';
import { Prisma, Quiz } from '@prisma/client';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private prismaService: PrismaService,
    private aiService: AiService,
  ) {}

  async createQuiz(dto: CreateQuizDto, createdBy: string) {
    if (!dto.title || !dto.language) {
      throw new BadRequestException('Title and language are required');
    }

    try {
      return await this.prismaService.primary.quiz.create({
        data: {
          ...dto,
          description: dto.description ?? '',
          createdBy,
        },
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`Create quiz failed: ${err?.message}`, err?.stack);
      if (err?.code === 'P2002') {
        throw new BadRequestException('Quiz with this title already exists');
      }
      throw new InternalServerErrorException('Failed to create quiz');
    }
  }

  async addQuestion(dto: AddQuestionDto) {
    if (!dto.quizId || !dto.question || !dto.answer) {
      throw new BadRequestException(
        'Quiz ID, question, and answer are required',
      );
    }

    try {
      const quiz = await this.prismaService.readReplica.quiz.findUnique({
        where: { id: dto.quizId },
      });
      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      return await this.prismaService.primary.question.create({
        data: {
          quizId: dto.quizId,
          question: dto.question,
          options: dto.options,
          answer: dto.answer,
          language: dto.language,
        },
      });
    } catch (error) {
      this.logger.error(
        `Add question failed: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add question');
    }
  }

  async getAllQuizzes(
    language?: string,
    tags?: string[],
    page = 1,
    limit = 10,
  ): Promise<{ data: Quiz[], total: number, page: number, limit: number }> { // Added return type
    const skip = (page - 1) * limit;

    try {
      const whereClause = {
        language,
        tags: tags && tags.length > 0 ? { hasSome: tags } : undefined,
      };

      const [quizzes, total] = await this.prismaService.readReplica.$transaction([
        this.prismaService.readReplica.quiz.findMany({
          where: whereClause,
          include: {
            questions: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prismaService.readReplica.quiz.count({ where: whereClause }),
      ]);

      return {
        data: quizzes,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Get all quizzes failed: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve quizzes');
    }
  }

  async getQuizById(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      const quiz = await this.prismaService.readReplica.quiz.findUnique({
        where: { id },
        include: { questions: true },
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz with id ${id} not found`);
      }

      return quiz;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Get quiz by ID failed: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve quiz');
    }
  }

  // New method to consistently read from the primary database
  async getQuizByIdConsistent(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      const quiz = await this.prismaService.primary.quiz.findUnique({
        where: { id },
        include: { questions: true },
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz with id ${id} not found on primary`);
      }

      return quiz;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Get quiz by ID from primary failed: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve quiz from primary');
    }
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      return await this.prismaService.primary.quiz.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        throw new NotFoundException(`Quiz with id ${id} not found`);
      }
      if ((error as any)?.code === 'P2023') {
        throw new BadRequestException('Invalid quiz ID format');
      }

      this.logger.error(
        `Update quiz failed: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      throw new InternalServerErrorException('Failed to update quiz');
    }
  }

  async deleteQuiz(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      return await this.prismaService.primary.$transaction(async (prisma) => {
        await prisma.question.deleteMany({ where: { quizId: id } });

        return await prisma.quiz.delete({ where: { id } });
      });
    } catch (error) {
      if ((error as any)?.code === 'P2025') {
        throw new NotFoundException(`Quiz with id ${id} not found`);
      }
      if ((error as any)?.code === 'P2023') {
        throw new BadRequestException('Invalid quiz ID format');
      }

      this.logger.error(
        `Delete quiz failed: ${(error as any)?.message}`,
        (error as any)?.stack,
      );
      throw new InternalServerErrorException('Failed to delete quiz');
    }
  }
  private async validateQuizAnswers(quizId: string, answers: string[]) {
    const quiz = await this.getQuizById(quizId);

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (
        answers[idx] &&
        answers[idx].toString().toLowerCase() === q.answer.toLowerCase()
      ) {
        score++;
      }
    });

    return { score, total: quiz.questions.length };
  }

  async submitQuiz(clientId: string, dto: SubmitQuizDto) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }
    if (!dto.quizId || !dto.answers) {
      throw new BadRequestException('Quiz ID and answers are required');
    }

    try {
      const client = await this.prismaService.readReplica.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        throw new NotFoundException(`Client with id ${clientId} not found`);
      }

      let score = dto.score || 0;

      if (!dto.score) {
        const quiz = await this.getQuizById(dto.quizId);

        if (!quiz.questions || quiz.questions.length === 0) {
          throw new BadRequestException('Quiz has no questions');
        }

        // Calculate score from answers
        score = 0;
        for (let i = 0; i < quiz.questions.length; i++) {
          const q = quiz.questions[i];
          const answer = dto.answers[i] || '';
          if (answer.toLowerCase() === q.answer.toLowerCase()) {
            score++;
          }
        }
      }

      return await this.prismaService.primary.clientQuizAttempt.create({
        data: {
          clientId,
          quizId: dto.quizId,
          score,
          answers: dto.answers,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Submit quiz failed: ${(error as any).message}`,
        (error as any).stack,
      );
      throw new InternalServerErrorException('Failed to submit quiz');
    }
  }

  async getAttemptsByClient(clientId: string, page = 1, limit = 10) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    const skip = (page - 1) * limit;

    try {
      return await this.prismaService.readReplica.clientQuizAttempt.findMany({
        where: { clientId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          quiz: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Get attempts failed: ${(error as any).message}`,
        (error as any).stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve quiz attempts',
      );
    }
  }

  async getQuizSuggestionsFromAI(clientId: string) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    try {
      const client = await this.prismaService.readReplica.client.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          phone: true,
          agentId: true,
          preferredLanguage: true,
          interests: true,
          goals: true,
          quizAttempts: {
            select: {
              quizId: true,
              score: true,
              createdAt: true,
            },
          },
        },
      });

      if (!client) {
        throw new NotFoundException(`Client with id ${clientId} not found`);
      }

      const profile = {
        id: client.id,
        name: client.name,
        phone: client.phone,
        agentId: client.agentId,
        language: client.preferredLanguage ?? 'en',
        goals: client.goals ?? [],
      };

      return await this.aiService.generateQuizSuggestions(profile);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Get AI suggestions failed: ${(error as any).message}`,
        (error as any).stack,
      );
      throw new InternalServerErrorException(
        'Failed to get AI quiz suggestions',
      );
    }
  }
}
