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

    /**
     * Calls {@link SignupService#verifyEmail} to check
     * the provided code for the given user id against
     * the one stored in user data.
     * @param id User id
     * @param code Email verification code
     * @returns {boolean} True on email verified
     */
    @HttpCode(200)
    @Get('verifyEmail/:id')
    async verifyEmail(@Param('id') id: string, @Query('code') code: string) {
        return await this.signupService.verifyEmail(id, code);
    }
}
