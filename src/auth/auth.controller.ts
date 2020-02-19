import { Controller, Request, Post, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @HttpCode(200)
    @Post('login')
    async login(@Request() req) {
        return await this.authService.loginUser(req.user);
    }

    @UseGuards(AuthGuard())
    @HttpCode(200)
    @Post('logout')
    async logout(@Request() req) {
        const authToken = req.headers.authorization.replace('Bearer ', '');
        return await this.authService.logoutUser(authToken, req.user);
    }
}
