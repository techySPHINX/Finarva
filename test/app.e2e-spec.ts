import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    const server = app.getHttpServer();
    let response: supertest.Response;
    try {
      response = await supertest(server).get('/');
    } catch (error) {
      fail(error);
      return;
    }

    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });
});
