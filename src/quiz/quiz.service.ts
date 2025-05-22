import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { AiService } from '../ai/ai.service';
import { QuizSuggestionDto } from '../ai/dto/quiz-suggestion.dto';

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createQuiz(dto: CreateQuizDto, createdBy: string) {
    return this.prisma.quiz.create({
      data: {
        ...dto,
        createdBy,
      },
    });
  }

  async addQuestion(dto: AddQuestionDto) {
    return this.prisma.question.create({
      data: {
        ...dto,
        quizId: dto.quizId,
      },
    });
  }

  async getAllQuizzes(language?: string, tags?: string[]) {
    return this.prisma.quiz.findMany({
      where: {
        language,
        tags: tags && tags.length ? { hasSome: tags } : undefined,
      },
      include: {
        questions: true,
      },
    });
  }

  async getQuizById(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
  }

  async submitQuiz(clientId: string, dto: SubmitQuizDto) {
    return this.prisma.clientQuizAttempt.create({
      data: {
        ...dto,
        clientId,
      },
    });
  }

  async getAttemptsByClient(clientId: string) {
    return this.prisma.clientQuizAttempt.findMany({
      where: { clientId },
    });
  }

  async getQuizSuggestionsFromAI(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        age: true,
        occupation: true,
        interests: true,
        preferredLanguage: true,
        investmentExperience: true,
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
      throw new Error('Client not found');
    }

    const input: QuizSuggestionDto = {
      clientId: client.id,
      profile: {
        name: client.name,
        age: client.age,
        occupation: client.occupation,
        interests: client.interests,
        preferredLanguage: client.preferredLanguage,
        investmentExperience: client.investmentExperience,
      },
      quizHistory: client.quizAttempts.map((attempt) => ({
        quizId: attempt.quizId,
        score: attempt.score,
        completedAt: attempt.createdAt.toISOString(),
      })),
    };

    const suggestions = await this.aiService.generateQuizSuggestions(input);
    return suggestions;
  }
}
