import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  Logger,
  ValidationPipe,
  VersioningType,
  RequestMethod
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cluster, { Worker } from 'cluster';
import * as os from 'os';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN')?.split(',') || ['http://localhost:3000'],
    credentials: configService.get<boolean>('CORS_CREDENTIALS') || true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Compression
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: (configService.get<number>('RATE_LIMIT_TTL') || 60) * 1000,
      max: configService.get<number>('RATE_LIMIT_LIMIT') || 100,
      message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: nodeEnv === 'production',
    }),
  );

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix, {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'health/live', method: RequestMethod.GET },
      { path: 'health/ready', method: RequestMethod.GET },
    ],
  });

  // Swagger documentation (only in non-production)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Finarva API')
      .setDescription(
        '🚀 Finarva AI Backend: The Financial OS for Microentrepreneurs - A comprehensive API for financial management, AI-powered advisory, and business analytics.'
      )
      .setVersion('1.0.0')
      .addServer(`http://localhost:${port}`, 'Development Server')
      .addServer('https://api.finarva.com', 'Production Server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management operations')
      .addTag('Financial', 'Financial management features')
      .addTag('AI', 'AI-powered features and analytics')
      .addTag('Health', 'Application health checks')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Finarva API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .topbar-wrapper .link { 
          content: url('https://finarva.com/logo.png'); 
          width: 120px; 
          height: auto; 
        }
        .swagger-ui .topbar { background-color: #1f2937; }
      `,
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });

    Logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  }

  // Graceful shutdown
  const server = await app.listen(port);

  process.on('SIGTERM', () => {
    Logger.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      Logger.log('💀 Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    Logger.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      Logger.log('💀 Process terminated');
      process.exit(0);
    });
  });

  Logger.log(`🚀 Finarva API is running on: http://localhost:${port}`);
  Logger.log(`🌍 Environment: ${nodeEnv}`);
  Logger.log(`📡 API Prefix: /${apiPrefix}`);
  Logger.log(`🏥 Health Check: http://localhost:${port}/health`);
}

// Clustering configuration
const numCPUs = os.cpus().length;
const enableClustering = process.env.NODE_CLUSTER_ENABLED === 'true';

if (enableClustering && cluster.isPrimary) {
  Logger.log(`🎯 Master process ${process.pid} is running`);
  Logger.log(`🚀 Starting ${numCPUs} worker processes`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker exit
  cluster.on('exit', (worker: Worker, code: number, signal: string) => {
    Logger.error(`💀 Worker process ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });

  // Handle cluster disconnect
  cluster.on('disconnect', (worker: Worker) => {
    Logger.warn(`🔌 Worker ${worker.process.pid} disconnected`);
  });

} else {
  // Start the application
  bootstrap().catch((error) => {
    Logger.error('❌ Failed to start application:', error);
    process.exit(1);
  });

  if (enableClustering) {
    Logger.log(`👷 Worker process ${process.pid} started`);
  }
}
