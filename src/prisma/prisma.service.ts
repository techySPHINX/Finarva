import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  learningContent: any;
 quiz: any;
 question: any;
 clientQuizAttempt: any;
  async onModuleInit() {
    await this.$connect();
  }
}
  