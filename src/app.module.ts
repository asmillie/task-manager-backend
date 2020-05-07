import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as config from 'config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { SignupModule } from './signup/signup.module';
import { DemoService } from './demo/demo/demo.service';
import { DemoController } from './demo/demo/demo.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      config.get<string>('database.uri'), {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    SignupModule,
  ],
  controllers: [AppController, DemoController],
  providers: [AppService, DemoService],
})
export class AppModule {}
