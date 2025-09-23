import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import cluster, { Worker } from 'cluster';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('FinTrack Edge API')
    .setDescription(
      'API documentation for FinTrack Edge - For MicroEntrepreneurs',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}

const numCPUs = os.cpus().length;
const enableClustering = process.env.NODE_CLUSTER_ENABLED === 'true';

if (enableClustering && cluster.isMaster) {
  Logger.log(`Master process ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker: Worker, _code: number) => {
    Logger.error(`Worker process ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  void bootstrap();
  Logger.log(`Worker process ${process.pid} started`);
}
