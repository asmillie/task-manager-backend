import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import * as config from 'config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { AuthGuard, PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forRoot(
      config.get<string>('database.uri'), {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }),    
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
      useClass: AuthGuard()
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenInterceptor
    }
  ],
})
export class AppModule {}
