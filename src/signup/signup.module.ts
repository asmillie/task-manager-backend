import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { SignupController } from './signup.controller';
import { UsersService } from '../users/users.service';

@Module({
  providers: [
    SignupService,
    UsersService,
  ],
  controllers: [SignupController],
})
export class SignupModule {}
