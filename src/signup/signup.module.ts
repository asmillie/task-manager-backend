import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
  ],
  providers: [
    SignupService,
  ],
  controllers: [SignupController],
})
export class SignupModule {}
