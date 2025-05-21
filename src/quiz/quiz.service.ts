import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  createQuiz(dto: CreateQuizDto, createdBy: string) {
    return this.prisma.quiz.create({
      data: {
        ...dto,
        createdBy,
      },
    });
  }

  addQuestion(dto: AddQuestionDto) {
    return this.prisma.question.create({
      data: {
        ...dto,
        quizId: dto.quizId,
      },
    });
  }

  getAllQuizzes(language?: string, tags?: string[]) {
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

  getQuizById(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
  }

  submitQuiz(clientId: string, dto: SubmitQuizDto) {
    return this.prisma.clientQuizAttempt.create({
      data: {
        ...dto,
        clientId,
      },
    });
  }

  getAttemptsByClient(clientId: string) {
    return this.prisma.clientQuizAttempt.findMany({
      where: { clientId },
    });
  }
}
