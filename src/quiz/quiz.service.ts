import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { AiService } from '../ai/ai.service';

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
        description: dto.description ?? '',
        createdBy,
      },
    });
  }

  async addQuestion(dto: AddQuestionDto) {
    // Ensure the quiz exists before adding question
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.prisma.question.create({
      data: {
        quizId: dto.quizId,
        question: dto.question,
        options: dto.options,
        answer: dto.answer,
        language: dto.language,
      },
    });
  }

  async getAllQuizzes(
    language?: string,
    tags?: string[],
    page = 1,
    limit = 10,
  ) {
    const skip = (page - 1) * limit;

    return this.prisma.quiz.findMany({
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
  }

  async getQuizById(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    const existing = await this.prisma.quiz.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Quiz not found');

    return this.prisma.quiz.update({
      where: { id },
      data: dto,
    });
  }

  async deleteQuiz(id: string) {
    const existing = await this.prisma.quiz.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Quiz not found');

    // Optionally: Delete related questions too (cascading not automatic in MongoDB)
    await this.prisma.question.deleteMany({ where: { quizId: id } });

    return this.prisma.quiz.delete({ where: { id } });
  }

  // Helper: Auto-score answers
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
    // Check client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Client not found');

    // Auto-score if score is not provided or <= 0
    let score = dto.score ?? 0;
    if (score <= 0) {
      const result = await this.validateQuizAnswers(dto.quizId, dto.answers);
      score = result.score;
    }

    return this.prisma.clientQuizAttempt.create({
      data: {
        clientId,
        quizId: dto.quizId,
        score,
        answers: dto.answers,
      },
    });
  }

  async getAttemptsByClient(clientId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    return this.prisma.clientQuizAttempt.findMany({
      where: { clientId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        quiz: true,
      },
    });
  }

  async getQuizSuggestionsFromAI(clientId: string) {
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
      throw new NotFoundException('Client not found');
    }

    const profile = {
      id: client.id,
      name: client.name,
      phone: client.phone,
      agentId: client.agentId,
      language: client.preferredLanguage ?? 'en',
      goals: client.goals ?? [],
    };

    // const quizHistory = client.quizAttempts.map((attempt) => ({
    //   quizId: attempt.quizId,
    //   score: attempt.score,
    //   completedAt: attempt.createdAt.toISOString(),
    // }));

    return this.aiService.generateQuizSuggestions(profile);
  }
}
