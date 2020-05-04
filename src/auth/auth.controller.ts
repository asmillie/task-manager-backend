import { Controller, Request, Post, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { VerifiedEmailGuard } from './verified-email.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Login a user by verifying credentials (email and password)
     * before creating a JWT (JSON Web Token) which is returned
     * in the response along with user details.
     * @param req Request object
     */
    @UseGuards(
        AuthGuard('local'),
        VerifiedEmailGuard,
    )
    @HttpCode(200)
    @Post('login')
    async login(@Request() req) {
        return await this.authService.loginUser(req.user);
    }

    /**
     * Logout an authenticated user by removing the current
     * JWT from the user's saved tokens. Returns user details
     * in the response.
     * @param req Request object
     */
    @UseGuards(AuthGuard())
    @HttpCode(200)
    @Post('logout')
    async logout(@Request() req) {
        const authToken = req.headers.authorization.replace('Bearer ', '');
        return await this.authService.logoutUser(authToken, req.user);
    }
}
