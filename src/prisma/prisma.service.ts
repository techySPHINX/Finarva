import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public primary: PrismaClient;
  public readReplica: PrismaClient;

  constructor() {
    this.primary = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });
    this.readReplica = new PrismaClient({
      datasources: { db: { url: process.env.READ_REPLICA_URL || process.env.DATABASE_URL } },
    });
  }

  async onModuleInit() {
    await this.primary.$connect();
    await this.readReplica.$connect();
  }

  async onModuleDestroy() {
    await this.primary.$disconnect();
    await this.readReplica.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    (this.primary as any).$on('beforeExit', async () => {
      await app.close();
    });
    (this.readReplica as any).$on('beforeExit', async () => {
      await app.close();
    });
  }
}
