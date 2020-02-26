import { Injectable, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
                usernameField: 'email',
        });
    }

    /**
     * Returns user that matches provided credentials.
     * @param email User email address
     * @param password User password
     * @throws {UnauthorizedException} if user is not found
     */
    async validate(email: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
