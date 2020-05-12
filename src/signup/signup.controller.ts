import { Controller, Post, Param, Query, Body, HttpCode, Get } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignupService } from './signup.service';

@Controller('signup')
export class SignupController {

    constructor(private readonly signupService: SignupService) {}

    /**
     * Calls {@link SignupService#signup} to create a new user
     * and send an email to verify the user's email address.
     * @param createUserDto User data
     * @returns {User}
     */
    @Post()
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.signupService.signup(createUserDto);
    }
}
