import { Controller, Post, Query } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {

    constructor(private readonly signupService: SignupService) {}

    @Post()
    async signup(createUserDto: CreateUserDto) {
        return await this.signupService.signup(createUserDto);
    }

    @Post('verifyEmail')
    async verifyEmail(@Query() hash: string) {
        // Call Service
    }
}
