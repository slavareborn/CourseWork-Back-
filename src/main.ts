import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SeedService } from './seed/seed.service';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function start() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Starting Nest application...');

    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn'],
    });
    logger.log('Nest application created.');

    const configService = app.get(ConfigService);
    const corsOrigin =
      configService.get<string>('URL') || 'http://localhost:80/';

    const corsOptions: CorsOptions = {
      origin: corsOrigin,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders:
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    };

    app.use(cookieParser());
    app.enableCors(corsOptions);

    const config = new DocumentBuilder()
      .setTitle('My API')
      .setDescription('API documentation for my NestJS app')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    app.setGlobalPrefix('api');
    logger.log(`Global prefix set to: /api`);

    const seedService = app.get(SeedService);
    logger.log('Seed service initialized.');

    const hasUsers = await seedService.hasDataInTable();

    if (!hasUsers) {
      logger.log('Seeding database...');
      await seedService.seed();
      logger.log('Database seeded.');
    } else {
      logger.log('Users data already exists. Skipping seeding.');
    }

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document);

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    logger.log(`Application is running on http://localhost:${port}/api`);
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error('Error starting Nest application:', e.message, e.stack);
    } else {
      logger.error('An unknown error occurred during startup.');
    }
    throw e;
  }
}

void start();
