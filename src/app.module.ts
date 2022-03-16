import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import config from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { PassportModule } from '@nestjs/passport';
import { LoggerService } from './logs/logger/logger.service';
import { RequestIdInterceptor } from './interceptors/request-id.interceptor';
import { LogRequestInterceptor } from './interceptors/log-request.interceptor';
import { EmailVerifiedGuard } from './auth/email-verified.guard';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    MongooseModule.forRoot(
      config.get<string>('database.uri')
    ),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: EmailVerifiedGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LogRequestInterceptor
    },
    LoggerService
  ],
})
export class AppModule {}
