import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MongoExceptionFilter } from './mongo-exception-filter';
import * as config from 'config';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.use(
    rateLimit({
      windowMs: config.get<number>('rateLimit.windowMs'),
      max: config.get<number>('rateLimit.maxRequestsPerWMS'),
    }),
  );
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new MongoExceptionFilter());

  const port = config.get<number>('port');
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
