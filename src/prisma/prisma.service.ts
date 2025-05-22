import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private _learningContent: any;
 public get learningContent(): any {
  return this._learningContent;
 }
 public set learningContent(value: any) {
  this._learningContent = value;
 }
  async onModuleInit() {
    await this.$connect();
  }
}
  