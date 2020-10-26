import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    UsersModule,
    TasksModule,
  ],
  providers: [
    SignupService,
  ],
  controllers: [SignupController],
})
export class SignupModule {}
