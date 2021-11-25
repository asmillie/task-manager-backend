import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksClient from 'jwks-rsa';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersService: UsersService) {
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
            issuer: 'https://dev-x4xgby3m.us.auth0.com/',
        });
    }

    /**
     * Called after request is authenticated, no need to do anything here.
     */
    async validate(sub: any): Promise<Boolean> {
        return true;
    }
}
