import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksClient from 'jwks-rsa';
import { UsersService } from '../../users/users.service';
import { User } from 'src/users/interfaces/user.interface';
import * as config from 'config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKeyProvider: jwksClient.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: 'https://dev-x4xgby3m.us.auth0.com/.well-known/jwks.json'
            }),
            algorithms: ['RS256'],
            audience: 'task-manager',
            issuer: 'https://dev-x4xgby3m.us.auth0.com/'
        });
    }

    /**
     * Finds and returns user that matches id contained in JWT payload.
     * @param payload User email and id extracted from JWT
     * @throws {UnauthorizedException} if user is not found
     */
    async validate(payload: any): Promise<User> {
        console.log(`JWT Data: ${JSON.stringify(payload)}`);
        const user = await this.usersService.findUserById(payload.sub);
        if (user) {
            return user;
        }

        throw new UnauthorizedException();
    }
}
