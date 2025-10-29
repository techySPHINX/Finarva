
import { Module } from '@nestjs/common';
import {
  TerminusModule,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [
    HttpHealthIndicator,
    PrismaHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
  ],
})
export class HealthModule { }
