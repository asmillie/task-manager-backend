import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { User } from 'src/users/interfaces/user.interface';
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('jwt.secret'),
        });
    }

    /**
     * Finds and returns user that matches id contained in JWT payload.
     * @param payload User email and id extracted from JWT
     * @throws {UnauthorizedException} if user is not found
     */
    async validate(payload: any): Promise<User> {
        const user = await this.usersService.findUserById(payload.sub);
        if (user) {
            return user;
        }

        throw new UnauthorizedException();
    }
}
