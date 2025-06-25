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
import { Prisma } from '@prisma/client';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createQuiz(dto: CreateQuizDto, createdBy: string) {
    if (!dto.title || !dto.language) {
      throw new BadRequestException('Title and language are required');
    }

    try {
      return await this.prisma.quiz.create({
        data: {
          ...dto,
          description: dto.description ?? '',
          createdBy,
        },
      });
    } catch (error) {
      this.logger.error(`Create quiz failed: ${(error as any).message}`, (error as any).stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Quiz with this title already exists');
        }
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
      const quiz = await this.prisma.quiz.findUnique({
        where: { id: dto.quizId },
      });
      if (!quiz) {
        throw new NotFoundException('Quiz not found');
      }

      return await this.prisma.question.create({
        data: {
          quizId: dto.quizId,
          question: dto.question,
          options: dto.options,
          answer: dto.answer,
          language: dto.language,
        },
      });
    } catch (error) {
      this.logger.error(`Add question failed: ${(error as any).message}`, (error as any).stack);
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
  ) {
    const skip = (page - 1) * limit;

    try {
      return await this.prisma.quiz.findMany({
        where: {
          language,
          tags: tags && tags.length > 0 ? { hasSome: tags } : undefined,
        },
        include: {
          questions: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Get all quizzes failed: ${(error as any).message}`,
        (error as any).stack,
      );
      throw new InternalServerErrorException('Failed to retrieve quizzes');
    }
  }

  async getQuizById(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      const quiz = await this.prisma.quiz.findUnique({
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
      this.logger.error(`Get quiz by ID failed: ${(error as any).message}`, (error as any).stack);
      throw new InternalServerErrorException('Failed to retrieve quiz');
    }
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      const existing = await this.prisma.quiz.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Quiz not found');
      }

      return await this.prisma.quiz.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Quiz with id ${id} not found`);
        }
      }
      this.logger.error(`Update quiz failed: ${(error as any).message}`, (error as any).stack);
      throw new InternalServerErrorException('Failed to update quiz');
    }
  }

  async deleteQuiz(id: string) {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid quiz ID format');
    }

    try {
      const existing = await this.prisma.quiz.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException('Quiz not found');
      }

      await this.prisma.question.deleteMany({ where: { quizId: id } });
      return await this.prisma.quiz.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Quiz with id ${id} not found`);
        }
      }
      this.logger.error(`Delete quiz failed: ${(error as any).message}`, (error as any).stack);
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
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!client) {
        throw new NotFoundException(`Client with id ${clientId} not found`);
      }

      let score = dto.score ?? 0;
      if (score <= 0) {
        const result = await this.validateQuizAnswers(dto.quizId, dto.answers);
        score = result.score;
      }

      return await this.prisma.clientQuizAttempt.create({
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
      this.logger.error(`Submit quiz failed: ${(error as any).message}`, (error as any).stack);
      throw new InternalServerErrorException('Failed to submit quiz');
    }
  }

  async getAttemptsByClient(clientId: string, page = 1, limit = 10) {
    if (!clientId || typeof clientId !== 'string') {
      throw new BadRequestException('Invalid client ID format');
    }

    const skip = (page - 1) * limit;

    try {
      return await this.prisma.clientQuizAttempt.findMany({
        where: { clientId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          quiz: true,
        },
      });
    } catch (error) {
      this.logger.error(`Get attempts failed: ${(error as any).message}`, (error as any).stack);
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
      const client = await this.prisma.client.findUnique({
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
