import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MongoExceptionFilter } from './mongo-exception-filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors();
  app.use(
    rateLimit({
      windowMs: configService.get<number>('API_RATE_LIMIT_WINDOW_MS'),
      max: configService.get<number>('API_RATE_LIMIT_MAX_REQ_PER_WMS'),
    }),
  );
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new MongoExceptionFilter());

  const port = configService.get<number>('PORT');
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
