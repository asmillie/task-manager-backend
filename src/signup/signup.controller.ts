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
     * @param demo Optional query indicates a demo account
     * @returns {User}
     */
    @Post()
    async signup(@Body() createUserDto: CreateUserDto) {
        return await this.signupService.signup(createUserDto);
    }

    @Post('demo')
    async createDemoAccount() {
        return await this.signupService.createDemoAccount();
    }

    /**
     * Checks if an email address is in use
     * @param email Address to check
     */
    @Post('/emailExists')
    @HttpCode(200)
    async emailExists(@Body('email') email: string) {
        const emailExists = await this.signupService.emailExists(email);
        return {
            emailExists,
        };
    }
}
